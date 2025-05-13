import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pesticide-management')
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Get the inventory collection
    const inventoryCollection = mongoose.connection.collection('inventories');
    
    // Drop the problematic index
    return inventoryCollection.dropIndex('batches.batchId_1_store_1')
      .then(() => {
        console.log('Successfully dropped problematic index: batches.batchId_1_store_1');
      })
      .catch((err) => {
        if (err.codeName === 'IndexNotFound') {
          console.log('Index does not exist or was already removed');
        } else {
          console.error('Error dropping index:', err);
        }
      });
  })
  .then(() => {
    console.log('Database migration completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 