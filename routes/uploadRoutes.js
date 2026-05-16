// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const FileModel = require('../models/fileModel');

const router = express.Router();

// --- MULTER CONFIGURATION (MEMORY STORAGE) ---
// Store file securely in memory instead of disk, bypassing all Hostinger/Railway filesystem limits
const storage = multer.memoryStorage();

// Filter to only accept images and 3D models (Security check)
const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|webp|avif|glb|gltf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  const is3DModel = 
    file.mimetype === 'model/gltf-binary' || 
    file.mimetype === 'model/gltf+json' || 
    file.mimetype === 'application/octet-stream';

  const mimetype = filetypes.test(file.mimetype) || is3DModel;

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Only Images and 3D Models (.glb) are allowed!');
  }
};

const upload = multer({
  storage,
  // Optional: Set limits (e.g., 15MB to stay safely under MongoDB's 16MB limit)
  limits: { fileSize: 15 * 1024 * 1024 }, 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// --- THE POST ROUTE (UPLOAD TO MONGODB) ---
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded.' });
    }

    // Save the file binary data directly into MongoDB Atlas!
    const newFile = await FileModel.create({
      fileName: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer, // Raw binary
    });
    
    // Return the database API URL to access the file
    const fileUrl = `/api/upload/file/${newFile._id}`;
    res.send({ url: fileUrl });

  } catch (error) {
    console.error("MongoDB Upload Error:", error);
    res.status(500).send({ message: 'Failed to upload file to database.' });
  }
});

// --- THE GET ROUTE (STREAM FROM MONGODB) ---
router.get('/file/:id', async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }

    // Tell the browser what type of file this is (e.g. image/png or model/gltf-binary)
    res.set('Content-Type', file.contentType);
    res.send(file.data);

  } catch (error) {
    res.status(500).send('Error retrieving file');
  }
});

module.exports = router;