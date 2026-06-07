const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const questionController = require('../controllers/questionController');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'questions');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post('/', questionController.createQuestion);
router.post('/upload', upload.array('files', 10), questionController.uploadQuestionFiles);
router.get('/course/:courseId', questionController.getCourseQuestions);

module.exports = router;
