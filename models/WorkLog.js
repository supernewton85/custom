const mongoose = require('mongoose');

const WorkLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  log: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('WorkLog', WorkLogSchema);