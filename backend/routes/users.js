const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

router.get('/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const users = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { profileId: { $regex: q, $options: 'i' } },
          ]
        }
      ]
    }).select('_id username avatarColor profileId').limit(10).lean();
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/social/request', authenticate, async (req, res) => {
  try {
    const { targetId } = req.body;
    if (String(req.userId) === String(targetId)) return res.status(400).json({ error: 'Cannot add yourself.' });
    
    const [me, target] = await Promise.all([
      User.findById(req.userId).select('username avatarColor friends friendRequests'),
      User.findById(targetId)
    ]);
    
    if (!target) return res.status(404).json({ error: 'User not found.' });
    if (target.friends.includes(req.userId) || target.friendRequests.includes(req.userId)) {
      return res.status(400).json({ error: 'Request already sent or already friends.' });
    }
    
    target.friendRequests.push(req.userId);
    await target.save();
    
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${target._id}`).emit('social:request', {
        userId: me._id, username: me.username, avatarColor: me.avatarColor
      });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/social/accept', authenticate, async (req, res) => {
  try {
    const { requesterId } = req.body;
    const [me, requester] = await Promise.all([
      User.findById(req.userId),
      User.findById(requesterId).select('username avatarColor')
    ]);
    
    if (!me || !requester) return res.status(404).json({ error: 'User not found' });
    
    me.friendRequests = me.friendRequests.filter(id => String(id) !== String(requesterId));
    if (!me.friends.includes(requesterId)) me.friends.push(requesterId);
    await me.save();
    
    // Add me to requester's friends too (bidirectional)
    const reqUserDoc = await User.findById(requesterId);
    if (!reqUserDoc.friends.includes(me._id)) {
      reqUserDoc.friends.push(me._id);
      await reqUserDoc.save();
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${requesterId}`).emit('social:accepted', {
        userId: me._id, username: me.username, avatarColor: me.avatarColor
      });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/social/reject', authenticate, async (req, res) => {
  try {
    const { requesterId } = req.body;
    const me = await User.findById(req.userId);
    me.friendRequests = me.friendRequests.filter(id => String(id) !== String(requesterId));
    await me.save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/social/remove', authenticate, async (req, res) => {
  try {
    const { friendId } = req.body;
    const [me, friend] = await Promise.all([
      User.findById(req.userId),
      User.findById(friendId)
    ]);
    
    me.friends = me.friends.filter(id => String(id) !== String(friendId));
    await me.save();
    
    if (friend) {
      friend.friends = friend.friends.filter(id => String(id) !== String(me._id));
      await friend.save();
    }
    
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/social/friends', authenticate, async (req, res) => {
  try {
    const me = await User.findById(req.userId)
      .populate('friends', '_id username avatarColor exp')
      .populate('friendRequests', '_id username avatarColor exp')
      .lean();
    res.json({ friends: me.friends || [], friendRequests: me.friendRequests || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
