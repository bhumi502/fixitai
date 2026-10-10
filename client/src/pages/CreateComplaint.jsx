// pages/CreateComplaint.jsx - Create New Maintenance Ticket with AI Analysis & Review
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { complaintService } from '../services/complaintService';
import { categoryService } from '../services/categoryService';
import { COMPLAINT_PRIORITIES } from '../utils/constants';
import {
  PlusCircle,
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Bot,
  Edit3,
  RotateCcw,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    priority: 'Medium',
    department: 'Maintenance',
  });

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showAiCard, setShowAiCard] = useState(false);
  const [isEditingAi, setIsEditingAi] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories({ status: 'Active' });
        const availableCategories = Array.isArray(res?.data) ? res.data : [];

        if (!res?.success || availableCategories.length === 0) {
          setCategoryError(res?.message || 'No categories are available. Please contact an administrator.');
          return;
        }

        setCategories(availableCategories);
        setFormData((prev) => ({
          ...prev,
          category: availableCategories.some((category) => category.name === prev.category)
            ? prev.category
            : availableCategories[0].name,
        }));
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategoryError('Unable to load categories. Please refresh and try again.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle AI analysis triggering
  const handleAnalyzeAI = async () => {
    setError('');
    if (!formData.description || formData.description.trim().length < 5) {
      setError('Please provide a detailed description (at least 5 characters) before analyzing with AI.');
      return;
    }

    try {
      setIsAnalyzing(true);
      const res = await complaintService.analyzeComplaint(formData.description);
      if (res.success && res.data) {
        setAiResult(res.data);
        setShowAiCard(true);
        setIsEditingAi(false);

        // Auto apply AI suggestion to form
        setFormData((prev) => ({
          ...prev,
          category: res.data.category || prev.category,
          priority: res.data.priority || prev.priority,
          department: res.data.department || prev.department,
        }));
      } else {
        setError(res.message || 'AI Analysis failed. Please try again.');
      }
    } catch (err) {
      setError('AI service is temporarily unavailable.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (aiResult) {
      setFormData((prev) => ({
        ...prev,
        category: aiResult.category || prev.category,
        priority: aiResult.priority || prev.priority,
        department: aiResult.department || prev.department,
      }));
      setSuccessMessage('AI suggestions applied to form fields!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

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
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.location || !formData.category) {
      setError('Please fill in all required fields (Title, Description, Location, Category)');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('department', formData.department || 'Maintenance');

      if (aiResult) {
        data.append('aiAnalysis', JSON.stringify(aiResult));
      }

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await complaintService.createComplaint(data);
      if (res.success) {
        setSuccessMessage('Complaint created and registered successfully!');
        setTimeout(() => {
          navigate('/complaints');
        }, 1200);
      } else {
        setError(res.message || 'Failed to submit complaint');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while submitting complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/complaints" className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Complaints
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Report a Maintenance Problem
          </h1>
          <p className="text-sm text-slate-500">
            Provide detailed information or click <strong>Analyze with AI</strong> for automated triage assistance.
          </p>
        </div>

        {/* Notifications & Error alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Complaint Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 max-w-3xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Complaint Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Split AC leaking water and not cooling"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            {/* Description & AI Button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Detailed Problem Description *
                </label>
                <button
                  type="button"
                  onClick={handleAnalyzeAI}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-xs rounded-lg shadow-xs transition-all disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAnalyzing ? 'AI Analyzing...' : 'Analyze with AI'}
                </button>
              </div>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain what is broken, symptoms observed (e.g. AC in classroom 204 is running but not cooling)..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            {/* AI ANALYSIS CARD */}
            {showAiCard && aiResult && (
              <div className="p-5 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white rounded-2xl border border-indigo-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        AI Triage Analysis
                        {aiResult.isDemo ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md">
                            DEMO / Fallback Engine
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Gemini AI Live
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500">Automated classification assist</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-full">
                      {(aiResult.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Category</span>
                    <span className="text-sm font-bold text-slate-800">{aiResult.category}</span>
                  </div>

                  <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Priority</span>
                    <span className={`text-sm font-extrabold ${aiResult.priority === 'High' || aiResult.priority === 'Critical' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {aiResult.priority}
                    </span>
                  </div>

                  <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Department</span>
                    <span className="text-sm font-bold text-slate-800">{aiResult.department}</span>
                  </div>
                </div>

                {aiResult.suggestedAction && (
                  <div className="p-3 bg-white/90 rounded-xl border border-indigo-100 text-xs text-slate-700 space-y-1">
                    <span className="font-semibold text-indigo-900 block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Suggested Technician Action:
                    </span>
                    <p className="text-slate-600 leading-relaxed">{aiResult.suggestedAction}</p>
                  </div>
                )}

                {/* AI Card Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleApplyAiSuggestion}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Use AI Suggestions
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingAi(!isEditingAi)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditingAi ? 'Lock Form Fields' : 'Edit Suggestions'}
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyzeAI}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Analyze Again
                  </button>
                </div>
              </div>
            )}

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={loadingCategories || categories.length === 0}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                >
                  {loadingCategories && <option value="">Loading categories...</option>}
                  {!loadingCategories && categories.length === 0 && (
                    <option value="">{categoryError || 'No categories available'}</option>
                  )}
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name} ({cat.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Priority Level *
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

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Problem Location / Room Number *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Science Block, 3rd Floor, Computer Lab 302"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Photo of Malfunction (Optional)
              </label>

              {imagePreview ? (
                <div className="relative inline-block border border-slate-200 rounded-2xl overflow-hidden p-2 bg-slate-50">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-auto object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                  <span className="text-sm font-semibold text-slate-700">
                    Click to upload photo
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Supports JPG, PNG, WEBP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/complaints"
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60"
              >
                <PlusCircle className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateComplaint;
