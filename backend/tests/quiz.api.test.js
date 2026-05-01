const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Topic = require('../models/Topic');
const Subtopic = require('../models/Subtopic');
const Question = require('../models/Question');
const UserQuestionHistory = require('../models/UserQuestionHistory');

let mongoServer;
const app = express();
app.use(express.json());

// Mock auth middleware BEFORE requiring routes
const FIXED_USER_ID = new mongoose.Types.ObjectId();
jest.mock('../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.userId = FIXED_USER_ID;
    next();
  }
}));

const quizRoutes = require('../routes/quiz');
app.use('/api/quiz', quizRoutes);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Quiz API Adaptive Logic Tests', () => {
  
  it('should filter out already seen questions when starting a session', async () => {
    const topic = await Topic.create({ name: 'Java', slug: 'java' });
    const subtopic = await Subtopic.create({ name: 'OOP', slug: 'oop', topicId: topic._id });

    const q1 = await Question.create({ 
      question: 'Q1', options: ['A','B'], correctAnswer: 0, difficulty: 'easy', 
      topicId: topic._id, subtopicId: subtopic._id 
    });
    const q2 = await Question.create({ 
      question: 'Q2', options: ['A','B'], correctAnswer: 0, difficulty: 'easy', 
      topicId: topic._id, subtopicId: subtopic._id 
    });
    const q3 = await Question.create({ 
      question: 'Q3', options: ['A','B'], correctAnswer: 0, difficulty: 'easy', 
      topicId: topic._id, subtopicId: subtopic._id 
    });

    await UserQuestionHistory.create({ userId: FIXED_USER_ID, questionId: q1._id });
    await UserQuestionHistory.create({ userId: FIXED_USER_ID, questionId: q2._id });

    const res = await request(app)
      .post('/api/quiz/session/start')
      .send({ topic_id: topic._id, subtopic_id: subtopic._id, num_questions: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.questions.length).toBe(1);
    expect(String(res.body.questions[0].id)).toBe(String(q3._id));
  });

  it('should fall back to seen questions if not enough new questions are available', async () => {
    const topic = await Topic.create({ name: 'Java', slug: 'java' });
    const subtopic = await Subtopic.create({ name: 'OOP', slug: 'oop-fallback', topicId: topic._id });
    const q1 = await Question.create({ 
      question: 'Q1', options: ['A','B'], correctAnswer: 0, difficulty: 'easy', 
      topicId: topic._id, subtopicId: subtopic._id 
    });

    await UserQuestionHistory.create({ userId: FIXED_USER_ID, questionId: q1._id });

    const res = await request(app)
      .post('/api/quiz/session/start')
      .send({ topic_id: topic._id, subtopic_id: subtopic._id, num_questions: 1 });

    expect(res.body.questions.length).toBe(1);
    expect(String(res.body.questions[0].id)).toBe(String(q1._id));
  });
});
