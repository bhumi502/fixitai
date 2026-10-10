// admin/ManageComplaints.jsx - Administrative Complaint & Dispatch Management
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { complaintService } from '../services/complaintService';
import { staffService } from '../services/staffService';
import { categoryService } from '../services/categoryService';
import { adminService } from '../services/adminService';
import { COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '../utils/constants';
import { formatDateOnly, truncateText } from '../utils/helpers';
import {
  Search,
  Filter,
  Eye,
  UserPlus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Clock,
  Wrench,
  Sparkles,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const PRIORITY_ORDER = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const STATUS_ORDER = {
  Pending: 1,
  Assigned: 2,
  'In Progress': 3,
  Resolved: 4,
  Rejected: 5,
};

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Sorting
  const [sortField, setSortField] = useState('createdAt'); // 'createdAt' | 'complaintId' | 'title' | 'category' | 'priority' | 'status'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'All' ||
    categoryFilter !== 'All' ||
    priorityFilter !== 'All' ||
    sortField !== 'createdAt' ||
    sortDirection !== 'desc';

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setSortField('createdAt');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Sort complaints
  const sortedComplaints = useMemo(() => {
    return [...complaints].sort((a, b) => {
      let result = 0;
      switch (sortField) {
        case 'complaintId':
          result = (a.complaintId || '').localeCompare(b.complaintId || '');
          break;
        case 'title':
          result = (a.title || '').localeCompare(b.title || '');
          break;
        case 'category':
          result = (a.category || '').localeCompare(b.category || '');
          break;
        case 'priority': {
          const wA = PRIORITY_ORDER[a.priority] || 0;
          const wB = PRIORITY_ORDER[b.priority] || 0;
          result = wA - wB;
          break;
        }
        case 'status': {
          const sA = STATUS_ORDER[a.status] || 0;
          const sB = STATUS_ORDER[b.status] || 0;
          result = sA - sB;
          break;
        }
        case 'createdAt':
        default: {
          const tA = new Date(a.createdAt || 0).getTime();
          const tB = new Date(b.createdAt || 0).getTime();
          result = tA - tB;
          break;
        }
      }
      return sortDirection === 'asc' ? result : -result;
    });
  }, [complaints, sortField, sortDirection]);

  // Total pages and paginated slice
  const totalPages = Math.max(1, Math.ceil(sortedComplaints.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, priorityFilter, pageSize]);

  const paginatedComplaints = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedComplaints.slice(startIndex, startIndex + pageSize);
  }, [sortedComplaints, currentPage, pageSize]);

  // Generate page numbers array for pagination
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors ml-1 inline shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 transition-transform ml-1 inline shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 transition-transform ml-1 inline shrink-0" />
    );
  };

  // Review AI Modal
  const [reviewModal, setReviewModal] = useState({
    open: false,
    complaint: null,
    category: '',
    priority: '',
    department: '',
    suggestedAction: '',
    adminRemarks: '',
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  // Assign Modal
  const [assignModal, setAssignModal] = useState({ open: false, complaint: null, staffId: '' });
  const [assignLoading, setAssignLoading] = useState(false);

  // Status Change Modal
  const [statusModal, setStatusModal] = useState({
    open: false,
    complaint: null,
    status: '',
    resolutionNotes: '',
  });
  const [statusLoading, setStatusLoading] = useState(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({ open: false, complaint: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Feedback Alert
  const [alert, setAlert] = useState({ text: '', type: '' });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [compRes, staffRes, catRes] = await Promise.all([
        complaintService.getComplaints({
          search: search || undefined,
          status: statusFilter,
          category: categoryFilter,
          priority: priorityFilter,
        }),
        staffService.getStaff(),
        categoryService.getCategories(),
      ]);

      if (compRes.success) setComplaints(compRes.data);
      if (staffRes.success) setStaffMembers(staffRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to load complaints data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchAll();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter, categoryFilter, priorityFilter]);

  // Handle Review AI Suggestions Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModal.complaint) return;

    try {
      setReviewLoading(true);
      const res = await adminService.reviewComplaint(reviewModal.complaint._id, {
        category: reviewModal.category,
        priority: reviewModal.priority,
        department: reviewModal.department,
        suggestedAction: reviewModal.suggestedAction,
        adminRemarks: reviewModal.adminRemarks,
      });

      if (res.success) {
        setAlert({
          text: `AI suggestions & details updated for #${reviewModal.complaint.complaintId}.`,
          type: 'success',
        });
        setReviewModal({
          open: false,
          complaint: null,
          category: '',
          priority: '',
          department: '',
          suggestedAction: '',
          adminRemarks: '',
        });
        fetchAll();
      } else {
        setAlert({ text: res.message || 'Review update failed', type: 'error' });
      }
    } catch (err) {
      setAlert({
        text: err.response?.data?.message || 'Review update failed.',
        type: 'error',
      });
    } finally {
      setReviewLoading(false);
      setTimeout(() => setAlert({ text: '', type: '' }), 4000);
    }
  };

  // Handle Assign Staff
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModal.staffId || !assignModal.complaint) return;

    try {
      setAssignLoading(true);
      const res = await adminService.assignComplaint(
        assignModal.complaint._id,
        assignModal.staffId
      );

      if (res.success) {
        setAlert({
          text: `Complaint #${assignModal.complaint.complaintId} assigned successfully.`,
          type: 'success',
        });
        setAssignModal({ open: false, complaint: null, staffId: '' });
        fetchAll();
      } else {
        setAlert({ text: res.message || 'Assignment failed', type: 'error' });
      }
    } catch (err) {
      setAlert({
        text: err.response?.data?.message || 'Assignment failed.',
        type: 'error',
      });
    } finally {
      setAssignLoading(false);
      setTimeout(() => setAlert({ text: '', type: '' }), 4000);
    }
  };

  // Handle Admin Status Update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModal.status || !statusModal.complaint) return;

    try {
      setStatusLoading(true);
      const res = await adminService.updateComplaintStatus(
        statusModal.complaint._id,
        statusModal.status,
        statusModal.resolutionNotes
      );

      if (res.success) {
        setAlert({
          text: `Status for #${statusModal.complaint.complaintId} changed to ${statusModal.status}.`,
          type: 'success',
        });
        setStatusModal({ open: false, complaint: null, status: '', resolutionNotes: '' });
        fetchAll();
      } else {
        setAlert({ text: res.message || 'Status update failed', type: 'error' });
      }
    } catch (err) {
      setAlert({
        text: err.response?.data?.message || 'Status update failed.',
        type: 'error',
      });
    } finally {
      setStatusLoading(false);
      setTimeout(() => setAlert({ text: '', type: '' }), 4000);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteModal.complaint) return;

    try {
      setDeleteLoading(true);
      const res = await complaintService.deleteComplaint(deleteModal.complaint._id);
      if (res.success) {
        setAlert({ text: 'Complaint deleted from system.', type: 'success' });
        setComplaints((prev) => prev.filter((c) => c._id !== deleteModal.complaint._id));
      } else {
        setAlert({ text: res.message || 'Failed to delete complaint', type: 'error' });
      }
    } catch (err) {
      setAlert({
        text: err.response?.data?.message || 'Failed to delete complaint.',
        type: 'error',
      });
    } finally {
      setDeleteLoading(false);
      setDeleteModal({ open: false, complaint: null });
      setTimeout(() => setAlert({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              All Campus Complaints
            </h1>
            <p className="text-sm text-slate-500">
              Review, dispatch technicians, and manage lifecycle for all complaints
            </p>
          </div>
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

        {/* Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket ID, title..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  title="Clear search"
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700"
              >
                <option value="All">All Statuses</option>
                {COMPLAINT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700"
              >
                <option value="All">All Priorities</option>
                {COMPLAINT_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={`${sortField}_${sortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('_');
                  setSortField(field);
                  setSortDirection(dir);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700 cursor-pointer"
                title="Sort complaints"
              >
                <option value="createdAt_desc">Date: Newest First</option>
                <option value="createdAt_asc">Date: Oldest First</option>
                <option value="priority_desc">Priority: High to Low</option>
                <option value="priority_asc">Priority: Low to High</option>
                <option value="status_asc">Status: Progress Order</option>
                <option value="complaintId_desc">Ticket: Descending</option>
                <option value="complaintId_asc">Ticket: Ascending</option>
                <option value="title_asc">Title: A to Z</option>
                <option value="title_desc">Title: Z to A</option>
              </select>
            </div>

            {/* Clear Filter Button */}
            <div>
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className={`w-full px-3 py-2 text-sm font-semibold rounded-xl border transition-all inline-flex items-center justify-center gap-1.5 ${
                  hasActiveFilters
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 shadow-xs cursor-pointer'
                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
                title={hasActiveFilters ? 'Reset all active filters and sort' : 'No filters currently applied'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span>
                Total records: <strong className="text-slate-800">{complaints.length}</strong>
                {sortedComplaints.length > 0 && (
                  <span className="text-slate-400 ml-1.5">
                    (Showing {Math.min((currentPage - 1) * pageSize + 1, sortedComplaints.length)}-
                    {Math.min(currentPage * pageSize, sortedComplaints.length)} of {sortedComplaints.length}
                    {sortedComplaints.length !== complaints.length ? ` filtered` : ''})
                  </span>
                )}
              </span>
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 ml-2">
                  <span className="text-[11px] font-semibold text-slate-400">Active:</span>
                  {search && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      "{search}"
                      <button onClick={() => setSearch('')} className="hover:text-indigo-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('All')} className="hover:text-blue-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {categoryFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Category: {categoryFilter}
                      <button onClick={() => setCategoryFilter('All')} className="hover:text-amber-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {priorityFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      Priority: {priorityFilter}
                      <button onClick={() => setPriorityFilter('All')} className="hover:text-purple-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {(sortField !== 'createdAt' || sortDirection !== 'desc') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      Sort: {sortField} ({sortDirection})
                      <button
                        onClick={() => {
                          setSortField('createdAt');
                          setSortDirection('desc');
                        }}
                        className="hover:text-slate-900"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Reset all
              </button>
            )}
          </div>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <LoadingSpinner label="Loading all complaints..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints matching criteria"
            description="Adjust your filters or search keywords to view other records."
            actionLabel={hasActiveFilters ? 'Clear All Filters' : undefined}
            onAction={hasActiveFilters ? handleClearFilters : undefined}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold select-none">
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('complaintId')}
                      className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                      title="Sort by Ticket ID"
                    >
                      Ticket
                      {renderSortIcon('complaintId')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('title')}
                      className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                      title="Sort by Title"
                    >
                      Title & Reporter
                      {renderSortIcon('title')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('category')}
                      className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                      title="Sort by Category"
                    >
                      Category
                      {renderSortIcon('category')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('priority')}
                      className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                      title="Sort by Priority"
                    >
                      Priority
                      {renderSortIcon('priority')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                      title="Sort by Status"
                    >
                      Status
                      {renderSortIcon('status')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('createdAt')}
                      className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                      title="Sort by Date"
                    >
                      Date
                      {renderSortIcon('createdAt')}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-700 whitespace-nowrap">
                      #{c.complaintId}
                    </td>

                    {/* Title & Reporter */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 block truncate"
                      >
                        {c.title}
                      </Link>
                      <span className="text-xs text-slate-400">
                        By: {c.reportedBy?.name || 'Unknown'} ({c.reportedBy?.email})
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                      {c.category}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      {c.assignedTo ? (
                        <span className="inline-flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          <Wrench className="w-3 h-3" />
                          {c.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                      {formatDateOnly(c.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/complaints/${c._id}`}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Review AI Button */}
                        <button
                          onClick={() =>
                            setReviewModal({
                              open: true,
                              complaint: c,
                              category: c.category,
                              priority: c.priority,
                              department: c.department || 'Maintenance',
                              suggestedAction: c.suggestedAction || (c.aiAnalysis?.suggestedAction || ''),
                              adminRemarks: c.adminRemarks || '',
                            })
                          }
                          title="Review AI Suggestions"
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>

                        {/* Assign Staff Button */}
                        <button
                          onClick={() =>
                            setAssignModal({
                              open: true,
                              complaint: c,
                              staffId: c.assignedTo?._id || (staffMembers[0]?._id || ''),
                            })
                          }
                          title="Assign Staff"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>

                        {/* Change Status Button */}
                        <button
                          onClick={() =>
                            setStatusModal({
                              open: true,
                              complaint: c,
                              status: c.status,
                              resolutionNotes: c.resolutionNotes || '',
                            })
                          }
                          title="Change Status"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteModal({ open: true, complaint: c })}
                          title="Delete Complaint"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-5 py-3.5 bg-slate-50/75 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            {/* Left: showing count & page size selector */}
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Showing{' '}
                <strong className="text-slate-900 font-semibold">
                  {sortedComplaints.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-900 font-semibold">
                  {Math.min(currentPage * pageSize, sortedComplaints.length)}
                </strong>{' '}
                of{' '}
                <strong className="text-slate-900 font-semibold">
                  {sortedComplaints.length}
                </strong>{' '}
                complaints
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                  title="Items per page"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Right: Page navigation buttons */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 mr-2 text-[11px] hidden sm:inline">
                Page {currentPage} of {totalPages}
              </span>

              {/* First page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First Page"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Prev page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous Page"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1 px-1">
                {getPageNumbers().map((num, idx) =>
                  num === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${num}`}
                      type="button"
                      onClick={() => setCurrentPage(num)}
                      className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-semibold transition-all ${
                        currentPage === num
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
              </div>

              {/* Next page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Next Page"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last page */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Last Page"
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

        {/* 0. REVIEW AI MODAL */}
        {reviewModal.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Review AI Suggestions & Triage
                  </h3>
                </div>
                <button
                  onClick={() =>
                    setReviewModal({
                      open: false,
                      complaint: null,
                      category: '',
                      priority: '',
                      department: '',
                      suggestedAction: '',
                      adminRemarks: '',
                    })
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Reviewing Ticket: <strong>#{reviewModal.complaint?.complaintId}</strong> - "{reviewModal.complaint?.title}"
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={reviewModal.category}
                      onChange={(e) => setReviewModal({ ...reviewModal, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={reviewModal.priority}
                      onChange={(e) => setReviewModal({ ...reviewModal, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={reviewModal.department}
                    onChange={(e) => setReviewModal({ ...reviewModal, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Suggested Technician Action
                  </label>
                  <textarea
                    rows={2}
                    value={reviewModal.suggestedAction}
                    onChange={(e) => setReviewModal({ ...reviewModal, suggestedAction: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Remarks & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={reviewModal.adminRemarks}
                    onChange={(e) => setReviewModal({ ...reviewModal, adminRemarks: e.target.value })}
                    placeholder="Enter notes for staff or internal records..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewModal({
                        open: false,
                        complaint: null,
                        category: '',
                        priority: '',
                        department: '',
                        suggestedAction: '',
                        adminRemarks: '',
                      })
                    }
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {reviewLoading ? 'Saving...' : 'Save AI Modifications'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 1. ASSIGN STAFF MODAL */}
        {assignModal.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Assign Technician
                  </h3>
                </div>
                <button
                  onClick={() => setAssignModal({ open: false, complaint: null, staffId: '' })}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Ticket: <strong>#{assignModal.complaint?.complaintId}</strong> - "{assignModal.complaint?.title}"
              </p>

              <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Staff Member *
                  </label>
                  <select
                    value={assignModal.staffId}
                    onChange={(e) =>
                      setAssignModal({ ...assignModal, staffId: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  >
                    <option value="">-- Choose technician --</option>
                    {staffMembers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.department} - {s.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAssignModal({ open: false, complaint: null, staffId: '' })
                    }
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignLoading || !assignModal.staffId}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. CHANGE STATUS MODAL */}
        {statusModal.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Change Complaint Status
                  </h3>
                </div>
                <button
                  onClick={() =>
                    setStatusModal({ open: false, complaint: null, status: '', resolutionNotes: '' })
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Ticket: <strong>#{statusModal.complaint?.complaintId}</strong> - "{statusModal.complaint?.title}"
              </p>

              <form onSubmit={handleStatusSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Status *
                  </label>
                  <select
                    value={statusModal.status}
                    onChange={(e) =>
                      setStatusModal({ ...statusModal, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  >
                    {COMPLAINT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {statusModal.status === 'Resolved' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Resolution Notes
                    </label>
                    <textarea
                      rows={3}
                      value={statusModal.resolutionNotes}
                      onChange={(e) =>
                        setStatusModal({ ...statusModal, resolutionNotes: e.target.value })
                      }
                      placeholder="Explain how this problem was fixed..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setStatusModal({ open: false, complaint: null, status: '', resolutionNotes: '' })
                    }
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={statusLoading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {statusLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. DELETE CONFIRMATION MODAL */}
        <ConfirmDialog
          isOpen={deleteModal.open}
          title="Delete Complaint"
          message={`Are you sure you want to delete complaint #${deleteModal.complaint?.complaintId}? This will remove it completely from MongoDB.`}
          confirmText="Yes, Delete Ticket"
          confirmVariant="danger"
          isLoading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal({ open: false, complaint: null })}
        />
      </main>
    </div>
  );
};

export default ManageComplaints;
