import asyncHandler from 'express-async-handler';
import Inventory from '../models/inventoryModel.js';

// @desc    Fetch all inventory items
// @route   GET /api/inventory
// @access  Private
const getInventoryItems = asyncHandler(async (req, res) => {
  const inventoryItems = await Inventory.find({});
  res.json(inventoryItems);
});

// @desc    Fetch single inventory item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItemById = asyncHandler(async (req, res) => {
  const inventoryItem = await Inventory.findById(req.params.id);
  
  if (inventoryItem) {
    res.json(inventoryItem);
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

// @desc    Create a inventory item
// @route   POST /api/inventory
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

  // Check if the item already exists by SKU
  const itemExists = await Inventory.findOne({ sku });

  if (itemExists) {
    res.status(400);
    throw new Error('Item with this SKU already exists');
  }

  const inventoryItem = await Inventory.create({
    name,
    sku,
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

// @desc    Update a inventory item
// @route   PUT /api/inventory/:id
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

  const inventoryItem = await Inventory.findById(req.params.id);

  if (inventoryItem) {
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

    const updatedInventoryItem = await inventoryItem.save();
    res.json(updatedInventoryItem);
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

// @desc    Delete a inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const inventoryItem = await Inventory.findById(req.params.id);

  if (inventoryItem) {
    await Inventory.deleteOne({ _id: inventoryItem._id });
    res.json({ message: 'Inventory item removed' });
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

// @desc    Add a batch to inventory item
// @route   POST /api/inventory/:id/batches
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

  const inventoryItem = await Inventory.findById(req.params.id);

  if (inventoryItem) {
    // Check if batch with the same batchId already exists
    const batchExists = inventoryItem.batches.find(b => b.batchId === batchId);

    if (batchExists) {
      res.status(400);
      throw new Error('Batch with this ID already exists');
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

    const updatedInventoryItem = await inventoryItem.save();
    res.status(201).json(updatedInventoryItem);
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
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