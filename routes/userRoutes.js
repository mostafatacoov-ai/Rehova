// backend/routes/userRoutes.js
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // <-- This fixes "User is not defined"

const router = express.Router();

// --- HELPER FUNCTION: GENERATE TOKEN ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'rehova_super_secret', {
    expiresIn: '30d',
  });
};

// ==========================================
// 1. STANDARD LOGIN (EMAIL & PASSWORD)
// @route   POST /api/users/login
// @access  Public
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Assuming you have a matchPassword method in your userModel
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ==========================================
// 2. STANDARD REGISTRATION (EMAIL & PASSWORD)
// @route   POST /api/users
// @access  Public
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ==========================================
// 3. GOOGLE AUTHENTICATION
// @route   POST /api/users/google
// @access  Public
// ==========================================
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    // Fetch user data from Google using axios
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { email, name } = data;

    // Check if this user already exists in your database
    let user = await User.findOne({ email });

    if (user) {
      // User exists, log them in
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id), 
      });
    } else {
      // User doesn't exist, create a new account
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await User.create({
        name,
        email,
        password: randomPassword, 
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    }
  } catch (error) {
    console.error("Google Auth Backend Error:", error.message); 
    res.status(401).json({ message: error.message || 'Google Authentication Failed' });
  }
});

module.exports = router;