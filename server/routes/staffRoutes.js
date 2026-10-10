// routes/staffRoutes.js - Staff API Endpoints
const express = require('express');
const router = express.Router();
const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router
  .route('/')
  .get(protect, getStaff)
  .post(protect, adminOnly, createStaff);

router
  .route('/:id')
  .get(protect, getStaffById)
  .put(protect, adminOnly, updateStaff)
  .delete(protect, adminOnly, deleteStaff);

module.exports = router;
