// backend/routes/quizzes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.post('/', authenticate, isAdmin, quizController.createQuiz);
router.get('/', quizController.getAllQuizzes);
router.get('/course/:courseId', quizController.getQuizzesByCourse);
router.get('/:id', quizController.getQuiz);
router.post('/:id/submit', authenticate, quizController.submitQuiz);

module.exports = router;