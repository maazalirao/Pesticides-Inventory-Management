import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../server/models/userModel.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com', role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create new admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', adminUser.role);
    console.log('🆔 User ID:', adminUser._id);
    
    console.log('\n🎉 You can now login to the admin panel at /admin/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createAdminUser(); 