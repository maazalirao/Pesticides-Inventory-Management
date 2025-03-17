import express from 'express';
import { 
  getInventoryItems, 
  getInventoryItemById, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  addBatchToInventoryItem
} from '../controllers/inventoryController.js';

const router = express.Router();

// Get all inventory items / Create new inventory item
router.route('/').get(getInventoryItems).post(createInventoryItem);

// Get/Update/Delete specific inventory item
router.route('/:id')
  .get(getInventoryItemById)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

// Add batch to inventory item
router.route('/:id/batches').post(addBatchToInventoryItem);

export default router; 