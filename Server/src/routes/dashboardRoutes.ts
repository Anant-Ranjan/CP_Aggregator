import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getDashboardSummary } from '../controllers/dashboardController';

const router = express.Router();
router.get('/', protect as any, getDashboardSummary);

export default router;
