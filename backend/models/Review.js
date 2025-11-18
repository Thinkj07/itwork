const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  
  rating: {
    type: Number,
    required: [true, 'Vui lòng chọn đánh giá'],
    min: 1,
    max: 5
  },
  
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề đánh giá'],
    trim: true,
    maxlength: 200
  },
  
  comment: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung đánh giá'],
    maxlength: 2000
  },
  
  pros: String,
  cons: String,
  
  // Review categories
  workEnvironment: {
    type: Number,
    min: 1,
    max: 5
  },
  salary: {
    type: Number,
    min: 1,
    max: 5
  },
  benefits: {
    type: Number,
    min: 1,
    max: 5
  },
  management: {
    type: Number,
    min: 1,
    max: 5
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// One review per candidate per company
ReviewSchema.index({ company: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);

