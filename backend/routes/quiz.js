const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { cacheResponse } = require('../middleware/cache');
const { calculateExp } = require('../utils/expCalculator');
const Topic = require('../models/Topic');
const Subtopic = require('../models/Subtopic');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const UserQuestionHistory = require('../models/UserQuestionHistory');
const BattleResult = require('../models/BattleResult');
const User = require('../models/User');

// Cache topics map for 5 minutes (300s) as it changes rarely
router.get('/topics', authenticate, cacheResponse(300), async (req, res) => {
  try {
    const topics = await Topic.find().lean();
    const subtopics = await Subtopic.find().lean();
    res.json(topics.map(t => ({ ...t, subtopics: subtopics.filter(s => String(s.topicId) === String(t._id)) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/session/start', authenticate, async (req, res) => {
  try {
    const { topic_id, subtopic_id, num_questions } = req.body;
    const n = Math.min(Math.max(parseInt(num_questions) || 5, 5), 20);

    const seenHistory = await UserQuestionHistory.find({ userId: req.userId }).lean();
    const seenIds = seenHistory.map(h => h.questionId);

    let questions = await Question.find({ subtopicId: subtopic_id, _id: { $nin: seenIds } }).lean();
    if (questions.length < n) {
      questions = await Question.find({ subtopicId: subtopic_id }).lean();
    }
    questions = questions.sort(() => Math.random() - 0.5).slice(0, n);
    if (!questions.length) return res.status(404).json({ error: 'No questions found for this subtopic.' });

    const session = await QuizSession.create({
      userId: req.userId, topicId: topic_id, subtopicId: subtopic_id,
      numQuestions: n, total: questions.length,
      questionIds: questions.map(q => q._id),
    });

      res.json({
      sessionId: session._id,
      questions: questions.map(q => ({ 
        id: q._id, question: q.question, options: q.options, difficulty: q.difficulty,
        isExecutionTask: q.isExecutionTask || false, codeSnippet: q.codeSnippet, testCases: q.testCases
      })),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/session/:sessionId/submit', authenticate, async (req, res) => {
  try {
    const { answers, time_taken } = req.body;
    const session = await QuizSession.findOne({ _id: req.params.sessionId, userId: req.userId });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.completedAt) return res.status(400).json({ error: 'Already submitted.' });

    const questions = await Question.find({ _id: { $in: session.questionIds } }).lean();
    let score = 0;
    const results = [];

    for (const q of questions) {
      const userAnswer = answers[String(q._id)];
      const isCorrect = userAnswer !== undefined && userAnswer !== null && Number(userAnswer) === q.correctAnswer;
      if (isCorrect) score++;
      results.push({
        questionId: q._id, question: q.question, options: q.options,
        userAnswer: userAnswer !== undefined ? Number(userAnswer) : null,
        correctAnswer: q.correctAnswer, isCorrect, explanation: q.explanation,
      });
    }

    session.score = score;
    session.timeTaken = time_taken || 0;
    session.results = results;
    session.completedAt = new Date();
    await session.save();

    // Track history
    await Promise.all(questions.map(q =>
      UserQuestionHistory.updateOne({ userId: req.userId, questionId: q._id }, {}, { upsert: true })
    ));

    // Solo Practice EXP Distribution (Zero Floor)
    const expChange = calculateExp(score, questions.length);
    const accuracy = score / questions.length;

    const user = await User.findById(req.userId);
    if (user) {
       const newExp = Math.max(0, (user.exp || 0) + expChange);
       const actualChange = newExp - (user.exp || 0);
       user.exp = newExp;
       user.expHistory.push({
          date: new Date().toISOString(),
          exp: newExp,
          source: 'practice'
       });
       await user.save();
    }

    res.json({ score, total: questions.length, results, expChange: accuracy < 0.5 ? -10 : expChange });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/session/:sessionId/result', authenticate, async (req, res) => {
  try {
    const session = await QuizSession.findOne({ _id: req.params.sessionId, userId: req.userId })
      .populate('topicId', 'name').populate('subtopicId', 'name').lean();
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ ...session, topic: session.topicId, subtopic: session.subtopicId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).lean();
    const sessions = await QuizSession.find({ userId, completedAt: { $exists: true } })
      .populate('topicId', 'name').populate('subtopicId', 'name').lean();
    const battleResults = await BattleResult.find({ userId }).lean();

    const totalQuizzes = sessions.length;
    const totalBattles = battleResults.length;

    // Battle wins
    const { Battle } = require('../models/Battle') || require('../models/Battle');
    let battleWins = 0;
    for (const br of battleResults) {
      const allResults = await BattleResult.find({ battleId: br.battleId }).lean();
      if (allResults.length < 2) continue;
      const sorted = allResults.sort((a,b) => b.score!==a.score ? b.score-a.score : a.timeTaken-b.timeTaken);
      if (String(sorted[0].userId) === String(userId) &&
          !(sorted[0].score === sorted[1].score && sorted[0].timeTaken === sorted[1].timeTaken)) {
        battleWins++;
      }
    }

    // Topic & Subtopic performance in a single pass
    const topicMap = {};
    const subtopicMap = {};
    const dateMap = {};

    for (let i = sessions.length - 1; i >= 0; i--) {
      const s = sessions[i];
      const tId = String(s.topicId?._id || s.topicId);
      const stId = String(s.subtopicId?._id || s.subtopicId);
      const ratio = s.score / (s.total || 1);

      // Topic
      if (!topicMap[tId]) topicMap[tId] = { name: s.topicId?.name || '', totalRatio: 0, count: 0 };
      topicMap[tId].totalRatio += ratio;
      topicMap[tId].count++;

      // Subtopic
      if (!subtopicMap[stId]) subtopicMap[stId] = { name: s.subtopicId?.name || '', tName: s.topicId?.name || '', totalRatio: 0, count: 0 };
      subtopicMap[stId].totalRatio += ratio;
      subtopicMap[stId].count++;

      // Progress (last 14 days)
      const d = s.completedAt?.toISOString?.()?.slice(0, 10);
      if (d) {
        if (!dateMap[d]) dateMap[d] = { totalRatio: 0, count: 0 };
        dateMap[d].totalRatio += ratio;
        dateMap[d].count++;
      }
    }

    const topicPerformance = Object.values(topicMap).map(t => ({
      topic: t.name, percentage: Math.round((t.totalRatio / t.count) * 100), count: t.count
    }));

    const weakAreas = Object.values(subtopicMap)
      .map(s => ({ subtopic: s.name, topic: s.tName, percentage: Math.round((s.totalRatio / s.count) * 100) }))
      .filter(s => s.percentage < 60)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5);

    const recentActivity = sessions.slice(0, 5).map(s => ({
      id: s._id, score: s.score, total: s.total, timeTaken: s.timeTaken,
      completedAt: s.completedAt, topicName: s.topicId?.name, subtopicName: s.subtopicId?.name,
    }));

    const progressData = Object.entries(dateMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, d]) => ({ date, avg_acc: d.totalRatio / d.count }));

    res.json({ totalQuizzes, totalBattles, battleWins, battleLosses: Math.max(0, totalBattles-battleWins),
       winRate: totalBattles ? Math.round((battleWins / totalBattles) * 100) : 0, 
       topicPerformance, weakAreas, recentActivity, progressData, expHistory: user?.expHistory || [] });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

// Require Battle after models are loaded
require('../models/Battle');

module.exports = router;
