const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' },
  userId: { type: String, default: 'anonymous' },
  jsonData: { type: Object },
  thumbnailUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Design', DesignSchema);
