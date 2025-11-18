const Review = require('../models/Review');
const Application = require('../models/Application');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Candidate only, must have been hired)
exports.createReview = async (req, res, next) => {
  try {
    const { companyId, jobId, rating, title, comment, pros, cons, workEnvironment, salary, benefits, management, isAnonymous } = req.body;

    // Check if user has been hired by this company
    const hiredApplication = await Application.findOne({
      candidate: req.user.id,
      company: companyId,
      status: 'hired'
    });

    if (!hiredApplication) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể đánh giá công ty mà bạn đã được tuyển dụng'
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      candidate: req.user.id,
      company: companyId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá công ty này rồi'
      });
    }

    const review = await Review.create({
      company: companyId,
      candidate: req.user.id,
      job: jobId,
      rating,
      title,
      comment,
      pros,
      cons,
      workEnvironment,
      salary,
      benefits,
      management,
      isAnonymous: isAnonymous || false
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a company
// @route   GET /api/reviews/company/:companyId
// @access  Public
exports.getCompanyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ company: req.params.companyId })
      .populate('candidate', 'fullName avatar')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalReviews: reviews.length,
      avgRating: 0,
      avgWorkEnvironment: 0,
      avgSalary: 0,
      avgBenefits: 0,
      avgManagement: 0
    };

    if (reviews.length > 0) {
      stats.avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
      
      const withWorkEnv = reviews.filter(r => r.workEnvironment);
      if (withWorkEnv.length > 0) {
        stats.avgWorkEnvironment = (withWorkEnv.reduce((sum, r) => sum + r.workEnvironment, 0) / withWorkEnv.length).toFixed(1);
      }

      const withSalary = reviews.filter(r => r.salary);
      if (withSalary.length > 0) {
        stats.avgSalary = (withSalary.reduce((sum, r) => sum + r.salary, 0) / withSalary.length).toFixed(1);
      }

      const withBenefits = reviews.filter(r => r.benefits);
      if (withBenefits.length > 0) {
        stats.avgBenefits = (withBenefits.reduce((sum, r) => sum + r.benefits, 0) / withBenefits.length).toFixed(1);
      }

      const withManagement = reviews.filter(r => r.management);
      if (withManagement.length > 0) {
        stats.avgManagement = (withManagement.reduce((sum, r) => sum + r.management, 0) / withManagement.length).toFixed(1);
      }
    }

    res.json({
      success: true,
      data: reviews,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (Candidate only)
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ candidate: req.user.id })
      .populate('company', 'companyName companyLogo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

