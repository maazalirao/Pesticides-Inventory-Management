import express from 'express';
import { protect, admin, storeOwner, checkStoreAccess } from '../middleware/authMiddleware.js';
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  assignUserToStore,
  removeUserFromStore,
  getMyStores,
  repairStoreRelationships,
  getPublicStores
} from '../controllers/storeController.js';

// This is a placeholder - you'll need to create the actual controller
// import {
//   createStore,
//   getStores,
//   getStoreById,
//   updateStore,
//   deleteStore,
//   assignUserToStore,
//   removeUserFromStore
// } from '../controllers/storeController.js';

const router = express.Router();

// Admin only routes
router.route('/')
  .post(protect, admin, createStore)
  .get(protect, admin, getStores);

// Routes for store owners (to get their stores)
// Note: This MUST be before the '/:id' routes to avoid path conflicts
router.route('/mystores')
  .get(protect, storeOwner, getMyStores);

// Public route to get active stores for customer view
router.route('/public')
  .get(getPublicStores);

// Special debug endpoint for development mode
router.route('/repair-relationships')
  .get(protect, repairStoreRelationships);

// Admin store management
router.route('/:id')
  .get(protect, admin, getStoreById)
  .put(protect, admin, updateStore)
  .delete(protect, admin, deleteStore);

// User assignment routes
router.route('/:id/users')
  .post(protect, admin, assignUserToStore)
  .delete(protect, admin, removeUserFromStore);

export default router; 