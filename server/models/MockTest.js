const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  provider: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  totalScore: {
    type: Number,
    required: true
  },
  obtainedScore: {
    type: Number,
    required: true
  },
  subjectScores: [{
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    score: Number,
    maxScore: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

mockTestSchema.virtual('percentage').get(function() {
  if (this.totalScore === 0) return 0;
  return (this.obtainedScore / this.totalScore) * 100;
});

module.exports = mongoose.model('MockTest', mockTestSchema);
