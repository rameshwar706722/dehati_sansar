import { Router } from 'express';
import { getAllInquiries, createInquiry, updateInquiryStatus, deleteInquiry } from '../controllers/inquiryController.js';

const router = Router();
router.get('/', getAllInquiries);
router.post('/', createInquiry);
router.patch('/:id', updateInquiryStatus);
router.delete('/:id', deleteInquiry);
export default router;