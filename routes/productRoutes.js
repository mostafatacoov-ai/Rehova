// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
});

// @desc    Create a draft product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    // We catch the dummy data sent from AdminDashboard.jsx
    const product = new Product({
      name: req.body.name || 'New Draft Product',
      price: req.body.price || 0,
      image: req.body.image || 'https://via.placeholder.com/400x500?text=Upload+Image',
      description: req.body.description || 'Enter description here...',
      countInStock: req.body.countInStock || 0,
      sizes: req.body.sizes || [],
      colors: req.body.colors || [],
      photos: req.body.photos || [],
      model3d: req.body.model3d || ''
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create draft product', error: error.message });
  }
});

// @desc    Update a product (This fixes the 404 error)
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { name, price, description, countInStock, sizes, colors, photos, model3d, sizeChart, washingInstructions, shippingDelivery, hasSpecialOffer, specialOfferText, isHidden } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Update standard fields
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
      
      // Update advanced arrays (colors, sizes, multiple photos)
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      product.photos = photos || product.photos;
      
      if (model3d !== undefined) {
        product.model3d = model3d;
      }
      
      if (sizeChart !== undefined) product.sizeChart = sizeChart;
      if (washingInstructions !== undefined) product.washingInstructions = washingInstructions;
      if (shippingDelivery !== undefined) product.shippingDelivery = shippingDelivery;
      
      if (hasSpecialOffer !== undefined) product.hasSpecialOffer = hasSpecialOffer;
      if (specialOfferText !== undefined) product.specialOfferText = specialOfferText;
      if (isHidden !== undefined) product.isHidden = isHidden;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found in database' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product permanently removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

module.exports = router;