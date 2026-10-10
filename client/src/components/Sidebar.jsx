// components/Sidebar.jsx - Role-aware Dashboard Sidebar Navigation
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/helpers';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  User,
  Users,
  Briefcase,
  Layers,
  BarChart3,
  FileText,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);

  React.useEffect(() => {
    setImgErr(false);
  }, [user?.profileImage]);

  const avatarSrc = user?.profileImage
    ? getImageUrl(user.profileImage)
    : (user?.role === 'admin' ? '/admin-avatar.jpg' : null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 h-[calc(100vh-4rem)] sticky top-16 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div className="space-y-6">
        {/* Navigation Sections */}
        <nav className="space-y-1">
          {/* USER Navigation */}
          {user?.role === 'user' && (
            <>
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                General
              </div>
              <NavLink to="/dashboard" end className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink to="/complaints/create" className={navLinkClass}>
                <PlusCircle className="w-4 h-4" />
                Report Problem
              </NavLink>
              <NavLink to="/complaints" end className={navLinkClass}>
                <ClipboardList className="w-4 h-4" />
                My Complaints
              </NavLink>
              <NavLink to="/notifications" className={navLinkClass}>
                <Bell className="w-4 h-4" />
                Notifications
              </NavLink>
            </>
          )}

          {/* STAFF Navigation */}
          {user?.role === 'staff' && (
            <>
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Staff Operations
              </div>
              <NavLink to="/staff/dashboard" end className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Staff Dashboard
              </NavLink>
              <NavLink to="/staff/complaints" className={navLinkClass}>
                <CheckCircle2 className="w-4 h-4" />
                Assigned Complaints
              </NavLink>
              <NavLink to="/notifications" className={navLinkClass}>
                <Bell className="w-4 h-4" />
                Notifications
              </NavLink>
            </>
          )}

          {/* ADMIN Navigation */}
          {user?.role === 'admin' && (
            <>
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Management
              </div>
              <NavLink to="/admin/dashboard" end className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </NavLink>
              <NavLink to="/admin/complaints" className={navLinkClass}>
                <ClipboardList className="w-4 h-4" />
                All Complaints
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="w-4 h-4" />
                Manage Users
              </NavLink>
              <NavLink to="/admin/staff" className={navLinkClass}>
                <Briefcase className="w-4 h-4" />
                Manage Staff
              </NavLink>
              <NavLink to="/admin/categories" className={navLinkClass}>
                <Layers className="w-4 h-4" />
                Categories
              </NavLink>

              <div className="pt-4 px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Insights
              </div>
              <NavLink to="/admin/analytics" className={navLinkClass}>
                <BarChart3 className="w-4 h-4" />
                Analytics
              </NavLink>
              <NavLink to="/admin/reports" className={navLinkClass}>
                <FileText className="w-4 h-4" />
                Reports
              </NavLink>
            </>
          )}

          {/* Common Account Section */}
          <div className="pt-4 px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Account
          </div>
          <NavLink to="/profile" className={navLinkClass}>
            <User className="w-4 h-4" />
            Profile Settings
          </NavLink>
        </nav>
      </div>

      {/* Bottom section of sidebar */}
      <div className="pt-4 border-t border-slate-200/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors duration-150"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
