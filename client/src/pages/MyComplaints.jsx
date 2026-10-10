// pages/MyComplaints.jsx - User's Complaint Directory
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintTable from '../components/ComplaintTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { complaintService } from '../services/complaintService';
import { categoryService } from '../services/categoryService';
import { COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '../utils/constants';
import {
  PlusCircle,
  Search,
  Filter,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'card' | 'table'

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Deletion modal state
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaints({
        search: search || undefined,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
      });
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchComplaints();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, categoryFilter, priorityFilter]);

  const handleDeleteConfirm = async () => {
    if (!complaintToDelete) return;
    try {
      setIsDeleting(true);
      const res = await complaintService.deleteComplaint(complaintToDelete._id);
      if (res.success) {
        setMessage({ text: 'Complaint deleted successfully.', type: 'success' });
        setComplaints((prev) => prev.filter((c) => c._id !== complaintToDelete._id));
      } else {
        setMessage({ text: res.message || 'Failed to delete complaint', type: 'error' });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Error occurred while deleting complaint.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
      setComplaintToDelete(null);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setPriorityFilter('All');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Complaints
            </h1>
            <p className="text-sm text-slate-500">
              Manage and track all facility maintenance tickets submitted by your account
            </p>
          </div>

          <Link
            to="/complaints/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Report Problem
          </Link>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`p-4 rounded-2xl text-sm flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, title, or location..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="All">All Statuses</option>
                {COMPLAINT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="All">All Priorities</option>
                {COMPLAINT_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls Bar: Clear Filters + View switch */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <button
              onClick={handleClearFilters}
              className="text-indigo-600 hover:text-indigo-700 font-semibold underline decoration-transparent hover:decoration-indigo-700 transition-all"
            >
              Clear Filters
            </button>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'card' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-500'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Listing */}
        {loading ? (
          <LoadingSpinner label="Loading your complaints..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints found"
            description="You don't have any complaints matching your current filters."
            actionLabel="+ Report a Problem"
            actionTo="/complaints/create"
          />
        ) : viewMode === 'table' ? (
          <ComplaintTable
            complaints={complaints}
            onDelete={(complaint) => setComplaintToDelete(complaint)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((c) => (
              <ComplaintCard
                key={c._id}
                complaint={c}
                onDelete={(complaint) => setComplaintToDelete(complaint)}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!complaintToDelete}
          title="Delete Complaint"
          message={`Are you sure you want to delete complaint #${complaintToDelete?.complaintId} ("${complaintToDelete?.title}")? This action cannot be reversed.`}
          confirmText="Yes, Delete"
          confirmVariant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setComplaintToDelete(null)}
        />
      </main>
    </div>
  );
};

export default MyComplaints;
