const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config();

// ── Database connection ────────────────────────────────────
require('./config/database');

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve Frontend (public/) ───────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const clientDir = require('fs').existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'public');

app.use(express.static(clientDir));

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

// ── Performance Routes ─────────────────────────────────────
try {
  const performanceRoutes = require('./routes/performance');
  app.use('/api/performance', performanceRoutes);
} catch (e) {}

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
  const indexFile = path.join(clientDir, 'index.html');
  const fallbackFile = path.join(__dirname, 'public', 'admin.html');
  res.sendFile(require('fs').existsSync(indexFile) ? indexFile : fallbackFile);
});

// ── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ ICTU EduGuide running  →  http://localhost:${PORT}`);
  console.log(`   API health check       →  http://localhost:${PORT}/api`);
  console.log(`   Admin login            →  admin@ictuniversity.edu.cm / Admin@ICTU2026`);
});
