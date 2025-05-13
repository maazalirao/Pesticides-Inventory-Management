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
import { protect, admin, storeOwner, checkStoreAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

// Store-specific analytics routes
// All routes require store access verification
router.get('/store/:storeId/dashboard-stats', protect, checkStoreAccess, getDashboardStats);
router.get('/store/:storeId/sales-data', protect, checkStoreAccess, getSalesData);
router.get('/store/:storeId/inventory-distribution', protect, checkStoreAccess, getInventoryDistribution);
router.get('/store/:storeId/customer-segments', protect, checkStoreAccess, getCustomerSegments);
router.get('/store/:storeId/sales-forecast', protect, checkStoreAccess, getSalesForecast);
router.get('/store/:storeId/low-stock', protect, checkStoreAccess, getLowStockProducts);
router.get('/store/:storeId/expiring-products', protect, checkStoreAccess, getExpiringProducts);
router.get('/store/:storeId/recent-sales', protect, checkStoreAccess, getRecentSales);

// Legacy routes - these should be deprecated and removed once frontend is updated
// They will fall back to the first store the user has access to
router.get('/dashboard-stats', protect, (req, res, next) => {
  if (req.user.stores && req.user.stores.length > 0) {
    req.params.storeId = req.user.stores[0]._id;
  }
  next();
}, getDashboardStats);

router.get('/sales-data', protect, (req, res, next) => {
  if (req.user.stores && req.user.stores.length > 0) {
    req.params.storeId = req.user.stores[0]._id;
  }
  next();
}, getSalesData);

router.get('/inventory-distribution', protect, (req, res, next) => {
  if (req.user.stores && req.user.stores.length > 0) {
    req.params.storeId = req.user.stores[0]._id;
  }
  next();
}, getInventoryDistribution);

router.get('/customer-segments', protect, (req, res, next) => {
  if (req.user.stores && req.user.stores.length > 0) {
    req.params.storeId = req.user.stores[0]._id;
  }
  next();
}, getCustomerSegments);

router.get('/sales-forecast', protect, (req, res, next) => {
  if (req.user.stores && req.user.stores.length > 0) {
    req.params.storeId = req.user.stores[0]._id;
  }
  next();
}, getSalesForecast);

router.get('/low-stock', protect, (req, res, next) => {
  if (req.user.stores && req.user.stores.length > 0) {
    req.params.storeId = req.user.stores[0]._id;
  }
  next();
}, getLowStockProducts);

router.get('/expiring-products', protect, (req, res, next) => {
  if (req.user.stores && req.user.stores.length > 0) {
    req.params.storeId = req.user.stores[0]._id;
  }
  next();
}, getExpiringProducts);

router.get('/recent-sales', protect, (req, res, next) => {
  if (req.user.stores && req.user.stores.length > 0) {
    req.params.storeId = req.user.stores[0]._id;
  }
  next();
}, getRecentSales);

export default router; 