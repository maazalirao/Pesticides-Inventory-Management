import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import { notFound } from './middleware/errorMiddleware.js';
import { errorHandler } from './middleware/authMiddleware.js';

// Load environment variables
dotenv.config();

// Set development mode if not specified
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
  console.log('NODE_ENV not set, defaulting to development mode');
}

console.log('Running in auth bypass mode for Vercel deployment');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Routes (will import them later)
app.get('/api', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Routes import
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Special direct route for public product access with no authentication - helps fix issues on Vercel
app.get('/api/public/products', async (req, res) => {
  console.log('PUBLIC PRODUCTS ROUTE: Accessed with query params:', req.query);
  
  try {
    const mongoose = (await import('mongoose')).default;
    const ProductModel = mongoose.model('Product');
    
    let query = { status: { $ne: 'discontinued' } };
    
    // Filter by store if provided
    if (req.query.store) {
      console.log('PUBLIC PRODUCTS ROUTE: Filtering by store:', req.query.store);
      query.store = req.query.store;
    }
    
    // Execute query
    const products = await ProductModel.find(query)
      .populate('store', 'name')
      .populate('supplier', 'name')
      .lean()
      .exec();
    
    console.log(`PUBLIC PRODUCTS ROUTE: Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('PUBLIC PRODUCTS ROUTE: Error fetching products:', error);
    res.status(500).json({ 
      message: 'Error fetching products',
      error: error.message 
    });
  }
});

// Special handling for admin routes to ensure they're properly captured
app.use('/api/admin', (req, res, next) => {
  console.log('Admin route accessed:', req.originalUrl);
  
  // Forward admin/inventory routes to inventory controller
  if (req.path.startsWith('/inventory')) {
    req.url = req.url.replace('/inventory', '');
    return inventoryRoutes(req, res, next);
  }
  
  // Forward admin/products routes to product controller
  if (req.path.startsWith('/products')) {
    req.url = req.url.replace('/products', '');
    return productRoutes(req, res, next);
  }
  
  // Forward admin/suppliers routes to supplier controller
  if (req.path.startsWith('/suppliers')) {
    req.url = req.url.replace('/suppliers', '');
    return supplierRoutes(req, res, next);
  }
  
  // Forward admin/customers routes to customer controller
  if (req.path.startsWith('/customers')) {
    req.url = req.url.replace('/customers', '');
    return customerRoutes(req, res, next);
  }
  
  // Forward admin/stores routes to store controller
  if (req.path.startsWith('/stores')) {
    req.url = req.url.replace('/stores', '');
    return storeRoutes(req, res, next);
  }
  
  // Forward admin/analytics routes to analytics controller
  if (req.path.startsWith('/analytics')) {
    req.url = req.url.replace('/analytics', '');
    return analyticsRoutes(req, res, next);
  }
  
  // Add other admin route handlers as needed
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('API is running');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}); 