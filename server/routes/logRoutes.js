const express = require('express');
const router = express.Router();
const { getLogs, createLog, getLogStats } = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getLogStats);

router.route('/')
  .get(getLogs)
  .post(createLog);

module.exports = router;
