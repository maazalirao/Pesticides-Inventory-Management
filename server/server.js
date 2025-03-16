import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow any origin in any environment for simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes (will import them later)
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...', environment: process.env.NODE_ENV });
});

// Debug route
app.get('/api/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1, // 1 = connected
    headers: req.headers,
    time: new Date().toISOString()
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    // If already connected, return
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    // For Vercel serverless functions, use these options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    // Don't exit the process in production as it would terminate the serverless function
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Routes import
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
// Add more routes as needed

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  });
} else {
  // For production, just connect to MongoDB but don't start a server
  // (Vercel will handle that)
  connectDB();
}

// Export the app for serverless environments
export default app; 