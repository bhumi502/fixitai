// controllers/complaintController.js - Complaint CRUD & Workflow
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Staff = require('../models/Staff');
const Notification = require('../models/Notification');
const ComplaintHistory = require('../models/ComplaintHistory');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (User/Admin)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, location, category, priority, department, aiAnalysis } = req.body;

    if (!title || !description || !location || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (Title, Description, Location, Category)',
      });
    }

    // Determine department from category if exists and not explicitly provided
    let finalDept = department || 'Maintenance';
    if (!department) {
      const catDoc = await Category.findOne({ name: category });
      if (catDoc && catDoc.department) {
        finalDept = catDoc.department;
      }
    }

    // Image file path if uploaded
    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Parse aiAnalysis if sent as string (e.g. from multipart form data)
    let parsedAi = null;
    if (aiAnalysis) {
      parsedAi = typeof aiAnalysis === 'string' ? JSON.parse(aiAnalysis) : aiAnalysis;
    }

    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      category: category.trim(),
      priority: priority || 'Medium',
      department: finalDept,
      image,
      reportedBy: req.user._id,
      status: 'Pending',
      aiAnalysis: parsedAi,
      aiConfidence: parsedAi?.confidence || 0,
      suggestedAction: parsedAi?.suggestedAction || '',
    });

    // Log initial history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: parsedAi ? 'Complaint Created (AI Analyzed)' : 'Complaint Created',
      previousStatus: '',
      newStatus: 'Pending',
      performedBy: req.user._id,
      remarks: parsedAi?.suggestedAction ? `AI Suggested: ${parsedAi.suggestedAction}` : 'Submitted by user',
    });

    // Create confirmation notification for user
    await Notification.create({
      userId: req.user._id,
      complaintId: complaint._id,
      message: `Your complaint #${complaint.complaintId} (${complaint.title}) has been successfully submitted.`,
      type: 'general',
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of complaints (filtered by user/staff/admin + search & filters)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.reportedBy = req.user._id;
    } else if (req.user.role === 'staff') {
      // Find staff profile associated with current user
      const staffMember = await Staff.findOne({ email: req.user.email });
      if (staffMember) {
        query.assignedTo = staffMember._id;
      } else {
        query.assignedTo = null; // No assignments yet
      }
    }

    // Optional query filters
    if (status && status !== 'All') {
      query.status = status;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { complaintId: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone department')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint details
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone department specialization');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Access check: normal user can only view their own complaint
    if (
      req.user.role === 'user' &&
      complaint.reportedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this complaint',
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint (User can edit if Pending; Admin can edit anything)
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Role check
    if (req.user.role === 'user') {
      if (complaint.reportedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own complaints',
        });
      }
      if (complaint.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Complaints cannot be edited once they have been assigned or processed',
        });
      }
    }

    const { title, description, location, category, priority } = req.body;

    if (title) complaint.title = title.trim();
    if (description) complaint.description = description.trim();
    if (location) complaint.location = location.trim();
    if (category) {
      complaint.category = category.trim();
      const catDoc = await Category.findOne({ name: category });
      if (catDoc && catDoc.department) {
        complaint.department = catDoc.department;
      }
    }
    if (priority) complaint.priority = priority;

    if (req.file) {
      complaint.image = `/uploads/${req.file.filename}`;
    }

    const updatedComplaint = await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (User can delete if Pending; Admin can delete any)
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Access check
    if (req.user.role === 'user') {
      if (complaint.reportedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own complaints',
        });
      }
      if (complaint.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Complaints cannot be deleted once processing has started',
        });
      }
    }

    await complaint.deleteOne();

    // Clean up related notifications
    await Notification.deleteMany({ complaintId: complaint._id });

    return res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & resolution notes by Staff
// @route   PUT /api/complaints/:id/staff-status
// @access  Private (Staff/Admin)
const updateStaffStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const prevStatus = complaint.status;
    if (status) {
      complaint.status = status;
    }
    if (resolutionNotes !== undefined) {
      complaint.resolutionNotes = resolutionNotes.trim();
      complaint.staffRemarks = resolutionNotes.trim();
    }
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Log history action
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: status === 'Resolved' ? 'Complaint Resolved' : `Status Updated to ${status}`,
      previousStatus: prevStatus,
      newStatus: status || prevStatus,
      performedBy: req.user._id,
      remarks: resolutionNotes ? resolutionNotes.trim() : `Updated by ${req.user.name}`,
    });

    // Notify the user who reported the problem
    let messageText = `Your complaint #${complaint.complaintId} status has been updated to "${complaint.status}".`;
    if (status === 'Resolved') {
      messageText = `Your complaint #${complaint.complaintId} has been resolved! Notes: "${complaint.resolutionNotes || 'Problem fixed successfully.'}"`;
    }

    await Notification.create({
      userId: complaint.reportedBy,
      complaintId: complaint._id,
      message: messageText,
      type: status === 'Resolved' ? 'resolution' : 'status',
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint history timeline
// @route   GET /api/complaints/:id/history
// @access  Private
const getComplaintHistory = async (req, res, next) => {
  try {
    const history = await ComplaintHistory.find({ complaint: req.params.id })
      .populate('performedBy', 'name role email')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  updateStaffStatus,
  getComplaintHistory,
};
