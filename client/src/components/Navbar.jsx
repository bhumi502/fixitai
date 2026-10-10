// components/Navbar.jsx - Primary Application Navigation Bar
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { getImageUrl } from '../utils/helpers';
import { Wrench, Menu, X, User, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isAdmin = user?.role === 'admin' || location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Reset imgError whenever user profileImage changes
  React.useEffect(() => {
    setImgError(false);
  }, [user?.profileImage]);

  // Resolve proper avatar image URL
  const getAvatarSrc = () => {
    if (user?.profileImage && user.profileImage.trim() !== '') {
      return getImageUrl(user.profileImage);
    }
    if (isAdmin) {
      return '/admin-avatar.jpg';
    }
    return null;
  };

  const avatarSrc = getAvatarSrc();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Full width container so logo and name align cleanly to the far left */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name - Properly Fixed to the Left Side */}
          <Link
            to={isAdmin ? '/admin/dashboard' : '/'}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Wrench className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 leading-tight">
                FixIt <span className="text-indigo-600 font-extrabold">AI</span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/80">
                    <Shield className="w-2.5 h-2.5 text-indigo-600" />
                    Admin
                  </span>
                )}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                {isAdmin ? 'Admin Console' : 'Maintenance Suite'}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links - Completely removed on Admin side */}
          {!isAdmin ? (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors duration-150 ${
                  isActive('/') ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors duration-150 ${
                  isActive('/about') ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`text-sm font-medium transition-colors duration-150 ${
                  isActive('/contact') ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Contact
              </Link>
            </nav>
          ) : (
            /* Spacer to keep right actions nicely aligned */
            <div className="hidden md:block flex-1" />
          )}

          {/* Right Action Controls - Dashboard name removed as requested */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />

                <div className="h-5 w-px bg-slate-200" />

                {/* User / Admin Profile Menu Badge with proper profile avatar image */}
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    title="Account Profile & Settings"
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group"
                  >
                    {/* Proper Profile Avatar Display */}
                    <div className="relative shrink-0">
                      {avatarSrc && !imgError ? (
                        <img
                          src={avatarSrc}
                          alt={user?.name || 'Admin'}
                          onError={(e) => {
                            if (e.target.src !== window.location.origin + '/admin-avatar.jpg') {
                              e.target.src = '/admin-avatar.jpg';
                            } else {
                              setImgError(true);
                            }
                          }}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30 shadow-xs bg-indigo-50"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {user?.name ? user.name.charAt(0).toUpperCase() : (isAdmin ? 'A' : 'U')}
                        </div>
                      )}
                      {/* Active Online Status Badge */}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="text-left hidden lg:block">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                          {user?.name || (isAdmin ? 'System Admin' : 'User')}
                        </p>
                        {isAdmin && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium truncate block max-w-[130px]">
                        {user?.email || 'admin@fixitai.demo'}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all duration-150"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {isAdmin ? (
            /* ADMIN MOBILE DRAWER: NO HOME, ABOUT, CONTACT, NO DASHBOARD BUTTON */
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-center gap-3">
                <div className="relative shrink-0">
                  {avatarSrc && !imgError ? (
                    <img
                      src={avatarSrc}
                      alt={user?.name || 'Admin'}
                      onError={(e) => {
                        if (e.target.src !== window.location.origin + '/admin-avatar.jpg') {
                          e.target.src = '/admin-avatar.jpg';
                        } else {
                          setImgError(true);
                        }
                      }}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user?.name || 'System Admin'}
                    </p>
                    <span className="text-[9px] font-bold uppercase bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <User className="w-4 h-4" />
                  Admin Profile & Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            /* NON-ADMIN PUBLIC MENU */
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Contact
              </Link>

              {isAuthenticated ? (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
