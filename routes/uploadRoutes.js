// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // We need this to check if the folder exists

const router = express.Router();

// --- BULLETPROOF FOLDER CHECK ---
// This ensures the "uploads" folder exists before Multer tries to use it!
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Save files to the backend/uploads folder
  },
  filename(req, file, cb) {
    // Rename the file to ensure no two files ever have the exact same name
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Filter to only accept images and 3D models (Security check)
const checkFileType = (file, cb) => {
  // 1. Added 'glb' and 'gltf' to the allowed extensions
  const filetypes = /jpg|jpeg|png|webp|avif|glb|gltf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // 2. Specifically allow 3D model MIME types (Backend security)
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
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// --- THE POST ROUTE ---
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded.' });
  }
  
  // Format the path so it works nicely in the browser
  const filePath = `/${req.file.path.replace(/\\/g, '/')}`;
  
  // Send the URL back to the React frontend
  res.send(filePath); 
});

module.exports = router;