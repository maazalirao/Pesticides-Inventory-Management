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

// Admin routes - handle them directly with proper routing
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/suppliers', supplierRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/stores', storeRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('API is running');
});

// Debug endpoint to check database connection
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      status: 'OK',
      database: statusMap[dbStatus] || 'unknown',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test analytics endpoint without authentication
app.get('/api/analytics/test', async (req, res) => {
  try {
    console.log('Test analytics endpoint accessed');
    res.json({
      message: 'Analytics endpoint is accessible',
      storeId: req.query.storeId || 'No storeId provided',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test analytics endpoint error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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