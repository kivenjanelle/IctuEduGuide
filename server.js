// backend/server.js - Minimal Working Version
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.json({ message: '✅ ICTU EduGuide Backend is running!' });
});

// Basic Auth Route (for testing)
app.post('/api/auth/login', (req, res) => {
  res.json({ 
    message: 'Login route works', 
    token: 'fake-jwt-token-for-testing',
    user: { id: 1, name: 'Admin', role: 'admin', email: 'admin@ictu.cm' }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ ICTU EduGuide Backend running on http://localhost:${PORT}`);
  console.log('Test it at: http://localhost:5000');
});