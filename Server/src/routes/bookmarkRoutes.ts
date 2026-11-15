import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { addBookmark, getBookmarks, deleteBookmark } from '../controllers/bookmarkController';

const router = express.Router();
router.post('/', protect as any, addBookmark);
router.get('/', protect as any, getBookmarks);
router.delete('/:id', protect as any, deleteBookmark);

export default router;
