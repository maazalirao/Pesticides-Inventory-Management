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
// When mounted at /api/admin/inventory, this becomes /api/admin/inventory/all
router.route('/all')
  .get(getInventoryItems); // Get all inventory across all stores (auth bypassed on Vercel)

export default router; 