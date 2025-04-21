import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Staff middleware (includes admin)
const staff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as staff');
  }
};

// Verify Clerk token middleware
const protectWithClerk = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // For Clerk integration:
      // In a real implementation, you would verify the Clerk token
      // and use the clerkId to find the associated user
      
      // This is a simplified version - in production, implement proper Clerk token verification
      const clerkId = 'clerk-user-id'; // This would come from verifying the token
      
      // Find user by Clerk ID
      const user = await User.findOne({ clerkId }).select('-password');
      
      if (!user) {
        // Create a new user if not found (optional)
        // This depends on your user onboarding flow
        // const newUser = await User.create({...});
        // req.user = newUser;
        
        res.status(404);
        throw new Error('User not found');
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect, admin, staff, protectWithClerk }; 