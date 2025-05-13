import Invoice from '../models/invoiceModel.js';
import Store from '../models/storeModel.js';
import asyncHandler from 'express-async-handler';

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

// Get all invoices for a specific store
export const getAllInvoices = asyncHandler(async (req, res) => {
  // Check if we're fetching invoices for a specific store or all invoices (admin only)
  const isAdminRoute = req.originalUrl.includes('/admin/all');
  
  let query = {};
  
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // If storeId is provided, check access and filter by store
  if (storeId) {
    // Check if user has access to this store
    const hasAccess = await checkUserStoreAccess(req, storeId);
    if (!hasAccess) {
      res.status(403);
      throw new Error('You do not have access to this store');
    }
    
    query.store = storeId;
  } else if (!isAdminRoute && req.user.role !== 'admin') {
    // If no storeId is provided and user is not admin, show invoices from their stores
    if (req.user.stores && req.user.stores.length > 0) {
      const storeIds = req.user.stores.map(store => store._id);
      query.store = { $in: storeIds };
    } else {
      // User has no store access, return empty array
      return res.json({
        success: true,
        data: []
      });
    }
  }
  
  const invoices = await Invoice.find(query)
    .sort({ createdAt: -1 })
    .populate('store', 'name')
    .populate('customer', 'name');
  
  res.status(200).json({
    success: true,
    data: invoices
  });
});

// Get single invoice
export const getInvoice = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the invoice
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
  
  const invoice = await Invoice.findOne(query)
    .populate('store', 'name')
    .populate('customer', 'name');
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found in this store'
    });
  }
  
  res.status(200).json({
    success: true,
    data: invoice
  });
});

// Create new invoice
export const createInvoice = asyncHandler(async (req, res) => {
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
  
  // Generate invoice number with store prefix
  const storePrefix = storeExists.name.substring(0, 3).toUpperCase();
  const invoiceNumber = `${storePrefix}-${Date.now()}`;
  
  const invoice = await Invoice.create({
    ...req.body,
    store: storeId,
    invoiceNumber
  });

  res.status(201).json({
    success: true,
    data: invoice
  });
});

// Update invoice
export const updateInvoice = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the invoice
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
  
  // Make sure store field cannot be changed
  const updateData = { ...req.body };
  delete updateData.store; // Prevent changing store association

  const invoice = await Invoice.findOneAndUpdate(
    query,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found in this store'
    });
  }

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// Delete invoice
export const deleteInvoice = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the invoice
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
  
  const invoice = await Invoice.findOneAndDelete(query);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found in this store'
    });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Update invoice status
export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the invoice
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
  
  const { status } = req.body;
  const invoice = await Invoice.findOneAndUpdate(
    query,
    { status },
    {
      new: true,
      runValidators: true
    }
  );

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found in this store'
    });
  }

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// Get invoices by status
export const getInvoicesByStatus = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding invoices
  const query = { status: req.params.status };
  
  // If storeId is provided, add it to the query
  if (storeId) {
    query.store = storeId;
    
    // Check if user has access to this store
    const hasAccess = await checkUserStoreAccess(req, storeId);
    if (!hasAccess) {
      res.status(403);
      throw new Error('You do not have access to this store');
    }
  } else if (req.user.role !== 'admin') {
    // If no storeId is provided and user is not admin, show invoices from their stores
    if (req.user.stores && req.user.stores.length > 0) {
      const storeIds = req.user.stores.map(store => store._id);
      query.store = { $in: storeIds };
    } else {
      // User has no store access, return empty array
      return res.json({
        success: true,
        data: []
      });
    }
  }
  
  const invoices = await Invoice.find(query)
    .populate('store', 'name')
    .populate('customer', 'name');
  
  res.status(200).json({
    success: true,
    data: invoices
  });
}); 