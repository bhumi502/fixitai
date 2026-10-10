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
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const StaffComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setSortConfig({ key: 'createdAt', direction: 'desc' });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />;
  };

  const sortedComplaints = [...complaints].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    if (sortConfig.key === 'createdAt') {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedComplaints.length / itemsPerPage);
  const paginatedComplaints = sortedComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Total active jobs: <strong>{complaints.length}</strong></span>
            <button
              onClick={handleClearFilters}
              className="text-indigo-600 hover:text-indigo-700 font-semibold underline decoration-transparent hover:decoration-indigo-700 transition-all"
            >
              Clear Filters
            </button>
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
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold select-none">
                  <th className="py-3.5 px-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('complaintId')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">Ticket {getSortIcon('complaintId')}</div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">Title & Description {getSortIcon('title')}</div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">Category {getSortIcon('category')}</div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('priority')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">Priority {getSortIcon('priority')}</div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('location')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">Location {getSortIcon('location')}</div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">Status {getSortIcon('status')}</div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-1 whitespace-nowrap">Date {getSortIcon('createdAt')}</div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedComplaints.map((c) => (
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

            {totalPages > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/80 bg-slate-50">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedComplaints.length)} of {sortedComplaints.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1 hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffComplaints;
