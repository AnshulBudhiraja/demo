const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
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

// Check in using QR code
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    // Find user by QR code
    const user = await User.findOne({ 'profile.qrCode': qrCode });
    if (!user) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    // Check if already checked in
    if (user.attendance.checkedIn) {
      return res.status(400).json({ 
        message: 'Already checked in',
        checkInTime: user.attendance.checkInTime
      });
    }

    // Update attendance
    user.attendance.checkedIn = true;
    user.attendance.checkInTime = new Date();
    await user.save();

    res.json({
      message: 'Check-in successful',
      user: {
        nickname: user.profile.nickname,
        falseIdentity: user.profile.falseIdentity,
        checkInTime: user.attendance.checkInTime
      }
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      checkedIn: user.attendance.checkedIn,
      checkInTime: user.attendance.checkInTime
    });
  } catch (error) {
    console.error('Error fetching attendance status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all checked-in attendees (for organizers)
router.get('/attendees', authenticateToken, async (req, res) => {
  try {
    const attendees = await User.find({ 
      'attendance.checkedIn': true 
    }).select('profile.nickname profile.falseIdentity attendance.checkInTime');

    res.json(attendees);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify attendee by QR code (for other attendees)
router.post('/verify-attendee', authenticateToken, async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    const user = await User.findOne({ 'profile.qrCode': qrCode });
    if (!user) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    // Return only public information
    res.json({
      nickname: user.profile.nickname,
      falseIdentity: user.profile.falseIdentity,
      bio: user.profile.bio,
      interests: user.profile.interests,
      isVerified: user.profile.isVerified,
      checkedIn: user.attendance.checkedIn
    });
  } catch (error) {
    console.error('Error verifying attendee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;