const pool = require('../config/database');

class QuestionController {
  async createQuestion(req, res) {
    const { course_id, question_text, year, marks, answer_text, explanation } = req.body;
    if (!course_id || !question_text || !answer_text) {
      return res.status(400).json({ error: 'Course, question and answer are required' });
    }

    try {
      const qRes = await pool.query(
        `INSERT INTO questions (course_id, question_text, year, marks, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [course_id, question_text, year, marks || 10, req.user?.id || 1]
      );

      await pool.query(
        `INSERT INTO answers (question_id, answer_text, explanation, created_by)
         VALUES ($1, $2, $3, $4)`,
        [qRes.rows[0].id, answer_text, explanation, req.user?.id || 1]
      );

      res.status(201).json({ message: 'Question and answer added successfully' });
    } catch (err) {
      console.error('createQuestion error:', err.message);
      res.status(500).json({ error: 'Failed to add question' });
    }
  }

  async uploadQuestionFiles(req, res) {
    const { course_id, year, marks, answer_text, explanation } = req.body;
    if (!course_id) {
      return res.status(400).json({ error: 'Course is required' });
    }

    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'Please select at least one PDF file' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const uploaded = [];
      for (const file of files) {
        const result = await client.query(
          `INSERT INTO questions
             (course_id, question_text, year, marks, created_by, file_name, file_url, file_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            course_id,
            file.originalname,
            year || null,
            marks || 10,
            req.user?.id || 1,
            file.originalname,
            `/uploads/questions/${file.filename}`,
            file.mimetype,
          ]
        );

        if (answer_text || explanation) {
          await client.query(
            `INSERT INTO answers (question_id, answer_text, explanation, created_by)
             VALUES ($1, $2, $3, $4)`,
            [result.rows[0].id, answer_text || 'PDF question upload', explanation || null, req.user?.id || 1]
          );
        }

        uploaded.push(result.rows[0]);
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'PDF question file(s) uploaded', questions: uploaded });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('uploadQuestionFiles error:', err.message);
      res.status(500).json({ error: 'Failed to upload PDF question file(s)' });
    } finally {
      client.release();
    }
  }

  async getCourseQuestions(req, res) {
    try {
      const result = await pool.query(`
        SELECT q.*, a.answer_text, a.explanation 
        FROM questions q 
        LEFT JOIN answers a ON a.question_id = q.id 
        WHERE q.course_id = $1 
        ORDER BY q.year DESC, q.id ASC
      `, [req.params.courseId]);
      res.json({ questions: result.rows });
    } catch (err) {
      console.error('getCourseQuestions error:', err.message);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  }
}

module.exports = new QuestionController();
