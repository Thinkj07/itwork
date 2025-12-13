const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'BLOCK_USER',
      'UNBLOCK_USER',
      'DELETE_USER',
      'APPROVE_JOB',
      'REJECT_JOB',
      'DELETE_JOB',
      'UPDATE_USER',
      'UPDATE_JOB',
      'VIEW_STATISTICS',
      'OTHER'
    ]
  },
  targetType: {
    type: String,
    enum: ['User', 'Job', 'Application', 'Review', 'System'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
AuditLogSchema.index({ admin: 1, timestamp: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
