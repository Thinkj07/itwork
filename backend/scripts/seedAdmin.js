const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ 
      email: 'admin@system.com',
      role: 'admin' 
    });

    if (adminExists) {
      console.log('⚠️  Admin account already exists');
      process.exit(0);
    }

    // Create admin account
    const admin = await User.create({
      email: 'admin@system.com',
      password: 'Admin@123456', // Will be hashed by pre-save hook
      role: 'admin',
      fullName: 'System Administrator',
      isActive: true,
      isSystemAccount: true // Prevent deletion
    });

    console.log('✅ Admin account created successfully');
    console.log('📧 Email: admin@system.com');
    console.log('🔑 Password: Admin@123456');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
