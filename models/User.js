const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    nickname: {
      type: String,
      required: true,
      maxlength: 50
    },
    falseIdentity: {
      type: String,
      maxlength: 100
    },
    bio: {
      type: String,
      maxlength: 500
    },
    interests: [{
      type: String,
      maxlength: 50
    }],
    lookingFor: [{
      type: String,
      maxlength: 50
    }],
    qrCode: {
      type: String,
      unique: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  attendance: {
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkInTime: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);