import { Router } from 'express';
import { getAllData, getDBStatus } from '../controllers/adminController.js';

const router = Router();
router.get('/all-data', getAllData);
router.get('/db-status', getDBStatus);
export default router;