// backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 🛑 1. NEW: Create a strict structure for what an Address looks like
const addressSchema = mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }, // Helps us know which one to auto-select at checkout
  },
  { _id: true } // Gives each saved address its own unique ID so users can delete/edit them!
);

// 🛑 2. MAIN USER SCHEMA
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
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeliveryBoy: {
      type: Boolean,
      required: true,
      default: false,
    },
    
    // 👇 --- NEW ADVANCED FEATURES --- 👇
    phone: { 
      type: String, 
      default: '' 
    },
    points: { 
      type: Number, 
      required: true, 
      default: 0 // Every new user starts with 0 points
    },
    addresses: [addressSchema], // An array of the address structures we defined above!
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // 👈 NEW
    // 👆 ---------------------------- 👆
  },
  {
    timestamps: true,
  }
);

// (Assuming you have these standard auth methods. If your old file had different ones, keep yours!)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;