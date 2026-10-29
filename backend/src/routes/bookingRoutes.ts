import { Router } from 'express';
import { createBooking, getBookingById, getUserBookings } from '../controllers/bookingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protected routes
router.post('/', authenticateToken, createBooking);
router.get('/:bookingId', authenticateToken, getBookingById);
router.get('/user/:userId', authenticateToken, getUserBookings);

export default router;