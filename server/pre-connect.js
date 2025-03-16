import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// This function will be called by Vercel during the build
export default async function preConnect() {
  console.log('Running pre-connect MongoDB setup...');
  
  // Exit early if no MONGO_URI
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not found in environment variables');
    return { ready: false, error: 'Missing MONGO_URI' };
  }
  
  try {
    // Test the MongoDB connection
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      // Minimal connection pool for initialization
      maxPoolSize: 1,
      minPoolSize: 0,
      family: 4
    });
    
    console.log(`MongoDB pre-connection successful: ${conn.connection.host}`);
    
    // Disconnect after testing
    await mongoose.disconnect();
    
    return { ready: true };
  } catch (error) {
    console.error('MongoDB pre-connection error:', error.message);
    
    return { 
      ready: false, 
      error: error.message 
    };
  }
} 