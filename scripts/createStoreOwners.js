import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Store from '../server/models/storeModel.js';
import User from '../server/models/userModel.js';

// Load environment variables
dotenv.config();

const createStoreOwners = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log('Connected to MongoDB');

    // Get all stores
    const stores = await Store.find({});
    
    if (stores.length === 0) {
      console.log('❌ No stores found in database');
      return;
    }

    console.log(`Found ${stores.length} stores. Creating store owners...`);

    // Store owner data - updated with preferred store names
    const storeOwnerData = [
      {
        name: 'Maaz Store Manager',
        email: 'maaz@pest.com',
        password: 'maaz123',
        storeName: 'Maaz Pesticide Store'
      },
      {
        name: 'Jamal Store Manager',
        email: 'jamal@pest.com',
        password: 'jamal123',
        storeName: 'Jamal Pest Control Supply'
      },
      {
        name: 'Mudasir Store Manager',
        email: 'mudasir@pest.com', 
        password: 'mudasir123',
        storeName: 'Mudasir Pesticide Center'
      },
      {
        name: 'Sample Store Manager',
        email: 'sample@pest.com',
        password: 'sample123',
        storeName: 'Sample New Store'
      }
    ];

    console.log('\n🏗️  CREATING STORE OWNERS:');
    console.log('==========================');

    for (const ownerData of storeOwnerData) {
      try {
        // Find the store by name
        const store = stores.find(s => s.name === ownerData.storeName);
        if (!store) {
          console.log(`⚠️  Store "${ownerData.storeName}" not found, skipping...`);
          continue;
        }

        // Check if user already exists
        let existingUser = await User.findOne({ email: ownerData.email });
        
        if (existingUser) {
          console.log(`👤 User ${ownerData.email} already exists, updating...`);
          
          // Update existing user
          existingUser.role = 'store_owner';
          if (!existingUser.stores.includes(store._id)) {
            existingUser.stores.push(store._id);
          }
          await existingUser.save();
          
          // Update store owner reference
          store.owner = existingUser._id;
          await store.save();
          
          console.log(`✅ Updated: ${ownerData.name} -> ${store.name}`);
        } else {
          // Create new store owner user
          const storeOwner = await User.create({
            name: ownerData.name,
            email: ownerData.email,
            password: ownerData.password, // Will be hashed by pre-save middleware
            role: 'store_owner',
            stores: [store._id]
          });

          // Update store to reference the owner
          store.owner = storeOwner._id;
          await store.save();

          console.log(`✅ Created: ${ownerData.name} -> ${store.name}`);
          console.log(`   📧 Email: ${ownerData.email}`);
          console.log(`   🔑 Password: ${ownerData.password}`);
        }
        
      } catch (error) {
        console.error(`❌ Error creating owner for ${ownerData.storeName}:`, error.message);
      }
    }

    // Display final summary
    console.log('\n📊 FINAL SUMMARY:');
    console.log('==================');

    const updatedStores = await Store.find({}).populate('owner', 'name email role');
    const storeOwners = await User.find({ role: 'store_owner' }).populate('stores', 'name');

    console.log('\n🏪 STORES WITH OWNERS:');
    updatedStores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   👤 Owner: ${store.owner?.name || 'No owner'} (${store.owner?.email || 'N/A'})`);
    });

    console.log('\n👥 STORE OWNER CREDENTIALS:');
    console.log('============================');
    storeOwners.forEach((owner, index) => {
      console.log(`${index + 1}. 👤 ${owner.name}`);
      console.log(`   📧 Email: ${owner.email}`);
      console.log(`   🔑 Password: Use the password from the script above`);
      console.log(`   🏪 Manages: ${owner.stores?.map(s => s.name).join(', ') || 'No stores'}`);
      console.log('   ─────────────────────────────────');
    });

    console.log('\n🎉 Store owners created successfully!');
    console.log('💡 You can now login at /admin/login with any of the above credentials');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
createStoreOwners(); 