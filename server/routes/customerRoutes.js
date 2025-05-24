import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect, admin, storeOwner, checkStoreAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

// Store-specific routes (add storeId as a parameter in the URL)
router.route('/store/:storeId')
  .get(protect, checkStoreAccess, getCustomers) // Get customers for a specific store
  .post(protect, checkStoreAccess, createCustomer); // Create customer in a specific store

router.route('/store/:storeId/:id')
  .get(protect, checkStoreAccess, getCustomerById) // Get customer details
  .put(protect, checkStoreAccess, updateCustomer) // Update customer
  .delete(protect, checkStoreAccess, deleteCustomer); // Delete customer

// Admin routes for global customer management
// When mounted at /api/admin/customers, this becomes /api/admin/customers/all
router.route('/all')
  .get(getCustomers); // Get all customers across all stores (auth bypassed on Vercel)

export default router; 