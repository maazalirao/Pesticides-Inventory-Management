import mongoose from 'mongoose';

const batchSchema = mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
    },
    lotNumber: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    manufacturingDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    locationCode: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const inventorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    threshold: {
      type: Number,
      required: true,
      default: 10,
    },
    status: {
      type: String,
      required: true,
      default: 'In Stock',
    },
    supplier: {
      type: String,
      default: '',
    },
    batches: [batchSchema],
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory; 