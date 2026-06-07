const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

router.get('/', performanceController.getPerformance);

module.exports = router;