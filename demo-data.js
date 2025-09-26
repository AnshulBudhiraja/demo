const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Group = require('./models/Group');

const createDemoData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-networking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Group.deleteMany({});
    console.log('Cleared existing data');

    // Create demo users
    const demoUsers = [
      {
        email: 'alice@example.com',
        password: 'password123',
        profile: {
          nickname: 'TechAlice',
          falseIdentity: 'AI Enthusiast',
          bio: 'Passionate about artificial intelligence and machine learning. Love connecting with fellow tech enthusiasts!',
          interests: ['Technology', 'AI', 'Machine Learning', 'Startups'],
          lookingFor: ['Collaborators', 'Mentors', 'Networking'],
          qrCode: uuidv4(),
          isVerified: true
        }
      },
      {
        email: 'bob@example.com',
        password: 'password123',
        profile: {
          nickname: 'DesignBob',
          falseIdentity: 'Creative Director',
          bio: 'Graphic designer with 5+ years experience. Always looking for new creative challenges and collaborations.',
          interests: ['Design', 'Art', 'Photography', 'Marketing'],
          lookingFor: ['Clients', 'Collaborators', 'Creative Projects'],
          qrCode: uuidv4(),
          isVerified: true
        }
      },
      {
        email: 'carol@example.com',
        password: 'password123',
        profile: {
          nickname: 'BusinessCarol',
          falseIdentity: 'Entrepreneur',
          bio: 'Serial entrepreneur with a passion for sustainable business practices. Looking to connect with like-minded individuals.',
          interests: ['Business', 'Sustainability', 'Finance', 'Networking'],
          lookingFor: ['Investors', 'Business Partners', 'Mentors'],
          qrCode: uuidv4(),
          isVerified: true
        }
      },
      {
        email: 'david@example.com',
        password: 'password123',
        profile: {
          nickname: 'MusicDave',
          falseIdentity: 'Sound Engineer',
          bio: 'Professional sound engineer and music producer. Love working on diverse projects and meeting new artists.',
          interests: ['Music', 'Technology', 'Art', 'Innovation'],
          lookingFor: ['Artists', 'Collaborators', 'Job Opportunities'],
          qrCode: uuidv4(),
          isVerified: true
        }
      },
      {
        email: 'eve@example.com',
        password: 'password123',
        profile: {
          nickname: 'FitnessEve',
          falseIdentity: 'Wellness Coach',
          bio: 'Certified fitness trainer and wellness coach. Passionate about helping people achieve their health goals.',
          interests: ['Health', 'Fitness', 'Education', 'Travel'],
          lookingFor: ['Clients', 'Friends', 'Learning'],
          qrCode: uuidv4(),
          isVerified: true
        }
      }
    ];

    // Create users
    const users = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.profile.nickname}`);
    }

    // Create demo groups
    const demoGroups = [
      {
        name: 'Tech Innovators',
        description: 'A group for technology enthusiasts and innovators to share ideas and collaborate on projects.',
        interests: ['Technology', 'AI', 'Innovation'],
        members: [
          { user: users[0]._id, role: 'admin' },
          { user: users[1]._id, role: 'member' },
          { user: users[3]._id, role: 'member' }
        ],
        messages: [
          {
            user: users[0]._id,
            nickname: users[0].profile.nickname,
            message: 'Welcome everyone! Excited to connect with fellow tech enthusiasts.',
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            user: users[1]._id,
            nickname: users[1].profile.nickname,
            message: 'Thanks for creating this group! Looking forward to some great discussions.',
            timestamp: new Date(Date.now() - 1800000)
          }
        ]
      },
      {
        name: 'Creative Minds',
        description: 'A space for artists, designers, and creative professionals to share their work and collaborate.',
        interests: ['Design', 'Art', 'Photography'],
        members: [
          { user: users[1]._id, role: 'admin' },
          { user: users[3]._id, role: 'member' }
        ],
        messages: [
          {
            user: users[1]._id,
            nickname: users[1].profile.nickname,
            message: 'Hello creative minds! Share your latest projects here.',
            timestamp: new Date(Date.now() - 7200000)
          }
        ]
      },
      {
        name: 'Business Network',
        description: 'Connect with entrepreneurs, investors, and business professionals for networking and collaboration.',
        interests: ['Business', 'Finance', 'Networking'],
        members: [
          { user: users[2]._id, role: 'admin' },
          { user: users[0]._id, role: 'member' }
        ],
        messages: [
          {
            user: users[2]._id,
            nickname: users[2].profile.nickname,
            message: 'Welcome to our business network! Let\'s help each other grow.',
            timestamp: new Date(Date.now() - 5400000)
          }
        ]
      }
    ];

    // Create groups
    for (const groupData of demoGroups) {
      const group = new Group(groupData);
      await group.save();
      console.log(`Created group: ${group.name}`);
    }

    // Mark some users as checked in
    users[0].attendance.checkedIn = true;
    users[0].attendance.checkInTime = new Date(Date.now() - 7200000);
    await users[0].save();

    users[1].attendance.checkedIn = true;
    users[1].attendance.checkInTime = new Date(Date.now() - 5400000);
    await users[1].save();

    users[2].attendance.checkedIn = true;
    users[2].attendance.checkInTime = new Date(Date.now() - 3600000);
    await users[2].save();

    console.log('\n✅ Demo data created successfully!');
    console.log('\nDemo accounts:');
    console.log('Email: alice@example.com, Password: password123');
    console.log('Email: bob@example.com, Password: password123');
    console.log('Email: carol@example.com, Password: password123');
    console.log('Email: david@example.com, Password: password123');
    console.log('Email: eve@example.com, Password: password123');
    console.log('\nSome users are already checked in and have joined groups.');

  } catch (error) {
    console.error('Error creating demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createDemoData();