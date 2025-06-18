import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Admin login
// @route   POST /api/users/admin/login
// @access  Public
router.post('/admin/login', authUser);

// @desc    Admin logout
// @route   POST /api/users/admin/logout
// @access  Private
router.post('/admin/logout', (req, res) => {
  // Since we're using JWT tokens, logout is handled on the frontend by removing the token
  res.json({ message: 'Admin logged out successfully' });
});

// Public routes
router.route('/').post(registerUser);
router.post('/login', authUser);

// Protected routes
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// Admin only routes
router.route('/').get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUserById).put(protect, admin, updateUser).delete(protect, admin, deleteUser);

export default router; 