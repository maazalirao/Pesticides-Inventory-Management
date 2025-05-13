import mongoose from 'mongoose';

const batchSchema = mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
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
    _id: true, // Ensure subdocument gets its own ID
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
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
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

// Add compound index to ensure SKU is unique within a store
inventorySchema.index({ sku: 1, store: 1 }, { unique: true });

// Pre-save validation to ensure batch IDs are unique within an inventory item
// This replaces the database-level unique index that was causing problems
inventorySchema.pre('save', function(next) {
  // Skip validation if no batches or only one batch
  if (!this.batches || this.batches.length <= 1) {
    return next();
  }
  
  // Check for duplicate batch IDs
  const batchIds = this.batches.map(batch => batch.batchId);
  const uniqueBatchIds = [...new Set(batchIds)];
  
  // If there are fewer unique batch IDs than total batch IDs, we have duplicates
  if (uniqueBatchIds.length < batchIds.length) {
    return next(new Error('Duplicate batch IDs found. Each batch must have a unique ID.'));
  }
  
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

// Drop the problematic index if it exists in the database
// This will run when the application starts
Inventory.collection.dropIndex('batches.batchId_1_store_1')
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

export default Inventory; 