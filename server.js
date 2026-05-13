// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import Routes
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingRoutes = require('./routes/settingRoutes'); // 🛑 NEW: Import Settings Routes
const subscriberRoutes = require('./routes/subscriberRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB(); 

const app = express();

// ==========================================
// 🛡️ CRITICAL MIDDLEWARE
// ==========================================
// Allow requests from your live Hostinger domain
app.use(cors({ origin: '*' })); 

// Crucial for reading JSON payloads from React (like the Google Token!)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 🚀 API ROUTES
// ==========================================
app.use('/api/products', productRoutes); 
app.use('/api/upload', uploadRoutes); // Vital for the upload progress bar
app.use('/api/users', userRoutes); // Where the Google Auth goes!
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes); // 🛑 NEW: Mount the Settings API!
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/promo', promoCodeRoutes);

// ==========================================
// 📁 STATIC FOLDER SETUP
// ==========================================
// Allows the frontend to read images saved in the backend's 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 🏥 HEALTH CHECKS
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Rehova V2 API is running flawlessly.' });
});

app.get('/', (req, res) => {
  res.send('Rehova API is running...');
});

// ==========================================
// 🔌 SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});