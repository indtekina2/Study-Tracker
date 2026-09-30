const MockTest = require('../models/MockTest');
const mongoose = require('mongoose');

exports.getMockTests = async (req, res, next) => {
  try {
    const tests = await MockTest.find({ userId: req.user._id })
      .sort({ date: -1 })
      .populate('subjectScores.subjectId', 'name');
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    next(error);
  }
};

exports.createMockTest = async (req, res, next) => {
  try {
    const subjectScores = req.body.subjectScores?.map(s => ({
      subjectId: s.subjectId || s.subject,
      score: Number(s.score),
      maxScore: Number(s.maxScore) || 0
    }));

    const test = await MockTest.create({
      ...req.body,
      ...(subjectScores ? { subjectScores } : {}),
      userId: req.user._id
    });
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    next(error);
  }
};

exports.deleteMockTest = async (req, res, next) => {
  try {
    const test = await MockTest.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!test) {
      return res.status(404).json({ success: false, message: 'Mock test not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.getMockTestAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    
    const tests = await MockTest.find({ userId }).sort({ date: 1 });
    const scoreTrend = tests.map(test => ({
      date: test.date,
      percentage: test.percentage,
      testName: test.testName
    }));
    
    const weakAreasAggr = await MockTest.aggregate([
      { $match: { userId } },
      { $unwind: '$subjectScores' },
      {
        $group: {
          _id: '$subjectScores.subjectId',
          totalScore: { $sum: '$subjectScores.score' },
          totalMax: { $sum: '$subjectScores.maxScore' }
        }
      },
      {
        $project: {
          subjectId: '$_id',
          averagePercentage: {
            $cond: [
              { $eq: ['$totalMax', 0] },
              0,
              { $multiply: [{ $divide: ['$totalScore', '$totalMax'] }, 100] }
            ]
          }
        }
      },
      { $sort: { averagePercentage: 1 } },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: '$subject' },
      {
        $project: {
          _id: 1,
          name: '$subject.name',
          averagePercentage: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        scoreTrend,
        weakAreas: weakAreasAggr
      }
    });
  } catch (error) {
    next(error);
  }
};
