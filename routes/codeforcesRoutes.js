const express = require('express');
const router = express.Router();
const {getCodeforcesStats} = require('../controllers/codeforcesController');
const {protect} = require('../middleware/authMiddleware');

router.get('/stats', protect, getCodeforcesStats);

module.exports = router;