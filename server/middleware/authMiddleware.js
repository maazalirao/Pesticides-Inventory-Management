import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Store from '../models/storeModel.js';

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  // For development: completely bypass auth
  if (process.env.NODE_ENV === 'development') {
    console.log("DEV MODE: Bypassing authentication");
    
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
      console.error("Error setting up development user:", error);
      // Continue with normal auth flow if this fails
    }
  }
  
  // Normal authentication logic for production...
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Skip token verification if token is "null" or "undefined" in development mode
      if ((token === 'null' || token === 'undefined') && process.env.NODE_ENV === 'development') {
        console.log("Token is null/undefined, using development fallback");
        // Use development fallback
        return useDevelopmentFallback(req, res, next);
      }
      
      console.log("Received token:", token ? token.substring(0, 15) + "..." : "none");

      // First try to verify with our JWT_SECRET
      let decoded = null;
      try {
        if (!process.env.JWT_SECRET) {
          console.log("No JWT_SECRET defined, using default");
          decoded = jwt.verify(token, 'development_secret_key_replace_in_production');
        } else {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        }
        
        // If successful, get user from our database
        req.user = await User.findById(decoded.id).select('-password').populate('stores');
      } catch (verifyError) {
        console.log("JWT verification failed, trying alternative auth:", verifyError.message);
        
        // For development mode, use fallback
        if (process.env.NODE_ENV === 'development') {
          return useDevelopmentFallback(req, res, next);
        } else {
          throw verifyError; // Re-throw in production
        }
      }

      if (!req.user) {
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401);
      throw new Error('Not authorized, token failed: ' + error.message);
    }
  } else {
    // For development mode, auto-login as admin
    if (process.env.NODE_ENV === 'development') {
      return useDevelopmentFallback(req, res, next);
    }

    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Helper function for development fallback authentication
const useDevelopmentFallback = async (req, res, next) => {
  try {
    const defaultAdmin = await User.findOne({
      role: 'admin'
    }).select('-password').populate('stores');
    
    if (defaultAdmin) {
      console.log("Auto-login as admin (development only)");
      req.user = defaultAdmin;
      next();
      return;
    } else {
      // Create a default admin if none exists
      console.log("Creating default admin user");
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      
      req.user = await User.findById(admin._id).select('-password');
      next();
      return;
    }
  } catch (error) {
    console.error("Error in dev auto-login:", error);
    res.status(401);
    throw new Error('Development auth failed: ' + error.message);
  }
};

// Admin middleware
const admin = (req, res, next) => {
  // For development: bypass admin check
  if (process.env.NODE_ENV === 'development') {
    console.log("DEV MODE: Bypassing admin check");
    return next();
  }
  
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Store owner middleware (includes admin)
const storeOwner = (req, res, next) => {
  // For development: bypass store owner check
  if (process.env.NODE_ENV === 'development') {
    console.log("DEV MODE: Bypassing store owner check");
    return next();
  }
  
  if (req.user && (req.user.role === 'admin' || req.user.role === 'store_owner')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a store owner');
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

  // In development mode, still enforce the store filter but don't check access rights
  if (process.env.NODE_ENV === 'development') {
    console.log("DEV MODE: Setting store in request but skipping access check");
    req.store = storeExists;
    return next();
  }

  // Admin has access to all stores
  if (req.user && req.user.role === 'admin') {
    req.store = storeExists;
    return next();
  }

  // For store owners and employees, check if they have access to this store
  if (req.user && req.user.stores) {
    const hasAccess = req.user.stores.some(store => store._id.toString() === storeId);
    
    if (hasAccess) {
      // Set the store in the request for later use
      req.store = storeExists;
      return next();
    }
  }

  // If we reach here, user doesn't have access
  res.status(403);
  throw new Error('You do not have access to this store');
});

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
      const user = await User.findOne({ clerkId }).select('-password').populate('stores');
      
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

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error('Middleware Error:', err.message);
  
  // For development mode, log more details
  if (process.env.NODE_ENV === 'development') {
    console.error('Error stack:', err.stack);
  }
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

export { protect, admin, storeOwner, checkStoreAccess, protectWithClerk, errorHandler }; 