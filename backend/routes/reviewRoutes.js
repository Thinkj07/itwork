const express = require('express');
const router = express.Router();
const {
  createReview,
  getCompanyReviews,
  getMyReviews
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('candidate'), createReview);
router.get('/my-reviews', protect, authorize('candidate'), getMyReviews);
router.get('/company/:companyId', getCompanyReviews);

module.exports = router;

