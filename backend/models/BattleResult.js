const mongoose = require('mongoose');

const battleResultSchema = new mongoose.Schema({
  battleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Battle', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
}, { timestamps: true });

battleResultSchema.index({ battleId: 1, userId: 1 }, { unique: true });
battleResultSchema.index({ userId: 1 });

module.exports = mongoose.model('BattleResult', battleResultSchema);
