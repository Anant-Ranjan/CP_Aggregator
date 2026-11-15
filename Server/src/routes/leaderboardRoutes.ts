import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getLeaderboard, getUserLeaderboardRank } from '../controllers/leaderboardController';

const router = express.Router();

router.get('/', protect as any, getLeaderboard);
router.get('/rank', protect as any, getUserLeaderboardRank);

export default router;
