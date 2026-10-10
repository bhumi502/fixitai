// services/adminService.js - Admin specific API calls
import api from './api';

export const adminService = {
  // Get dashboard metrics & charts
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get users list
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Update user status (active/blocked)
  updateUserStatus: async (id, status) => {
    const response = await api.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  // Assign complaint to staff
  assignComplaint: async (complaintId, staffId) => {
    const response = await api.put(`/admin/complaints/${complaintId}/assign`, { staffId });
    return response.data;
  },

  // Update complaint status directly by Admin
  updateComplaintStatus: async (complaintId, status, resolutionNotes, adminRemarks) => {
    const response = await api.put(`/admin/complaints/${complaintId}/status`, {
      status,
      resolutionNotes,
      adminRemarks,
    });
    return response.data;
  },

  // Review & modify AI suggestions for complaint
  reviewComplaint: async (complaintId, reviewData) => {
    const response = await api.put(`/admin/complaints/${complaintId}/review`, reviewData);
    return response.data;
  },
};
