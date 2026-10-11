import { Router } from 'express';
import { getAllInventory, updateInventoryItem } from '../controllers/inventoryController.js';

const router = Router();

router.get('/', getAllInventory);
router.patch('/:id', updateInventoryItem);

export default router;