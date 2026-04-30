const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findById(req.userId);
    const valid = await bcrypt.compare(current_password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
    user.passwordHash = await bcrypt.hash(new_password, 10);
    await user.save();
    res.json({ message: 'Password updated.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/', authenticate, async (req, res) => {
  try {
    const uid = req.userId;
    await require('../models/UserQuestionHistory').deleteMany({ userId: uid });
    await require('../models/QuizSession').deleteMany({ userId: uid });
    await require('../models/BattleResult').deleteMany({ userId: uid });
    await require('../models/Message').deleteMany({ $or:[{ senderId:uid },{ receiverId:uid }] });
    await User.findByIdAndDelete(uid);
    res.json({ message: 'Account deleted.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
