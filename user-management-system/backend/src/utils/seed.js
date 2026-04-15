require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ROLES } = require('../config/roles');

const seedUsers = [
  {
    name: 'Super Admin',
    email: 'admin@example.com',
    password: 'Admin@123456',
    role: ROLES.ADMIN,
    status: 'active',
  },
  {
    name: 'Manager One',
    email: 'manager@example.com',
    password: 'Manager@123456',
    role: ROLES.MANAGER,
    status: 'active',
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'User@123456',
    role: ROLES.USER,
    status: 'active',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Jane@123456',
    role: ROLES.USER,
    status: 'active',
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'Bob@123456',
    role: ROLES.USER,
    status: 'inactive',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin first to get ID for createdBy
    const adminData = seedUsers[0];
    const adminUser = new User(adminData);
    await adminUser.save();
    console.log(`Created admin: ${adminUser.email}`);

    // Create remaining users with createdBy set to admin
    for (let i = 1; i < seedUsers.length; i++) {
      const user = new User({
        ...seedUsers[i],
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
      });
      await user.save();
      console.log(`Created user: ${user.email}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nCredentials:');
    seedUsers.forEach(u => {
      console.log(`  ${u.role.padEnd(10)} | ${u.email.padEnd(25)} | ${u.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
