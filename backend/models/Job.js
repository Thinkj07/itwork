const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề công việc'],
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả công việc']
  },
  requirements: {
    type: String,
    required: [true, 'Vui lòng nhập yêu cầu công việc']
  },
  benefits: String,
  
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục'],
    enum: ['Frontend', 'Backend', 'Mobile', 'AI / Data', 'DevOps', 'QA / Tester', 'Product Manager', 'Finance / Accounting', 'Marketing', 'Other']
  },
  
  skills: [String],
  
  salaryFrom: {
    type: Number,
    min: 0
  },
  salaryTo: {
    type: Number,
    min: 0
  },
  salaryCurrency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD']
  },
  salaryNegotiable: {
    type: Boolean,
    default: false
  },
  
  jobType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    default: 'Full-time'
  },
  
  workMode: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  
  location: {
    city: String,
    district: String,
    address: String
  },
  
  experienceLevel: {
    type: String,
    enum: ['Intern', 'Fresher', 'Junior', 'Middle', 'Senior', 'Lead', 'Manager'],
    default: 'Junior'
  },
  
  numberOfPositions: {
    type: Number,
    default: 1,
    min: 1
  },
  
  applicationDeadline: Date,
  
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  applicationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search
JobSchema.index({ title: 'text', description: 'text', skills: 'text' });
JobSchema.index({ category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', JobSchema);

