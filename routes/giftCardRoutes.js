const express = require('express');
const router = express.Router();
const GiftCard = require('../models/giftCardModel');
const { protect, admin } = require('../middleware/authMiddleware');
const crypto = require('crypto');

// Generate unique code helper
const generateUniqueCode = () => {
  return 'GC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// @desc    Get all gift cards
// @route   GET /api/giftcards
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const cards = await GiftCard.find({}).populate('purchasedBy', 'name email').sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get my gift cards
// @route   GET /api/giftcards/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const cards = await GiftCard.find({ purchasedBy: req.user._id }).sort({ purchasedAt: -1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your gift cards' });
  }
});

// @desc    Bulk create gift cards
// @route   POST /api/giftcards/bulk
// @access  Private/Admin
router.post('/bulk', protect, admin, async (req, res) => {
  try {
    const { count, value } = req.body;
    
    if (!count || !value || count <= 0 || value <= 0) {
      return res.status(400).json({ message: 'Invalid count or value' });
    }

    const newCards = [];
    for (let i = 0; i < count; i++) {
      let unique = false;
      let code = '';
      // Ensure absolute uniqueness
      while (!unique) {
        code = generateUniqueCode();
        const exists = await GiftCard.findOne({ code });
        if (!exists) unique = true;
      }
      
      newCards.push({
        code,
        initialValue: value,
        currentBalance: value,
        status: 'Available',
      });
    }

    const createdCards = await GiftCard.insertMany(newCards);
    res.status(201).json({ message: `${createdCards.length} Gift Cards generated!`, cards: createdCards });
  } catch (error) {
    res.status(500).json({ message: 'Server error generating gift cards' });
  }
});

// @desc    Validate a gift card
// @route   POST /api/giftcards/validate
// @access  Public
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const card = await GiftCard.findOne({ code: code.toUpperCase() });

    if (!card) return res.status(404).json({ message: 'Invalid gift card code' });
    if (card.currentBalance <= 0) return res.status(400).json({ message: 'Gift card has zero balance' });
    // Note: We don't necessarily enforce that status must be 'Purchased' if they were manually given out, 
    // but if it's 'Available' it means no one bought it yet. Let's allow 'Available' as well in case admin gives it manually.

    res.json({
      code: card.code,
      balance: card.currentBalance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error validating gift card' });
  }
});

module.exports = router;
