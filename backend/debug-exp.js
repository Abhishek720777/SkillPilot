const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/quizbattle').then(async () => {
  const User = require('./models/User');
  const QuizSession = require('./models/QuizSession');
  
  // Test 1: Can we update user exp?
  const users = await User.find();
  console.log('\n=== USER SCHEMA TEST ===');
  if (users.length > 0) {
    const u = users[0];
    console.log('  Before:', { exp: u.exp, expHistoryLen: u.expHistory?.length });
    try {
      u.exp = (u.exp || 0) + 5;
      u.expHistory.push({ date: new Date().toISOString(), exp: u.exp, type: 'test' });
      await u.save();
      const fresh = await User.findById(u._id).lean();
      console.log('  After save:', { exp: fresh.exp, expHistoryLen: fresh.expHistory?.length });
    } catch(e) {
      console.error('  SAVE FAILED:', e.message, e.stack?.split('\n').slice(0,3).join('\n'));
    }
  }

  // Test 2: Check sessions  
  const sessions = await QuizSession.find({ completedAt: { $exists: true } }).lean();
  console.log('\n=== SESSIONS ===', sessions.length, 'completed');
  if (sessions.length > 0) {
    const s = sessions[0];
    console.log('  completedAt type:', typeof s.completedAt, '| value:', s.completedAt);
    console.log('  score:', s.score, '/ total:', s.total);
  }

  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
