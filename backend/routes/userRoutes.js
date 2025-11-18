const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  updateEducation,
  updateExperience,
  toggleSaveJob,
  getSavedJobs,
  toggleFollowCompany,
  uploadAvatar,
  uploadCV
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile/:id', getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/education', protect, authorize('candidate'), updateEducation);
router.put('/experience', protect, authorize('candidate'), updateExperience);
router.post('/saved-jobs/:jobId', protect, authorize('candidate'), toggleSaveJob);
router.get('/saved-jobs', protect, authorize('candidate'), getSavedJobs);
router.post('/follow/:companyId', protect, authorize('candidate'), toggleFollowCompany);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/upload-cv', protect, authorize('candidate'), upload.single('cv'), uploadCV);

module.exports = router;

