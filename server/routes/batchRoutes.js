import express from 'express';
import { 
  getBatches, 
  getBatchById, 
  createBatch, 
  updateBatch, 
  deleteBatch 
} from '../controllers/batchController.js';

const router = express.Router();

// Get all batches / Create new batch
router.route('/').get(getBatches).post(createBatch);

// Get/Update/Delete specific batch
router.route('/:id')
  .get(getBatchById)
  .put(updateBatch)
  .delete(deleteBatch);

export default router; 