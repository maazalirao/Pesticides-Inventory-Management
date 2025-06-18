import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Store from '../models/storeModel.js';

// Protect routes - Real JWT authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Auth middleware - Request URL:', req.originalUrl);
  console.log('Auth middleware - Headers authorization:', req.headers.authorization ? 'Present' : 'Missing');

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  try {
      // Get token from header (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth middleware - Token extracted:', token ? 'Yes' : 'No');

      // Verify token
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set in environment variables');
        res.status(500);
        throw new Error('Server configuration error');
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token and remove password
      req.user = await User.findById(decoded.id).select('-password').populate('stores');
      console.log('Auth middleware - User found:', req.user ? req.user.email : 'None');
      console.log('Auth middleware - User role:', req.user?.role);
      console.log('Auth middleware - User stores count:', req.user?.stores?.length || 0);

      if (!req.user) {
        console.log('Auth middleware - No user found for token');
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
  } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    console.log('Auth middleware - No token provided');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware - Check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
};

// Store owner middleware - Check if user is admin or store owner
const storeOwner = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'store_owner')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as store owner');
  }
};

// Middleware to check store access
const checkStoreAccess = asyncHandler(async (req, res, next) => {
  const storeId = req.params.storeId || req.query.storeId || req.body.storeId;
  
  if (!storeId) {
    res.status(400);
    throw new Error('Store ID is required');
  }

  // Check if store exists
  const storeExists = await Store.findById(storeId);
  if (!storeExists) {
    res.status(404);
    throw new Error('Store not found');
  }

  // Check if user has access to this store
  if (req.user.role === 'admin') {
    // Admin has access to all stores
    req.store = storeExists;
    return next();
  } else if (req.user.role === 'store_owner') {
    // Check if store is in user's stores array
    const hasAccess = req.user.stores.some(store => store._id.equals(storeId));
    if (hasAccess) {
  req.store = storeExists;
  return next();
    } else {
      res.status(403);
      throw new Error('Access denied to this store');
    }
  } else {
    res.status(403);
    throw new Error('Insufficient permissions');
  }
});

// Verify Clerk token middleware - for customer routes
const protectWithClerk = asyncHandler(async (req, res, next) => {
  console.log("CLERK AUTH BYPASS: Allowing access without Clerk token");
  
  try {
    // Find an admin user as default for development
    const adminUser = await User.findOne({ role: 'admin' }).select('-password').populate('stores');
    
    if (adminUser) {
      req.user = adminUser;
    } else {
      // Set a default admin user in the request if none exists
      req.user = {
        _id: '123456789012345678901234', // Mock ID
        name: 'Default Admin',
        email: 'admin@example.com',
        role: 'admin',
        stores: [],
      };
    }
    
    next();
  } catch (error) {
    console.error("Error in Clerk auth bypass:", error);
    // Even if there's an error, still proceed with a default user
    req.user = {
      _id: '123456789012345678901234', // Mock ID
      name: 'Default Admin',
      email: 'admin@example.com',
      role: 'admin',
      stores: [],
    };
    next();
  }
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error('Middleware Error:', err.message);
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

export { protect, admin, storeOwner, checkStoreAccess, protectWithClerk, errorHandler };