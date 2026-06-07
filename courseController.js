const pool = require('../config/database');

class CourseController {
  async getAllCourses(req, res) {
    try {
      const result = await pool.query(`
        SELECT c.*, 
               COUNT(DISTINCT q.id) as question_count,
               COUNT(DISTINCT qz.id) as quiz_count
        FROM courses c
        LEFT JOIN questions q ON q.course_id = c.id
        LEFT JOIN quizzes qz ON qz.course_id = c.id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `);
      res.json({ courses: result.rows });
    } catch (err) {
      console.error('getAllCourses error:', err.message);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  }

  async getCourse(req, res) {
    try {
      const result = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
      res.json({ course: result.rows[0] });
    } catch (err) {
      console.error('getCourse error:', err.message);
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  }

  async createCourse(req, res) {
    const { title, code, description, level, speciality, credits } = req.body;
    if (!title || !code) return res.status(400).json({ error: 'Title and code are required' });

    try {
      const result = await pool.query(
        `INSERT INTO courses (title, code, description, level, speciality, credits, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [title, code.toUpperCase(), description, level, speciality, credits || 3, req.user?.id || 1]
      );
      res.status(201).json({ message: 'Course created', course: result.rows[0] });
    } catch (err) {
      console.error('createCourse error:', err.message);
      res.status(500).json({ error: 'Failed to create course' });
    }
  }
}

module.exports = new CourseController();