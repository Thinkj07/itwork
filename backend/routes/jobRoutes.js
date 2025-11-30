const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobsByCompany,
  getMyJobs,
  closeJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getJobs)
  .post(protect, authorize('employer'), createJob);

router.get('/my-jobs', protect, authorize('employer'), getMyJobs);
router.get('/company/:companyId', getJobsByCompany);
router.patch('/:id/close', protect, authorize('employer'), closeJob);

router.route('/:id')
  .get(getJob)
  .put(protect, authorize('employer'), updateJob)
  .delete(protect, authorize('employer'), deleteJob);

module.exports = router;

