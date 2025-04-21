import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin, protectWithClerk } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes

// Protected customer routes
router.route('/profile')
  .get(protectWithClerk, getUserProfile)
  .put(protectWithClerk, updateUserProfile);

// Admin routes
router.route('/')
  .get(protectWithClerk, admin, getUsers);

router.route('/:id')
  .get(protectWithClerk, admin, getUserById)
  .put(protectWithClerk, admin, updateUser)
  .delete(protectWithClerk, admin, deleteUser);

export default router; 