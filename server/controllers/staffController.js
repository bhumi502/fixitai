// controllers/staffController.js - Staff Member CRUD
const Staff = require('../models/Staff');
const User = require('../models/User');

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private (Admin/Staff)
const getStaff = async (req, res, next) => {
  try {
    const { department, status, search } = req.query;
    let query = {};

    if (department && department !== 'All') query.department = department;
    if (status && status !== 'All') query.status = status;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { specialization: searchRegex },
      ];
    }

    const staffList = await Staff.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: staffList.length,
      data: staffList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff by ID
// @route   GET /api/staff/:id
// @access  Private
const getStaffById = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new staff member (and ensure login User exists)
// @route   POST /api/staff
// @access  Private (Admin Only)
const createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, department, specialization, status, password } = req.body;

    if (!name || !email || !phone || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Name, Email, Phone, and Department',
      });
    }

    const existingStaff = await Staff.findOne({ email: email.toLowerCase().trim() });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'A staff member with this email already exists',
      });
    }

    // Check or create associated User account for login
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: password || 'Password123!',
        role: 'staff',
        status: 'active',
      });
    } else {
      user.role = 'staff';
      await user.save();
    }

    const newStaff = await Staff.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      department,
      specialization: specialization ? specialization.trim() : 'General',
      status: status || 'Available',
      user: user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: newStaff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Admin Only)
const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    const { name, email, phone, department, specialization, status } = req.body;

    if (name) staff.name = name.trim();
    if (phone) staff.phone = phone.trim();
    if (department) staff.department = department;
    if (specialization !== undefined) staff.specialization = specialization.trim();
    if (status) staff.status = status;

    if (email && email.toLowerCase().trim() !== staff.email) {
      const emailTaken = await Staff.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: staff._id },
      });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: 'Another staff member is already using this email address',
        });
      }
      staff.email = email.toLowerCase().trim();
    }

    const updatedStaff = await staff.save();

    // Sync with user account if linked
    if (staff.user) {
      await User.findByIdAndUpdate(staff.user, {
        name: staff.name,
        phone: staff.phone,
        email: staff.email,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin Only)
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    await staff.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Staff member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};
