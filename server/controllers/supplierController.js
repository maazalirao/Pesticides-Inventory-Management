import asyncHandler from 'express-async-handler';
import Supplier from '../models/supplierModel.js';
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

// @desc    Fetch all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
  // Add extensive debug logging
  console.log('getSuppliers called with URL:', req.originalUrl);
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
  
  // For admin routes, we want all suppliers - do not filter by store
  if (isAdminRoute || req.user.role === 'admin') {
    // Keep query empty to get all suppliers across all stores
    console.log('Admin route detected - fetching suppliers from all stores');
  } else if (storeId) {
    query.store = storeId;
  } else if (req.user && req.user.role !== 'admin') {
    // If no storeId is provided and user is not admin, show suppliers from their stores
    if (req.user.stores && req.user.stores.length > 0) {
      const storeIds = req.user.stores.map(store => store._id);
      query.store = { $in: storeIds };
    } else {
      // User has no store access, return empty array
      return res.json([]);
    }
  }
  
  console.log('Suppliers query:', JSON.stringify(query));
  
  try {
    // Use lean() for faster queries
    const suppliers = await Supplier.find(query)
      .populate('store', 'name')
      .lean()
      .exec();
    
    console.log(`Found ${suppliers.length} suppliers`);
    
    // For admin routes, also get all stores and return in expected format
    if (isAdminRoute || req.user.role === 'admin') {
      const Store = mongoose.model('Store');
      const stores = await Store.find({}).lean().exec();
      
      console.log(`Found ${stores.length} stores for admin response`);
      
      // Return in the expected format for the admin dashboard
      return res.json({ 
        suppliers: suppliers,
        stores: stores
      });
    }
    
    // For regular routes, just return the suppliers
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500);
    throw new Error('Error fetching suppliers: ' + error.message);
  }
});

// @desc    Fetch single supplier
// @route   GET /api/suppliers/store/:storeId/:id
// @access  Private
const getSupplierById = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the supplier
  const query = { _id: req.params.id };
  
  // If storeId is provided, add it to the query
  if (storeId) {
    query.store = storeId;
    
    // Check if user has access to this store
    const hasAccess = await checkUserStoreAccess(req, storeId);
    if (!hasAccess) {
      res.status(403);
      throw new Error('You do not have access to this store');
    }
  }
  
  const supplier = await Supplier.findOne(query).populate('store', 'name');
  
  if (supplier) {
    res.json(supplier);
  } else {
    res.status(404);
    throw new Error('Supplier not found in this store');
  }
});

// @desc    Create a supplier
// @route   POST /api/suppliers/store/:storeId
// @access  Private
const createSupplier = asyncHandler(async (req, res) => {
  const {
    name,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    notes,
    isActive,
  } = req.body;
  
  // Get storeId from URL params or request body
  const storeId = getStoreIdFromRequest(req);
  
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
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }

  // Check if supplier with this email already exists in this store
  const supplierExists = await Supplier.findOne({ 
    email, 
    store: storeId 
  });

  if (supplierExists) {
    res.status(400);
    throw new Error('Supplier with this email already exists in this store');
  }

  const supplier = await Supplier.create({
    name,
    contactPerson,
    email,
    phone,
    store: storeId,
    address,
    taxId,
    paymentTerms,
    notes,
    isActive: isActive !== undefined ? isActive : true,
  });

  if (supplier) {
    res.status(201).json(supplier);
  } else {
    res.status(400);
    throw new Error('Invalid supplier data');
  }
});

// @desc    Update a supplier
// @route   PUT /api/suppliers/store/:storeId/:id
// @access  Private
const updateSupplier = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the supplier
  const query = { _id: req.params.id };
  
  // If storeId is provided, add it to the query
  if (storeId) {
    query.store = storeId;
    
    // Check if user has access to this store
    const hasAccess = await checkUserStoreAccess(req, storeId);
    if (!hasAccess) {
      res.status(403);
      throw new Error('You do not have access to this store');
    }
  }
  
  const supplier = await Supplier.findOne(query);

  if (supplier) {
    supplier.name = req.body.name || supplier.name;
    supplier.contactPerson = req.body.contactPerson || supplier.contactPerson;
    supplier.email = req.body.email || supplier.email;
    supplier.phone = req.body.phone || supplier.phone;
    supplier.address = req.body.address || supplier.address;
    supplier.taxId = req.body.taxId || supplier.taxId;
    supplier.paymentTerms = req.body.paymentTerms || supplier.paymentTerms;
    supplier.notes = req.body.notes || supplier.notes;
    supplier.isActive = req.body.isActive !== undefined ? req.body.isActive : supplier.isActive;
    // Do not update the store reference to maintain data integrity

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } else {
    res.status(404);
    throw new Error('Supplier not found in this store');
  }
});

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/store/:storeId/:id
// @access  Private
const deleteSupplier = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the supplier
  const query = { _id: req.params.id };
  
  // If storeId is provided, add it to the query
  if (storeId) {
    query.store = storeId;
    
    // Check if user has access to this store
    const hasAccess = await checkUserStoreAccess(req, storeId);
    if (!hasAccess) {
      res.status(403);
      throw new Error('You do not have access to this store');
    }
  }
  
  const supplier = await Supplier.findOne(query);

  if (supplier) {
    await supplier.deleteOne();
    res.json({ message: 'Supplier removed' });
  } else {
    res.status(404);
    throw new Error('Supplier not found in this store');
  }
});

export {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
}; 