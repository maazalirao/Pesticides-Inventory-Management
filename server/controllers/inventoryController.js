import asyncHandler from 'express-async-handler';
import Inventory from '../models/inventoryModel.js';
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

// @desc    Fetch all inventory items for a specific store
// @route   GET /api/inventory/store/:storeId
// @access  Private
const getInventoryItems = asyncHandler(async (req, res) => {
  // Add extensive debug logging
  console.log('getInventoryItems called with URL:', req.originalUrl);
  console.log('Request path:', req.path);
  console.log('Request query:', req.query);
  console.log('Request params:', req.params);
  
  // Check if we're fetching inventory for a specific store or all inventory (admin only)
  const isAdminRoute = req.originalUrl.includes('/admin/all') || 
                      req.originalUrl.includes('/admin/inventory/all') ||
                      req.originalUrl.includes('/admin') && req.path === '/all';
  
  console.log('isAdminRoute:', isAdminRoute);
  
  let query = {};
  
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // For admin routes, we want all inventory - do not filter by store
  if (isAdminRoute) {
    // Keep query empty to get all inventory items across all stores
    console.log('Admin route detected - fetching inventory from all stores');
  } else if (storeId) {
    // Check if user has access to this store
    const hasAccess = await checkUserStoreAccess(req, storeId);
    if (!hasAccess) {
      res.status(403);
      throw new Error('You do not have access to this store');
    }
    
    query.store = storeId;
  } else if (req.user.role !== 'admin') {
    // If no storeId is provided and user is not admin, show inventory from their stores
    if (req.user.stores && req.user.stores.length > 0) {
      const storeIds = req.user.stores.map(store => store._id);
      query.store = { $in: storeIds };
    } else {
      // User has no store access, return empty array
      return res.json([]);
    }
  }
  
  console.log('Inventory query:', JSON.stringify(query));
  
  // Use lean() for faster queries and select only needed fields
  const inventoryItems = await Inventory.find(query)
    .select('name sku category quantity unit price threshold status supplier batches store')
    .populate('store', 'name')
    .lean()
    .exec();
  
  console.log(`Found ${inventoryItems.length} inventory items`);
  
  // For admin routes, also get all stores and return in expected format
  if (isAdminRoute) {
    const Store = mongoose.model('Store');
    const stores = await Store.find({}).lean().exec();
    
    console.log(`Found ${stores.length} stores for admin response`);
    
    // Return in the expected format for the admin dashboard
    return res.json({ 
      inventory: inventoryItems,
      stores: stores
    });
  }
  
  // For regular routes, just return the inventory items
  res.json(inventoryItems);
});

// @desc    Fetch single inventory item
// @route   GET /api/inventory/store/:storeId/:id
// @access  Private
const getInventoryItemById = asyncHandler(async (req, res) => {
  const inventoryItem = await Inventory.findOne({
    _id: req.params.id,
    store: req.params.storeId
  }).populate('store', 'name');
  
  if (inventoryItem) {
    res.json(inventoryItem);
  } else {
    res.status(404);
    throw new Error('Inventory item not found in this store');
  }
});

// @desc    Create an inventory item
// @route   POST /api/inventory/store/:storeId
// @access  Private
const createInventoryItem = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    category,
    quantity,
    unit,
    price,
    threshold,
    status,
    supplier,
    batches,
  } = req.body;

  // Check if the item already exists by SKU in this store
  const itemExists = await Inventory.findOne({ 
    sku, 
    store: req.params.storeId 
  });

  if (itemExists) {
    res.status(400);
    throw new Error('Item with this SKU already exists in this store');
  }

  // Validate batches if provided
  if (batches && batches.length > 0) {
    // Check if any batch is missing a batchId
    const missingBatchId = batches.some(batch => !batch.batchId);
    if (missingBatchId) {
      res.status(400);
      throw new Error('All batches must have a batch ID');
    }
    
    // Check for duplicate batchIds
    const batchIds = batches.map(batch => batch.batchId);
    const uniqueBatchIds = [...new Set(batchIds)];
    if (uniqueBatchIds.length < batchIds.length) {
      res.status(400);
      throw new Error('Duplicate batch IDs detected. Each batch must have a unique ID.');
    }
  }

  const inventoryItem = await Inventory.create({
    name,
    sku,
    store: req.params.storeId, // Set store ID from URL parameter
    category,
    quantity,
    unit,
    price,
    threshold,
    status,
    supplier: supplier || '',
    batches: batches || [],
  });

  if (inventoryItem) {
    res.status(201).json(inventoryItem);
  } else {
    res.status(400);
    throw new Error('Invalid inventory item data');
  }
});

// @desc    Update an inventory item
// @route   PUT /api/inventory/store/:storeId/:id
// @access  Private
const updateInventoryItem = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    category,
    quantity,
    unit,
    price,
    threshold,
    status,
    supplier,
    batches,
  } = req.body;

  // Find inventory with both ID and store ID to ensure store ownership
  const inventoryItem = await Inventory.findOne({
    _id: req.params.id,
    store: req.params.storeId
  });

  if (!inventoryItem) {
    res.status(404);
    throw new Error('Inventory item not found in this store');
    return;
  }

  // Validate batches if provided
  if (batches && batches.length > 0) {
    // Check if any batch is missing a batchId
    const missingBatchId = batches.some(batch => !batch.batchId);
    if (missingBatchId) {
      res.status(400);
      throw new Error('All batches must have a batch ID');
    }
    
    // Check for duplicate batchIds
    const batchIds = batches.map(batch => batch.batchId);
    const uniqueBatchIds = [...new Set(batchIds)];
    if (uniqueBatchIds.length < batchIds.length) {
      res.status(400);
      throw new Error('Duplicate batch IDs detected. Each batch must have a unique ID.');
    }
  }

  inventoryItem.name = name || inventoryItem.name;
  inventoryItem.sku = sku || inventoryItem.sku;
  inventoryItem.category = category || inventoryItem.category;
  inventoryItem.quantity = quantity !== undefined ? quantity : inventoryItem.quantity;
  inventoryItem.unit = unit || inventoryItem.unit;
  inventoryItem.price = price !== undefined ? price : inventoryItem.price;
  inventoryItem.threshold = threshold !== undefined ? threshold : inventoryItem.threshold;
  inventoryItem.status = status || inventoryItem.status;
  inventoryItem.supplier = supplier !== undefined ? supplier : inventoryItem.supplier;
  
  // If batches are provided, use them, otherwise keep existing batches
  if (batches) {
    inventoryItem.batches = batches;
  }
  // Store ID should not be updated to maintain data integrity

  try {
    const updatedInventoryItem = await inventoryItem.save();
    res.json(updatedInventoryItem);
  } catch (error) {
    if (error.message.includes('Duplicate batch IDs found')) {
      res.status(400);
      throw new Error('Duplicate batch IDs detected. Each batch must have a unique ID.');
    } else {
      res.status(500);
      throw new Error('Error saving inventory: ' + error.message);
    }
  }
});

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/store/:storeId/:id
// @access  Private
const deleteInventoryItem = asyncHandler(async (req, res) => {
  // Find inventory with both ID and store ID to ensure store ownership
  const inventoryItem = await Inventory.findOne({
    _id: req.params.id,
    store: req.params.storeId
  });

  if (inventoryItem) {
    await Inventory.deleteOne({ _id: inventoryItem._id });
    res.json({ message: 'Inventory item removed' });
  } else {
    res.status(404);
    throw new Error('Inventory item not found in this store');
  }
});

// @desc    Add a batch to inventory item
// @route   POST /api/inventory/store/:storeId/:id/batches
// @access  Private
const addBatchToInventoryItem = asyncHandler(async (req, res) => {
  const { 
    batchId, 
    lotNumber, 
    quantity, 
    manufacturingDate, 
    expiryDate, 
    supplier, 
    locationCode, 
    notes 
  } = req.body;

  // Find inventory with both ID and store ID to ensure store ownership
  const inventoryItem = await Inventory.findOne({
    _id: req.params.id,
    store: req.params.storeId
  });

  if (!inventoryItem) {
    res.status(404);
    throw new Error('Inventory item not found in this store');
    return;
  }

  // Validate batch ID is provided
  if (!batchId) {
    res.status(400);
    throw new Error('Batch ID is required');
    return;
  }

  // Check if batch with the same batchId already exists
  const batchExists = inventoryItem.batches.find(b => b.batchId === batchId);

  if (batchExists) {
    res.status(400);
    throw new Error('Batch with this ID already exists');
    return;
  }

  // Add the batch
  inventoryItem.batches.push({
    batchId,
    lotNumber,
    quantity,
    manufacturingDate,
    expiryDate,
    supplier,
    locationCode,
    notes
  });

  // Update the total quantity
  inventoryItem.quantity += Number(quantity);

  // Update status based on new quantity
  if (inventoryItem.quantity <= 0) {
    inventoryItem.status = 'Out of Stock';
  } else if (inventoryItem.quantity <= inventoryItem.threshold) {
    inventoryItem.status = 'Low Stock';
  } else {
    inventoryItem.status = 'In Stock';
  }

  // Save with error handling for duplicate batch IDs
  try {
    const updatedInventoryItem = await inventoryItem.save();
    res.status(201).json(updatedInventoryItem);
  } catch (error) {
    if (error.message.includes('Duplicate batch IDs found')) {
      res.status(400);
      throw new Error('Duplicate batch IDs detected. Each batch must have a unique ID.');
    } else {
      res.status(500);
      throw new Error('Error saving inventory: ' + error.message);
    }
  }
});

export { 
  getInventoryItems, 
  getInventoryItemById, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  addBatchToInventoryItem
}; 