const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
});

historySchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('UserQuestionHistory', historySchema);
