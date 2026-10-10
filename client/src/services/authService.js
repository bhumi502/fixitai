// services/authService.js - Authentication API calls
import api from './api';

export const authService = {
  // Register new account
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Verify OTP for Registration
  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Forgot Password (Send OTP)
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset Password (with OTP)
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile or change password
  updateProfile: async (profileData) => {
    let headers = {};
    if (typeof FormData !== 'undefined' && profileData instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.put('/auth/profile', profileData, { headers });
    return response.data;
  },
};
