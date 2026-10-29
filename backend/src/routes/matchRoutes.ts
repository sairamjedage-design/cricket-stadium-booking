import { Router } from 'express';
import { getMatches, getMatchById, getMatchSeats, createMatch } from '../controllers/matchController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getMatches);
router.get('/:matchId', getMatchById);
router.get('/:matchId/seats', getMatchSeats);

// Protected routes (admin only for now)
router.post('/', authenticateToken, createMatch);

export default router;