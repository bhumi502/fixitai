// App.jsx - Main Application Routing & Providers
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import Dashboard from './pages/Dashboard';
import CreateComplaint from './pages/CreateComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';
import EditComplaint from './pages/EditComplaint';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import ManageComplaints from './admin/ManageComplaints';
import ManageUsers from './admin/ManageUsers';
import ManageStaff from './admin/ManageStaff';
import ManageCategories from './admin/ManageCategories';
import Analytics from './admin/Analytics';
import Reports from './admin/Reports';

// Staff Pages
import StaffDashboard from './staff/StaffDashboard';
import StaffComplaints from './staff/StaffComplaints';
import StaffComplaintDetails from './staff/StaffComplaintDetails';

import ChatbotWidget from './components/ChatbotWidget';

// 404 Component
const NotFound = () => (
  <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 text-center">
    <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full shadow-xs">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 mb-6">
        The requested URL was not found on FixIt AI.
      </p>
      <a
        href="/"
        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
      >
        Return to Home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* User Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/create"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin']}>
                    <CreateComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin']}>
                    <MyComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['user', 'staff', 'admin']}>
                    <ComplaintDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin']}>
                    <EditComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['user', 'staff', 'admin']}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['user', 'staff', 'admin']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageStaff />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Staff Protected Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['staff', 'admin']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/complaints"
                element={
                  <ProtectedRoute allowedRoles={['staff', 'admin']}>
                    <StaffComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['staff', 'admin']}>
                    <StaffComplaintDetails />
                  </ProtectedRoute>
                }
              />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <ChatbotWidget />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
