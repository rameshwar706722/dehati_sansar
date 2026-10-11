import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';

const router = Router();

router.get('/', getAllServices);
router.get('/:identifier', getServiceById);
router.post('/', createService);
router.put('/:id', updateService); // 👈 Must exist for PUT /api/services/2
router.delete('/:id', deleteService);

export default router;