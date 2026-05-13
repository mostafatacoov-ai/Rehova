// backend/routes/subscriberRoutes.js
const express = require('express');
const router = express.Router();
const Subscriber = require('../models/subscriberModel');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Add a new subscriber (Public)
// @route   POST /api/subscribers
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    if (!name || !phoneNumber) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }
    const subscriber = new Subscriber({ name, phoneNumber });
    await subscriber.save();
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding subscriber', error: error.message });
  }
});

// @desc    Get all subscribers (Admin Only)
// @route   GET /api/subscribers
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscribers', error: error.message });
  }
});

module.exports = router;
