// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel'); 

// 🛑 WE MUST IMPORT THE AUTH MIDDLEWARE TO PROTECT THE PROFILE ROUTES
// (This checks the user's token so they can only edit their own profile)
const { protect } = require('../middleware/authMiddleware');

// 🛠️ THE FAILSAFE: If Railway drops the env var, this hardcoded ID takes over automatically.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '343076682784-f9g6kf31uhbdlfgh5vm5e1k0rgp7ef8k.apps.googleusercontent.com';

// Initialize Google Auth with the guaranteed Client ID
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- HELPER FUNCTION: GENERATE TOKEN ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'rehova_super_secret', {
    expiresIn: '30d',
  });
};

// ==========================================
// 1. STANDARD LOGIN (EMAIL & PASSWORD)
// @route POST /api/users/login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Assumes matchPassword exists on your userModel
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isDeliveryBoy: user.isDeliveryBoy,
        phone: user.phone,             // 👈 ADDED
        addresses: user.addresses,     // 👈 ADDED
        favorites: user.favorites,     // 👈 ADDED
        points: user.points,           // 👈 ADDED
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
// 2. STANDARD REGISTRATION
// @route POST /api/users
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isDeliveryBoy: user.isDeliveryBoy,
        phone: user.phone,             // 👈 ADDED
        addresses: user.addresses,     // 👈 ADDED
        favorites: user.favorites,     // 👈 ADDED
        points: user.points,           // 👈 ADDED
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 3. GOOGLE AUTHENTICATION (Bulletproof + Trim Fix)
// @route POST /api/users/google
// ==========================================
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      console.error("❌ GOOGLE AUTH ERROR: No token received from frontend!");
      return res.status(400).json({ message: "No token provided." });
    }
    
    const rawClientId = process.env.GOOGLE_CLIENT_ID || '343076682784-f9g6kf31uhbdlfgh5vm5e1k0rgp7ef8k.apps.googleusercontent.com';
    const SAFE_CLIENT_ID = rawClientId.trim(); 

    const googleClient = new OAuth2Client(SAFE_CLIENT_ID);

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: SAFE_CLIENT_ID,
    });
    
    const { name, email } = ticket.getPayload();
    
    let user = await User.findOne({ email });
    
    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isDeliveryBoy: user.isDeliveryBoy,
        phone: user.phone,             // 👈 ADDED
        addresses: user.addresses,     // 👈 ADDED
        favorites: user.favorites,     // 👈 ADDED
        points: user.points,           // 👈 ADDED
        token: generateToken(user._id),
      });
    } else {
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      user = await User.create({
        name,
        email,
        password: randomPassword,
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isDeliveryBoy: user.isDeliveryBoy,
        phone: user.phone,             // 👈 ADDED
        addresses: user.addresses,     // 👈 ADDED
        favorites: user.favorites,     // 👈 ADDED
        points: user.points,           // 👈 ADDED
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('🔥 GOOGLE VERIFICATION FAILED. Reason:', error.message);
    return res.status(401).json({ message: `Backend rejected token: ${error.message}` });
  }
});

// ==========================================
// 4. NEW: GET USER PROFILE (Private)
// @route GET /api/users/profile
// ==========================================
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isDeliveryBoy: user.isDeliveryBoy,
        phone: user.phone,
        addresses: user.addresses,
        favorites: user.favorites,
        points: user.points,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// ==========================================
// 5. NEW: UPDATE USER PROFILE (Private)
// @route PUT /api/users/profile
// ==========================================
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      // Save the Phone Number
      if (req.body.phone !== undefined) {
        user.phone = req.body.phone;
      }
      
      // Save the Array of Addresses
      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isDeliveryBoy: updatedUser.isDeliveryBoy,
        phone: updatedUser.phone,
        addresses: updatedUser.addresses,
        favorites: updatedUser.favorites,
        points: updatedUser.points,
        token: generateToken(updatedUser._id), 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// ==========================================
// 5.5. NEW: TOGGLE FAVORITE (Private)
// @route POST /api/users/favorites/toggle
// ==========================================
router.post('/favorites/toggle', protect, async (req, res) => {
  try {
    const productId = req.body.productId;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if already favorited
    const alreadyFav = user.favorites && user.favorites.some(fav => fav.toString() === productId.toString());

    let updatedUser;
    if (alreadyFav) {
      // Remove from favorites using $pull (bypasses pre-save hook)
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { favorites: productId } },
        { new: true }
      );
    } else {
      // Add to favorites using $addToSet (bypasses pre-save hook)
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { favorites: productId } },
        { new: true }
      );
    }
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isDeliveryBoy: updatedUser.isDeliveryBoy,
      phone: updatedUser.phone,
      addresses: updatedUser.addresses,
      favorites: updatedUser.favorites,
      points: updatedUser.points,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error('🔥 FAVORITES TOGGLE ERROR:', error.message);
    res.status(500).json({ message: 'Server error toggling favorite' });
  }
});

// ==========================================
// 5.6. NEW: GET FAVORITE PRODUCTS (Private)
// @route GET /api/users/favorites
// ==========================================
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
});

// ==========================================
// 6. GET ALL USERS (For Admin Dashboard)
// @route GET /api/users
// ==========================================
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 6.5. GET ALL DELIVERY BOYS (For Admin Dashboard)
// @route GET /api/users/delivery-boys
// ==========================================
router.get('/delivery-boys', async (req, res) => {
  try {
    const deliveryBoys = await User.find({ isDeliveryBoy: true });
    res.json(deliveryBoys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 7. DELETE USER (For Admin Dashboard)
// @route DELETE /api/users/:id
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed completely.' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;