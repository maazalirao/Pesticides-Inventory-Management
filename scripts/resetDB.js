import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../server/config/db.js';

dotenv.config();

// Collections to reset
const collections = [
  'stores', 
  'products', 
  'inventories', 
  'suppliers', 
  'customers', 
  'orders',
  'users'
  // Add any other collections here
];

const resetDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('MongoDB Connected');
    
    // Clear all collections
    for (const collection of collections) {
      try {
        await mongoose.connection.collection(collection).deleteMany({});
        console.log(`✅ Collection '${collection}' cleared`);
      } catch (err) {
        // If collection doesn't exist, just log and continue
        console.log(`❓ Collection '${collection}' not found or already empty`);
      }
    }
    
    console.log('✅ Database reset complete');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error resetting database: ${error.message}`);
    process.exit(1);
  }
};

console.log('🔄 Starting database reset...');
resetDatabase(); 