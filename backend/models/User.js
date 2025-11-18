const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },
  role: {
    type: String,
    enum: ['candidate', 'employer'],
    required: [true, 'Vui lòng chọn vai trò']
  },
  
  // Candidate-specific fields
  fullName: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: String,
  dateOfBirth: Date,
  address: String,
  bio: String,
  
  // Professional info for candidates
  skills: [String],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String
  }],
  education: [{
    school: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  certifications: [{
    name: String,
    organization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String
  }],
  cvUrl: String,
  
  // Employer-specific fields (company info)
  companyName: {
    type: String,
    trim: true
  },
  companyLogo: String,
  companyWebsite: String,
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+', '']
  },
  companyType: {
    type: String,
    enum: ['IT', 'Product', 'Service', 'Outsourcing', 'Startup', ''],
    default: 'IT'
  },
  industry: String,
  companyDescription: String,
  companyAddress: String,
  
  // Saved/Followed items
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  followedCompanies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('User', UserSchema);

