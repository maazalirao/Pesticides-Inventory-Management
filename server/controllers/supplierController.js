import asyncHandler from 'express-async-handler';
import Supplier from '../models/supplierModel.js';

// @desc    Fetch all suppliers
// @route   GET /api/suppliers
// @access  Public
const getSuppliers = asyncHandler(async (req, res) => {
  // Use lean() for faster queries and select only needed fields
  const suppliers = await Supplier.find({})
    .select('name contactPerson email phone address taxId paymentTerms notes isActive')
    .lean()
    .exec();
  res.json(suppliers);
});

// @desc    Fetch single supplier
// @route   GET /api/suppliers/:id
// @access  Public
const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
  if (supplier) {
    res.json(supplier);
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = asyncHandler(async (req, res) => {
  const {
    name,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    notes,
    isActive,
  } = req.body;

  const supplierExists = await Supplier.findOne({ email });

  if (supplierExists) {
    res.status(400);
    throw new Error('Supplier with this email already exists');
  }

  const supplier = await Supplier.create({
    name,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    notes,
    isActive: isActive !== undefined ? isActive : true,
  });

  if (supplier) {
    res.status(201).json(supplier);
  } else {
    res.status(400);
    throw new Error('Invalid supplier data');
  }
});

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    supplier.name = req.body.name || supplier.name;
    supplier.contactPerson = req.body.contactPerson || supplier.contactPerson;
    supplier.email = req.body.email || supplier.email;
    supplier.phone = req.body.phone || supplier.phone;
    supplier.address = req.body.address || supplier.address;
    supplier.taxId = req.body.taxId || supplier.taxId;
    supplier.paymentTerms = req.body.paymentTerms || supplier.paymentTerms;
    supplier.notes = req.body.notes || supplier.notes;
    supplier.isActive = req.body.isActive !== undefined ? req.body.isActive : supplier.isActive;

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    await supplier.deleteOne();
    res.json({ message: 'Supplier removed' });
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

export {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
}; 