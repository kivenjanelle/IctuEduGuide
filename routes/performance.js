const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, performanceController.getPerformance);

module.exports = router;
