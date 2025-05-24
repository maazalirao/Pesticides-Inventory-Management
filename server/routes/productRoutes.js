import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin, storeOwner, checkStoreAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

// Root routes - using storeId as a query parameter
router.route('/')
  .get(getProducts) // Public endpoint to get products with optional store filter
  .post(protect, createProduct); // Create product with storeId in body

router.route('/:id')
  .get(getProductById) // Get product details - make it public
  .put(protect, updateProduct) // Update product
  .delete(protect, deleteProduct); // Delete product

// Store-specific routes (alternative approach using URL params)
router.route('/store/:storeId')
  .get(protect, checkStoreAccess, getProducts) // Get products for a specific store
  .post(protect, checkStoreAccess, createProduct); // Create product in a specific store

router.route('/store/:storeId/:id')
  .get(protect, checkStoreAccess, getProductById) // Get product details
  .put(protect, checkStoreAccess, updateProduct) // Update product
  .delete(protect, checkStoreAccess, deleteProduct); // Delete product

// Admin routes for global product management
// When mounted at /api/admin/products, this becomes /api/admin/products/all
router.route('/all')
  .get(getProducts); // Get all products across all stores (auth bypassed on Vercel)

export default router; 