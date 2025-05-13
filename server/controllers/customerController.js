import asyncHandler from 'express-async-handler';
import Customer from '../models/customerModel.js';
import Store from '../models/storeModel.js';
import mongoose from 'mongoose';

// Helper to get store ID from either URL params or query params
const getStoreIdFromRequest = (req) => {
  return req.params.storeId || req.query.storeId || req.body.storeId;
};

// Helper to check if user has access to the store
const checkUserStoreAccess = async (req, storeId) => {
  // Admin has access to all stores
  if (req.user.role === 'admin') return true;
  
  // For store owners and employees, check if they have access to this store
  return req.user.stores.some(store => store._id.toString() === storeId);
};

// @desc    Fetch all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  // Add extensive debug logging
  console.log('getCustomers called with URL:', req.originalUrl);
  console.log('Request path:', req.path);
  console.log('Request query:', req.query);
  console.log('Request params:', req.params);
  
  // More comprehensive admin route detection
  const isAdminRoute = 
    req.originalUrl.includes('/admin') && (
      req.originalUrl.includes('/all') ||
      req.path === '/all' ||
      req.path === '/' ||
      req.originalUrl.endsWith('/admin')
    );
  
  console.log('isAdminRoute:', isAdminRoute);
  
  let query = {};
  
  // Get storeId from URL params or query params
  const storeId = req.params.storeId || req.query.storeId || req.body.storeId;
  
  // For admin routes, we want all customers - do not filter by store
  if (isAdminRoute || req.user.role === 'admin') {
    // Keep query empty to get all customers across all stores
    console.log('Admin route detected - fetching customers from all stores');
  } else if (storeId) {
    query.store = storeId;
  } else if (req.user && req.user.role !== 'admin') {
    // If no storeId is provided and user is not admin, show customers from their stores
    if (req.user.stores && req.user.stores.length > 0) {
      const storeIds = req.user.stores.map(store => store._id);
      query.store = { $in: storeIds };
    } else {
      // User has no store access, return empty array
      return res.json([]);
    }
  }
  
  console.log('Customers query:', JSON.stringify(query));
  
  try {
    // Use lean() for faster queries
    const customers = await Customer.find(query)
      .populate('store', 'name')
      .lean()
      .exec();
    
    console.log(`Found ${customers.length} customers`);
    
    // For admin routes, also get all stores and return in expected format
    if (isAdminRoute || req.user.role === 'admin') {
      const Store = mongoose.model('Store');
      const stores = await Store.find({}).lean().exec();
      
      console.log(`Found ${stores.length} stores for admin response`);
      
      // Return in the expected format for the admin dashboard
      return res.json({ 
        customers: customers,
        stores: stores
      });
    }
    
    // For regular routes, just return the customers
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500);
    throw new Error('Error fetching customers: ' + error.message);
  }
});

// @desc    Fetch single customer
// @route   GET /api/customers/store/:storeId/:id
// @access  Private
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    store: req.params.storeId
  }).populate('store', 'name');
  
  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer not found in this store');
  }
});

// @desc    Create a customer
// @route   POST /api/customers/store/:storeId
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    paymentMethod,
    taxId,
    notes,
    isActive,
  } = req.body;

  // Check if customer with this email already exists in this store
  const customerExists = await Customer.findOne({ 
    email, 
    store: req.params.storeId 
  });

  if (customerExists) {
    res.status(400);
    throw new Error('Customer with this email already exists in this store');
  }

  const customer = await Customer.create({
    name,
    email,
    phone,
    store: req.params.storeId, // Set store ID from URL parameter
    address,
    paymentMethod,
    taxId,
    notes,
    isActive: isActive !== undefined ? isActive : true,
  });

  if (customer) {
    res.status(201).json(customer);
  } else {
    res.status(400);
    throw new Error('Invalid customer data');
  }
});

// @desc    Update a customer
// @route   PUT /api/customers/store/:storeId/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  // Find customer with both ID and store ID to ensure store ownership
  const customer = await Customer.findOne({
    _id: req.params.id,
    store: req.params.storeId
  });

  if (customer) {
    customer.name = req.body.name || customer.name;
    customer.email = req.body.email || customer.email;
    customer.phone = req.body.phone || customer.phone;
    customer.address = req.body.address || customer.address;
    customer.paymentMethod = req.body.paymentMethod || customer.paymentMethod;
    customer.taxId = req.body.taxId || customer.taxId;
    customer.notes = req.body.notes || customer.notes;
    customer.isActive = req.body.isActive !== undefined ? req.body.isActive : customer.isActive;
    // Store ID should not be updated to maintain data integrity

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error('Customer not found in this store');
  }
});

// @desc    Delete a customer
// @route   DELETE /api/customers/store/:storeId/:id
// @access  Private
const deleteCustomer = asyncHandler(async (req, res) => {
  // Find customer with both ID and store ID to ensure store ownership
  const customer = await Customer.findOne({
    _id: req.params.id,
    store: req.params.storeId
  });

  if (customer) {
    await customer.deleteOne();
    res.json({ message: 'Customer removed' });
  } else {
    res.status(404);
    throw new Error('Customer not found in this store');
  }
});

export {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
}; 