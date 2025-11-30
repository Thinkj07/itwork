const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Candidate only)
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId, cvType, cvUrl, coverLetter } = req.body;

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    // Check if job is closed
    if (job.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Công việc này đã được đóng. Bạn không thể ứng tuyển vào công việc đã đóng.'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã ứng tuyển vào công việc này rồi'
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      company: job.company,
      cvType: cvType || 'profile',
      cvUrl,
      coverLetter
    });

    // Update job application count
    job.applicationCount += 1;
    await job.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title category location')
      .populate('company', 'companyName companyLogo');

    // Create notification for employer
    try {
      const candidate = await User.findById(req.user.id);
      await createNotification({
        recipient: job.company,
        sender: req.user.id,
        type: 'application',
        title: 'Ứng viên mới',
        message: `${candidate.fullName} đã ứng tuyển vào vị trí "${job.title}"`,
        link: `/employer/jobs`, // ✅ Sửa thành manage jobs page
        relatedJob: jobId,
        relatedApplication: application._id
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the application if notification fails
    }

    res.status(201).json({
      success: true,
      data: populatedApplication
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications (for candidate)
// @route   GET /api/applications/my-applications
// @access  Private (Candidate only)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title category location salaryFrom salaryTo status')
      .populate('company', 'companyName companyLogo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a job (for employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    // Make sure user owns the job
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem ứng viên của công việc này'
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'fullName email phone avatar skills experience education cvUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for employer's jobs
// @route   GET /api/applications/employer
// @access  Private (Employer only)
exports.getEmployerApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ company: req.user.id })
      .populate('job', 'title category')
      .populate('candidate', 'fullName email phone avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer only)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển'
      });
    }

    // Make sure employer owns the job
    if (application.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật đơn ứng tuyển này'
      });
    }

    const oldStatus = application.status;
    application.status = status;
    if (note) {
      application.notes = note;
    }

    await application.save();

    application = await Application.findById(application._id)
      .populate('candidate', 'fullName email phone')
      .populate('job', 'title');

    // Create notification for candidate if status changed
    if (oldStatus !== status) {
      try {
        const employer = await User.findById(req.user.id);
        const statusMessages = {
          'pending': 'Đơn ứng tuyển của bạn đang được xem xét',
          'reviewing': 'Đơn ứng tuyển của bạn đang được xem xét kỹ hơn',
          'shortlisted': 'Chúc mừng! Bạn đã được chọn vào danh sách ứng viên tiềm năng',
          'interview': 'Chúc mừng! Bạn đã được mời phỏng vấn',
          'hired': 'Chúc mừng! Bạn đã được tuyển dụng',
          'rejected': 'Rất tiếc, đơn ứng tuyển của bạn không phù hợp lần này'
        };

        await createNotification({
          recipient: application.candidate._id,
          sender: req.user.id,
          type: 'status_change',
          title: 'Cập nhật đơn ứng tuyển',
          message: `${employer.companyName || 'Nhà tuyển dụng'} đã cập nhật trạng thái đơn ứng tuyển "${application.job.title}" của bạn thành "${statusMessages[status] || status}"`,
          link: `/candidate/applications`, // fix
          relatedJob: application.job._id,
          relatedApplication: application._id
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the status update if notification fails
      }
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate', 'fullName email phone avatar skills experience education cvUrl')
      .populate('company', 'companyName companyLogo');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển'
      });
    }

    // Make sure user is either the candidate or the employer
    if (
      application.candidate._id.toString() !== req.user.id &&
      application.company._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn ứng tuyển này'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload CV for application
// @route   POST /api/applications/upload-cv
// @access  Private (Candidate only)
exports.uploadApplicationCV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên file CV'
      });
    }

    const cvUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: { cvUrl }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application (for candidate)
// @route   DELETE /api/applications/:id
// @access  Private (Candidate only)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển'
      });
    }

    // Make sure user is the candidate who owns this application
    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền rút đơn ứng tuyển này'
      });
    }

    // Get job to update application count
    const job = await Job.findById(application.job);
    if (job && job.applicationCount > 0) {
      job.applicationCount -= 1;
      await job.save();
    }

    // Delete the application
    await application.deleteOne();

    res.json({
      success: true,
      message: 'Đã rút đơn ứng tuyển thành công',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

