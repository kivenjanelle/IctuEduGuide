const pool = require('../config/database');

class QuizController {
  async createQuiz(req, res) {
    const { title, course_id, description } = req.body;
    if (!title || !course_id) return res.status(400).json({ error: 'Title and course are required' });

    try {
      const result = await pool.query(
        `INSERT INTO quizzes (title, course_id, description, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, course_id, description, req.user?.id || 1]
      );
      res.status(201).json({ message: 'Quiz created', quiz: result.rows[0] });
    } catch (err) {
      console.error('createQuiz error:', err.message);
      res.status(500).json({ error: 'Failed to create quiz' });
    }
  }

  async getAllQuizzes(req, res) {
    try {
      const result = await pool.query('SELECT * FROM quizzes ORDER BY created_at DESC');
      res.json({ quizzes: result.rows });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
  }

  async getQuizzesByCourse(req, res) {
    try {
      const result = await pool.query(
        'SELECT * FROM quizzes WHERE course_id = $1 ORDER BY created_at DESC',
        [req.params.courseId]
      );
      res.json({ quizzes: result.rows });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
  }

  async getQuiz(req, res) {
    try {
      const result = await pool.query('SELECT * FROM quizzes WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Quiz not found' });
      res.json({ quiz: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch quiz' });
    }
  }

  async submitQuiz(req, res) {
    res.json({ message: 'Quiz submitted', result: { percentage: 85 } });
  }
}

module.exports = new QuizController();