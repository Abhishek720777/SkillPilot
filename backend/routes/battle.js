const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const Battle = require('../models/Battle');
const BattleResult = require('../models/BattleResult');
const Question = require('../models/Question');
const Subtopic = require('../models/Subtopic');

router.post('/create', authenticate, async (req, res) => {
  try {
    const { topic_id, subtopic_id, difficulty, num_questions, timer_seconds } = req.body;
    const n = Math.min(Math.max(parseInt(num_questions)||5, 5), 20);
    const timer = Math.min(Math.max(parseInt(timer_seconds)||120, 30), 600);

    let query = { topicId: topic_id };
    if (subtopic_id) query.subtopicId = subtopic_id;
    if (difficulty && difficulty !== 'mixed') query.difficulty = difficulty;

    let questions = await Question.find(query).lean();
    if (!questions.length) questions = await Question.find({ topicId: topic_id }).lean();
    questions = questions.sort(()=>Math.random()-0.5).slice(0, n);
    if (!questions.length) return res.status(400).json({ error: 'No questions found.' });

    const roomCode = Math.random().toString(36).substring(2,8).toUpperCase();
    const battle = await Battle.create({
      roomCode, creatorId: req.userId, topicId: topic_id,
      subtopicId: subtopic_id||null, difficulty: difficulty||'mixed',
      numQuestions: questions.length, timerSeconds: timer,
      questions: questions.map(q => ({ 
        id:q._id, question:q.question, options:q.options, 
        correctAnswer:q.correctAnswer, difficulty:q.difficulty, explanation:q.explanation,
        isExecutionTask: q.isExecutionTask || false, codeSnippet: q.codeSnippet, testCases: q.testCases
      })),
    });

    res.json({ battleId: battle._id, room_code: battle.roomCode, timer_seconds: timer, num_questions: questions.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/join', authenticate, async (req, res) => {
  try {
    const battle = await Battle.findOne({ roomCode: req.body.room_code?.toUpperCase() });
    if (!battle) return res.status(404).json({ error: 'Room not found.' });
    if (battle.status === 'active') return res.status(400).json({ error: 'Battle already started.' });
    if (battle.status === 'completed') return res.status(400).json({ error: 'Battle has ended.' });

    const userId = String(req.userId);
    // Allow creator to "rejoin" (page refresh) — just return the battleId
    if (String(battle.creatorId) === userId) {
      return res.json({ battleId: battle._id, room_code: battle.roomCode });
    }

    // Already in the room? Let them back in (page refresh)
    const alreadyIn = battle.participants.some(p => String(p) === userId);
    if (!alreadyIn) {
      if (battle.participants.length >= battle.maxPlayers) {
        return res.status(400).json({ error: `Room is full (max ${battle.maxPlayers} players).` });
      }
      battle.participants.push(req.userId);
      await battle.save();
    }

    res.json({ battleId: battle._id, room_code: battle.roomCode });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:battleId', authenticate, async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.battleId).lean();
    if (!battle) return res.status(404).json({ error: 'Battle not found.' });

    const User = require('../models/User');
    const creator = await User.findById(battle.creatorId).select('_id username avatarColor').lean();
    const joiner = battle.joinerId ? await User.findById(battle.joinerId).select('_id username avatarColor').lean() : null;
    const topic = await require('../models/Topic').findById(battle.topicId).lean();

    const questions = (battle.questions||[]).map(q => ({ 
      id:q.id, question:q.question, options:q.options, difficulty:q.difficulty, 
      isExecutionTask: q.isExecutionTask, codeSnippet: q.codeSnippet, testCases: q.testCases 
    }));
    res.json({ ...battle, creator, joiner, topic, questions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:battleId/result', authenticate, async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.battleId).lean();
    const User = require('../models/User');
    const results = await BattleResult.find({ battleId: req.params.battleId }).lean();
    const enriched = await Promise.all(results.map(async r => {
      const u = await User.findById(r.userId).select('username avatarColor').lean();
      return { ...r, username: u?.username, avatarColor: u?.avatarColor };
    }));
    res.json({ battle, results: enriched });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
