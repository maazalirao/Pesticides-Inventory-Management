import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    threshold: {
      type: Number,
      default: 5,
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
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    image: {
      type: String,
      default: '/images/default-product.jpg',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'low-stock', 'out-of-stock'],
      default: 'active',
    },
    manufacturer: {
      type: String,
      default: '',
    },
    toxicityLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    recommendedUse: {
      type: String,
      default: '',
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Compound index for SKU uniqueness within a store
productSchema.index({ sku: 1, store: 1 }, { unique: true });

// Pre-save middleware to ensure stock and stockQuantity are synchronized
productSchema.pre('save', function(next) {
  // Make sure stock and stockQuantity are in sync
  if (this.isModified('stockQuantity')) {
    this.stock = this.stockQuantity;
  } else if (this.isModified('stock')) {
    this.stockQuantity = this.stock;
  }
  
  // Update status based on stock level
  if (this.stock <= 0) {
    this.status = 'out-of-stock';
  } else if (this.stock <= this.threshold) {
    this.status = 'low-stock';
  } else {
    this.status = 'active';
  }
  
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product; 