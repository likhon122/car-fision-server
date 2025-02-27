import express from 'express';
import { ProductsControllers } from './product.controllers';
import auth from '../../middleware/auth';

const router = express.Router();

// Create a Stationery Product Router
router.post('/', ProductsControllers.createProduct);

// Get All Stationery Products Router
router.get('/', ProductsControllers.getAllProducts);

// Get a Specific Stationery Product Router
router.get('/:productId', ProductsControllers.getSingleProduct);

// // Update a Stationery Product Router
// router.patch('/:productId', ProductsControllers.updateProduct);

// // Delete a Stationery Product Router
router.delete('/:productId', auth('admin'), ProductsControllers.deleteProduct);

export const productRoute = router;
