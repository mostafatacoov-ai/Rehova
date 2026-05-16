// backend/models/fileModel.js
const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('File', fileSchema);
