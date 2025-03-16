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
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.vercel\.app$/, /localhost/] 
    : '*',
  credentials: true
}));
app.use(express.json());

// Database connection
let cachedDb = null;

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...', new Date().toISOString());
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    // If we already have a connection, use it
    if (cachedDb && mongoose.connection.readyState === 1) {
      console.log('Using cached database connection');
      return cachedDb;
    }
    
    // Disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
      console.log('Closing existing MongoDB connection');
      await mongoose.disconnect();
    }
    
    // DNS caching - mongoose doesn't do this by default in some environments
    // This sometimes helps with connection issues in serverless
    mongoose.set('bufferCommands', false);
    
    // Enhanced options for serverless environment
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep low for faster failure/retry
      connectTimeoutMS: 10000, 
      socketTimeoutMS: 30000,
      // The following options help with serverless environments
      maxPoolSize: 1, // Reduced to minimum for serverless
      minPoolSize: 0, // Start with no connections
      family: 4, // Force IPv4
      // Critical option for serverless environments:
      // Don't wait for secondary servers in replica sets
      readPreference: 'primary',
      retryWrites: false, // Disable retry writes for faster connections
      w: 'majority', // Wait for primary and majority of secondaries
      wtimeoutMS: 2500 // Reduce write concern timeout
    });
    
    cachedDb = conn;
    console.log(`MongoDB Connected: ${conn.connection.host} at ${new Date().toISOString()}`);
    return cachedDb;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`, new Date().toISOString());
    
    // In production, don't exit the process as this will terminate the serverless function
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    
    throw error; // Re-throw to be handled by error middleware
  }
};

// Root route - use this for health checks
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...', env: process.env.NODE_ENV });
});

// Database health check endpoint
app.get('/api/dbhealth', async (req, res) => {
  try {
    // Attempt to connect to the database
    await connectDB();
    
    // Simple DB operation to validate connection
    const dbState = mongoose.connection.readyState;
    
    res.json({
      status: 'success',
      message: 'Database connection successful',
      dbState: dbState,
      states: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Routes import
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
// Add more routes as needed

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error in ${req.method} ${req.path}:`, err.message);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Connect to database and start server
// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });
} else {
  // For production/serverless, just connect to database once
  connectDB().catch(err => {
    console.error('Failed to connect to MongoDB in serverless environment:', err);
  });
}

export default app; 