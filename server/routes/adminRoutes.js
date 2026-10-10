// routes/adminRoutes.js - Admin Specific API Endpoints
const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getUsers,
  updateUserStatus,
  assignComplaint,
  adminReviewComplaint,
  updateComplaintStatusAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// All routes require authentication & admin role
router.use(protect, adminOnly);

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/complaints/:id/assign', assignComplaint);
router.put('/complaints/:id/review', adminReviewComplaint);
router.put('/complaints/:id/status', updateComplaintStatusAdmin);

module.exports = router;
