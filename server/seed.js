require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Chapter = require('./models/Chapter');
const StudyLog = require('./models/StudyLog');
const MockTest = require('./models/MockTest');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/study-tracker');
    console.log('Connected.');

    // Clear existing test user if present
    const testEmail = 'demo@example.com';
    let user = await User.findOne({ email: testEmail });
    if (!user) {
      user = await User.create({
        name: 'Demo Student',
        email: testEmail,
        password: 'password123',
        targetExam: 'JEE Advanced / NEET'
      });
      console.log('Created demo user: demo@example.com / password123');
    } else {
      console.log('Found existing demo user:', user.email);
    }

    const userId = user._id;

    // Clean existing data for demo user
    await Subject.deleteMany({ userId });
    await Chapter.deleteMany({ userId });
    await StudyLog.deleteMany({ userId });
    await MockTest.deleteMany({ userId });
    console.log('Cleared existing data for demo user.');

    // Create Subjects
    const physics = await Subject.create({ userId, name: 'Physics', colorCode: '#ef4444' });
    const chemistry = await Subject.create({ userId, name: 'Chemistry', colorCode: '#3b82f6' });
    const math = await Subject.create({ userId, name: 'Mathematics', colorCode: '#22c55e' });
    console.log('Created 3 subjects.');

    // Create Chapters
    const ch1 = await Chapter.create({
      userId,
      subjectId: physics._id,
      title: 'Thermodynamics & Heat Transfer',
      status: 'Completed',
      priority: 'High',
      totalQuestionsSolved: 45,
      correctQuestions: 38,
      subtopics: [
        { title: 'First Law of Thermodynamics', completed: true },
        { title: 'Carnot Engine', completed: true },
        { title: 'Radiation & Conduction', completed: true }
      ]
    });

    const ch2 = await Chapter.create({
      userId,
      subjectId: physics._id,
      title: 'Rotational Motion',
      status: 'In Progress',
      priority: 'High',
      totalQuestionsSolved: 30,
      correctQuestions: 22,
      subtopics: [
        { title: 'Moment of Inertia', completed: true },
        { title: 'Torque and Angular Momentum', completed: false }
      ]
    });

    const ch3 = await Chapter.create({
      userId,
      subjectId: chemistry._id,
      title: 'Organic Chemistry — Reaction Mechanisms',
      status: 'Completed',
      priority: 'High',
      totalQuestionsSolved: 50,
      correctQuestions: 44,
      subtopics: [
        { title: 'Electrophilic Addition', completed: true },
        { title: 'Nucleophilic Substitution (SN1, SN2)', completed: true }
      ]
    });

    const ch4 = await Chapter.create({
      userId,
      subjectId: math._id,
      title: 'Calculus — Integration & Differential Equations',
      status: 'Revision Required',
      priority: 'High',
      totalQuestionsSolved: 60,
      correctQuestions: 48,
      subtopics: [
        { title: 'Definite Integrals', completed: true },
        { title: 'Differential Equations', completed: false }
      ]
    });

    console.log('Created 4 chapters.');

    // Create Study Logs across past week
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const logDate = new Date(now);
      logDate.setDate(logDate.getDate() - i);
      
      const subject = [physics, chemistry, math][i % 3];
      const chapter = [ch1, ch2, ch3, ch4][i % 4];

      await StudyLog.create({
        userId,
        subjectId: subject._id,
        chapterId: chapter._id,
        date: logDate,
        durationMinutes: 90 + (i * 15),
        questionsAttempted: 20 + i * 2,
        questionsCorrect: 16 + i * 2,
        questionsIncorrect: 4,
        difficulty: i % 2 === 0 ? 'Medium' : 'Hard',
        notes: `Studied ${chapter.title} and completed key practice problems.`
      });
    }
    console.log('Created 7 study logs.');

    // Create Mock Tests
    await MockTest.create({
      userId,
      testName: 'Full Mock Test 1',
      provider: 'National Mock Series',
      date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      totalScore: 300,
      obtainedScore: 210,
      subjectScores: [
        { subjectId: physics._id, score: 70, maxScore: 100 },
        { subjectId: chemistry._id, score: 75, maxScore: 100 },
        { subjectId: math._id, score: 65, maxScore: 100 }
      ]
    });

    await MockTest.create({
      userId,
      testName: 'Full Mock Test 2',
      provider: 'National Mock Series',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      totalScore: 300,
      obtainedScore: 242,
      subjectScores: [
        { subjectId: physics._id, score: 82, maxScore: 100 },
        { subjectId: chemistry._id, score: 85, maxScore: 100 },
        { subjectId: math._id, score: 75, maxScore: 100 }
      ]
    });

    await MockTest.create({
      userId,
      testName: 'Full Mock Test 3',
      provider: 'Grand Test Series',
      date: now,
      totalScore: 300,
      obtainedScore: 268,
      subjectScores: [
        { subjectId: physics._id, score: 90, maxScore: 100 },
        { subjectId: chemistry._id, score: 92, maxScore: 100 },
        { subjectId: math._id, score: 86, maxScore: 100 }
      ]
    });

    console.log('Created 3 mock test records.');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
