// services/complaintService.js - Complaint CRUD API calls
import api from './api';

export const complaintService = {
  // Get all complaints with query filters
  getComplaints: async (params = {}) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  // Get single complaint by ID
  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Create new complaint (supports multipart/form-data with file)
  createComplaint: async (formData) => {
    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update complaint (supports multipart/form-data with file)
  updateComplaint: async (id, formData) => {
    const response = await api.put(`/complaints/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete complaint
  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },

  // Staff update status and resolution notes
  updateStaffStatus: async (id, statusData) => {
    const response = await api.put(`/complaints/${id}/staff-status`, statusData);
    return response.data;
  },

  // AI analysis of complaint description
  analyzeComplaint: async (description) => {
    const response = await api.post('/ai/analyze', { description });
    return response.data;
  },

  // Get complaint history timeline
  getComplaintHistory: async (id) => {
    const response = await api.get(`/complaints/${id}/history`);
    return response.data;
  },

  // AI Repair & Diagnostic Solution Guide for Staff/Admin
  getSolutionGuide: async (complaintData) => {
    const response = await api.post('/ai/solution-guide', complaintData);
    return response.data;
  },
};
