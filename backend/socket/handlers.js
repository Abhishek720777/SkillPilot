const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const Battle = require('../models/Battle');
const BattleResult = require('../models/BattleResult');
const Message = require('../models/Message');
const User = require('../models/User');

const battleRooms = new Map();

module.exports = function setupSocketHandlers(io) {
  io.use((socket, next) => {
    let token = socket.handshake.auth?.token;
    if (!token && socket.request.headers.cookie) {
      const cookies = socket.request.headers.cookie.split(';').reduce((res, c) => {
        const [key, val] = c.trim().split('=');
        res[key] = val;
        return res;
      }, {});
      token = cookies.token;
    }
    if (!token) return next(new Error('Authentication error'));
    try {
      const d = jwt.verify(token, JWT_SECRET);
      socket.userId = String(d.userId);
      socket.username = d.username;
      next();
    } catch { next(new Error('Invalid token')); }
  });

  io.on('connection', (socket) => {
    // Join personal room for push notifications
    socket.join(`user:${socket.userId}`);

    // ── BATTLE ────────────────────────────────────────────────────────────────

    socket.on('battle:join_room', async ({ battleId }) => {
      const key = String(battleId);
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) return;
        const cid = String(battle.creatorId);
        
        // Add user to participants if they are not the creator and not already in
        // IMPORTANT: Use String() comparison — participants are ObjectIds, socket.userId is a string
        const alreadyIn = battle.participants.some(id => String(id) === socket.userId);
        if (socket.userId !== cid && !alreadyIn) {
          if (battle.participants.length >= (battle.maxPlayers - 1)) {
            return socket.emit('battle:error', { message: 'Room is full' });
          }
          battle.participants.push(socket.userId);
          await battle.save();
        }

        socket.join(`battle:${key}`);

        if (!battleRooms.has(key)) {
          battleRooms.set(key, { answers: {}, startedAt: null, concluding: false });
        }
        const room = battleRooms.get(key);
        if (!room.answers[socket.userId]) {
          room.answers[socket.userId] = { completed: false, score: 0, timeTaken: 0 };
        }

        const joinedUsers = await User.find({ _id: { $in: [battle.creatorId, ...battle.participants] } }).select('username avatarColor').lean();

        // Broadcast entire lobby info
        io.to(`battle:${key}`).emit('battle:lobby_update', {
          users: joinedUsers,
          creatorId: battle.creatorId
        });
      } catch (e) { console.error('battle:join_room error', e.message); }
    });

    socket.on('battle:admin_start', async ({ battleId }) => {
      const key = String(battleId);
      try {
        const battle = await Battle.findById(battleId);
        if (!battle || String(battle.creatorId) !== socket.userId) return;

        await Battle.findByIdAndUpdate(battleId, { status: 'active' });
        const room = battleRooms.get(key);
        if (room) room.startedAt = Date.now();

        const questions = (battle.questions || []).map(q => ({
          id: q.id, question: q.question, options: q.options, difficulty: q.difficulty,
          codeSnippet: q.codeSnippet, isExecutionTask: q.isExecutionTask, testCases: q.testCases
        }));
        io.to(`battle:${key}`).emit('battle:start', {
          questions, timerSeconds: battle.timerSeconds, startedAt: room?.startedAt || Date.now(),
        });
      } catch (e) { console.error('battle:admin_start error', e.message); }
    });

    socket.on('battle:submit', async ({ battleId, answers, timeTaken }) => {
      const key = String(battleId);
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) return;
        const room = battleRooms.get(key);
        if (!room) return;

        // Idempotent — ignore if already completed by this user
        if (room.answers[socket.userId]?.completed) return;

        let score = 0;
        for (const q of battle.questions) {
          const ua = answers[String(q.id)];
          if (ua !== undefined && Number(ua) === q.correctAnswer) score++;
        }

        room.answers[socket.userId] = { completed: true, score, timeTaken: Math.round(timeTaken) };

        await BattleResult.findOneAndUpdate(
          { battleId, userId: socket.userId },
          { score, timeTaken: Math.round(timeTaken) },
          { upsert: true, new: true }
        );

        // Inform lobby someone finished to show ranking
        const u = await User.findById(socket.userId).select('username').lean();
        io.to(`battle:${key}`).emit('battle:player_finished', { 
           userId: socket.userId, username: u?.username, score, timeTaken: Math.round(timeTaken) 
        });
        
        socket.emit('battle:submitted', { score, total: battle.questions.length });

        // Re-fetch battle to get fresh participant count
        const freshBattle = await Battle.findById(battleId);
        const allUsers = Object.keys(room.answers);
        // Use deduplicated String IDs from DB participants to avoid ObjectId inflation bug
        const uniqueParticipants = [...new Set((freshBattle?.participants || []).map(id => String(id)))];
        const expectedCount = uniqueParticipants.length + 1; // +1 for creator
        const allDone = allUsers.length >= expectedCount && allUsers.every(uid => room.answers[uid]?.completed);
        
        console.log(`[Battle ${key}] submit: allUsers=${allUsers.length} expected=${expectedCount} uniqueParticipants=${uniqueParticipants.length} allDone=${allDone} concluding=${room.concluding}`);
        
        if (allDone && !room.concluding) {
          room.concluding = true;
          await concludeBattle(io, battleId, key, freshBattle, room);
        }
      } catch (e) { console.error('battle:submit error', e.message); }
    });

    socket.on('battle:timeout', async ({ battleId }) => {
      const key = String(battleId);
      try {
        const room = battleRooms.get(key);
        if (!room) return;
        if (room.answers[socket.userId]?.completed) return;

        const battle = await Battle.findById(battleId);
        const timed = battle?.timerSeconds || 300;

        room.answers[socket.userId] = { completed: true, score: 0, timeTaken: timed };

        await BattleResult.findOneAndUpdate(
          { battleId, userId: socket.userId },
          { score: 0, timeTaken: timed },
          { upsert: true }
        );

        const allUsers = Object.keys(room.answers);
        const uniqueParticipants = [...new Set((battle?.participants || []).map(id => String(id)))];
        const expectedCount = uniqueParticipants.length + 1;
        const allDone = allUsers.length >= expectedCount && allUsers.every(u => room.answers[u]?.completed);
        
        if (allDone && !room.concluding) {
          room.concluding = true;
          if (battle) await concludeBattle(io, battleId, key, battle, room);
        }
      } catch (e) { console.error('battle:timeout error', e.message); }
    });

    // ── CHAT ──────────────────────────────────────────────────────────────────

    socket.on('chat:join', ({ userId }) => {
      const chatRoom = [String(socket.userId), String(userId)].sort().join('-');
      socket.join(`chat:${chatRoom}`);
    });

    socket.on('chat:message', async ({ receiverId, content }) => {
      if (!content?.trim()) return;
      try {
        const msg = await Message.create({
          senderId: socket.userId, receiverId, content: content.trim(),
        });
        const chatRoom = [String(socket.userId), String(receiverId)].sort().join('-');
        io.to(`chat:${chatRoom}`).emit('chat:message', {
          ...msg.toObject(), sender_name: socket.username,
        });
      } catch (e) { console.error('chat:message error', e.message); }
    });

    socket.on('disconnect', () => {
      battleRooms.forEach((room, key) => {
        if (room.answers[socket.userId] !== undefined) {
          socket.to(`battle:${key}`).emit('battle:opponent_disconnected', { userId: socket.userId });
        }
      });
    });
  });
};

async function concludeBattle(io, battleId, key, battle, room) {
  console.log(`[concludeBattle] Starting for battle ${key}, players=${Object.keys(room.answers).length}`);
  try {
    const results = await Promise.all(
      Object.entries(room.answers).map(async ([uid, data]) => {
        const u = await User.findById(uid).select('username avatarColor').lean();
        return {
          userId: uid,
          username: u?.username || 'Unknown',
          avatarColor: u?.avatarColor || '#4F46E5',
          score: data.score,
          timeTaken: data.timeTaken,
          total: battle.questions.length,
        };
      })
    );

    results.sort((a, b) => b.score !== a.score ? b.score - a.score : a.timeTaken - b.timeTaken);
    console.log(`[concludeBattle] results built:`, results.map(r => `${r.username}:${r.score}`));
    await Battle.findByIdAndUpdate(battleId, { status: 'completed' });

    // Multi-player EXP Progression System
    try {
      const numPlayers = results.length;
      const totalQ = battle.questions.length;
      
      const userMap = {};
      for (const res of results) {
         const u = await User.findById(res.userId);
         userMap[res.userId] = u;
      }

      for (let i = 0; i < numPlayers; i++) {
        const myId = results[i].userId;
        const myExp = userMap[myId]?.exp || 0;
        let expChange = 0;
        
        const accuracy = results[i].score / (totalQ || 1);
        const actualRank = i + 1;
        
        // Base participation
        expChange += 5;

        // Rank Factor
        if (numPlayers > 1) {
           if (actualRank === 1) expChange += 30; // Winner Bonus
           else if (actualRank === 2 && numPlayers >= 3) expChange += 15;
           else if (actualRank > numPlayers / 2) expChange -= 10; // Bottom half rank penalty
        }

        // Performance Factor (Override for terrible submissions)
        if (accuracy < 0.4) {
           expChange = -15; // Hard deduct if you bombed the quiz
        } else if (accuracy === 1) {
           expChange += 10; // Perfect score bonus
        }
        
        let newExp = Math.max(0, myExp + expChange);
        let actualChange = newExp - myExp;

        if (userMap[myId]) {
           userMap[myId].exp = newExp;
           userMap[myId].expHistory.push({
              date: new Date().toISOString(),
              exp: newExp,
              source: 'battle'
           });
           await userMap[myId].save();
        }
        results[i].eloChange = actualChange; // rename field if needed, keeping eloChange for frontend compatibility or rename to expChange
        results[i].expChange = actualChange; 
      }
    } catch(err) { console.error("EXP Update Error", err); }

    const isDraw = results.length >= 2 && results[0].score === results[1].score && results[0].timeTaken === results[1].timeTaken;
    
    console.log(`[concludeBattle] Emitting battle:results to room battle:${key}`);
    io.to(`battle:${key}`).emit('battle:results', {
      results,
      winner: isDraw ? null : results[0],
    });
    console.log(`[concludeBattle] Done.`);
    battleRooms.delete(key);
  } catch (e) {
    console.error('concludeBattle OUTER error:', e.message, e.stack?.split('\n').slice(0,4).join(' | '));
  }
}
