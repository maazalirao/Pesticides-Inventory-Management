import express from 'express';
import { 
  getInventoryItems, 
  getInventoryItemById, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  addBatchToInventoryItem
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all inventory items / Create new inventory item
router.route('/').get(protect, getInventoryItems).post(protect, createInventoryItem);

// Get, update, delete inventory item by ID
router
  .route('/:id')
  .get(protect, getInventoryItemById)
  .put(protect, updateInventoryItem)
  .delete(protect, deleteInventoryItem);

// Add a batch to an inventory item
router.route('/:id/batches').post(protect, addBatchToInventoryItem);

export default router; 