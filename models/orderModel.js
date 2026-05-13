// backend/models/orderModel.js
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
   orderItems: [
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    selectedSize: { type: String },
    selectedColor: { type: String },
    
    // --- NEW CUSTOM DESIGN FIELDS ---
    isCustomOrder: { type: Boolean, default: false },
    uploadedDesigns: [{ type: String }], // Array of URLs to their PNGs
    mockupImage: { type: String }, // A screenshot of their final design
    
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
  },
],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    
    // --- NEW: PROMO CODE LOGGING ---
    promoCode: { type: String, default: '' },
    discountApplied: { type: Number, default: 0 },
    
    // --- ADVANCED DELIVERY TRACKING ---
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    deliveryStatus: {
      type: String,
      enum: ['Processing', 'In Delivery', 'Delivered', 'Returned'],
      default: 'Processing',
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    deliveryComments: [
      {
        text: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;