const express = require('express');
const router = express.Router();
const {addBookmark, getBookmarks} = require('../controllers/bookmarkController');
const {protect} = require('../middleware/authMiddleware');

router.post('/', protect, addBookmark);

router.get('/', protect, getBookmarks);

module.exports = router;