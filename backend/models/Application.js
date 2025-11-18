const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // CV source
  cvType: {
    type: String,
    enum: ['profile', 'upload'],
    default: 'profile'
  },
  cvUrl: String, // URL if uploaded new CV
  
  coverLetter: String,
  
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'interview', 'rejected', 'hired'],
    default: 'pending'
  },
  
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  
  notes: String, // Employer's notes about the candidate
  
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate applications
ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Update status history when status changes
ApplicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);

