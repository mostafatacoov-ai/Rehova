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
    
    // 🛑 NEW: Save the 3D Custom Lab data & Categories
    if (req.body.printFee !== undefined) settings.printFee = req.body.printFee;
    if (req.body.customProducts) settings.customProducts = req.body.customProducts;
    if (req.body.categories) settings.categories = req.body.categories;
    if (req.body.returnRefundPolicy !== undefined) settings.returnRefundPolicy = req.body.returnRefundPolicy;

    // 🛑 NEW: Popup Settings
    if (req.body.popupActive !== undefined) settings.popupActive = req.body.popupActive;
    if (req.body.popupTitle !== undefined) settings.popupTitle = req.body.popupTitle;
    if (req.body.popupText !== undefined) settings.popupText = req.body.popupText;
    if (req.body.popupDiscount !== undefined) settings.popupDiscount = req.body.popupDiscount;

    // --- SEO SETTINGS ---
    if (req.body.seoTitle !== undefined) settings.seoTitle = req.body.seoTitle;
    if (req.body.seoDescription !== undefined) settings.seoDescription = req.body.seoDescription;
    if (req.body.seoKeywords !== undefined) settings.seoKeywords = req.body.seoKeywords;

    // --- HOME PAGE CONTENT ---
    if (req.body.heroVideo !== undefined) settings.heroVideo = req.body.heroVideo;
    if (req.body.heroButton1Text !== undefined) settings.heroButton1Text = req.body.heroButton1Text;
    if (req.body.heroButton1Link !== undefined) settings.heroButton1Link = req.body.heroButton1Link;
    if (req.body.heroButton2Text !== undefined) settings.heroButton2Text = req.body.heroButton2Text;
    if (req.body.heroButton2Link !== undefined) settings.heroButton2Link = req.body.heroButton2Link;
    if (req.body.homePageHeading !== undefined) settings.homePageHeading = req.body.homePageHeading;

    // --- VISIBILITY TOGGLES ---
    if (req.body.showCollection !== undefined) settings.showCollection = req.body.showCollection;
    if (req.body.showCustomizer !== undefined) settings.showCustomizer = req.body.showCustomizer;
    if (req.body.showGiftCards !== undefined) settings.showGiftCards = req.body.showGiftCards;
    if (req.body.showBlogs !== undefined) settings.showBlogs = req.body.showBlogs;
    if (req.body.showOurStory !== undefined) settings.showOurStory = req.body.showOurStory;

    // --- TRANSLATIONS / WORDING ---
    if (req.body.translations !== undefined) {
      settings.translations = req.body.translations;
      settings.markModified('translations'); // Important for Mixed types in Mongoose
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

module.exports = router;