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

dotenv.config();

// Connect to MongoDB
connectDB(); 

const app = express();

// Middleware
app.use(cors({
  origin: ['https://rehovawear.com', 'https://www.rehovawear.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use('/api/products', productRoutes); 
app.use('/api/upload', uploadRoutes); // <-- Vital for the upload progress bar to work
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// --- Static Folder Setup ---
// This line is magic: It allows your browser to view the images saved in the backend's 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Default health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Rehova V2 API is running flawlessly.' });
});

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('Rehova API is running...');
});
app.listen(PORT, () => {
  console.log(`[SERVER] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});