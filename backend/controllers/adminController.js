const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');

// Helper function to create audit log
const createAuditLog = async (adminId, action, targetType, targetId, description, metadata = {}, req) => {
  try {
    await AuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      description,
      metadata,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
};

// ==================== DASHBOARD & STATISTICS ====================

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();

    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });

    const newJobsThisWeek = await Job.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    const newJobsThisMonth = await Job.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });

    const newApplicationsThisWeek = await Application.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    const newApplicationsThisMonth = await Application.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });

    const activeCandidateIds = await Application.distinct('candidate', {
      createdAt: { $gte: oneMonthAgo }
    });
    
    const activeEmployerIds = await Job.distinct('company', {
      createdAt: { $gte: oneMonthAgo }
    });
    
    const allActiveUserIds = new Set([
      ...activeCandidateIds.map(id => id.toString()),
      ...activeEmployerIds.map(id => id.toString())
    ]);
    
    const activeUsers = allActiveUserIds.size;

    const blockedUsers = await User.countDocuments({ isActive: false });

    const jobsByStatus = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const topCompanies = await Job.aggregate([
      {
        $group: {
          _id: '$company',
          jobCount: { $sum: 1 },
          applicationCount: { $sum: '$applicationCount' }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'companyInfo'
        }
      },
      { $unwind: '$companyInfo' },
      {
        $project: {
          companyId: '$_id',
          companyName: '$companyInfo.companyName',
          companyLogo: '$companyInfo.companyLogo',
          jobCount: 1,
          applicationCount: 1
        }
      }
    ]);

    const recentActivities = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('admin', 'email fullName companyName');

    await createAuditLog(
      req.user.id,
      'VIEW_STATISTICS',
      'System',
      null,
      'Admin viewed dashboard statistics',
      {},
      req
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCandidates,
          totalEmployers,
          totalJobs,
          activeJobs,
          totalApplications,
          activeUsers,
          blockedUsers
        },
        weekly: {
          newUsers: newUsersThisWeek,
          newJobs: newJobsThisWeek,
          newApplications: newApplicationsThisWeek
        },
        monthly: {
          newUsers: newUsersThisMonth,
          newJobs: newJobsThisMonth,
          newApplications: newApplicationsThisMonth
        },
        jobsByStatus: jobsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topCompanies,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get growth chart data
// @route   GET /api/admin/dashboard/growth
// @access  Private/Admin
exports.getGrowthData = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usersGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const jobsGrowth = await Job.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const applicationsGrowth = await Application.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        users: usersGrowth,
        jobs: jobsGrowth,
        applications: applicationsGrowth
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'blocked') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    let additionalInfo = {};

    if (user.role === 'candidate') {
      const applicationCount = await Application.countDocuments({ candidate: user._id });
      const reviewCount = await Review.countDocuments({ author: user._id });
      
      additionalInfo = {
        applicationCount,
        reviewCount
      };
    } else if (user.role === 'employer') {
      const jobCount = await Job.countDocuments({ company: user._id });
      const activeJobCount = await Job.countDocuments({ company: user._id, status: 'active' });
      const totalApplications = await Application.countDocuments({ company: user._id });
      
      additionalInfo = {
        jobCount,
        activeJobCount,
        totalApplications
      };
    }

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        ...additionalInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    if (user.isSystemAccount) {
      return res.status(403).json({
        success: false,
        message: 'Không thể khóa tài khoản hệ thống'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không thể khóa tài khoản Admin khác'
      });
    }

    const previousStatus = user.isActive;
    user.isActive = !user.isActive;
    await user.save();

    await createAuditLog(
      req.user.id,
      user.isActive ? 'UNBLOCK_USER' : 'BLOCK_USER',
      'User',
      user._id,
      `Admin ${user.isActive ? 'unblocked' : 'blocked'} user: ${user.email}`,
      {
        previousStatus,
        newStatus: user.isActive,
        reason: req.body.reason || 'No reason provided'
      },
      req
    );

    res.json({
      success: true,
      message: `Đã ${user.isActive ? 'mở khóa' : 'khóa'} tài khoản thành công`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Prevent deleting system accounts
    if (user.isSystemAccount) {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa tài khoản hệ thống'
      });
    }

    // Prevent deleting admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa tài khoản Admin'
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DELETE_USER',
      'User',
      user._id,
      `Admin deleted user: ${user.email}`,
      {
        userRole: user.role,
        reason: req.body.reason || 'No reason provided'
      },
      req
    );

    res.json({
      success: true,
      message: 'Đã xóa người dùng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user information
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Don't allow updating password, role, or systemAccount flag
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;
    delete updates.isSystemAccount;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    // Create audit log
    await createAuditLog(
      req.user.id,
      'UPDATE_USER',
      'User',
      user._id,
      `Admin updated user: ${user.email}`,
      { updates },
      req
    );

    res.json({
      success: true,
      message: 'Đã cập nhật thông tin người dùng',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// ==================== JOB MANAGEMENT ====================

// @desc    Get all jobs with filters
// @route   GET /api/admin/jobs
// @access  Private/Admin
exports.getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const jobs = await Job.find(query)
      .populate('company', 'companyName companyLogo email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job details
// @route   GET /api/admin/jobs/:id
// @access  Private/Admin
exports.getJobDetails = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'companyName companyLogo email phone companyWebsite');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    // Get application count
    const applicationCount = await Application.countDocuments({ job: job._id });

    res.json({
      success: true,
      data: {
        ...job.toObject(),
        applicationCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job status (approve/reject)
// @route   PUT /api/admin/jobs/:id/status
// @access  Private/Admin
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    const previousStatus = job.status;
    job.status = status;
    await job.save();

    // Determine action type
    let action = 'UPDATE_JOB';
    if (status === 'active' && previousStatus !== 'active') {
      action = 'APPROVE_JOB';
    } else if (status === 'closed') {
      action = 'REJECT_JOB';
    }

    // Create audit log
    await createAuditLog(
      req.user.id,
      action,
      'Job',
      job._id,
      `Admin changed job status from ${previousStatus} to ${status}: ${job.title}`,
      {
        previousStatus,
        newStatus: status,
        reason: reason || 'No reason provided'
      },
      req
    );

    res.json({
      success: true,
      message: 'Đã cập nhật trạng thái công việc',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/admin/jobs/:id
// @access  Private/Admin
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    await job.deleteOne();

    // Create audit log
    await createAuditLog(
      req.user.id,
      'DELETE_JOB',
      'Job',
      job._id,
      `Admin deleted job: ${job.title}`,
      {
        jobTitle: job.title,
        company: job.company,
        reason: req.body.reason || 'Violation of terms'
      },
      req
    );

    res.json({
      success: true,
      message: 'Đã xóa công việc thành công'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== AUDIT LOGS ====================

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      admin,
      targetType,
      startDate,
      endDate
    } = req.query;

    // Build query
    const query = {};

    if (action && action !== 'all') {
      query.action = action;
    }

    if (admin) {
      query.admin = admin;
    }

    if (targetType && targetType !== 'all') {
      query.targetType = targetType;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(query)
      .populate('admin', 'email fullName companyName')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
