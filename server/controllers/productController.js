import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // Use lean() for faster queries and select only needed fields
  const products = await Product.find({})
    .select('name description category price stockQuantity sku image manufacturer toxicityLevel recommendedUse tags')
    .lean()
    .exec();
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('supplier', 'name');
  
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    stockQuantity,
    sku,
    supplier,
    image,
    manufacturer,
    toxicityLevel,
    recommendedUse,
    tags,
  } = req.body;

  const productExists = await Product.findOne({ sku });

  if (productExists) {
    res.status(400);
    throw new Error('Product with this SKU already exists');
  }

  const product = await Product.create({
    name,
    description,
    category,
    price,
    stockQuantity,
    sku,
    supplier,
    image: image || '/images/default-product.jpg',
    manufacturer,
    toxicityLevel,
    recommendedUse,
    tags,
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
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.price = req.body.price || product.price;
    product.stockQuantity = req.body.stockQuantity || product.stockQuantity;
    product.sku = req.body.sku || product.sku;
    product.supplier = req.body.supplier || product.supplier;
    product.image = req.body.image || product.image;
    product.manufacturer = req.body.manufacturer || product.manufacturer;
    product.toxicityLevel = req.body.toxicityLevel || product.toxicityLevel;
    product.recommendedUse = req.body.recommendedUse || product.recommendedUse;
    product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;
    product.tags = req.body.tags || product.tags;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}; 