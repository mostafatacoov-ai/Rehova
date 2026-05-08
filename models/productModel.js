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
    photos: [
      {
        url: { type: String, required: true },
        isMain: { type: Boolean, default: false }
      }
    ],
    // Legacy fallback
    image: { type: String, required: false },

    // Standard fields
    brand: { type: String, required: false, default: 'REHOVA' },
    category: { type: String, required: false },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;