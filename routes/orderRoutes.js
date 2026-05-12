// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const User = require('../models/userModel'); // 🛑 CRITICAL: We must import the User model to update points!

// @desc    Create new order & Award Loyalty Points
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

      // 🛑 NEW: LOYALTY POINTS REWARD SYSTEM 🛑
      // Calculate points: 1 point for every 10 EGP spent (e.g., 150 EGP = 15 points)
      const pointsEarned = Math.floor(Number(totalPrice) / 10);

      // Find the user in the database and securely award the points
      if (userInfo && userInfo._id) {
        const user = await User.findById(userInfo._id);
        if (user) {
          user.points = (user.points || 0) + pointsEarned;
          await user.save();
        }
      }

      // Send back the order AND the points earned!
      res.status(201).json({
        order: createdOrder,
        pointsEarned: pointsEarned 
      });
    }
  } catch (error) {
    console.error("Order Save Error:", error);
    res.status(500).json({ message: 'Server error while saving order' });
  }
});

module.exports = router;