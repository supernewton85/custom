const express = require('express');
const router = express.Router();
const WorkLog = require('../models/WorkLog');
const auth = require('../middleware/auth');

// 업무일지 가져오기
router.get('/:date', auth, async (req, res) => {
  try {
    const workLog = await WorkLog.findOne({ date: req.params.date, user: req.user.id });
    res.json(workLog || { log: '' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 업무일지 저장하기
router.post('/', auth, async (req, res) => {
  try {
    let workLog = await WorkLog.findOne({ date: req.body.date, user: req.user.id });
    if (workLog) {
      workLog.log = req.body.log;
      await workLog.save();
    } else {
      workLog = new WorkLog({
        date: req.body.date,
        log: req.body.log,
        user: req.user.id
      });
      await workLog.save();
    }
    res.json(workLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;