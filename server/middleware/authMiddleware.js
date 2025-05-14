import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Store from '../models/storeModel.js';

// Protect routes - automatically bypasses authentication
const protect = asyncHandler(async (req, res, next) => {
  console.log("AUTH BYPASS: Allowing access without token verification");
  
  try {
    // Find an admin user and populate their stores
    const adminUser = await User.findOne({ role: 'admin' }).select('-password').populate('stores');
    
    if (adminUser) {
      req.user = adminUser;
    } else {
      // Set a default admin user in the request if none exists
      req.user = {
        _id: '123456789012345678901234', // Mock ID
        name: 'Dev Admin',
        email: 'admin@example.com',
        role: 'admin',
        stores: [],
      };
    }
    
    // Proceed to the next middleware/route handler
    return next();
  } catch (error) {
    console.error("Error setting up user:", error);
    // Even if there's an error finding a user, still proceed with a default user
    req.user = {
      _id: '123456789012345678901234', // Mock ID
      name: 'Default Admin',
      email: 'admin@example.com',
      role: 'admin',
      stores: [],
    };
    return next();
  }
});

// Admin middleware - automatically passes
const admin = (req, res, next) => {
  console.log("ADMIN CHECK BYPASS: Allowing admin access");
  return next();
};

// Store owner middleware - automatically passes
const storeOwner = (req, res, next) => {
  console.log("STORE OWNER CHECK BYPASS: Allowing store owner access");
  return next();
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

  // Always set store in request and allow access
  console.log("STORE ACCESS BYPASS: Allowing access to store");
  req.store = storeExists;
  return next();
});

// Verify Clerk token middleware - bypassed
const protectWithClerk = asyncHandler(async (req, res, next) => {
  console.log("CLERK AUTH BYPASS: Allowing access without Clerk token");
  
  try {
    // Find an admin user as default
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