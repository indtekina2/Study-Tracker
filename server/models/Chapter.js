const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Revision Required'],
    default: 'Not Started'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  targetDate: {
    type: Date
  },
  subtopics: [{
    title: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  totalQuestionsSolved: {
    type: Number,
    default: 0
  },
  correctQuestions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

chapterSchema.virtual('accuracyPercent').get(function() {
  if (this.totalQuestionsSolved === 0) return 0;
  return (this.correctQuestions / this.totalQuestionsSolved) * 100;
});

module.exports = mongoose.model('Chapter', chapterSchema);
