// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const http = require('http'); // 🛑 NEW: Required for Socket.io
const { Server } = require('socket.io'); // 🛑 NEW: Socket.io
const Chat = require('./models/chatModel'); // 🛑 NEW: Chat model for socket events

// Import Routes
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingRoutes = require('./routes/settingRoutes'); // 🛑 NEW: Import Settings Routes
const subscriberRoutes = require('./routes/subscriberRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');
const chatRoutes = require('./routes/chatRoutes'); // 🛑 NEW: Chat Routes
const giftCardRoutes = require('./routes/giftCardRoutes'); // 🛑 NEW: Gift Card Routes

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
app.use('/api/chat', chatRoutes); // 🛑 NEW: Mount Chat API
app.use('/api/giftcards', giftCardRoutes); // 🛑 NEW: Mount Gift Card API

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
// 🔌 SERVER & SOCKET.IO INITIALIZATION
// ==========================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('[SOCKET] New client connected:', socket.id);

  // Join a specific chat room based on chat session ID
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`[SOCKET] User joined chat: ${chatId}`);
  });

  // Handle incoming messages
  socket.on('send_message', async (data) => {
    try {
      const { chatId, sender, text } = data;
      
      // Update DB
      const chat = await Chat.findById(chatId);
      if (chat) {
        const newMessage = { sender, text, timestamp: new Date() };
        chat.messages.push(newMessage);
        await chat.save();
        
        // Broadcast the message back to the room (both client and admin)
        io.to(chatId).emit('receive_message', newMessage);
        
        // Broadcast to all admins that a new message arrived
        io.emit('chat_updated', chat);
      }
    } catch (error) {
      console.error('[SOCKET] Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('[SOCKET] Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVER] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});