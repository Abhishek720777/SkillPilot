const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  roomCode: { type: String, unique: true, required: true, uppercase: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxPlayers: { type: Number, default: 10 },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic' },
  difficulty: { type: String, default: 'mixed' },
  numQuestions: { type: Number, required: true },
  timerSeconds: { type: Number, required: true },
  status: { type: String, enum: ['waiting','ready','active','completed'], default: 'waiting' },
  questions: [mongoose.Schema.Types.Mixed],
}, { timestamps: true });

module.exports = mongoose.model('Battle', battleSchema);
