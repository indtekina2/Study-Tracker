const express = require('express');
const router = express.Router();
const { getMockTests, createMockTest, deleteMockTest, getMockTestAnalytics } = require('../controllers/mockTestController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/analytics', getMockTestAnalytics);

router.route('/')
  .get(getMockTests)
  .post(createMockTest);

router.route('/:id')
  .delete(deleteMockTest);

module.exports = router;
