// backend/controllers/productController.js
const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not fetch products' });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Invalid Product ID' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin (We will lock this down later)
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name || 'Sample name',
      price: req.body.price || 0,
      description: req.body.description || 'Sample description',
      countInStock: req.body.countInStock || 0,
      discount: req.body.discount || 0,
      sizes: req.body.sizes || [],
      colors: req.body.colors || [],
      photos: req.body.photos || [{ url: 'https://via.placeholder.com/300', isMain: true }],
      model3d: req.body.model3d
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product data', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};
