const pool = require('../config/database');

class PerformanceController {
  async getPerformance(req, res) {
    try {
      const userId = req.user?.id;

      // Get all quiz attempts for this user
      const result = await pool.query(`
        SELECT 
          qa.*,
          q.title as quiz_title,
          c.title as course_title,
          c.code as course_code
        FROM quiz_attempts qa
        LEFT JOIN quizzes q ON q.id = qa.quiz_id
        LEFT JOIN courses c ON c.id = q.course_id
        WHERE qa.user_id = $1
        ORDER BY qa.created_at DESC
      `, [userId]);

      const attempts = result.rows;
      const total = attempts.length;
      const average = total > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / total)
        : 0;

      res.json({
        average,
        total_attempts: total,
        attempts,
      });
    } catch (err) {
      console.error('getPerformance error:', err.message);
      // Return empty performance if table doesn't exist yet
      res.json({ average: 0, total_attempts: 0, attempts: [] });
    }
  }
}

module.exports = new PerformanceController();
