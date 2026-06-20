const express = require('express');
const router = express.Router();
const Chat = require('../models/chatModel');

// @route   POST /api/chat/start
// @desc    Start a new chat session or get an existing active one for a user
router.post('/start', async (req, res) => {
  try {
    const { clientName, clientEmail } = req.body;

    if (!clientName || !clientEmail) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    // Try to find an existing active chat for this email
    let chat = await Chat.findOne({ clientEmail, status: 'active' });

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        clientName,
        clientEmail,
        messages: [{ sender: 'admin', text: 'Hi there! How can we help you today?' }],
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ message: 'Server error starting chat.' });
  }
});

// @route   GET /api/chat/:id
// @desc    Fetch a specific chat session (used by client on refresh)
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Server error fetching chat.' });
  }
});

// @route   GET /api/chat
// @desc    Get all chats for Admin Dashboard
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find({}).sort({ lastMessageAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server error fetching chats.' });
  }
});

// @route   PUT /api/chat/:id/archive
// @desc    Archive or Unarchive a chat
router.put('/:id/archive', async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'archived'
    const chat = await Chat.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error archiving chat:', error);
    res.status(500).json({ message: 'Server error archiving chat.' });
  }
});

module.exports = router;
