// controllers/adminController.js - Admin Metrics, User Management, Assignment
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Staff = require('../models/Staff');
const Notification = require('../models/Notification');
const ComplaintHistory = require('../models/ComplaintHistory');

// @desc    Get complete administrative dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingCount = await Complaint.countDocuments({ status: 'Pending' });
    const assignedCount = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgressCount = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedCount = await Complaint.countDocuments({ status: 'Resolved' });
    const rejectedCount = await Complaint.countDocuments({ status: 'Rejected' });
    const criticalCount = await Complaint.countDocuments({ priority: 'Critical' });

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalStaff = await Staff.countDocuments();

    // Grouping by Category
    const categoryAgg = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const byCategory = categoryAgg.map((item) => ({
      name: item._id || 'Uncategorized',
      count: item.count,
    }));

    // Grouping by Status
    const statusAgg = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byStatus = statusAgg.map((item) => ({
      status: item._id,
      count: item.count,
    }));

    // Grouping by Priority
    const priorityAgg = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    const byPriority = priorityAgg.map((item) => ({
      priority: item._id,
      count: item.count,
    }));

    // Recent 5 complaints
    const recentComplaints = await Complaint.find()
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name department')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalComplaints,
          pending: pendingCount,
          assigned: assignedCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          rejected: rejectedCount,
          critical: criticalCount,
          totalUsers,
          totalStaff,
        },
        charts: {
          byCategory,
          byStatus,
          byPriority,
        },
        recentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for Admin
// @route   GET /api/admin/users
// @access  Private (Admin Only)
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.status = status;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (activate / deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin Only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot alter your own admin account status',
      });
    }

    user.status = status || (user.status === 'active' ? 'blocked' : 'active');
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status changed to ${user.status}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a complaint to a staff member
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private (Admin Only)
const assignComplaint = async (req, res, next) => {
  try {
    const { staffId } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const staffMember = await Staff.findById(staffId);
    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    const prevStatus = complaint.status;
    complaint.assignedTo = staffMember._id;
    complaint.department = staffMember.department;
    complaint.status = 'Assigned';
    await complaint.save();

    // Log History
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Assigned to Staff',
      previousStatus: prevStatus,
      newStatus: 'Assigned',
      performedBy: req.user._id,
      remarks: `Assigned to ${staffMember.name} (${staffMember.department})`,
    });

    // Create notification for complaint reporter
    await Notification.create({
      userId: complaint.reportedBy,
      complaintId: complaint._id,
      message: `Your complaint #${complaint.complaintId} has been assigned to ${staffMember.name} (${staffMember.department} Department).`,
      type: 'assignment',
    });

    // If staff member has a linked user account, notify staff too
    if (staffMember.user) {
      await Notification.create({
        userId: staffMember.user,
        complaintId: complaint._id,
        message: `You have been assigned a new complaint: #${complaint.complaintId} - "${complaint.title}".`,
        type: 'assignment',
      });
    }

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone department');

    return res.status(200).json({
      success: true,
      message: `Complaint assigned to ${staffMember.name}`,
      data: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin review and modify AI suggestions / complaint details
// @route   PUT /api/admin/complaints/:id/review
// @access  Private (Admin Only)
const adminReviewComplaint = async (req, res, next) => {
  try {
    const { category, priority, department, suggestedAction, adminRemarks } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (category) complaint.category = category;
    if (priority) complaint.priority = priority;
    if (department) complaint.department = department;
    if (suggestedAction) complaint.suggestedAction = suggestedAction;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks.trim();

    await complaint.save();

    // Log history
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Admin Reviewed AI Suggestions',
      previousStatus: complaint.status,
      newStatus: complaint.status,
      performedBy: req.user._id,
      remarks: adminRemarks || 'Admin updated category/priority/department',
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint AI suggestions & details updated by Admin',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change complaint status directly by Admin (e.g. Reject)
// @route   PUT /api/admin/complaints/:id/status
// @access  Private (Admin Only)
const updateComplaintStatusAdmin = async (req, res, next) => {
  try {
    const { status, resolutionNotes, adminRemarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const prevStatus = complaint.status;
    complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (adminRemarks) complaint.adminRemarks = adminRemarks;
    if (status === 'Resolved') complaint.resolvedAt = new Date();

    await complaint.save();

    // Log History
    await ComplaintHistory.create({
      complaint: complaint._id,
      action: status === 'Rejected' ? 'Complaint Rejected' : `Admin Status Change to ${status}`,
      previousStatus: prevStatus,
      newStatus: status,
      performedBy: req.user._id,
      remarks: adminRemarks || resolutionNotes || `Status updated by Admin`,
    });

    // Notify user
    await Notification.create({
      userId: complaint.reportedBy,
      complaintId: complaint._id,
      message: `Your complaint #${complaint.complaintId} status has been updated to "${status}".${adminRemarks ? ` Remarks: ${adminRemarks}` : ''}`,
      type: status === 'Resolved' ? 'resolution' : 'status',
    });

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  updateUserStatus,
  assignComplaint,
  adminReviewComplaint,
  updateComplaintStatusAdmin,
};
