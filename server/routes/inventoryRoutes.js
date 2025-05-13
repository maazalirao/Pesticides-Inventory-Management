import express from 'express';
import { 
  getInventoryItems, 
  getInventoryItemById, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  addBatchToInventoryItem
} from '../controllers/inventoryController.js';
import { protect, admin, storeOwner, checkStoreAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

// Store-specific inventory routes
router.route('/store/:storeId')
  .get(protect, checkStoreAccess, getInventoryItems) // Get inventory for a specific store
  .post(protect, checkStoreAccess, createInventoryItem); // Create inventory item in a store

// Get/Update/Delete specific inventory item
router.route('/store/:storeId/:id')
  .get(protect, checkStoreAccess, getInventoryItemById)
  .put(protect, checkStoreAccess, updateInventoryItem)
  .delete(protect, checkStoreAccess, deleteInventoryItem);

// Add batch to inventory item
router.route('/store/:storeId/:id/batches')
  .post(protect, checkStoreAccess, addBatchToInventoryItem);

// Admin routes for global inventory management
// The route that the frontend is actually trying to use
router.route('/admin/inventory/all')
  .get(protect, admin, getInventoryItems); // Get all inventory across all stores

// Add a more flexible route that will catch various admin patterns  
router.route('/admin/:action?/:subaction?')
  .get(protect, admin, (req, res, next) => {
    console.log('Flexible admin route matched:', req.originalUrl);
    console.log('action:', req.params.action, 'subaction:', req.params.subaction);
    // If this is trying to access inventory/all, handle it
    if (req.params.action === 'inventory' && req.params.subaction === 'all') {
      return getInventoryItems(req, res, next);
    }
    next();
  });

// Keep the old route for backward compatibility
router.route('/admin/all')
  .get(protect, admin, getInventoryItems); // Get all inventory across all stores

export default router; 