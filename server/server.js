import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    // Allow all origins in development
    if(process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Allow Railway domains and other production domains
    const allowedOrigins = [
      /\.railway\.app$/,
      /railway\.app$/,
      process.env.FRONTEND_URL
    ];
    
    const allowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if(allowed) {
      return callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      return callback(null, true); // Temporarily allow all origins in production too
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes (will import them later)
app.get('/api', (req, res) => {
  res.send('API is running...');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Test API endpoints
app.get('/apiserver/test', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ message: 'API server test endpoint is working', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ message: 'API test endpoint is working', timestamp: new Date().toISOString() });
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

// Define API route prefixes based on environment
const apiPrefix = process.env.NODE_ENV === 'production' ? '/apiserver' : '/api';

// Routes import with environment-specific prefixes
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/inventory`, inventoryRoutes);

// Legacy routes support for development
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/inventory', inventoryRoutes);
}

// API fallback for any unhandled API routes
app.all('/apiserver/*', (req, res) => {
  res.status(404).json({ message: `API endpoint not found: ${req.path}` });
});

app.all('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint not found: ${req.path}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Serve static assets in production AFTER all API routes
if (process.env.NODE_ENV === 'production') {
  // Set build folder as static
  const buildPath = path.resolve(__dirname, '../dist');
  console.log('Serving static files from:', buildPath);
  
  app.use(express.static(buildPath));
  
  // Any non-api route will be redirected to index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/apiserver') && 
        !req.path.startsWith('/api') && 
        !req.path.startsWith('/health')) {
      res.sendFile(path.resolve(buildPath, 'index.html'));
    } else {
      // This should not be reached due to the API fallback above, but just in case
      res.status(404).json({ message: 'Not found' });
    }
  });
} else {
  console.log('Running in development mode, not serving static files');
}

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}); 