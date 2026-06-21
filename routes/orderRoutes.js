// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel'); // 🛑 NEEDED FOR INVENTORY
const GiftCard = require('../models/giftCardModel'); // 🛑 NEW: Gift Cards
const { protect } = require('../middleware/authMiddleware');

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
      promoCode,
      discountApplied,
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
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        promoCode,
        discountApplied,
      });

      const createdOrder = await order.save();

      // 🛑 NEW: GIFT CARD REDEMPTION
      if (promoCode) {
        const giftCard = await GiftCard.findOne({ code: promoCode.toUpperCase() });
        if (giftCard) {
          giftCard.currentBalance -= (discountApplied || 0);
          if (giftCard.currentBalance <= 0) {
            giftCard.currentBalance = 0;
            giftCard.status = 'Used';
          }
          await giftCard.save();
        }
      }

      // 🛑 NEW: GIFT CARD PURCHASING
      let assignedGiftCards = [];
      for (const item of orderItems) {
        const productData = await Product.findById(item.product);
        // We assume the admin sets the category to 'Gift Card' for these products
        if (productData && productData.category === 'Gift Card') {
          for (let i = 0; i < item.qty; i++) {
            const availableCard = await GiftCard.findOne({ status: 'Available', initialValue: productData.price });
            if (availableCard) {
              availableCard.status = 'Purchased';
              availableCard.purchasedBy = userInfo._id;
              availableCard.purchasedAt = Date.now();
              await availableCard.save();
              assignedGiftCards.push(availableCard.code);
            } else {
              // Generate on the fly if ran out
              const newCode = 'GC-' + require('crypto').randomBytes(4).toString('hex').toUpperCase();
              const newCard = new GiftCard({
                code: newCode,
                initialValue: productData.price,
                currentBalance: productData.price,
                status: 'Purchased',
                purchasedBy: userInfo._id,
                purchasedAt: Date.now()
              });
              await newCard.save();
              assignedGiftCards.push(newCard.code);
            }
          }
        }
      }

      // 🛑 NEW: LOYALTY POINTS REWARD SYSTEM 🛑
      // Calculate points: 1 point for every 10 EGP spent (e.g., 150 EGP = 15 points)
      const pointsEarned = Math.floor(Number(totalPrice) / 10);

      // Find the user in the database and securely award the points
      if (userInfo && userInfo._id) {
        const user = await User.findById(userInfo._id);
        if (user) {
          user.points = (user.points || 0) + pointsEarned;

          // Auto-save shipping address if it's new
          if (shippingAddress && shippingAddress.address) {
            const isNewAddress = !user.addresses.some(a =>
              a.street === shippingAddress.address &&
              a.city === shippingAddress.city &&
              a.zip === shippingAddress.postalCode &&
              a.country === shippingAddress.country
            );
            if (isNewAddress) {
              user.addresses.push({
                street: shippingAddress.address,
                city: shippingAddress.city,
                zip: shippingAddress.postalCode,
                country: shippingAddress.country
              });
            }
          }
          await user.save();
        }
      }

      // 🛑 NEW: Emit Socket.io event for real-time dashboard notification
      if (req.app.get('io')) {
        req.app.get('io').emit('new_order', createdOrder);
      }

      // Send back the order AND the points earned!
      res.status(201).json({
        order: createdOrder,
        pointsEarned: pointsEarned,
        assignedGiftCards // Return the codes directly so they can be shown to the user on success
      });
    }
  } catch (error) {
    console.error("Order Save Error:", error);
    res.status(500).json({ message: 'Server error while saving order' });
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').populate('deliveryBoy', 'id name phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @desc    Get logged in user orders or delivery boy assigned orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    // If delivery boy, fetch their assigned orders. Otherwise, their placed orders.
    const query = req.user.isDeliveryBoy ? { deliveryBoy: req.user._id } : { user: req.user._id };
    const orders = await Order.find(query).populate('user', 'id name email').populate('deliveryBoy', 'id name phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching my orders' });
  }
});

// @desc    Assign delivery boy & set status (Admin)
// @route   PUT /api/orders/:id/delivery-admin
// @access  Private/Admin
router.put('/:id/delivery-admin', async (req, res) => {
  try {
    const { deliveryBoyId, deliveryFee, deliveryStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      if (deliveryBoyId !== undefined) order.deliveryBoy = deliveryBoyId;
      if (deliveryFee !== undefined) order.deliveryFee = deliveryFee;

      // If changing to 'In Delivery', deduct inventory
      if (deliveryStatus && deliveryStatus === 'In Delivery' && order.deliveryStatus !== 'In Delivery') {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.countInStock = product.countInStock - item.qty;
            await product.save();
          }
        }
      }

      if (deliveryStatus !== undefined) order.deliveryStatus = deliveryStatus;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating delivery assignment' });
  }
});

// @desc    Update delivery status and add comments (Delivery Boy)
// @route   PUT /api/orders/:id/delivery-status
// @access  Private
router.put('/:id/delivery-status', protect, async (req, res) => {
  try {
    const { deliveryStatus, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      // Must be the assigned delivery boy or admin
      if (order.deliveryBoy && order.deliveryBoy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(401).json({ message: 'Not authorized for this order' });
      }

      if (comment) {
        order.deliveryComments.push({ text: comment, date: new Date() });
      }

      // Handle 'Returned' logic
      if (deliveryStatus === 'Returned' && order.deliveryStatus !== 'Returned') {
        // Restore inventory
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.countInStock = product.countInStock + item.qty;
            await product.save();
          }
        }
      }

      if (deliveryStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      if (deliveryStatus !== undefined) order.deliveryStatus = deliveryStatus;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating delivery status' });
  }
});

module.exports = router;