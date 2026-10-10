// pages/Dashboard.jsx - User Overview Dashboard
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { complaintService } from '../services/complaintService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Eye,
  MapPin,
} from 'lucide-react';
import { formatDateOnly, truncateText } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getComplaints();
        if (res.success) {
          setComplaints(res.data);
        }
      } catch (error) {
        console.error('Failed to load user complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Hello, {user?.name || 'User'} 👋
            </h1>
            <p className="text-sm text-slate-500">
              Welcome to your FixIt AI dashboard. Track your reported issues and facility updates.
            </p>
          </div>

          <Link
            to="/complaints/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Report New Problem
          </Link>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Reported
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</h3>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pending Triage
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{pendingCount}</h3>
            </div>
          </div>

          {/* In Progress */}
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

          {/* Resolved */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Resolved
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{resolvedCount}</h3>
            </div>
          </div>
        </div>

        {/* Recent Complaints Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recent Complaints</h2>
              <p className="text-xs text-slate-400">
                Your most recently submitted maintenance tickets
              </p>
            </div>
            <Link
              to="/complaints"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label="Fetching complaint history..." />
          ) : recentComplaints.length === 0 ? (
            <EmptyState
              title="No complaints reported yet"
              description="Have a broken AC, plumbing leak, or classroom IT malfunction? Submit your first ticket now."
              actionLabel="+ Report a Problem"
              actionTo="/complaints/create"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentComplaints.map((item) => (
                <div
                  key={item._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors px-2 rounded-xl"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        #{item.complaintId}
                      </span>
                      <PriorityBadge priority={item.priority} />
                      <StatusBadge status={item.status} />
                    </div>
                    <Link
                      to={`/complaints/${item._id}`}
                      className="font-semibold text-slate-800 hover:text-indigo-600 block text-sm transition-colors"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {truncateText(item.location, 35)}
                      </span>
                      <span>•</span>
                      <span>{formatDateOnly(item.createdAt)}</span>
                    </div>
                  </div>

                  <Link
                    to={`/complaints/${item._id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-colors shrink-0 self-start sm:self-center"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
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

export default Dashboard;
