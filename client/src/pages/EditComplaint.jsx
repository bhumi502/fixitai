// pages/EditComplaint.jsx - Edit Existing Pending Complaint
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { complaintService } from '../services/complaintService';
import { categoryService } from '../services/categoryService';
import { COMPLAINT_PRIORITIES } from '../utils/constants';
import { getImageUrl } from '../utils/helpers';
import {
  ArrowLeft,
  Edit3,
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    priority: 'Medium',
  });

  const [existingImage, setExistingImage] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsRes, compRes] = await Promise.all([
          categoryService.getCategories(),
          complaintService.getComplaintById(id),
        ]);

        if (catsRes.success) setCategories(catsRes.data);

        if (compRes.success && compRes.data) {
          const c = compRes.data;
          setFormData({
            title: c.title,
            description: c.description,
            location: c.location,
            category: c.category,
            priority: c.priority,
          });
          setExistingImage(c.image || '');
        } else {
          setError(compRes.message || 'Complaint not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaint data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds the 5MB size limit.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only image files (jpg, jpeg, png, webp) are permitted.');
      return;
    }

    setError('');
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const removeNewImage = () => {
    setNewImageFile(null);
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    setNewImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      if (newImageFile) {
        data.append('image', newImageFile);
      }

      const res = await complaintService.updateComplaint(id, data);
      if (res.success) {
        setSuccess('Complaint updated successfully!');
        setTimeout(() => {
          navigate(`/complaints/${id}`);
        }, 1200);
      } else {
        setError(res.message || 'Failed to update complaint');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while updating complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner label="Loading complaint to edit..." />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to={`/complaints/${id}`} className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Cancel & Return to Details
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Edit Complaint
          </h1>
          <p className="text-sm text-slate-500">
            Update problem specifics, location, or attach an updated photograph.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Complaint Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name} ({cat.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                >
                  {COMPLAINT_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            {/* Image section */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Attached Photo
              </label>

              {newImagePreview ? (
                <div className="relative inline-block border border-slate-200 rounded-2xl overflow-hidden p-2 bg-slate-50 mb-3">
                  <p className="text-[11px] text-slate-500 mb-1 font-semibold">New Photo Selected:</p>
                  <img
                    src={newImagePreview}
                    alt="New Preview"
                    className="h-36 w-auto object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="absolute top-7 right-3 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : existingImage ? (
                <div className="mb-3">
                  <p className="text-[11px] text-slate-500 mb-1 font-semibold">Current Photo:</p>
                  <img
                    src={getImageUrl(existingImage)}
                    alt="Current"
                    className="h-32 w-auto object-cover rounded-xl border border-slate-200"
                  />
                </div>
              ) : null}

              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50">
                <UploadCloud className="w-6 h-6 text-indigo-500 mb-1" />
                <span className="text-xs font-semibold text-slate-700">
                  {existingImage || newImagePreview ? 'Replace Photo' : 'Upload Photo'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to={`/complaints/${id}`}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60"
              >
                <Edit3 className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditComplaint;
