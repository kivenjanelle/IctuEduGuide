// backend/routes/quizzes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizzesController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.post('/',                authenticate, isAdmin, quizController.createQuiz);
router.get('/',                 quizController.getAllQuizzes);
router.get('/course/:courseId', quizController.getQuizzesByCourse);
router.get('/:id',              quizController.getQuiz);
router.post('/:id/submit',      authenticate, quizController.submitQuiz);
router.put('/:id',              authenticate, isAdmin, quizController.updateQuiz);
router.delete('/:id',           authenticate, isAdmin, quizController.deleteQuiz);

module.exports = router;