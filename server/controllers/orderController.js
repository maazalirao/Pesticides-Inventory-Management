import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Store from '../models/storeModel.js';

// @desc    Create new order
// @route   POST /api/orders/store/:storeId
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  // Validate store exists
  const store = await Store.findById(storeId);
  if (!store) {
    res.status(404);
    throw new Error('Store not found');
  }

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // Check if all items are in stock and belong to the correct store
    for (const item of orderItems) {
      const product = await Product.findOne({ 
        _id: item.product,
        store: storeId
      });
      
      if (!product) {
        res.status(404);
        throw new Error(`Product not found or not available in this store: ${item.name}`);
      }
      
      // In a real app, you would check inventory levels here
      // This is simplified for the demo
    }

    // Create order
    const order = new Order({
      orderItems,
      user: req.user._id,
      store: storeId,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/store/:storeId/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    store: req.params.storeId,
  }).populate('user', 'name email');

  if (order) {
    // Check if the order belongs to the logged-in user or if user is admin/store owner
    if (
      order.user._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin' ||
      (req.user.role === 'store_owner' && req.user.stores.some(store => store._id.toString() === req.params.storeId))
    ) {
      res.json(order);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/store/:storeId/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    store: req.params.storeId,
  });

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/orders/store/:storeId/:id/status
// @access  Private/StoreOwner/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, notes } = req.body;
  const order = await Order.findOne({
    _id: req.params.id,
    store: req.params.storeId,
  });

  if (order) {
    order.status = status || order.status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    if (notes) {
      order.notes = notes;
    }
    
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders for a specific store
// @route   GET /api/orders/store/:storeId/myorders
// @access  Private
const getMyStoreOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 
    user: req.user._id,
    store: req.params.storeId 
  });
  res.json(orders);
});

// @desc    Get logged in user orders across all stores
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('store', 'name');
  res.json(orders);
});

// @desc    Get all orders for a specific store
// @route   GET /api/orders/store/:storeId
// @access  Private/StoreOwner/Admin
const getStoreOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ store: req.params.storeId })
    .populate('user', 'id name')
    .sort('-createdAt');
  res.json(orders);
});

// @desc    Get all orders across all stores
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name')
    .populate('store', 'name')
    .sort('-createdAt');
  res.json(orders);
});

export {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyStoreOrders,
  getMyOrders,
  getStoreOrders,
  getAllOrders,
}; 