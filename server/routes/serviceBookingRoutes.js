import { Router } from 'express';
import {
  getAllServiceBookings,
  createServiceBooking,
  updateBookingStatus,
  deleteServiceBooking,
} from '../controllers/serviceBookingController.js';

const router = Router();

router.get('/', getAllServiceBookings);
router.post('/', createServiceBooking);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', deleteServiceBooking);

export default router;