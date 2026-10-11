import { Router } from 'express';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct,
  deleteProduct,
  createCategory, 
  createStore,
  getCitiesWithStores 
} from '../controllers/productController.js';

const router = Router();

router.get('/', getAllProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/categories', createCategory);
router.post('/stores', createStore);
router.get('/locations', getCitiesWithStores);

export default router;