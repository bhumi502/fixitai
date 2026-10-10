// routes/complaintRoutes.js - Complaints API Endpoints
const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  updateStaffStatus,
  getComplaintHistory,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/staffMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, getComplaints)
  .post(protect, upload.single('image'), createComplaint);

router.get('/:id/history', protect, getComplaintHistory);

router
  .route('/:id')
  .get(protect, getComplaintById)
  .put(protect, upload.single('image'), updateComplaint)
  .delete(protect, deleteComplaint);

router.put('/:id/staff-status', protect, staffOrAdmin, updateStaffStatus);

module.exports = router;
