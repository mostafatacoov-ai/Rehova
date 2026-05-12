// backend/models/settingModel.js
const mongoose = require('mongoose');

const settingSchema = mongoose.Schema(
  {
    announcementText: {
      type: String,
      default: '🎉 Special Offer: Use code REHOVA20 for 20% off!',
    },
    announcementActive: {
      type: Boolean,
      default: false,
    },
    primaryColor: {
      type: String,
      default: '#000000',
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;