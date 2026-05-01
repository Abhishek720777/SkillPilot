const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required.' });
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) return res.status(409).json({ error: 'Username or email already taken.' });
    const passwordHash = await bcrypt.hash(password, 10);
    const colors = ['#4F46E5','#7C3AED','#0891B2','#059669','#D97706','#DC2626'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];
    const user = await User.create({ username, email, passwordHash, avatarColor });
    const token = jwt.sign({ userId: user._id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user._id, profileId: user.profileId, username, email, avatarColor, exp: user.exp || 0 } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user._id, profileId: user.profileId, username: user.username, email: user.email, avatarColor: user.avatarColor, exp: user.exp || 0 } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abhishekpoojary720@gmail.com',
    pass: 'nwpm gbqi pwjr zzrt'
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(code, 10);

    // Save to user with 15 minute expiry
    user.resetCode = hashedCode;
    user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // Send email
    await transporter.sendMail({
      from: '"QuizBattle" <abhishekpoojary720@gmail.com>',
      to: user.email,
      subject: 'Password Reset Code - QuizBattle',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
          <h2 style="color: #4F46E5;">Password Reset</h2>
          <p>You requested a password reset for your QuizBattle account.</p>
          <p>Your 6-digit verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111; padding: 20px; background: #f4f4f5; border-radius: 8px; text-align: center; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Verification code sent to email.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
});

router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required.' });

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetCode: { $exists: true },
      resetCodeExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired code.' });

    const isValid = await bcrypt.compare(code, user.resetCode);
    if (!isValid) return res.status(400).json({ error: 'Invalid code.' });

    res.json({ success: true, message: 'Code verified successfully.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'All fields required.' });

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetCode: { $exists: true },
      resetCodeExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired code.' });

    const isValid = await bcrypt.compare(code, user.resetCode);
    if (!isValid) return res.status(400).json({ error: 'Invalid code.' });

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/me', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user._id, profileId: user.profileId, username: user.username, email: user.email, avatarColor: user.avatarColor, exp: user.exp || 0 } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, sub } = payload;
    
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      const colors = ['#4F46E5','#7C3AED','#0891B2','#059669','#D97706','#DC2626'];
      const avatarColor = colors[Math.floor(Math.random() * colors.length)];
      const baseUsername = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
      let username = baseUsername;
      let count = 1;
      while (await User.findOne({ username })) {
        username = baseUsername + count;
        count++;
      }
      user = await User.create({
        username,
        email: email.toLowerCase(),
        googleId: sub,
        avatarColor
      });
    } else if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }
    
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user._id, profileId: user.profileId, username: user.username, email: user.email, avatarColor: user.avatarColor, exp: user.exp || 0 } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

module.exports = router;
