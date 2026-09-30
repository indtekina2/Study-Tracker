const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  colorCode: {
    type: String,
    default: '#6366f1'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
