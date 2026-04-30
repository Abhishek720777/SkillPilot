const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/quizbattle').then(async () => {
   console.log('Connected to DB');
   const db = mongoose.connection.db;
   
   console.log('Dropping Users...');
   await db.collection('users').deleteMany({});
   console.log('Dropping QuizSessions...');
   await db.collection('quizsessions').deleteMany({});
   console.log('Dropping BattleResults...');
   await db.collection('battleresults').deleteMany({});
   console.log('Dropping Messages...');
   await db.collection('messages').deleteMany({});
   console.log('Dropping Battles...');
   await db.collection('battles').deleteMany({});
   
   console.log('Wipe complete.');
   process.exit(0);
}).catch(e => {
   console.error(e);
   process.exit(1);
});
