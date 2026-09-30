const StudyLog = require('../models/StudyLog');
const Chapter = require('../models/Chapter');
const mongoose = require('mongoose');

exports.getLogs = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    const subjectId = req.query.subjectId || req.query.subject;
    if (subjectId) filter.subjectId = subjectId;
    if (req.query.fromDate || req.query.toDate) {
      filter.date = {};
      if (req.query.fromDate) filter.date.$gte = new Date(req.query.fromDate);
      if (req.query.toDate) filter.date.$lte = new Date(req.query.toDate);
    }
    
    const logs = await StudyLog.find(filter)
      .sort({ date: -1 })
      .populate('subjectId', 'name colorCode')
      .populate('chapterId', 'title');
      
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

exports.createLog = async (req, res, next) => {
  try {
    const subjectId = req.body.subjectId || req.body.subject;
    const chapterId = req.body.chapterId || req.body.chapter;
    const durationMinutes = req.body.durationMinutes || req.body.duration;

    const logData = {
      ...req.body,
      subjectId,
      chapterId: chapterId || undefined,
      durationMinutes,
      userId: req.user._id
    };
    const log = await StudyLog.create(logData);
    
    if (log.chapterId && (log.questionsAttempted > 0 || log.questionsCorrect > 0)) {
      await Chapter.findOneAndUpdate(
        { _id: log.chapterId, userId: req.user._id },
        {
          $inc: {
            totalQuestionsSolved: log.questionsAttempted || 0,
            correctQuestions: log.questionsCorrect || 0
          }
        }
      );
    }
    
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

exports.getLogStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    
    const basicStats = await StudyLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$durationMinutes' },
          totalQuestions: { $sum: '$questionsAttempted' },
          totalCorrect: { $sum: '$questionsCorrect' }
        }
      }
    ]);

    const stats = basicStats[0] || { totalMinutes: 0, totalQuestions: 0, totalCorrect: 0 };
    const averageAccuracy = stats.totalQuestions > 0 ? (stats.totalCorrect / stats.totalQuestions) * 100 : 0;

    const datesObj = await StudyLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = today;
    for (const d of datesObj) {
      const logDate = new Date(d._id.year, d._id.month - 1, d._id.day);
      const diffTime = Math.abs(currentDate - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1) {
        if (diffDays === 0 && streak === 0) streak = 1;
        else if (diffDays === 1) {
          if (streak === 0) streak = 1;
          else streak++;
        }
        currentDate = logDate;
      } else {
        break;
      }
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyData = await StudyLog.aggregate([
      { $match: { userId, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalMinutes: { $sum: '$durationMinutes' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const subjectDistribution = await StudyLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$subjectId',
          totalMinutes: { $sum: '$durationMinutes' }
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: '$subject' },
      {
        $project: {
          _id: 1,
          totalMinutes: 1,
          name: '$subject.name',
          colorCode: '$subject.colorCode'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMinutes: stats.totalMinutes,
        totalQuestions: stats.totalQuestions,
        totalCorrect: stats.totalCorrect,
        averageAccuracy,
        streak,
        weeklyData,
        subjectDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};
