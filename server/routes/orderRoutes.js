import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
} from '../controllers/orderController.js';
import { protectWithClerk, admin, staff } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer routes
router.route('/')
  .post(protectWithClerk, createOrder)
  .get(protectWithClerk, admin, getOrders);

router.route('/myorders')
  .get(protectWithClerk, getMyOrders);

router.route('/:id')
  .get(protectWithClerk, getOrderById);

router.route('/:id/pay')
  .put(protectWithClerk, updateOrderToPaid);

// Admin routes
router.route('/:id/status')
  .put(protectWithClerk, staff, updateOrderStatus);

export default router; 