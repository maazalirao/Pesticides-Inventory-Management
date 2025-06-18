import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Store from '../server/models/storeModel.js';
import User from '../server/models/userModel.js';

// Load environment variables
dotenv.config();

const checkStores = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log('Connected to MongoDB');

    // Get all stores
    const stores = await Store.find({}).populate('owner', 'name email role');
    
    console.log('\n📊 EXISTING STORES:');
    console.log('==================');
    
    if (stores.length === 0) {
      console.log('❌ No stores found in database');
    } else {
      stores.forEach((store, index) => {
        console.log(`${index + 1}. 🏪 ${store.name}`);
        console.log(`   📧 Email: ${store.email || 'N/A'}`);
        console.log(`   📱 Phone: ${store.phone || 'N/A'}`);
        console.log(`   📍 City: ${store.address?.city || 'N/A'}`);
        console.log(`   👤 Owner: ${store.owner?.name || 'No owner assigned'} (${store.owner?.email || 'N/A'})`);
        console.log(`   📊 Status: ${store.status}`);
        console.log(`   🆔 Store ID: ${store._id}`);
        console.log('   ─────────────────────────────────');
      });
    }

    // Get all users with store owner or admin role
    const users = await User.find({ 
      role: { $in: ['admin', 'store_owner'] } 
    }).populate('stores', 'name');

    console.log('\n👥 USERS WITH STORE ACCESS:');
    console.log('============================');
    
    if (users.length === 0) {
      console.log('❌ No admin or store owner users found');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. 👤 ${user.name} (${user.email})`);
        console.log(`   🏷️  Role: ${user.role}`);
        console.log(`   🏪 Stores: ${user.stores?.length || 0} assigned`);
        if (user.stores && user.stores.length > 0) {
          user.stores.forEach(store => {
            console.log(`      - ${store.name}`);
          });
        }
        console.log('   ─────────────────────────────────');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
checkStores(); 