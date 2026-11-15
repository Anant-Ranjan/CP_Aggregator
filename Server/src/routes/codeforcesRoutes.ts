import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getCodeforcesStats } from '../controllers/codeforcesController';

const router = express.Router();
router.get('/stats', protect as any, getCodeforcesStats);

export default router;
