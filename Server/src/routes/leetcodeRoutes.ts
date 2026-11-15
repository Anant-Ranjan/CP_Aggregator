import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getLeetCodeStats } from '../controllers/leetcodeController';

const router = express.Router();
router.get('/stats', protect as any, getLeetCodeStats);

export default router;
