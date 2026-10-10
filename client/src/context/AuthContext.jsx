// context/AuthContext.jsx - Global Authentication State Management
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fixit_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('fixit_token');
      const storedUser = localStorage.getItem('fixit_user');

      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === 'admin' && (!parsed.profileImage || parsed.profileImage === '')) {
            parsed.profileImage = '/uploads/admin-avatar.jpg';
          }
          setUser(parsed);
          const res = await authService.getMe();
          if (res.success && res.data) {
            const freshUser = res.data;
            if (freshUser.role === 'admin' && (!freshUser.profileImage || freshUser.profileImage === '')) {
              freshUser.profileImage = '/uploads/admin-avatar.jpg';
            }
            setUser(freshUser);
            localStorage.setItem('fixit_user', JSON.stringify(freshUser));
          }
        } catch (error) {
          console.warn('Session expired or backend unreachable, resetting saved token');
          localStorage.removeItem('fixit_token');
          localStorage.removeItem('fixit_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.data) {
      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        role: res.data.role,
        status: res.data.status,
        profileImage: res.data.profileImage || (res.data.role === 'admin' ? '/uploads/admin-avatar.jpg' : ''),
      };
      setToken(res.data.token);
      setUser(userData);
      localStorage.setItem('fixit_token', res.data.token);
      localStorage.setItem('fixit_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  // Register handler
  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      const newUser = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        role: res.data.role,
        status: res.data.status,
        profileImage: res.data.profileImage || '',
      };
      setToken(res.data.token);
      setUser(newUser);
      localStorage.setItem('fixit_token', res.data.token);
      localStorage.setItem('fixit_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fixit_token');
    localStorage.removeItem('fixit_user');
  };

  // Update profile locally
  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('fixit_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff',
        isUser: user?.role === 'user',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
