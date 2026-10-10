// admin/Reports.jsx - Facility Audit & Printable Reporting View
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { complaintService } from '../services/complaintService';
import { DEPARTMENTS, COMPLAINT_STATUSES } from '../utils/constants';
import { formatDate, formatDateOnly } from '../utils/helpers';
import {
  Printer,
  Download,
  FileText,
  Filter,
  Search,
  RotateCcw,
  X,
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

const Reports = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');

  // Sorting
  const [sortField, setSortField] = useState('createdAt'); // 'createdAt' | 'complaintId' | 'title' | 'category' | 'priority' | 'location' | 'status'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasActiveFilters =
    search.trim() !== '' ||
    department !== 'All' ||
    status !== 'All' ||
    sortField !== 'createdAt' ||
    sortDirection !== 'desc';

  const handleClearFilters = () => {
    setSearch('');
    setDepartment('All');
    setStatus('All');
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

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors ml-1 inline shrink-0 print:hidden" />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-600 transition-transform ml-1 inline shrink-0 print:hidden" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600 transition-transform ml-1 inline shrink-0 print:hidden" />
    );
  };

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getComplaints({
          status,
          category: 'All',
        });
        if (res.success) {
          let list = res.data;
          if (department !== 'All') {
            list = list.filter((c) => c.department === department);
          }
          setComplaints(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [department, status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, department, status, pageSize]);

  // Filtered & Sorted
  const sortedComplaints = useMemo(() => {
    let list = [...complaints];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.complaintId && c.complaintId.toLowerCase().includes(q)) ||
          (c.title && c.title.toLowerCase().includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
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
        case 'location':
          result = (a.location || '').localeCompare(b.location || '');
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
  }, [complaints, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedComplaints.length / pageSize));

  const paginatedComplaints = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedComplaints.slice(startIndex, startIndex + pageSize);
  }, [sortedComplaints, currentPage, pageSize]);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="print:hidden">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Maintenance Audit Reports
            </h1>
            <p className="text-sm text-slate-500">
              Generate structured compliance logs and export records for facility meetings
            </p>
          </div>

          <div className="flex items-center gap-2.5 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Filter Controls (Hidden in Print) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket, title, location..."
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

            {/* Department */}
            <div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700 cursor-pointer"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {COMPLAINT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
                title="Sort report records"
              >
                <option value="createdAt_desc">Date: Newest First</option>
                <option value="createdAt_asc">Date: Oldest First</option>
                <option value="priority_desc">Priority: High to Low</option>
                <option value="priority_asc">Priority: Low to High</option>
                <option value="status_asc">Status: Progress Order</option>
                <option value="complaintId_desc">Ticket: Descending</option>
                <option value="complaintId_asc">Ticket: Ascending</option>
                <option value="title_asc">Title: A to Z</option>
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
                    {sortedComplaints.length !== complaints.length ? ' filtered' : ''})
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
                  {department !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Dept: {department}
                      <button onClick={() => setDepartment('All')} className="hover:text-blue-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {status !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Status: {status}
                      <button onClick={() => setStatus('All')} className="hover:text-emerald-900">
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

        {/* Printable Document Sheet */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Printable Header */}
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                FixIt AI - Official Facility Incident Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generated: {formatDate(new Date().toISOString())} | Scope: {department} / {status}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded">
                Records: {sortedComplaints.length}
              </span>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner label="Compiling report rows..." />
          ) : sortedComplaints.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12">
              No complaint tickets match the selected report parameters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-700 uppercase font-bold text-[10px] select-none">
                    <th className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleSort('complaintId')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[10px]"
                        title="Sort by Ticket ID"
                      >
                        Ticket ID
                        {renderSortIcon('complaintId')}
                      </button>
                    </th>
                    <th className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleSort('title')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[10px]"
                        title="Sort by Problem Title"
                      >
                        Title & Problem
                        {renderSortIcon('title')}
                      </button>
                    </th>
                    <th className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleSort('category')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[10px]"
                        title="Sort by Category"
                      >
                        Category
                        {renderSortIcon('category')}
                      </button>
                    </th>
                    <th className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleSort('priority')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[10px]"
                        title="Sort by Priority"
                      >
                        Priority
                        {renderSortIcon('priority')}
                      </button>
                    </th>
                    <th className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleSort('location')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[10px]"
                        title="Sort by Location"
                      >
                        Location
                        {renderSortIcon('location')}
                      </button>
                    </th>
                    <th className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleSort('status')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[10px]"
                        title="Sort by Status"
                      >
                        Status
                        {renderSortIcon('status')}
                      </button>
                    </th>
                    <th className="py-2.5 px-3">Assigned Staff</th>
                    <th className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleSort('createdAt')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[10px]"
                        title="Sort by Logged Date"
                      >
                        Logged Date
                        {renderSortIcon('createdAt')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedComplaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        #{c.complaintId}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs font-medium text-slate-800">
                        {c.title}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">{c.category}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} showIcon={false} />
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{c.location}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {c.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {formatDateOnly(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls (Hidden in Print) */}
          {sortedComplaints.length > 0 && (
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 print:hidden">
              {/* Left: count & page size select */}
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
                  records
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
                    title="Records per page"
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
          )}

          {/* Report Footer */}
          <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
            <p>Certified Campus Facility Department Audit Sheet</p>
            <p>
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
