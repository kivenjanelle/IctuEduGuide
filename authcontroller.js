const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

class AuthController {
  async register(req, res) {
    const { name, email, password, level, speciality } = req.body;
    if (!name || !email || !password || !level || !speciality) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!email.toLowerCase().endsWith('@ictuniversity.edu.cm')) {
      return res.status(400).json({ error: 'Please use your ICTU university email (@ictuniversity.edu.cm)' });
    }

    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already exists' });

      const hashed = await bcrypt.hash(password, 12);
      const result = await pool.query(
        `INSERT INTO users (name, email, password, role, level, speciality)
         VALUES ($1, $2, $3, 'student', $4, $5) RETURNING id, name, email, role, level, speciality`,
        [name.trim(), email.toLowerCase(), hashed, level, speciality]
      );

      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ message: 'Account created successfully', token, user });
    } catch (err) {
      console.error('Register error:', err.message);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...userData } = user;

      res.json({ message: 'Login successful', token, user: userData });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  }
}

module.exports = new AuthController();