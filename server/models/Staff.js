// models/Staff.js - Staff Schema & Model
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide staff name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide staff email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide staff contact number'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please select a department'],
      enum: ['Electrical', 'Plumbing', 'IT Support', 'Housekeeping', 'Maintenance', 'Security', 'Other'],
      default: 'Maintenance',
    },
    specialization: {
      type: String,
      default: 'General Maintenance',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Busy', 'Inactive'],
      default: 'Available',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Staff', staffSchema);
