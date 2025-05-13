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
// The route that the frontend is trying to use
router.route('/admin/customers/all')
  .get(protect, admin, getCustomers); // Get all customers across all stores

// Add a more flexible route that will catch various admin patterns
router.route('/admin/:action?/:subaction?')
  .get(protect, admin, (req, res, next) => {
    console.log('Flexible admin route matched for customers:', req.originalUrl);
    console.log('action:', req.params.action, 'subaction:', req.params.subaction);
    // If this is trying to access customers/all, handle it
    if (req.params.action === 'customers' && req.params.subaction === 'all') {
      return getCustomers(req, res, next);
    }
    next();
  });

// Keep the old route for backward compatibility
router.route('/admin/all')
  .get(protect, admin, getCustomers); // Get all customers across all stores (admin only)

export default router; 