const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const StudyLog = require('../models/StudyLog');
const MockTest = require('../models/MockTest');

const mongoose = require('mongoose');

exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    
    const chapterStats = await Chapter.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: '$subjectId',
          totalChapters: { $sum: 1 },
          completedChapters: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const statsMap = {};
    chapterStats.forEach(stat => {
      statsMap[stat._id.toString()] = stat;
    });
    
    const subjectsWithStats = subjects.map(subject => {
      const stats = statsMap[subject._id.toString()] || { totalChapters: 0, completedChapters: 0 };
      return {
        ...subject.toObject(),
        chapterCount: stats.totalChapters,
        completedChapters: stats.completedChapters
      };
    });
    
    res.status(200).json({ success: true, data: subjectsWithStats });
  } catch (error) {
    next(error);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const { name, colorCode } = req.body;
    const subject = await Subject.create({
      userId: req.user._id,
      name,
      colorCode
    });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const userId = req.user._id;
    
    const subject = await Subject.findOneAndDelete({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    await Chapter.deleteMany({ subjectId, userId });
    await StudyLog.deleteMany({ subjectId, userId });
    await MockTest.updateMany(
      { userId },
      { $pull: { subjectScores: { subjectId } } }
    );
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
