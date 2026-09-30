const mongoose = require('mongoose');

const studyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  date: {
    type: Date,
    default: Date.now
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  questionsAttempted: {
    type: Number,
    default: 0
  },
  questionsCorrect: {
    type: Number,
    default: 0
  },
  questionsIncorrect: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard']
  },
  notes: {
    type: String
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyLog', studyLogSchema);
