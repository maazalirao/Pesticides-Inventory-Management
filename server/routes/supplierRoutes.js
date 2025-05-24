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
// When mounted at /api/admin/suppliers, this becomes /api/admin/suppliers/all
router.route('/all')
  .get(getSuppliers); // Get all suppliers across all stores (auth bypassed on Vercel)

// Regular routes
router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/:id')
  .get(getSupplierById)
  .put(updateSupplier)
  .delete(deleteSupplier);

export default router; 