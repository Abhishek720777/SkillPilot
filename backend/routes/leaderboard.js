const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { cacheResponse } = require('../middleware/cache');
const User = require('../models/User');
const QuizSession = require('../models/QuizSession');
const BattleResult = require('../models/BattleResult');

// Cache the leaderboard results for 30 seconds
router.get('/global', authenticate, cacheResponse(30), async (req, res) => {
  try {
    const { filter } = req.query;
    
    let query = {};
    if (filter === 'friends') {
      const me = await User.findById(req.userId).select('friends').lean();
      if (me) {
         query = { _id: { $in: [...me.friends, req.userId] } };
      }
    }
    
    const users = await User.find(query).select('_id username avatarColor profileId exp').lean();
    const ranked = await Promise.all(users.map(async u => {
      const sessions = await QuizSession.find({ userId: u._id, completedAt:{$exists:true} }).lean();
      const battles = await BattleResult.find({ userId: u._id }).lean();
      const totalScore = sessions.reduce((s,q) => s + q.score, 0);
      const accuracy = sessions.length ? Math.round((sessions.reduce((s,q) => s+q.score/q.total,0)/sessions.length)*100) : 0;
      return { id: u._id, username: u.username, avatarColor: u.avatarColor, profileId: u.profileId, exp: u.exp || 0,
        totalQuizzes: sessions.length, totalBattles: battles.length, accuracy, totalScore,
        isMe: String(u._id) === String(req.userId) };
    }));
    ranked.sort((a,b) => b.exp - a.exp); // properly sorting by exp
    res.json(ranked.map((r,i) => ({ ...r, rank: i+1 })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
