import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'store_owner', 'employee'],
      default: 'employee',
    },
    stores: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
    }],
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    phone: {
      type: String,
    },
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Check if user has admin permissions
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

// Check if user has store owner permissions
userSchema.methods.isStoreOwner = function () {
  return this.role === 'admin' || this.role === 'store_owner';
};

// Check if user has access to a specific store
userSchema.methods.hasStoreAccess = function (storeId) {
  // Admin has access to all stores
  if (this.role === 'admin') return true;
  
  // Check if store is in user's stores array
  return this.stores.some(store => store.equals(storeId));
};

const User = mongoose.model('User', userSchema);

export default User; 