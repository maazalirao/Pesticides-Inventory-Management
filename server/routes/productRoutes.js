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
  .get(protect, getProducts) // Get products with optional storeId in query
  .post(protect, createProduct); // Create product with storeId in body

router.route('/:id')
  .get(protect, getProductById) // Get product details
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
// The route that the frontend is trying to use
router.route('/admin/products/all')
  .get(protect, admin, getProducts); // Get all products across all stores

// Add a more flexible route that will catch various admin patterns
router.route('/admin/:action?/:subaction?')
  .get(protect, admin, (req, res, next) => {
    console.log('Flexible admin route matched for products:', req.originalUrl);
    console.log('action:', req.params.action, 'subaction:', req.params.subaction);
    // If this is trying to access products/all, handle it
    if (req.params.action === 'products' && req.params.subaction === 'all') {
      return getProducts(req, res, next);
    }
    next();
  });

// Keep the old route for backward compatibility
router.route('/admin/all')
  .get(protect, admin, getProducts); // Get all products across all stores (admin only)

export default router; 