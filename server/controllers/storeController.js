import asyncHandler from 'express-async-handler';
import Store from '../models/storeModel.js';
import User from '../models/userModel.js';

// @desc    Create a new store
// @route   POST /api/stores
// @access  Admin
const createStore = asyncHandler(async (req, res) => {
  const { name, description, email, phone, address, owner } = req.body;

  const storeExists = await Store.findOne({ name });
  if (storeExists) {
    res.status(400);
    throw new Error('Store with this name already exists');
  }

  // Create the store
  const store = await Store.create({
    name,
    description,
    email,
    phone,
    address,
    owner: owner || null, // Optional owner
  });

  // If an owner is specified, add the store to their stores array
  if (owner) {
    try {
      const user = await User.findById(owner);
      if (user) {
        // Check if the store is already in the user's stores array
        if (!user.stores.includes(store._id)) {
          user.stores.push(store._id);
          await user.save();
          console.log(`Store ${store._id} added to user ${user._id}'s stores array`);
        }
      }
    } catch (error) {
      console.error('Error adding store to user:', error);
      // Don't fail the request if this step fails
    }
  }

  res.status(201).json(store);
});

// @desc    Get all stores
// @route   GET /api/stores
// @access  Admin
const getStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({}).populate('owner', 'name email');
  res.json(stores);
});

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Admin
const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate('owner', 'name email');

  if (store) {
    res.json(store);
  } else {
    res.status(404);
    throw new Error('Store not found');
  }
});

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Admin
const updateStore = asyncHandler(async (req, res) => {
  const { name, description, email, phone, address, status } = req.body;

  const store = await Store.findById(req.params.id);

  if (store) {
    store.name = name || store.name;
    store.description = description || store.description;
    store.email = email || store.email;
    store.phone = phone || store.phone;
    store.address = address || store.address;
    store.status = status || store.status;

    const updatedStore = await store.save();
    res.json(updatedStore);
  } else {
    res.status(404);
    throw new Error('Store not found');
  }
});

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Admin
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (store) {
    // Remove this store from all users' stores arrays
    await User.updateMany(
      { stores: store._id },
      { $pull: { stores: store._id } }
    );

    await store.deleteOne();
    res.json({ message: 'Store removed' });
  } else {
    res.status(404);
    throw new Error('Store not found');
  }
});

// @desc    Assign user to store
// @route   POST /api/stores/:id/users
// @access  Admin
const assignUserToStore = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const storeId = req.params.id;

  const user = await User.findById(userId);
  const store = await Store.findById(storeId);

  if (!user || !store) {
    res.status(404);
    throw new Error('User or store not found');
  }

  // Update user role if provided
  if (role && role !== user.role) {
    user.role = role;
  }

  // Check if user already has access to this store
  const alreadyHasAccess = user.stores.some(store => store.equals(storeId));
  
  if (!alreadyHasAccess) {
    user.stores.push(storeId);
  }

  // If this user is designated as a store owner, also update the store's owner field
  if (role === 'store_owner' && (!store.owner || !store.owner.equals(userId))) {
    store.owner = userId;
    await store.save();
    console.log(`User ${userId} set as owner of store ${storeId}`);
  }

  await user.save();

  res.status(200).json({ 
    message: 'User assigned to store successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      stores: user.stores
    },
    store: {
      _id: store._id,
      name: store.name,
      owner: store.owner
    }
  });
});

// @desc    Remove user from store
// @route   DELETE /api/stores/:id/users
// @access  Admin
const removeUserFromStore = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const storeId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Remove store from user's stores array
  user.stores = user.stores.filter(store => !store.equals(storeId));
  await user.save();

  res.status(200).json({ message: 'User removed from store successfully' });
});

// @desc    Create or update store owner
// @route   POST /api/stores/:id/owner
// @access  Admin
const createStoreOwner = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const storeId = req.params.id;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  // Check if store exists
  const store = await Store.findById(storeId);
  if (!store) {
    res.status(404);
    throw new Error('Store not found');
  }

  // Check if user with this email already exists
  let existingUser = await User.findOne({ email });
  
  if (existingUser) {
    // If user exists, update their role and assign the store
    existingUser.role = 'store_owner';
    existingUser.name = name; // Update name if provided
    
    // Update password if provided
    if (password) {
      existingUser.password = password; // Will be hashed by pre-save middleware
    }
    
    // Add store to user's stores array if not already present
    if (!existingUser.stores.includes(storeId)) {
      existingUser.stores.push(storeId);
    }
    
    await existingUser.save();
    
    // Update store's owner reference
    store.owner = existingUser._id;
    await store.save();
    
    const populatedStore = await Store.findById(storeId).populate('owner', 'name email role');
    
    res.status(200).json({
      message: 'Store owner updated successfully',
      store: populatedStore,
      owner: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      }
    });
  } else {
    // Create new store owner user
    const newUser = await User.create({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      role: 'store_owner',
      stores: [storeId]
    });

    // Update store's owner reference
    store.owner = newUser._id;
    await store.save();

    const populatedStore = await Store.findById(storeId).populate('owner', 'name email role');

    res.status(201).json({
      message: 'Store owner created successfully',
      store: populatedStore,
      owner: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      credentials: {
        email: newUser.email,
        password: password // Return the plain text password for admin reference
      }
    });
  }
});

// @desc    Get stores for current user
// @route   GET /api/stores/mystores
// @access  Store Owner/Admin
const getMyStores = asyncHandler(async (req, res) => {
  console.log('getMyStores called by:', req.user.name, '(', req.user.role, ')');
  console.log('User store IDs:', req.user.stores);
  
  // For admin, get all stores
  if (req.user.role === 'admin') {
    const stores = await Store.find({}).populate('owner', 'name email');
    console.log(`Found ${stores.length} stores for admin`);
    
    // If no stores found and we're in development, create a default store
    if (stores.length === 0 && process.env.NODE_ENV === 'development') {
      console.log('No stores found for admin, creating default store for development');
      
      const defaultStore = await Store.create({
        name: 'Default Store',
        description: 'This is a default store created for development',
        email: 'store@example.com',
        phone: '555-123-4567',
        address: {
          street: '123 Main St',
          city: 'Example City',
          state: 'EX',
          postalCode: '12345',
          country: 'Example Country',
        },
        status: 'active',
        owner: req.user._id
      });
      
      // Add store to user's stores array
      req.user.stores.push(defaultStore._id);
      await req.user.save();
      
      return res.json([defaultStore]);
    }
    
    return res.json(stores);
  }

  // For store owners, get their specific stores
  // First check if we need to populate the stores
  if (!req.user.populated('stores')) {
    await req.user.populate('stores');
  }
  
  console.log(`Found ${req.user.stores.length} stores for store owner`);
  
  // If store owner has no stores and we're in development, create one
  if (req.user.stores.length === 0 && process.env.NODE_ENV === 'development') {
    console.log('No stores found for store owner, creating default store for development');
    
    const defaultStore = await Store.create({
      name: `${req.user.name}'s Store`,
      description: 'This is a default store created for development',
      email: req.user.email,
      phone: '555-123-4567',
      address: {
        street: '123 Main St',
        city: 'Example City',
        state: 'EX',
        postalCode: '12345',
        country: 'Example Country',
      },
      status: 'active',
      owner: req.user._id
    });
    
    // Add store to user's stores array
    req.user.stores.push(defaultStore._id);
    await req.user.save();
    
    // Re-populate to get the full store object
    await req.user.populate('stores');
  }
  
  // Double check if any stores exist at this point
  if (req.user.stores.length === 0) {
    console.warn('User has no stores after all attempts to create or find them');
    
    // Look for any stores that might have this user as owner but aren't in their stores array
    const ownedStores = await Store.find({ owner: req.user._id });
    if (ownedStores.length > 0) {
      console.log(`Found ${ownedStores.length} stores where user is owner but not in their stores array`);
      
      // Add these stores to the user's stores array
      for (const store of ownedStores) {
        if (!req.user.stores.includes(store._id)) {
          req.user.stores.push(store._id);
        }
      }
      
      await req.user.save();
      await req.user.populate('stores');
    }
  }
  
  console.log(`Returning ${req.user.stores.length} stores to user`);
  res.json(req.user.stores);
});

// @desc    Repair store relationships - development tool
// @route   GET /api/stores/repair-relationships
// @access  Any authenticated user (in development)
const repairStoreRelationships = asyncHandler(async (req, res) => {
  try {
    console.log('Starting store relationship repair');
    
    // Get all stores
    const stores = await Store.find({});
    console.log(`Found ${stores.length} stores to check`);
    
    // Get all users with store_owner or admin role
    const users = await User.find({ 
      role: { $in: ['admin', 'store_owner'] } 
    });
    console.log(`Found ${users.length} admin/store_owner users to check`);
    
    const results = {
      fixed: {
        ownerAssignments: 0,
        userStoreArrays: 0
      },
      errors: []
    };
    
    // Fix store owners with no stores in their arrays
    for (const user of users) {
      // Find stores where this user is listed as owner
      const ownedStores = await Store.find({ owner: user._id });
      
      if (ownedStores.length > 0) {
        console.log(`User ${user.name} (${user._id}) owns ${ownedStores.length} stores`);
        
        // Check if these stores are in the user's stores array
        for (const store of ownedStores) {
          const storeInArray = user.stores.some(userStore => 
            userStore.equals(store._id)
          );
          
          if (!storeInArray) {
            console.log(`Adding store ${store.name} (${store._id}) to user ${user.name}'s stores array`);
            user.stores.push(store._id);
            results.fixed.userStoreArrays++;
          }
        }
        
        if (results.fixed.userStoreArrays > 0) {
          await user.save();
        }
      }
    }
    
    // Fix stores with missing owners
    for (const store of stores) {
      // If store has no owner but is in someone's stores array
      if (!store.owner) {
        for (const user of users) {
          const storeInArray = user.stores.some(userStore => 
            userStore.equals(store._id)
          );
          
          if (storeInArray) {
            console.log(`Setting user ${user.name} as owner of store ${store.name} (${store._id})`);
            store.owner = user._id;
            await store.save();
            results.fixed.ownerAssignments++;
            break;
          }
        }
      }
    }
    
    // Find users with store access but no stores
    const emptyStoreUsers = users.filter(user => user.stores.length === 0);
    if (emptyStoreUsers.length > 0) {
      console.log(`Found ${emptyStoreUsers.length} users with no stores`);
      
      for (const user of emptyStoreUsers) {
        // Check if we have any active stores
        const activeStores = await Store.find({ status: 'active' });
        
        if (activeStores.length > 0) {
          // Assign the first active store to this user
          const storeToAssign = activeStores[0];
          console.log(`Assigning store ${storeToAssign.name} to user ${user.name}`);
          
          user.stores.push(storeToAssign._id);
          await user.save();
          
          // Make user the owner if the store has no owner
          if (!storeToAssign.owner) {
            storeToAssign.owner = user._id;
            await storeToAssign.save();
          }
          
          results.fixed.userStoreArrays++;
        }
      }
    }
    
    // Return the repair results
    res.status(200).json({
      message: 'Store relationships repaired',
      results
    });
  } catch (error) {
    console.error('Error repairing store relationships:', error);
    res.status(500).json({ 
      message: 'Failed to repair store relationships',
      error: error.message
    });
  }
});

// @desc    Get all active stores for public view
// @route   GET /api/stores/public
// @access  Public
const getPublicStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({ status: 'active' })
    .select('name description email phone address')
    .lean();
  
  console.log(`Found ${stores.length} active stores for public view`);
  res.json(stores);
});

export {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  assignUserToStore,
  removeUserFromStore,
  createStoreOwner,
  getMyStores,
  repairStoreRelationships,
  getPublicStores
}; 