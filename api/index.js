const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config();

// ── Database connection ────────────────────────────────────
require('./config/database');
express.json(); // Built-in body parser for JSON

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(express.json());
  app.use(cors({
    origin:'*',
  credentials: true,
}));

// ── Serve Frontend (public/) ───────────────────────────────
app.use(express.static(path.join(__dirname, 'src','dist')));

// ── API Health Check ───────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({ message: '✅ ICTU EduGuide API is running!' });
});

// ── Auth Routes ────────────────────────────────────────────
const authController = require('./controllers/authcontroller');

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Hard-coded admin account
  if (
    email.toLowerCase() === 'admin@ictuniversity.edu.cm' &&
    password === 'Admin@ICTU2026'
  ) {
    return res.json({
      message: 'Login successful',
      token: 'admin-jwt-token-ictu-2026',
      user: {
        id: 1,
        name: 'Administrator',
        email: 'admin@ictuniversity.edu.cm',
        role: 'admin',
      },
    });
  }

  // Real DB login
  return authController.login(req, res);
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  return authController.register(req, res);
});

// ── Course Routes ──────────────────────────────────────────
const courseRoutes = require('./routes/Courses');
app.use('/api/courses', courseRoutes);

// ── Question Routes ────────────────────────────────────────
const questionRoutes = require('./routes/question');
app.use('/api/questions', questionRoutes);

// ── Quiz Routes ────────────────────────────────────────────
const quizRoutes = require('./routes/quizzes');
app.use('/api/quizzes', quizRoutes);

// ── Departments ────────────────────────────────────────────
app.get('/api/departments', (req, res) => {
  res.json([
    { id: 1, name: 'Cyber Security',       code: 'CSEC', students: 520 },
    { id: 2, name: 'Software Engineering', code: 'SENG', students: 680 },
    { id: 3, name: 'Computer Science',     code: 'CSCI', students: 750 },
    { id: 4, name: 'Information Systems',  code: 'INFS', students: 460 },
    { id: 5, name: 'Networking & ICT',     code: 'NICT', students: 590 },
  ]);
});

// ── Catch-all ──────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'dist', 'index.html'));
});
module.exports = app;

// ── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ ICTU EduGuide running  →  http://localhost:${PORT}`);
  console.log(`   API health check       →  http://localhost:${PORT}/api`);
  console.log(`   Admin login            →  admin@ictuniversity.edu.cm / Admin@ICTU2026`);
});