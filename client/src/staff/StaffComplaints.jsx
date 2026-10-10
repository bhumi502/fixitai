// staff/StaffComplaints.jsx - Staff Assigned Work Orders Listing
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { complaintService } from '../services/complaintService';
import { formatDateOnly, truncateText } from '../utils/helpers';
import {
  Wrench,
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
} from 'lucide-react';

const StaffComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchStaffComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaints({
        search: search || undefined,
        status: statusFilter,
      });
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchStaffComplaints();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter]);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Assigned Work Orders
            </h1>
            <p className="text-sm text-slate-500">
              Select any assigned complaint to begin repairs or submit completion notes
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search work order ID, title, or room..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="All">All Statuses</option>
                <option value="Assigned">Assigned (Not Started)</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
            Total active jobs: <strong>{complaints.length}</strong>
          </div>
        </div>

        {/* Complaints Listing */}
        {loading ? (
          <LoadingSpinner label="Loading assigned orders..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No work orders found"
            description="You do not have any complaints matching the filter criteria."
          />
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold">
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Title & Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-700 whitespace-nowrap">
                      #{c.complaintId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        to={`/staff/complaints/${c._id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 block truncate"
                      >
                        {c.title}
                      </Link>
                      <span className="text-xs text-slate-400 truncate block">
                        {truncateText(c.description, 50)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {c.category}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateOnly(c.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Link
                        to={`/staff/complaints/${c._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                      >
                        <Wrench className="w-3 h-3" />
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffComplaints;
