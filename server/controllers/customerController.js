import asyncHandler from 'express-async-handler';
import Customer from '../models/customerModel.js';

// @desc    Fetch all customers
// @route   GET /api/customers
// @access  Public
const getCustomers = asyncHandler(async (req, res) => {
  // Use lean() for faster queries and select only needed fields
  const customers = await Customer.find({})
    .select('name email phone address paymentMethod taxId notes isActive')
    .lean()
    .exec();
  res.json(customers);
});

// @desc    Fetch single customer
// @route   GET /api/customers/:id
// @access  Public
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  
  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private/Admin
const createCustomer = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    paymentMethod,
    taxId,
    notes,
    isActive,
  } = req.body;

  const customerExists = await Customer.findOne({ email });

  if (customerExists) {
    res.status(400);
    throw new Error('Customer with this email already exists');
  }

  const customer = await Customer.create({
    name,
    email,
    phone,
    address,
    paymentMethod,
    taxId,
    notes,
    isActive: isActive !== undefined ? isActive : true,
  });

  if (customer) {
    res.status(201).json(customer);
  } else {
    res.status(400);
    throw new Error('Invalid customer data');
  }
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    customer.name = req.body.name || customer.name;
    customer.email = req.body.email || customer.email;
    customer.phone = req.body.phone || customer.phone;
    customer.address = req.body.address || customer.address;
    customer.paymentMethod = req.body.paymentMethod || customer.paymentMethod;
    customer.taxId = req.body.taxId || customer.taxId;
    customer.notes = req.body.notes || customer.notes;
    customer.isActive = req.body.isActive !== undefined ? req.body.isActive : customer.isActive;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    await customer.deleteOne();
    res.json({ message: 'Customer removed' });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

export {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
}; 