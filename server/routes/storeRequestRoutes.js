import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Store from '../models/storeModel.js';
import User from '../models/userModel.js';

const router = express.Router();

// In-memory storage for store requests (you can replace with database)
let storeRequests = [];

// @desc    Get all store requests
// @route   GET /api/store-requests
// @access  Admin only
router.get('/', protect, (req, res) => {
  // Only admin can view all requests
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  
  res.json(storeRequests);
});

// @desc    Create a new store request
// @route   POST /api/store-requests
// @access  Public (for registration)
router.post('/', (req, res) => {
  const {
    name,
    description,
    requestorName,
    requestorEmail,
    requestorPhone,
    reasonForRequest,
    preferredEmail,
    preferredPassword
  } = req.body;

  // Validate required fields
  if (!name || !requestorName || !requestorEmail || !reasonForRequest) {
    return res.status(400).json({ 
      message: 'Missing required fields: name, requestorName, requestorEmail, reasonForRequest' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(requestorEmail)) {
    return res.status(400).json({ 
      message: 'Invalid email format for requestorEmail' 
    });
  }

  if (preferredEmail && !emailRegex.test(preferredEmail)) {
    return res.status(400).json({ 
      message: 'Invalid email format for preferredEmail' 
    });
  }

  // Create new store request with credential information
  const storeRequest = {
    _id: Date.now().toString(),
    name,
    description: description || '',
    requestorName,
    requestorEmail,
    requestorPhone: requestorPhone || '',
    reasonForRequest,
    preferredEmail: preferredEmail || requestorEmail, // Default to requestor email if not provided
    preferredPassword: preferredPassword || null, // Optional, admin can set later
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  storeRequests.push(storeRequest);

  res.status(201).json({
    message: 'Store request submitted successfully',
    request: storeRequest
  });
});

// @desc    Update store request status
// @route   PUT /api/store-requests/:id
// @access  Admin only
router.put('/:id', protect, (req, res) => {
  // Only admin can update requests
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  const { status, preferredEmail, preferredPassword } = req.body;
  const requestId = req.params.id;

  // Find the request
  const requestIndex = storeRequests.findIndex(req => req._id === requestId);
  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Store request not found' });
  }

  // Update the request
  storeRequests[requestIndex] = {
    ...storeRequests[requestIndex],
    status,
    preferredEmail: preferredEmail || storeRequests[requestIndex].preferredEmail,
    preferredPassword: preferredPassword || storeRequests[requestIndex].preferredPassword,
    updatedAt: new Date().toISOString()
  };

  res.json(storeRequests[requestIndex]);
});

// @desc    Approve store request and create store with owner
// @route   POST /api/store-requests/:id/approve
// @access  Admin only
router.post('/:id/approve', protect, async (req, res) => {
  // Only admin can approve requests
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  try {
    const requestId = req.params.id;
    const { ownerCredentials } = req.body; // Optional override for credentials

    // Find the request
    const requestIndex = storeRequests.findIndex(req => req._id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Store request not found' });
    }

    const request = storeRequests[requestIndex];

    // Check if store with same name already exists
    const existingStore = await Store.findOne({ name: request.name });
    if (existingStore) {
      return res.status(400).json({ 
        message: 'A store with this name already exists' 
      });
    }

    // Generate credentials if not provided
    const emailForOwner = ownerCredentials?.email || request.preferredEmail || request.requestorEmail;
    const passwordForOwner = ownerCredentials?.password || request.preferredPassword || generateDefaultPassword(request.name);
    const nameForOwner = ownerCredentials?.name || request.requestorName;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: emailForOwner });
    if (existingUser) {
      return res.status(400).json({ 
        message: `A user with email ${emailForOwner} already exists. Please choose a different email.` 
      });
    }

    // Create the store
    const newStore = await Store.create({
      name: request.name,
      description: request.description,
      email: emailForOwner,
      phone: request.requestorPhone,
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      status: 'active'
    });

    // Create the store owner user
    const newUser = await User.create({
      name: nameForOwner,
      email: emailForOwner,
      password: passwordForOwner, // Will be hashed by pre-save middleware
      role: 'store_owner',
      stores: [newStore._id]
    });

    // Update store with owner reference
    newStore.owner = newUser._id;
    await newStore.save();

    // Update request status to approved
    storeRequests[requestIndex] = {
      ...request,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdStoreId: newStore._id.toString(),
      createdOwnerId: newUser._id.toString()
    };

    res.status(201).json({
      message: 'Store request approved and store created successfully',
      store: newStore,
      owner: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      credentials: {
        email: emailForOwner,
        password: passwordForOwner // Return for admin reference
      },
      request: storeRequests[requestIndex]
    });

  } catch (error) {
    console.error('Error approving store request:', error);
    res.status(500).json({ 
      message: 'Failed to approve store request',
      error: error.message 
    });
  }
});

// @desc    Reject store request
// @route   POST /api/store-requests/:id/reject
// @access  Admin only
router.post('/:id/reject', protect, (req, res) => {
  // Only admin can reject requests
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  const requestId = req.params.id;
  const { rejectionReason } = req.body;

  // Find the request
  const requestIndex = storeRequests.findIndex(req => req._id === requestId);
  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Store request not found' });
  }

  // Update request status to rejected
  storeRequests[requestIndex] = {
    ...storeRequests[requestIndex],
    status: 'rejected',
    rejectionReason: rejectionReason || 'No reason provided',
    rejectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    message: 'Store request rejected',
    request: storeRequests[requestIndex]
  });
});

// @desc    Delete store request
// @route   DELETE /api/store-requests/:id
// @access  Admin only
router.delete('/:id', protect, (req, res) => {
  // Only admin can delete requests
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  const requestId = req.params.id;

  // Find and remove the request
  const requestIndex = storeRequests.findIndex(req => req._id === requestId);
  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Store request not found' });
  }

  storeRequests.splice(requestIndex, 1);

  res.json({ message: 'Store request deleted successfully' });
});

// Helper function to generate default password
function generateDefaultPassword(storeName) {
  // Create a simple password based on store name
  const cleanName = storeName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanName}123`;
}

export default router; 