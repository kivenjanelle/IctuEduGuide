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