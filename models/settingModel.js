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
    categories: [{ type: String }],             // 👈 Dynamic categories for products
    returnRefundPolicy: { 
      type: String, 
      default: 'We care about our customers and allow returns within 14 days of receipt\nItems must be unused and unwashed in original condition\nAll original tags must be attached' 
    },
    // --- POPUP SETTINGS ---
    popupActive: { type: Boolean, default: false },
    popupTitle: { type: String, default: 'GET 10% OFF YOUR FIRST ORDER' },
    popupText: { type: String, default: "300,000 CLIENTS HAVE TRIED US AND RETURNED FOR MORE. NOW IT'S YOUR TURN!" },
    popupDiscount: { type: String, default: 'CLAIM DISCOUNT' },
    
    // --- SEO SETTINGS ---
    seoTitle: { type: String, default: 'REHOVA | Premium Streetwear' },
    seoDescription: { type: String, default: 'Premium streetwear brand blending comfort, style, and exclusivity.' },
    seoKeywords: { type: String, default: 'streetwear, fashion, premium, clothing, rehova' },

    // --- HOME PAGE CONTENT ---
    heroVideo: { type: String, default: '/hero.mp4' },
    heroButton1Text: { type: String, default: 'Shop Collection' },
    heroButton1Link: { type: String, default: '/collection' },
    heroButton2Text: { type: String, default: 'Customize Your Own' },
    heroButton2Link: { type: String, default: '/custom-design' },
    homePageHeading: { type: String, default: 'Latest Arrivals' },

    // --- VISIBILITY TOGGLES ---
    showCollection: { type: Boolean, default: true },
    showCustomizer: { type: Boolean, default: true },
    showGiftCards: { type: Boolean, default: true },
    showBlogs: { type: Boolean, default: true },
    showOurStory: { type: Boolean, default: true },

    // --- TRANSLATIONS / WORDING ---
    translations: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;