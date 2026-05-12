// backend/routes/settingRoutes.js
const express = require('express');
const router = express.Router();
const Setting = require('../models/settingModel');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get global site settings (Public - for the frontend to load)
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Look for the first settings document
    let settings = await Setting.findOne({});
    
    // If you've never saved settings before, create the default ones automatically!
    if (!settings) {
      settings = await Setting.create({});
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// @desc    Update global site settings (Admin Only)
// @route   PUT /api/settings
// @access  Private/Admin
// @desc    Update global site settings (Admin Only)
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  try {
    let settings = await Setting.findOne({});
    if (!settings) settings = new Setting();

    settings.announcementText = req.body.announcementText !== undefined ? req.body.announcementText : settings.announcementText;
    settings.announcementActive = req.body.announcementActive !== undefined ? req.body.announcementActive : settings.announcementActive;
    settings.primaryColor = req.body.primaryColor || settings.primaryColor;
    settings.backgroundColor = req.body.backgroundColor || settings.backgroundColor;
    
    // 🛑 NEW: Save the 3D Custom Lab data
    if (req.body.printFee !== undefined) settings.printFee = req.body.printFee;
    if (req.body.customProducts) settings.customProducts = req.body.customProducts;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

module.exports = router;