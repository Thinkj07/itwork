const express = require('express');
const router = express.Router();
const { protect, verifyAdmin } = require('../middleware/auth');
const {
  // Dashboard & Statistics
  getDashboardStats,
  getGrowthData,
  
  // User Management
  getUsers,
  getUserDetails,
  toggleUserStatus,
  deleteUser,
  updateUser,
  
  // Job Management
  getJobs,
  getJobDetails,
  updateJobStatus,
  deleteJob,
  
  // Audit Logs
  getAuditLogs
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, verifyAdmin);

// ==================== DASHBOARD & STATISTICS ====================
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/growth', getGrowthData);

// ==================== USER MANAGEMENT ====================
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// ==================== JOB MANAGEMENT ====================
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobDetails);
router.put('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

// ==================== AUDIT LOGS ====================
router.get('/audit-logs', getAuditLogs);

module.exports = router;
