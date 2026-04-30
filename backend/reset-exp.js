const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/quizbattle').then(async () => {
  const db = mongoose.connection.db;
  
  // Wipe corrupted battles and results (they have wrong participant counts)
  const r1 = await db.collection('battles').deleteMany({});
  const r2 = await db.collection('battleresults').deleteMany({});
  console.log(`Deleted ${r1.deletedCount} battles, ${r2.deletedCount} battle results`);
  
  // Reset EXP so dashboard stays clean  
  const User = require('./models/User');
  await User.updateMany({}, { $set: { exp: 0, expHistory: [] } });
  console.log('EXP reset done');
  
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
