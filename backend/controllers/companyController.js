const User = require('../models/User');
const Job = require('../models/Job');
const Review = require('../models/Review');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res, next) => {
  try {
    const { search, industry, size, page = 1, limit = 10 } = req.query;

    const query = { role: 'employer', isActive: true };

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { companyDescription: { $regex: search, $options: 'i' } }
      ];
    }

    if (industry) {
      query.industry = industry;
    }

    if (size) {
      query.companySize = size;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const companies = await User.find(query)
      .select('companyName companyLogo industry companySize companyDescription companyWebsite companyAddress')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: companies.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company profile with jobs
// @route   GET /api/companies/:id
// @access  Public
exports.getCompanyProfile = async (req, res, next) => {
  try {
    const company = await User.findById(req.params.id)
      .select('-password');

    if (!company || company.role !== 'employer') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công ty'
      });
    }

    // Get active jobs
    const jobs = await Job.find({
      company: req.params.id,
      status: 'active'
    }).select('title category location salaryFrom salaryTo createdAt');

    // Get reviews
    const reviews = await Review.find({ company: req.params.id })
      .populate('candidate', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        company,
        jobs,
        reviews,
        avgRating: avgRating.toFixed(1),
        reviewCount: reviews.length
      }
    });
  } catch (error) {
    next(error);
  }
};

