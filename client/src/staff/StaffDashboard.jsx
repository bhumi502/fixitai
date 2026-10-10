// staff/StaffDashboard.jsx - Technician Work Orders & Overview
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { formatDateOnly, truncateText } from '../utils/helpers';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffComplaints = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getComplaints();
        if (res.success) {
          setComplaints(res.data);
        }
      } catch (err) {
        console.error('Failed to load assigned jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffComplaints();
  }, []);

  const totalAssigned = complaints.length;
  const pendingAssigned = complaints.filter((c) => c.status === 'Assigned').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const urgentTasks = complaints.filter(
    (c) => (c.priority === 'Critical' || c.priority === 'High') && c.status !== 'Resolved'
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
        {/* Welcome */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Staff Portal: {user?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Technician
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Manage your assigned campus repairs, execute work orders, and log resolution notes
            </p>
          </div>

          <Link
            to="/staff/complaints"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0 self-start sm:self-auto"
          >
            <Wrench className="w-4 h-4" />
            View Work Orders
          </Link>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assigned Jobs
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalAssigned}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ready to Start
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{pendingAssigned}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                In Progress
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{inProgressCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Resolved by You
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{resolvedCount}</h3>
            </div>
          </div>
        </div>

        {/* Priority Urgent Tasks */}
        {urgentTasks.length > 0 && (
          <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Urgent Attention Required ({urgentTasks.length} high priority jobs)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {urgentTasks.map((t) => (
                <div
                  key={t._id}
                  className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        #{t.complaintId}
                      </span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{t.title}</p>
                    <p className="text-[11px] text-slate-500">{t.location}</p>
                  </div>
                  <Link
                    to={`/staff/complaints/${t._id}`}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    Action
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Complaints List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Assigned Work Orders</h2>
              <p className="text-xs text-slate-400">
                Complaints assigned to you by facility administration
              </p>
            </div>
            <Link
              to="/staff/complaints"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading assigned tickets..." />
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No work orders assigned"
              description="You do not have any pending tasks right now. New assignments will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <div
                  key={c._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors px-2 rounded-xl"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        #{c.complaintId}
                      </span>
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                    <Link
                      to={`/staff/complaints/${c._id}`}
                      className="font-semibold text-slate-800 hover:text-indigo-600 block text-sm transition-colors"
                    >
                      {c.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{c.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {c.location}
                      </span>
                      <span>•</span>
                      <span>{formatDateOnly(c.createdAt)}</span>
                    </div>
                  </div>

                  <Link
                    to={`/staff/complaints/${c._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors shrink-0 self-start sm:self-center"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Manage Job
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
