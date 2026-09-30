const Chapter = require('../models/Chapter');

exports.getChapters = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    const subjectId = req.query.subjectId || req.query.subject;
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    const chapters = await Chapter.find(filter).populate('subjectId', 'name');
    res.status(200).json({ success: true, data: chapters });
  } catch (error) {
    next(error);
  }
};

exports.createChapter = async (req, res, next) => {
  try {
    const subjectId = req.body.subjectId || req.body.subject;
    const subtopics = req.body.subtopics?.map(st => ({
      title: st.title,
      completed: st.completed ?? st.isCompleted ?? false
    }));

    const chapter = await Chapter.create({
      ...req.body,
      subjectId,
      ...(subtopics ? { subtopics } : {}),
      userId: req.user._id
    });
    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

exports.updateChapter = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.body.subject || req.body.subjectId) {
      updateData.subjectId = req.body.subjectId || req.body.subject;
    }
    if (req.body.subtopics) {
      updateData.subtopics = req.body.subtopics.map(st => ({
        title: st.title,
        completed: st.completed ?? st.isCompleted ?? false
      }));
    }

    const chapter = await Chapter.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }
    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

exports.deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
