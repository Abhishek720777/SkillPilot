const request = require('supertest');
const express = require('express');
const executeRoutes = require('../routes/execute');
const child_process = require('child_process');
const fs = require('fs/promises');

// Mock child_process.exec
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  access: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn()
}));

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.userId = 'test_user_id';
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api/execute', executeRoutes);

describe('Execute API Unit Tests (Mocked Docker)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully run JavaScript code', async () => {
    // Mock successful docker execution
    child_process.exec.mockImplementation((cmd, options, callback) => {
      callback(null, { stdout: 'Hello World\n----TEST_RESULT----\n"Hello World"', stderr: '' });
    });

    const res = await request(app)
      .post('/api/execute/run')
      .send({
        language: 'javascript',
        code: 'console.log("Hello World");',
        testInput: '"Hello World"'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stdout).toContain('Hello World');
    expect(child_process.exec).toHaveBeenCalledWith(
      expect.stringContaining('docker run --rm --network none --memory 256m -v'),
      expect.any(Object),
      expect.any(Function)
    );
  });

  it('should handle syntax errors in Python', async () => {
    // Mock syntax error (exec returns error)
    child_process.exec.mockImplementation((cmd, options, callback) => {
      const error = new Error('Command failed');
      error.stderr = '  File "<source>.py", line 1\n    print("Hello" \n                  ^\nSyntaxError: unexpected EOF while parsing';
      error.stdout = '';
      callback(error, { stdout: '', stderr: error.stderr });
    });

    const res = await request(app)
      .post('/api/execute/run')
      .send({
        language: 'python',
        code: 'print("Hello" '
      });

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Line 1');
    expect(res.body.error).toContain('SyntaxError');
  });

  it('should handle timeout/infinite loops', async () => {
    // Mock timeout (exec returns error with message containing "timeout")
    child_process.exec.mockImplementation((cmd, options, callback) => {
      const error = new Error('ETIMEDOUT');
      error.killed = true;
      callback(error, { stdout: '', stderr: '' });
    });

    const res = await request(app)
      .post('/api/execute/run')
      .send({
        language: 'javascript',
        code: 'while(true);'
      });

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  it('should reject unsupported languages', async () => {
    const res = await request(app)
      .post('/api/execute/run')
      .send({
        language: 'c++',
        code: 'main(){}'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Unsupported language');
  });

  it('should reformat Java error messages correctly', async () => {
    child_process.exec.mockImplementation((cmd, options, callback) => {
      callback(null, { 
        stdout: '<source>.java:5: error: cannot find symbol\n  symbol: class Map', 
        stderr: '' 
      });
    });

    const res = await request(app)
      .post('/api/execute/run')
      .send({
        language: 'java',
        code: 'Map m = new HashMap();'
      });

    expect(res.body.success).toBe(true);
    expect(res.body.stdout).toContain('Line 5 — cannot find symbol');
  });
});
