const express = require('express');
const router = express.Router();
const { getChapters, createChapter, updateChapter, deleteChapter } = require('../controllers/chapterController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getChapters)
  .post(createChapter);

router.route('/:id')
  .put(updateChapter)
  .delete(deleteChapter);

module.exports = router;
