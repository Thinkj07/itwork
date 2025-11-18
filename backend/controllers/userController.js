const User = require('../models/User');
const path = require('path');

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Don't allow updating password and role
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/Update education
// @route   PUT /api/users/education
// @access  Private (Candidate only)
exports.updateEducation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ ứng viên mới có thể cập nhật học vấn'
      });
    }

    user.education = req.body.education;
    await user.save();

    res.json({
      success: true,
      data: user.education
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/Update experience
// @route   PUT /api/users/experience
// @access  Private (Candidate only)
exports.updateExperience = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ ứng viên mới có thể cập nhật kinh nghiệm'
      });
    }

    user.experience = req.body.experience;
    await user.save();

    res.json({
      success: true,
      data: user.experience
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Unsave a job
// @route   POST /api/users/saved-jobs/:jobId
// @access  Private (Candidate only)
exports.toggleSaveJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const jobId = req.params.jobId;

    if (user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ ứng viên mới có thể lưu công việc'
      });
    }

    const index = user.savedJobs.indexOf(jobId);

    if (index > -1) {
      // Unsave
      user.savedJobs.splice(index, 1);
    } else {
      // Save
      user.savedJobs.push(jobId);
    }

    await user.save();

    res.json({
      success: true,
      saved: index === -1,
      savedJobs: user.savedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved jobs
// @route   GET /api/users/saved-jobs
// @access  Private (Candidate only)
exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      populate: { path: 'company', select: 'companyName companyLogo' }
    });

    res.json({
      success: true,
      data: user.savedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow/Unfollow a company
// @route   POST /api/users/follow/:companyId
// @access  Private (Candidate only)
exports.toggleFollowCompany = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const companyId = req.params.companyId;

    if (user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ ứng viên mới có thể theo dõi công ty'
      });
    }

    const index = user.followedCompanies.indexOf(companyId);

    if (index > -1) {
      user.followedCompanies.splice(index, 1);
    } else {
      user.followedCompanies.push(companyId);
    }

    await user.save();

    res.json({
      success: true,
      following: index === -1,
      followedCompanies: user.followedCompanies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/upload-avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    let avatarUrl = '';

    // Check if file was uploaded
    if (req.file) {
      // Use uploaded file path
      avatarUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.avatarUrl) {
      // Use provided URL
      avatarUrl = req.body.avatarUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên ảnh hoặc cung cấp URL'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Update appropriate field based on user role
    if (user.role === 'employer') {
      user.companyLogo = avatarUrl;
    } else {
      user.avatar = avatarUrl;
    }
    
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload CV
// @route   POST /api/users/upload-cv
// @access  Private (Candidate only)
exports.uploadCV = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ ứng viên mới có thể tải lên CV'
      });
    }

    let cvUrl = '';

    // Check if file was uploaded
    if (req.file) {
      // Use uploaded file path
      cvUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.cvUrl) {
      // Use provided URL
      cvUrl = req.body.cvUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên CV hoặc cung cấp URL'
      });
    }

    user.cvUrl = cvUrl;
    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

