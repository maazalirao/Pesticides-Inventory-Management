import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
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

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public/Private
const getProducts = asyncHandler(async (req, res) => {
  // Add extensive debug logging
  console.log('getProducts called with URL:', req.originalUrl);
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
  // For public endpoints, check 'store' parameter to filter by store
  const storeId = req.params.storeId || req.query.storeId || req.query.store || req.body.storeId;
  
  // Check if request is from a public endpoint (no user object)
  const isPublicRequest = !req.user;
  
  if (isPublicRequest) {
    // Public API requests
    if (storeId) {
      query.store = storeId;
    }
    
    // Always filter by active status for public requests
    query.status = { $ne: 'discontinued' };
  } else if (isAdminRoute || req.user.role === 'admin') {
    // For admin routes, we want all products - do not filter by store
    console.log('Admin route detected - fetching products from all stores');
  } else if (storeId) {
    query.store = storeId;
  } else if (req.user.role !== 'admin') {
    // If no storeId is provided and user is not admin, show products from their stores
    if (req.user.stores && req.user.stores.length > 0) {
      const storeIds = req.user.stores.map(store => store._id);
      query.store = { $in: storeIds };
    } else {
      // User has no store access, return empty array
      return res.json([]);
    }
  }
  
  console.log('Products query:', JSON.stringify(query));
  
  try {
    // Use lean() for faster queries
    const products = await Product.find(query)
      .populate('store', 'name')
      .populate('supplier', 'name')
      .lean()
      .exec();
    
    console.log(`Found ${products.length} products`);
    
    // For admin routes, also get all stores and return in expected format
    if (!isPublicRequest && (isAdminRoute || req.user.role === 'admin')) {
      const Store = mongoose.model('Store');
      const stores = await Store.find({}).lean().exec();
      
      console.log(`Found ${stores.length} stores for admin response`);
      
      // Return in the expected format for the admin dashboard
      return res.json({ 
        products: products,
        stores: stores
      });
    }
    
    // For regular routes, just return the products
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500);
    throw new Error('Error fetching products: ' + error.message);
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public/Private
const getProductById = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the product
  const query = { _id: req.params.id };
  
  // If storeId is provided, add it to the query
  if (storeId) {
    query.store = storeId;
  }
  
  // For public requests, only return active products
  const isPublicRequest = !req.user;
  if (isPublicRequest) {
    query.status = { $ne: 'discontinued' };
  }
  
  // Find the product
  const product = await Product.findOne(query)
    .populate('supplier', 'name')
    .populate('store', 'name');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if user has access to the store this product belongs to (skip for public requests)
  if (!isPublicRequest) {
    const hasAccess = await checkUserStoreAccess(req, product.store._id.toString());
    if (!hasAccess) {
      res.status(403);
      throw new Error('You do not have access to this product');
    }
  }
  
  res.json(product);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    stock,
    threshold,
    sku,
    supplier,
    image,
    manufacturer,
    toxicityLevel,
    usage,
    status,
    tags,
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

  // Check if product with this SKU already exists in this store
  const productExists = await Product.findOne({ 
    sku, 
    store: storeId 
  });

  if (productExists) {
    res.status(400);
    throw new Error('Product with this SKU already exists in this store');
  }

  const product = await Product.create({
    name,
    description,
    category,
    price,
    stockQuantity: stock, // Map to the correct field in the model
    stock, // Additional field if needed in the UI
    threshold,
    sku,
    store: storeId,
    supplier,
    image: image || '/images/default-product.jpg',
    manufacturer,
    toxicityLevel,
    recommendedUse: usage, // Map recommendedUse to usage from the UI
    status,
    tags: tags || [],
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error('Invalid product data');
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  // Get storeId from URL params or request body
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the product
  const query = { _id: req.params.id };
  
  // If storeId is provided, add it to the query
  if (storeId) {
    query.store = storeId;
  }
  
  // Find the product
  const product = await Product.findOne(query);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if user has access to the store this product belongs to
  const hasAccess = await checkUserStoreAccess(req, product.store.toString());
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this product');
  }

  // Update fields
  product.name = req.body.name || product.name;
  product.description = req.body.description || product.description;
  product.category = req.body.category || product.category;
  product.price = req.body.price !== undefined ? req.body.price : product.price;
  product.stockQuantity = req.body.stock !== undefined ? req.body.stock : product.stockQuantity;
  product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
  product.threshold = req.body.threshold !== undefined ? req.body.threshold : product.threshold;
  product.sku = req.body.sku || product.sku;
  product.supplier = req.body.supplier || product.supplier;
  product.image = req.body.image || product.image;
  product.manufacturer = req.body.manufacturer || product.manufacturer;
  product.toxicityLevel = req.body.toxicityLevel || product.toxicityLevel;
  product.recommendedUse = req.body.usage || product.recommendedUse;
  product.status = req.body.status || product.status;
  product.tags = req.body.tags || product.tags;
  // Store ID should not be updated to maintain data integrity

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
  // Get storeId from URL params or query params
  const storeId = getStoreIdFromRequest(req);
  
  // Build query for finding the product
  const query = { _id: req.params.id };
  
  // If storeId is provided, add it to the query
  if (storeId) {
    query.store = storeId;
  }
  
  // Find the product
  const product = await Product.findOne(query);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if user has access to the store this product belongs to
  const hasAccess = await checkUserStoreAccess(req, product.store.toString());
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this product');
  }

  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}; 