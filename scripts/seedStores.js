import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Store from '../server/models/storeModel.js';
import connectDB from '../server/config/db.js';

dotenv.config();

const sampleStores = [
  {
    name: 'Maaz Pesticide Store',
    description: 'Premium pest control products and solutions by Maaz.',
    email: 'maaz@pestshield.com',
    phone: '+92 300 1234567',
    address: {
      street: '123 Main Street',
      city: 'Lahore',
      state: 'Punjab',
      postalCode: '54000',
      country: 'Pakistan',
    },
    status: 'active',
  },
  {
    name: 'Ali Pest Control Supply',
    description: 'Complete range of pest management products by Ali.',
    email: 'ali@pestshield.com',
    phone: '+92 301 2345678',
    address: {
      street: '456 Market Road',
      city: 'Karachi',
      state: 'Sindh',
      postalCode: '75000',
      country: 'Pakistan',
    },
    status: 'active',
  },
  {
    name: 'Rao Pesticide Center',
    description: 'Specialized agricultural and household pest solutions by Rao.',
    email: 'rao@pestshield.com',
    phone: '+92 302 3456789',
    address: {
      street: '789 Garden Avenue',
      city: 'Islamabad',
      state: 'Federal Territory',
      postalCode: '44000',
      country: 'Pakistan',
    },
    status: 'active',
  }
];

// Connect to MongoDB and seed stores
const seedStores = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('MongoDB Connected');
    
    // Clear existing stores
    await Store.deleteMany({});
    console.log('Cleared existing stores');
    
    // Insert the sample stores
    const insertedStores = await Store.insertMany(sampleStores);
    console.log(`Successfully inserted ${insertedStores.length} stores`);
    
    // Log the IDs for reference
    console.log('Store IDs for reference:');
    insertedStores.forEach(store => {
      console.log(`${store.name}: ${store._id}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the script
seedStores(); 