// models/Complaint.js - Complaint Schema & Model
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed complaint description'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide the problem location'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    department: {
      type: String,
      default: 'Maintenance',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    // AI Analysis & Decision Support fields
    aiAnalysis: {
      category: String,
      priority: String,
      department: String,
      suggestedAction: String,
      confidence: Number,
      isDemo: Boolean,
    },
    aiConfidence: {
      type: Number,
      default: 0,
    },
    suggestedAction: {
      type: String,
      default: '',
    },
    adminRemarks: {
      type: String,
      default: '',
      trim: true,
    },
    staffRemarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to assign formatted complaint ID (e.g. FC1001, FC1002) if not already assigned
complaintSchema.pre('validate', async function (next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    const nextNum = 1001 + count;
    this.complaintId = `FC${nextNum}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
