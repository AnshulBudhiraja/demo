const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

// Get all profiles (for discovery)
router.get('/discover', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.userId },
      'profile.isVerified': true 
    }).select('profile.nickname profile.falseIdentity profile.bio profile.interests profile.lookingFor');

    res.json(users);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { nickname, falseIdentity, bio, interests, lookingFor } = req.body;
    
    const updateData = {};
    if (nickname) updateData['profile.nickname'] = nickname;
    if (falseIdentity) updateData['profile.falseIdentity'] = falseIdentity;
    if (bio) updateData['profile.bio'] = bio;
    if (interests) updateData['profile.interests'] = interests;
    if (lookingFor) updateData['profile.lookingFor'] = lookingFor;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify QR code
router.post('/verify-qr', authenticateToken, async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    const user = await User.findOne({ 'profile.qrCode': qrCode });
    if (!user) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    // Return only public profile information
    res.json({
      nickname: user.profile.nickname,
      falseIdentity: user.profile.falseIdentity,
      bio: user.profile.bio,
      interests: user.profile.interests,
      isVerified: user.profile.isVerified
    });
  } catch (error) {
    console.error('Error verifying QR code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark profile as verified
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { 'profile.isVerified': true } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile verified successfully', user });
  } catch (error) {
    console.error('Error verifying profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;