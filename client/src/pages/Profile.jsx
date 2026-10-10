// pages/Profile.jsx - User Profile & Security Settings
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getImageUrl } from '../utils/helpers';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
  Upload,
  Sparkles,
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    user?.profileImage
      ? getImageUrl(user.profileImage)
      : (user?.role === 'admin' ? '/admin-avatar.jpg' : '')
  );
  const [imgError, setImgError] = useState(false);

  // Sync state whenever user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
      });
      if (!selectedFile) {
        setImagePreview(
          user.profileImage
            ? getImageUrl(user.profileImage)
            : (user.role === 'admin' ? '/admin-avatar.jpg' : '')
        );
      }
      setImgError(false);
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImgError(false);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  // Handle preset avatar selection (e.g. default admin avatar)
  const handleSelectPreset = (presetUrl) => {
    setSelectedFile(null);
    setImgError(false);
    setProfileData((prev) => ({ ...prev, profileImage: presetUrl }));
    setImagePreview(presetUrl);
  };

  // Handle Profile Details & Avatar Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });

    try {
      setUpdatingProfile(true);
      let res;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('name', profileData.name);
        formData.append('phone', profileData.phone);
        formData.append('profileImage', selectedFile);
        res = await authService.updateProfile(formData);
      } else {
        res = await authService.updateProfile({
          name: profileData.name,
          phone: profileData.phone,
          profileImage: profileData.profileImage,
        });
      }

      if (res.success) {
        updateUser(res.data);
        setSelectedFile(null);
        if (res.data.profileImage) {
          setImagePreview(getImageUrl(res.data.profileImage));
        }
        setProfileMsg({
          text: 'Profile details and photo updated successfully! Header avatar updated.',
          type: 'success',
        });
      } else {
        setProfileMsg({ text: res.message || 'Update failed', type: 'error' });
      }
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || 'Error occurred while updating profile.',
        type: 'error',
      });
    } finally {
      setUpdatingProfile(false);
      setTimeout(() => setProfileMsg({ text: '', type: '' }), 4000);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters long', type: 'error' });
      return;
    }

    try {
      setChangingPassword(true);
      const res = await authService.updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.success) {
        setPasswordMsg({ text: 'Password changed successfully.', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg({ text: res.message || 'Password update failed', type: 'error' });
      }
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to change password. Verify your current password.',
        type: 'error',
      });
    } finally {
      setChangingPassword(false);
      setTimeout(() => setPasswordMsg({ text: '', type: '' }), 4000);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-4xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Account Profile & Security
          </h1>
          <p className="text-sm text-slate-500">
            Manage your personal profile photo, credentials, contact numbers, and security password
          </p>
        </div>

        {/* Identity Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Large Avatar Photo */}
            <div className="relative shrink-0 group">
              {imagePreview && !imgError ? (
                <img
                  src={imagePreview}
                  alt={user?.name || 'User'}
                  onError={() => setImgError(true)}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md bg-indigo-50"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-3xl shadow-md shadow-indigo-600/20">
                  {user?.name?.charAt(0).toUpperCase() || (isAdmin ? 'A' : 'U')}
                </div>
              )}
              {/* Quick Camera button on avatar */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                className="absolute -bottom-1.5 -right-1.5 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md border-2 border-white transition-transform hover:scale-110"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <span className="inline-flex items-center gap-1 text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {isAdmin && <Shield className="w-3 h-3 text-indigo-600" />}
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {user?.phone || 'No phone added'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-xl bg-slate-50 hover:bg-white transition-all inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              Upload Photo
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleSelectPreset('/admin-avatar.jpg')}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 border border-indigo-200 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 transition-all inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Default Admin Avatar
              </button>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Edit Profile Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">Personal Information & Photo</h3>
          </div>

          {profileMsg.text && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {/* Photo Selection Banner */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {imagePreview && !imgError ? (
                    <img
                      src={imagePreview}
                      alt="Avatar Preview"
                      onError={() => setImgError(true)}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-500/20 shadow-xs bg-white"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Profile Picture</p>
                  <p className="text-[11px] text-slate-500">
                    {selectedFile
                      ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(0)} KB)`
                      : 'Upload a picture (JPG, PNG, WebP) to update your header avatar.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  Choose File
                </button>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(
                        user?.profileImage
                          ? getImageUrl(user.profileImage)
                          : (isAdmin ? '/admin-avatar.jpg' : '')
                      );
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address (Cannot be modified)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={updatingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {updatingProfile ? 'Saving Changes...' : 'Update Information'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">Security & Password</h3>
          </div>

          {passwordMsg.text && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                placeholder="Enter existing password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-sm shadow-md transition-all disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4" />
              {changingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
