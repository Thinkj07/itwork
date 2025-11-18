const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getEmployerApplications,
  updateApplicationStatus,
  getApplication,
  uploadApplicationCV
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('candidate'), applyForJob);
router.post('/upload-cv', protect, authorize('candidate'), upload.single('cv'), uploadApplicationCV);
router.get('/my-applications', protect, authorize('candidate'), getMyApplications);
router.get('/employer', protect, authorize('employer'), getEmployerApplications);
router.get('/job/:jobId', protect, authorize('employer'), getJobApplications);
router.get('/:id', protect, getApplication);
router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);

module.exports = router;

