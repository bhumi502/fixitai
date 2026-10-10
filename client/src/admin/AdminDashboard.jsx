// admin/AdminDashboard.jsx - Executive Admin Metrics & Real MongoDB Analytics
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminService } from '../services/adminService';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  Eye,
  BarChart2,
  PieChart,
  Shield,
} from 'lucide-react';
import { formatDateOnly, truncateText } from '../utils/helpers';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Failed to load admin metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <LoadingSpinner label="Compiling live facility analytics..." />
        </main>
      </div>
    );
  }

  const { summary = {}, charts = {}, recentComplaints = [] } = data || {};
  const { byCategory = [], byStatus = [], byPriority = [] } = charts;

  // Max calculations for relative chart bars
  const maxCategoryCount = Math.max(...byCategory.map((c) => c.count), 1);
  const maxPriorityCount = Math.max(...byPriority.map((p) => p.count), 1);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Admin Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Live Data
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Campus maintenance performance, real-time ticket statuses, and workforce deployment
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/complaints"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              Manage All Complaints
            </Link>
          </div>
        </div>

        {/* 6 Metrics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Complaints */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{summary.total ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Complaints Logged</p>
          </div>

          {/* Pending */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{summary.pending ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Awaiting Triage</p>
          </div>

          {/* Assigned */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{summary.assigned ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Dispatched to Staff</p>
          </div>

          {/* In Progress */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Working</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{summary.inProgress ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-0.5">In Repair</p>
          </div>

          {/* Resolved */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fixed</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{summary.resolved ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Resolved</p>
          </div>

          {/* Critical */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">High Risk</span>
            </div>
            <h3 className="text-2xl font-bold text-red-600">{summary.critical ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Critical Priority</p>
          </div>
        </div>

        {/* MongoDB Interactive Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Complaints by Category */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Complaints by Category</h3>
              </div>
              <span className="text-xs text-slate-400">From MongoDB</span>
            </div>

            {byCategory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No complaint data available.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {byCategory.map((item) => {
                  const percentage = Math.round((item.count / maxCategoryCount) * 100);
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{item.name}</span>
                        <span className="font-mono text-slate-500 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart 2: Complaints by Status */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Complaints by Status</h3>
              </div>
              <span className="text-xs text-slate-400">Real-time</span>
            </div>

            {byStatus.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No complaint data available.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {byStatus.map((item) => {
                  const total = summary.total || 1;
                  const percentOfTotal = Math.round((item.count / total) * 100);

                  const getStatusColor = (st) => {
                    switch (st) {
                      case 'Pending':
                        return 'bg-amber-500';
                      case 'Assigned':
                        return 'bg-blue-500';
                      case 'In Progress':
                        return 'bg-indigo-600';
                      case 'Resolved':
                        return 'bg-emerald-500';
                      default:
                        return 'bg-rose-500';
                    }
                  };

                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{item.status}</span>
                        <span className="font-mono text-slate-500">
                          {item.count} ({percentOfTotal}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`${getStatusColor(item.status)} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${percentOfTotal}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart 3: Complaints by Priority */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-800">Complaints by Priority</h3>
              </div>
              <span className="text-xs text-slate-400">Severity</span>
            </div>

            {byPriority.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No complaint data available.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {byPriority.map((item) => {
                  const percentage = Math.round((item.count / maxPriorityCount) * 100);

                  const getPriorityColor = (pr) => {
                    switch (pr) {
                      case 'Critical':
                        return 'bg-red-600';
                      case 'High':
                        return 'bg-orange-500';
                      case 'Medium':
                        return 'bg-amber-500';
                      default:
                        return 'bg-slate-400';
                    }
                  };

                  return (
                    <div key={item.priority} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{item.priority}</span>
                        <span className="font-mono text-slate-500 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`${getPriorityColor(item.priority)} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Complaints Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Latest Complaint Filings</h2>
              <p className="text-xs text-slate-400">
                Real-time stream of issues reported across campus buildings
              </p>
            </div>
            <Link
              to="/admin/complaints"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold">
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Complaint</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned To</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-xs text-indigo-700">
                      #{c.complaintId}
                    </td>
                    <td className="py-3 px-3 max-w-xs font-medium text-slate-800 truncate">
                      {c.title}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">{c.category}</td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {c.assignedTo ? c.assignedTo.name : <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
