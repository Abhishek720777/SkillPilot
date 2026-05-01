const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('../routes/auth');
const User = require('../models/User');

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Setup the fake in-memory DB before tests run
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Tear down the DB connection after tests complete
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear DB state between individual tests to prevent pollution
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Auth API Integration Tests', () => {
  
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return a token in cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testdev',
          email: 'testdev@test.com',
          password: 'securePassword123'
        });

      // Verify status code
      expect(res.statusCode).toBe(200);
      
      // Verify cookie
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('token=');
      
      // Verify response body shape
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('username', 'testdev');
      expect(res.body.user).toHaveProperty('email', 'testdev@test.com');
      
      // Crucial security test: NEVER send the password hash back
      expect(res.body.user).not.toHaveProperty('passwordHash');

      // Verify db persistence
      const savedUser = await User.findOne({ username: 'testdev' });
      expect(savedUser).toBeTruthy();
    });

    it('should fail with status 409 if the email is already in use', async () => {
      // 1. Seed database with a user
      await request(app).post('/api/auth/register').send({
        username: 'existing',
        email: 'taken@test.com',
        password: '123'
      });

      // 2. Try to register same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'taken@test.com',
          password: '123'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in successfully with valid credentials', async () => {
      // 1. Seed
      await request(app).post('/api/auth/register').send({
        username: 'login_hero',
        email: 'hero@test.com',
        password: 'mypassword'
      });

      // 2. Login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'hero@test.com',
          password: 'mypassword'
        });

      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie'][0]).toContain('token=');
      expect(res.body.user.username).toBe('login_hero');
    });

    it('should reject login with a 401 if password is wrong', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'login_hero',
        email: 'hero@test.com',
        password: 'mypassword'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'hero@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials.');
    });
  });

});
