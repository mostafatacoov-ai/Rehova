// backend/models/settingModel.js
const mongoose = require('mongoose');

// Define what a "Custom 3D Product" looks like
const customProductSchema = mongoose.Schema({
  name: { type: String, required: true },
  model3d: { type: String, required: true },
  basePrice: { type: Number, default: 0 },
  colors: [String],
  sizes: [String],
  status: { type: String, default: 'Hidden' }, // 👈 Added "Published" vs "Hidden"
  scale: { type: Number, default: 1 },        // 👈 Added for Calibration
  rotationX: { type: Number, default: 0 }     // 👈 Added for Calibration
});

const settingSchema = mongoose.Schema(
  {
    announcementText: { type: String, default: '🎉 Special Offer: Use code REHOVA20 for 20% off!' },
    announcementActive: { type: Boolean, default: false },
    primaryColor: { type: String, default: '#000000' },
    backgroundColor: { type: String, default: '#ffffff' },
    printFee: { type: Number, default: 150 },   // Extra cost for custom printing
    customProducts: [customProductSchema],      // 👈 The array holding your T-Shirts and Polos!
  },
  { timestamps: true }
);

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;