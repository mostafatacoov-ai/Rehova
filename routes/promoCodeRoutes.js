// backend/routes/promoCodeRoutes.js
const express = require('express');
const router = express.Router();
const PromoCode = require('../models/promoCodeModel');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all promo codes
// @route   GET /api/promo
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const codes = await PromoCode.find({}).sort({ createdAt: -1 });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a promo code
// @route   POST /api/promo
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { code, discountType, discountValue, isActive } = req.body;
    const exists = await PromoCode.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }
    const promo = new PromoCode({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      isActive: isActive !== undefined ? isActive : true
    });
    const created = await promo.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a promo code
// @route   PUT /api/promo/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { code, discountType, discountValue, isActive } = req.body;
    const promo = await PromoCode.findById(req.params.id);
    if (promo) {
      promo.code = code ? code.toUpperCase() : promo.code;
      promo.discountType = discountType || promo.discountType;
      promo.discountValue = discountValue || promo.discountValue;
      if (isActive !== undefined) promo.isActive = isActive;
      
      const updated = await promo.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Promo code not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a promo code
// @route   DELETE /api/promo/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (promo) {
      await PromoCode.deleteOne({ _id: promo._id });
      res.json({ message: 'Promo code removed' });
    } else {
      res.status(404).json({ message: 'Promo code not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Validate a promo code
// @route   POST /api/promo/validate
// @access  Public
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    const promo = await PromoCode.findOne({ code: code.toUpperCase() });
    if (!promo) return res.status(404).json({ message: 'Invalid promo code' });
    if (!promo.isActive) return res.status(400).json({ message: 'Promo code is inactive' });

    res.json({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
