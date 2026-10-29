import { Router } from 'express';
import { getStadiums, getStadiumById, createStadium, updateStadium } from '../controllers/stadiumController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getStadiums);
router.get('/:stadiumId', getStadiumById);

// Protected routes (admin only for now)
router.post('/', authenticateToken, createStadium);
router.put('/:stadiumId', authenticateToken, updateStadium);

export default router;