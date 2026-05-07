// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
// NOTE: Make sure you add your authentication middleware here if you have it!

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      userInfo // Passed from frontend auth
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      const order = new Order({
        orderItems: orderItems.map((x) => ({
          ...x,
          product: x._id, // Map the frontend ID to the database reference
        })),
        user: userInfo._id, // Associate order with logged-in user
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.error("Order Save Error:", error);
    res.status(500).json({ message: 'Server error while saving order' });
  }
});

module.exports = router;