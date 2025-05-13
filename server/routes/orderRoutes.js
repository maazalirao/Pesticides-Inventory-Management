import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyStoreOrders,
  getMyOrders,
  getStoreOrders,
  getAllOrders,
} from '../controllers/orderController.js';
import { 
  protectWithClerk, 
  admin, 
  storeOwner, 
  checkStoreAccess 
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for all users
router.route('/myorders')
  .get(protectWithClerk, getMyOrders);

// Admin routes for all stores
router.route('/admin/all')
  .get(protectWithClerk, admin, getAllOrders);

// Store-specific routes
router.route('/store/:storeId')
  .post(protectWithClerk, checkStoreAccess, createOrder)
  .get(protectWithClerk, storeOwner, checkStoreAccess, getStoreOrders);

router.route('/store/:storeId/myorders')
  .get(protectWithClerk, checkStoreAccess, getMyStoreOrders);

router.route('/store/:storeId/:id')
  .get(protectWithClerk, checkStoreAccess, getOrderById);

router.route('/store/:storeId/:id/pay')
  .put(protectWithClerk, checkStoreAccess, updateOrderToPaid);

router.route('/store/:storeId/:id/status')
  .put(protectWithClerk, storeOwner, checkStoreAccess, updateOrderStatus);

export default router; 