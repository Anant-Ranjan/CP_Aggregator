import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/userController';

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect as any, getUserProfile);
router.put('/profile', protect as any, updateUserProfile);

export default router;
