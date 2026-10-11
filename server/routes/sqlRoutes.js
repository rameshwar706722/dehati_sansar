import { Router } from 'express';
import { runRawSQL } from '../controllers/sqlController.js';

const router = Router();
router.post('/raw-query', runRawSQL);
export default router;