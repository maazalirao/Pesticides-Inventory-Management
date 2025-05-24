// Vercel API entry point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../server/config/db.js';

// Import all route handlers
import userRoutes from '../server/routes/userRoutes.js';
import storeRoutes from '../server/routes/storeRoutes.js';
import productRoutes from '../server/routes/productRoutes.js';
import inventoryRoutes from '../server/routes/inventoryRoutes.js';
import customerRoutes from '../server/routes/customerRoutes.js';
import supplierRoutes from '../server/routes/supplierRoutes.js';
import orderRoutes from '../server/routes/orderRoutes.js';
import analyticsRoutes from '../server/routes/analyticsRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-domain.vercel.app', 'https://fyp-web-pes.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FYP Web Pes API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Admin routes (for global queries across all stores)
app.use('/api/admin', (req, res, next) => {
  // Add admin-specific middleware here if needed
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl 
  });
});

export default app; 