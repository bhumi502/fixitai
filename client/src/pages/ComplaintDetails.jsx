// pages/ComplaintDetails.jsx - Detailed Complaint View with Progress & Audit Timeline
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit3,
  Bot,
  History,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { formatDate, getImageUrl } from '../utils/helpers';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getComplaintById(id);
        if (res.success) {
          setComplaint(res.data);
          // Fetch audit trail history
          const historyRes = await complaintService.getComplaintHistory(id);
          if (historyRes.success) {
            setHistory(historyRes.data || []);
          }
        } else {
          setError(res.message || 'Complaint not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaint details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await complaintService.deleteComplaint(id);
      if (res.success) {
        navigate('/complaints');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete complaint');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner label="Loading complaint record..." />
        </main>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 text-center space-y-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-slate-800">Error</h2>
            <p className="text-sm text-slate-500 mt-1">{error || 'Complaint not found'}</p>
            <Link
              to="/complaints"
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium"
            >
              Back to Complaints
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const timelineSteps = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Assigned':
        return 1;
      case 'In Progress':
        return 2;
      case 'Resolved':
        return 3;
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(complaint.status);
  const isRejected = complaint.status === 'Rejected';
  const canEdit =
    (complaint.status === 'Pending' && complaint.reportedBy?._id === user?._id) || isAdmin;
  const canDelete =
    (complaint.status === 'Pending' && complaint.reportedBy?._id === user?._id) || isAdmin;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/complaints"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Complaints
          </Link>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                to={`/complaints/edit/${complaint._id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
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

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              Category: <strong className="text-slate-900">{complaint.category}</strong>
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              Department: <strong className="text-slate-900">{complaint.department}</strong>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {complaint.location}
            </span>
          </div>
        </div>

        {/* Visual Progress Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Complaint Progress Timeline
          </h2>

          {isRejected ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold">Complaint Rejected</p>
                <p className="text-xs text-rose-600 mt-0.5">
                  This complaint has been reviewed and closed by facility administration.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = currentStep >= idx;
                  const isCurrent = currentStep === idx;

                  return (
                    <div
                      key={step}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                          : isCompleted
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-white border-slate-100 text-slate-400 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                          isCompleted
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <p className={`text-xs font-semibold ${isCurrent ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis Card (If present) */}
        {complaint.aiAnalysis && (
          <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    AI Analysis Report
                    {complaint.aiAnalysis.isDemo ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                        Demo Rule Engine
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Gemini AI
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">Automated AI Triage Assessment</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                {((complaint.aiConfidence || complaint.aiAnalysis.confidence || 0.9) * 100).toFixed(0)}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Suggested Category</span>
                <span className="text-sm font-bold text-slate-800">{complaint.aiAnalysis.category}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Suggested Priority</span>
                <span className="text-sm font-bold text-indigo-600">{complaint.aiAnalysis.priority}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Suggested Department</span>
                <span className="text-sm font-bold text-slate-800">{complaint.aiAnalysis.department}</span>
              </div>
            </div>

            {complaint.suggestedAction && (
              <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-700">
                <strong className="text-indigo-900 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> AI Suggested Action:
                </strong>
                <p className="text-slate-600 leading-relaxed">{complaint.suggestedAction}</p>
              </div>
            )}
          </div>
        )}

        {/* Two Column Grid: Description & Audit History / Assignment Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Description & Photo (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Problem Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>

              {complaint.image && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">
                    Attached Site Photograph:
                  </h4>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-lg">
                    <img
                      src={getImageUrl(complaint.image)}
                      alt="Complaint attachment"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Audit History Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Audit Trail & History
              </h3>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400">No history records logged yet.</p>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 py-2">
                  {history.map((h, idx) => (
                    <div key={h._id || idx} className="relative pl-6">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{h.action}</span>
                          <span className="text-slate-400">{formatDate(h.createdAt)}</span>
                        </div>
                        <p className="text-slate-500">
                          By: <strong>{h.performedBy?.name || 'System'}</strong> ({h.performedBy?.role || 'user'})
                        </p>
                        {h.remarks && (
                          <p className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 italic">
                            "{h.remarks}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolution Notes (If Resolved) */}
            {complaint.status === 'Resolved' && (
              <div className="bg-emerald-50/70 rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold">Technician Resolution Summary</h3>
                </div>
                <p className="text-sm text-emerald-950 whitespace-pre-line leading-relaxed">
                  {complaint.resolutionNotes || 'No additional notes provided.'}
                </p>
                {complaint.resolvedAt && (
                  <p className="text-xs text-emerald-700 pt-2 border-t border-emerald-200">
                    Resolved on: <strong>{formatDate(complaint.resolvedAt)}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Reporter & Staff Assignment Card (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reported By
              </h3>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm text-slate-900 truncate">
                    {complaint.reportedBy?.name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {complaint.reportedBy?.email}
                  </p>
                  {complaint.reportedBy?.phone && (
                    <p className="text-xs text-slate-400">{complaint.reportedBy?.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Assigned Technician
              </h3>
              {complaint.assignedTo ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {complaint.assignedTo.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {complaint.assignedTo.department} Department
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                    <p>
                      <strong>Specialization:</strong> {complaint.assignedTo.specialization || 'General'}
                    </p>
                    <p>
                      <strong>Contact:</strong> {complaint.assignedTo.phone}
                    </p>
                    <p className="truncate">
                      <strong>Email:</strong> {complaint.assignedTo.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                  <Clock className="w-5 h-5 text-slate-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">Awaiting Assignment</p>
                  <p className="text-[11px] text-slate-400">
                    Administrator will dispatch a technician soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteModal}
          title="Delete Complaint"
          message={`Are you sure you want to delete complaint #${complaint.complaintId}?`}
          confirmText="Yes, Delete"
          confirmVariant="danger"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      </main>
    </div>
  );
};

export default ComplaintDetails;
