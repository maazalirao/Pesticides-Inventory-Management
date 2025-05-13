import express from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js';
import { protect, admin, storeOwner, checkStoreAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

// Store-specific routes (add storeId as a parameter in the URL)
router.route('/store/:storeId')
  .get(protect, checkStoreAccess, getSuppliers) // Get suppliers for a specific store
  .post(protect, checkStoreAccess, createSupplier); // Create supplier in a specific store

router.route('/store/:storeId/:id')
  .get(protect, checkStoreAccess, getSupplierById) // Get supplier details
  .put(protect, checkStoreAccess, updateSupplier) // Update supplier
  .delete(protect, checkStoreAccess, deleteSupplier); // Delete supplier

// Admin routes for global supplier management
// The route that the frontend is trying to use
router.route('/admin/suppliers/all')
  .get(protect, admin, getSuppliers); // Get all suppliers across all stores

// Add a more flexible route that will catch various admin patterns
router.route('/admin/:action?/:subaction?')
  .get(protect, admin, (req, res, next) => {
    console.log('Flexible admin route matched for suppliers:', req.originalUrl);
    console.log('action:', req.params.action, 'subaction:', req.params.subaction);
    // If this is trying to access suppliers/all, handle it
    if (req.params.action === 'suppliers' && req.params.subaction === 'all') {
      return getSuppliers(req, res, next);
    }
    next();
  });

// Keep the old route for backward compatibility
router.route('/admin/all')
  .get(protect, admin, getSuppliers); // Get all suppliers across all stores

// Regular routes
router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/:id')
  .get(getSupplierById)
  .put(updateSupplier)
  .delete(deleteSupplier);

export default router; 