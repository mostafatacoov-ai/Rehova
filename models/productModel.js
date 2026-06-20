// backend/models/productModel.js
const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Set to false temporarily to prevent crashes if you create products without logging in
      ref: 'User',
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },isCustomizable: {
  type: Boolean,
  required: true,
  default: false, // Only true for the Blank T-Shirt and Polo
},
printPrice: {
  type: Number,
  required: true,
  default: 0, // Admin can set this to $5 or $10 per uploaded design
},

    countInStock: { type: Number, required: true, default: 0 },

    // --- NEW REHOVA FEATURES ---
    sizes: [{ type: String }],
    colors: [{ type: String }],
    styles: [
      {
        name: { type: String },
        colorCode: { type: String }
      }
    ],
    photos: [
      {
        url: { type: String, required: true },
        isMain: { type: Boolean, default: false }
      }
    ],
    // Legacy fallback
    image: { type: String, required: false },
    model3d: { type: String, default: '' },

    // 🛑 NEW ACCORDION FIELDS
    sizeChart: [
      {
        size: { type: String },
        bodyWidth: { type: String },
        bodyLength: { type: String }
      }
    ],
    washingInstructions: { 
      type: String, 
      default: 'Machine wash in cold water 30 degrees inside out\nDo not bleach\nUse gentle detergent and avoid mixing colors' 
    },
    shippingDelivery: { 
      type: String, 
      default: 'Regular orders: 3-7 business days, depending on your location' 
    },

    // Standard fields
    brand: { type: String, required: false, default: 'REHOVA' },
    category: { type: String, required: false },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    
    // --- SPECIAL OFFER RIBBON ---
    hasSpecialOffer: { type: Boolean, default: false },
    specialOfferText: { type: String, default: '' },
    isHidden: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;