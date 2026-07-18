const express = require('express');
const router = express.Router();
const {getLeetCodeStats} = require('../controllers/leetcodeController');
const {protect} = require('../middleware/authMiddleware');

router.get('/stats', protect, getLeetCodeStats);

module.exports = router;