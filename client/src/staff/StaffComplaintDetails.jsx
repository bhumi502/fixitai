// staff/StaffComplaintDetails.jsx - Technician Job Execution & Resolution Notes
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { complaintService } from '../services/complaintService';
import { formatDate, getImageUrl } from '../utils/helpers';
import {
  ArrowLeft,
  Wrench,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  ShieldAlert,
  Search,
} from 'lucide-react';

const StaffComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status Action Form
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ text: '', type: '' });

  // AI Solution Guide state
  const [solutionGuide, setSolutionGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.data) {
        setComplaint(res.data);
        setResolutionNotes(res.data.resolutionNotes || '');

        // Fetch AI Solution Guide for Technician
        fetchAiGuide(res.data);
      } else {
        setError(res.message || 'Complaint not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiGuide = async (cData) => {
    try {
      setLoadingGuide(true);
      const res = await complaintService.getSolutionGuide({
        title: cData.title,
        description: cData.description,
        category: cData.category,
        location: cData.location,
      });
      if (res.success && res.data) {
        setSolutionGuide(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch AI solution guide:', err);
    } finally {
      setLoadingGuide(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  // Handle Quick Transition to In Progress
  const handleStartRepair = async () => {
    try {
      setUpdating(true);
      const res = await complaintService.updateStaffStatus(id, {
        status: 'In Progress',
      });
      if (res.success) {
        setAlert({ text: 'Status changed to "In Progress". Problem under repair.', type: 'success' });
        fetchComplaint();
      } else {
        setAlert({ text: res.message || 'Failed to update status', type: 'error' });
      }
    } catch (err) {
      setAlert({ text: err.response?.data?.message || 'Error occurred.', type: 'error' });
    } finally {
      setUpdating(false);
      setTimeout(() => setAlert({ text: '', type: '' }), 4000);
    }
  };

  // Handle Mark Resolved with notes
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setAlert({ text: 'Please provide resolution notes describing the fix.', type: 'error' });
      return;
    }

    try {
      setUpdating(true);
      const res = await complaintService.updateStaffStatus(id, {
        status: 'Resolved',
        resolutionNotes: resolutionNotes.trim(),
      });
      if (res.success) {
        setAlert({ text: 'Work order marked as Resolved! User has been notified.', type: 'success' });
        fetchComplaint();
      } else {
        setAlert({ text: res.message || 'Failed to resolve ticket', type: 'error' });
      }
    } catch (err) {
      setAlert({ text: err.response?.data?.message || 'Error occurred.', type: 'error' });
    } finally {
      setUpdating(false);
      setTimeout(() => setAlert({ text: '', type: '' }), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner label="Loading work order..." />
        </main>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 text-center">
          <div className="bg-white p-8 rounded-3xl max-w-md mx-auto border border-slate-200">
            <p className="text-rose-600 font-semibold mb-2">Error</p>
            <p className="text-sm text-slate-500">{error || 'Work order not found'}</p>
            <Link
              to="/staff/complaints"
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Back to Work Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link
            to="/staff/complaints"
            className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assigned Work Orders
          </Link>
        </div>

        {alert.text && (
          <div
            className={`p-4 rounded-2xl text-sm flex items-center gap-2 border ${
              alert.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{alert.text}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                #{complaint.complaintId}
              </span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Reported: {formatDate(complaint.createdAt)}</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {complaint.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              Category: <strong>{complaint.category}</strong>
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {complaint.location}
            </span>
          </div>
        </div>

        {/* AI REPAIR & DIAGNOSTIC SOLUTION GUIDE FOR STAFF/ADMIN */}
        <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white border border-indigo-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  AI Repair & Inspection Guide
                  {solutionGuide?.isDemo ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                      Demo Engine
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                      Gemini AI Live
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">Automated step-by-step diagnostic and resolution assistance for technicians</p>
              </div>
            </div>
          </div>

          {loadingGuide ? (
            <div className="p-4 bg-white/80 rounded-2xl text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Generating AI Repair & Inspection Guide...</span>
            </div>
          ) : solutionGuide ? (
            <div className="space-y-4">
              {/* Safety Warning */}
              {solutionGuide.safetyWarning && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Safety Precaution:</strong>
                    <span className="ml-1 leading-relaxed">{solutionGuide.safetyWarning}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Diagnostic Check Steps */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-indigo-600" />
                    How to Inspect & Diagnose (Check Steps)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 pl-1">
                    {solutionGuide.diagnosticSteps?.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Resolution Steps */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-emerald-600" />
                    Recommended Repair Steps (How to Fix)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 pl-1">
                    {solutionGuide.recommendedFix?.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Required Tools & Materials */}
              {solutionGuide.requiredTools?.length > 0 && (
                <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/60 text-xs flex flex-wrap items-center gap-2">
                  <strong className="text-slate-800 flex items-center gap-1 shrink-0">
                    <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Recommended Tools/Materials:
                  </strong>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {solutionGuide.requiredTools.map((tool, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-200">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Technician Workflow Control Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
            <Wrench className="w-5 h-5 text-indigo-600" />
            <h3>Work Order Execution Workflow</h3>
          </div>

          {complaint.status === 'Assigned' && (
            <div className="bg-white p-5 rounded-2xl border border-indigo-100 space-y-3">
              <p className="text-xs text-slate-600">
                This job is currently in <strong className="text-blue-600">Assigned</strong> status. When you are ready to start investigating or fixing the equipment, click the button below to update the ticket to "In Progress".
              </p>
              <button
                onClick={handleStartRepair}
                disabled={updating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                {updating ? 'Starting...' : 'Start Repair (Mark In Progress)'}
              </button>
            </div>
          )}

          {complaint.status === 'In Progress' && (
            <form onSubmit={handleResolveSubmit} className="bg-white p-5 rounded-2xl border border-indigo-100 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Resolution Notes (Required to complete work order) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe the actions taken (e.g., replaced capacitor, cleaned pipe blockage, calibrated thermostat)..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {updating ? 'Resolving...' : 'Complete & Mark as Resolved'}
              </button>
            </form>
          )}

          {complaint.status === 'Resolved' && (
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Work Order Completed</span>
              </div>
              <p className="text-xs text-emerald-950 whitespace-pre-line">
                <strong>Resolution Notes:</strong> {complaint.resolutionNotes}
              </p>
              {complaint.resolvedAt && (
                <p className="text-[11px] text-emerald-700 pt-1">
                  Resolved on: {formatDate(complaint.resolvedAt)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Problem Description & Attached Image */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Problem Description from User
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {complaint.description}
              </p>

              {complaint.image && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">
                    User Attached Photograph:
                  </h4>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-lg">
                    <img
                      src={getImageUrl(complaint.image)}
                      alt="Malfunction"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User / Reporter Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reported By (Contact)
              </h3>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm text-slate-900 truncate">
                    {complaint.reportedBy?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {complaint.reportedBy?.email}
                  </p>
                  {complaint.reportedBy?.phone && (
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      📞 {complaint.reportedBy?.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffComplaintDetails;
