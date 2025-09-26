const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Create a new group
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, description, interests } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const group = new Group({
      name,
      description,
      interests: interests || [],
      members: [{
        user: req.userId,
        role: 'admin'
      }]
    });

    await group.save();
    await group.populate('members.user', 'profile.nickname profile.falseIdentity');

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find({ isActive: true })
      .populate('members.user', 'profile.nickname profile.falseIdentity')
      .populate('messages.user', 'profile.nickname profile.falseIdentity')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's groups
router.get('/my-groups', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.userId,
      isActive: true
    })
      .populate('members.user', 'profile.nickname profile.falseIdentity')
      .populate('messages.user', 'profile.nickname profile.falseIdentity')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a group
router.post('/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.userId
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    group.members.push({
      user: req.userId,
      role: 'member'
    });

    await group.save();
    await group.populate('members.user', 'profile.nickname profile.falseIdentity');

    res.json(group);
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave a group
router.post('/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.members = group.members.filter(member => 
      member.user.toString() !== req.userId
    );

    await group.save();
    await group.populate('members.user', 'profile.nickname profile.falseIdentity');

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group details
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members.user', 'profile.nickname profile.falseIdentity')
      .populate('messages.user', 'profile.nickname profile.falseIdentity');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to group
router.post('/:groupId/message', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const user = await User.findById(req.userId);
    
    group.messages.push({
      user: req.userId,
      nickname: user.profile.nickname,
      message
    });

    await group.save();

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auto-create groups based on common interests
router.post('/auto-create', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userInterests = user.profile.interests;
    if (!userInterests || userInterests.length === 0) {
      return res.status(400).json({ message: 'No interests found for user' });
    }

    // Find users with common interests
    const usersWithCommonInterests = await User.find({
      _id: { $ne: req.userId },
      'profile.interests': { $in: userInterests },
      'profile.isVerified': true
    });

    // Group users by common interests
    const interestGroups = {};
    usersWithCommonInterests.forEach(otherUser => {
      const commonInterests = otherUser.profile.interests.filter(interest => 
        userInterests.includes(interest)
      );
      
      commonInterests.forEach(interest => {
        if (!interestGroups[interest]) {
          interestGroups[interest] = [];
        }
        interestGroups[interest].push(otherUser);
      });
    });

    // Create groups for interests with 2+ people
    const createdGroups = [];
    for (const [interest, users] of Object.entries(interestGroups)) {
      if (users.length >= 2) {
        // Check if group already exists
        const existingGroup = await Group.findOne({
          interests: interest,
          isActive: true
        });

        if (!existingGroup) {
          const group = new Group({
            name: `${interest} Enthusiasts`,
            description: `A group for people interested in ${interest}`,
            interests: [interest],
            members: [
              { user: req.userId, role: 'admin' },
              ...users.slice(0, 4).map(user => ({ user: user._id, role: 'member' }))
            ]
          });

          await group.save();
          await group.populate('members.user', 'profile.nickname profile.falseIdentity');
          createdGroups.push(group);
        }
      }
    }

    res.json({ 
      message: 'Groups created successfully', 
      groups: createdGroups 
    });
  } catch (error) {
    console.error('Error auto-creating groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;