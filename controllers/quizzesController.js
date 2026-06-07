const pool = require('../config/database');

class QuizController {

  // ── Create quiz with questions ─────────────────────────────
  async createQuiz(req, res) {
    const { title, course_id, description, questions = [] } = req.body;
    if (!title || !course_id) return res.status(400).json({ error: 'Title and course are required' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const quizResult = await client.query(
        `INSERT INTO quizzes (title, course_id, description, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, course_id, description || null, req.user?.id || 1]
      );
      const quiz = quizResult.rows[0];

      for (const q of questions) {
        await client.query(
          `INSERT INTO quiz_questions
             (quiz_id, question_type, question_text, option_a, option_b, option_c, option_d,
              correct_option, model_answer, marks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            quiz.id,
            q.question_type || 'mcq',
            q.question_text,
            q.option_a   || null,
            q.option_b   || null,
            q.option_c   || null,
            q.option_d   || null,
            q.correct_option ? q.correct_option.toUpperCase() : null,
            q.model_answer   || null,
            q.marks          || 1,
          ]
        );
      }

      // update question count on quiz row if column exists
      await client.query(
        `UPDATE quizzes SET question_count = $1 WHERE id = $2`,
        [questions.length, quiz.id]
      ).catch(() => {}); // ignore if column doesn't exist

      await client.query('COMMIT');
      res.status(201).json({ message: 'Quiz created', quiz });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('createQuiz error:', err.message);
      res.status(500).json({ error: 'Failed to create quiz' });
    } finally {
      client.release();
    }
  }

  // ── Get all quizzes ────────────────────────────────────────
  async getAllQuizzes(req, res) {
    try {
      const result = await pool.query(`
        SELECT q.*, COUNT(qq.id)::int AS question_count
        FROM quizzes q
        LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
        GROUP BY q.id
        ORDER BY q.created_at DESC
      `);
      res.json({ quizzes: result.rows });
    } catch (err) {
      console.error('getAllQuizzes error:', err.message);
      res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
  }

  // ── Get quizzes by course ──────────────────────────────────
  async getQuizzesByCourse(req, res) {
    try {
      const result = await pool.query(`
        SELECT q.*, COUNT(qq.id)::int AS question_count
        FROM quizzes q
        LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
        WHERE q.course_id = $1
        GROUP BY q.id
        ORDER BY q.created_at DESC
      `, [req.params.courseId]);
      res.json({ quizzes: result.rows });
    } catch (err) {
      console.error('getQuizzesByCourse error:', err.message);
      res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
  }

  // ── Get single quiz WITH questions (no correct answers exposed) ──
  async getQuiz(req, res) {
    try {
      const quizRes = await pool.query('SELECT * FROM quizzes WHERE id = $1', [req.params.id]);
      if (quizRes.rows.length === 0) return res.status(404).json({ error: 'Quiz not found' });

      const quiz = quizRes.rows[0];

      // Return questions but HIDE correct_option and model_answer so students can't cheat
      const qRes = await pool.query(`
        SELECT id, quiz_id, question_type, question_text,
               option_a, option_b, option_c, option_d, marks
        FROM quiz_questions
        WHERE quiz_id = $1
        ORDER BY id ASC
      `, [quiz.id]);

      res.json({ quiz, questions: qRes.rows });
    } catch (err) {
      console.error('getQuiz error:', err.message);
      res.status(500).json({ error: 'Failed to fetch quiz' });
    }
  }

  // ── Submit quiz — grades and returns correct answers ───────
  async submitQuiz(req, res) {
    const { answers } = req.body; // array of answers indexed by question order
    try {
      const qRes = await pool.query(`
        SELECT id, question_type, question_text,
               option_a, option_b, option_c, option_d,
               correct_option, model_answer, marks
        FROM quiz_questions
        WHERE quiz_id = $1
        ORDER BY id ASC
      `, [req.params.id]);

      const questions = qRes.rows;
      if (questions.length === 0) return res.status(400).json({ error: 'Quiz has no questions' });

      let score = 0;
      let totalMarks = 0;

      const detailedResults = questions.map((q, i) => {
        const rawUserAnswer = (answers[i] ?? '').toString().trim();
        const userAnswer = rawUserAnswer.toUpperCase();
        const isMCQ = q.question_type === 'mcq';
        const marks = Number(q.marks || 1);
        totalMarks += marks;

        if (isMCQ) {
          const correct = (q.correct_option || '').toUpperCase();
          const isCorrect = userAnswer === correct;
          const earnedMarks = isCorrect ? marks : 0;
          score += earnedMarks;

          // Build label like "A. Option text"
          const optionLabel = (letter) => {
            const text = q[`option_${letter.toLowerCase()}`];
            return text ? `${letter}. ${text}` : letter;
          };

          return {
            question: q.question_text,
            question_type: 'mcq',
            type: 'mcq',
            userAnswer: userAnswer ? optionLabel(userAnswer) : 'Not answered',
            correctAnswer: optionLabel(correct),
            isCorrect,
            marks,
            earnedMarks,
          };
        } else {
          // Structural — not auto-graded, just return model answer
          const normalize = (value) => value
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
          const normalizedUserAnswer = normalize(rawUserAnswer);
          const normalizedModelAnswer = normalize(q.model_answer || '');
          const isCorrect = Boolean(
            normalizedUserAnswer &&
            normalizedModelAnswer &&
            (normalizedUserAnswer === normalizedModelAnswer ||
              normalizedUserAnswer.includes(normalizedModelAnswer) ||
              normalizedModelAnswer.includes(normalizedUserAnswer))
          );
          const earnedMarks = isCorrect ? marks : 0;
          score += earnedMarks;

          return {
            question: q.question_text,
            question_type: 'structural',
            type: 'structural',
            userAnswer: rawUserAnswer || 'Not answered',
            modelAnswer: q.model_answer || 'No model answer provided',
            isCorrect,
            marks,
            earnedMarks,
          };
        }
      });

      const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
      const passed = percentage >= 50;

      await pool.query(
        `INSERT INTO quiz_attempts (user_id, quiz_id, score, total, percentage, passed)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user?.id || 1, req.params.id, score, totalMarks, percentage, passed]
      );

      res.json({
        result: {
          score,
          total: totalMarks,
          percentage,
          passed,
          detailedResults,
        }
      });
    } catch (err) {
      console.error('submitQuiz error:', err.message);
      res.status(500).json({ error: 'Failed to submit quiz' });
    }
  }

  // ── Delete quiz ────────────────────────────────────────────
  async deleteQuiz(req, res) {
    try {
      await pool.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [req.params.id]);
      await pool.query('DELETE FROM quizzes WHERE id = $1', [req.params.id]);
      res.json({ message: 'Quiz deleted' });
    } catch (err) {
      console.error('deleteQuiz error:', err.message);
      res.status(500).json({ error: 'Failed to delete quiz' });
    }
  }

  // ── Update quiz ────────────────────────────────────────────
  async updateQuiz(req, res) {
    const { title, description, questions = [] } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE quizzes SET title=$1, description=$2 WHERE id=$3`,
        [title, description || null, req.params.id]
      );
      // Replace all questions
      await client.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [req.params.id]);
      for (const q of questions) {
        await client.query(
          `INSERT INTO quiz_questions
             (quiz_id, question_type, question_text, option_a, option_b, option_c, option_d,
              correct_option, model_answer, marks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            req.params.id,
            q.question_type || 'mcq',
            q.question_text,
            q.option_a   || null,
            q.option_b   || null,
            q.option_c   || null,
            q.option_d   || null,
            q.correct_option ? q.correct_option.toUpperCase() : null,
            q.model_answer   || null,
            q.marks          || 1,
          ]
        );
      }
      await client.query('COMMIT');
      res.json({ message: 'Quiz updated' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('updateQuiz error:', err.message);
      res.status(500).json({ error: 'Failed to update quiz' });
    } finally {
      client.release();
    }
  }
}

module.exports = new QuizController();
