import express from 'express';
import {
  getDashboardStats,
  getSalesData,
  getInventoryDistribution,
  getCustomerSegments,
  getSalesForecast,
  getLowStockProducts,
  getExpiringProducts,
  getRecentSales
} from '../controllers/analyticsController.js';
import { protectWithClerk, admin, staff } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard statistics - temporarily remove auth requirements
router.get('/dashboard-stats', getDashboardStats);

// Sales data for charts
router.get('/sales-data', getSalesData);

// Inventory distribution
router.get('/inventory-distribution', getInventoryDistribution);

// Customer segments
router.get('/customer-segments', getCustomerSegments);

// Sales forecast
router.get('/sales-forecast', getSalesForecast);

// Low stock products
router.get('/low-stock', getLowStockProducts);

// Expiring products
router.get('/expiring-products', getExpiringProducts);

// Recent sales
router.get('/recent-sales', getRecentSales);

export default router; 