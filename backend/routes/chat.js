const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

router.get('/conversations', authenticate, async (req, res) => {
  try {
    const msgs = await Message.find({ $or:[{senderId:req.userId},{receiverId:req.userId}] }).sort({createdAt:-1}).lean();
    const seen = new Set(); const convos = [];
    for (const m of msgs) {
      const otherId = String(m.senderId)===String(req.userId) ? String(m.receiverId) : String(m.senderId);
      if (seen.has(otherId)) continue;
      seen.add(otherId);
      const user = await User.findById(otherId).select('username avatarColor').lean();
      const unread = await Message.countDocuments({ senderId:otherId, receiverId:req.userId, readAt:null });
      convos.push({ user, lastMessage: m, unread });
    }
    res.json(convos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:userId', authenticate, async (req, res) => {
  try {
    const otherId = req.params.userId;
    const messages = await Message.find({ $or:[{senderId:req.userId,receiverId:otherId},{senderId:otherId,receiverId:req.userId}] }).sort({createdAt:1}).lean();
    await Message.updateMany({ senderId:otherId, receiverId:req.userId, readAt:null }, { readAt:new Date() });
    const otherUser = await User.findById(otherId).select('username avatarColor').lean();
    res.json({ messages, otherUser });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:userId', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Empty message.' });
    const msg = await Message.create({ senderId: req.userId, receiverId: req.params.userId, content: content.trim() });
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
