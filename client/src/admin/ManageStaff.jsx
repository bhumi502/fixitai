// admin/ManageStaff.jsx - Staff Directory & Technician CRUD Management
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { staffService } from '../services/staffService';
import { DEPARTMENTS, STAFF_STATUSES } from '../utils/constants';
import {
  Briefcase,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Wrench,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const STATUS_ORDER = {
  Available: 1,
  Busy: 2,
  Inactive: 3,
};

const ManageStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting
  const [sortField, setSortField] = useState('createdAt'); // 'createdAt' | 'name' | 'email' | 'department' | 'specialization' | 'status'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasActiveFilters =
    search.trim() !== '' ||
    departmentFilter !== 'All' ||
    statusFilter !== 'All' ||
    sortField !== 'createdAt' ||
    sortDirection !== 'desc';

  const handleClearFilters = () => {
    setSearch('');
    setDepartmentFilter('All');
    setStatusFilter('All');
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
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors ml-1 inline shrink-0" />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 transition-transform ml-1 inline shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 transition-transform ml-1 inline shrink-0" />
    );
  };

  // Modal State (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Maintenance',
    specialization: '',
    status: 'Available',
    password: '',
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Feedback Alert
  const [alert, setAlert] = useState({ text: '', type: '' });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await staffService.getStaff({
        search: search || undefined,
        department: departmentFilter,
        status: statusFilter,
      });
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchStaff();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, departmentFilter, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, departmentFilter, statusFilter, pageSize]);

  // Sort staff
  const sortedStaff = useMemo(() => {
    return [...staffList].sort((a, b) => {
      let result = 0;
      switch (sortField) {
        case 'name':
          result = (a.name || '').localeCompare(b.name || '');
          break;
        case 'email':
          result = (a.email || '').localeCompare(b.email || '');
          break;
        case 'department':
          result = (a.department || '').localeCompare(b.department || '');
          break;
        case 'specialization':
          result = (a.specialization || '').localeCompare(b.specialization || '');
          break;
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
  }, [staffList, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedStaff.length / pageSize));

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedStaff.slice(startIndex, startIndex + pageSize);
  }, [sortedStaff, currentPage, pageSize]);

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

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'Maintenance',
      specialization: '',
      status: 'Available',
      password: 'Password123!',
    });
    setModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      specialization: staff.specialization || '',
      status: staff.status,
      password: '',
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (editingStaff) {
        // Update
        const res = await staffService.updateStaff(editingStaff._id, formData);
        if (res.success) {
          setAlert({ text: `Staff member "${formData.name}" updated successfully.`, type: 'success' });
          setModalOpen(false);
          fetchStaff();
        } else {
          setAlert({ text: res.message || 'Update failed', type: 'error' });
        }
      } else {
        // Create
        const res = await staffService.createStaff(formData);
        if (res.success) {
          setAlert({
            text: `Staff member "${formData.name}" created with login enabled.`,
            type: 'success',
          });
          setModalOpen(false);
          fetchStaff();
        } else {
          setAlert({ text: res.message || 'Creation failed', type: 'error' });
        }
      }
    } catch (err) {
      setAlert({
        text: err.response?.data?.message || 'Error occurred while saving staff details.',
        type: 'error',
      });
    } finally {
      setModalLoading(false);
      setTimeout(() => setAlert({ text: '', type: '' }), 4000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      const res = await staffService.deleteStaff(deleteTarget._id);
      if (res.success) {
        setAlert({ text: 'Staff member removed successfully.', type: 'success' });
        setStaffList((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      } else {
        setAlert({ text: res.message || 'Failed to remove staff', type: 'error' });
      }
    } catch (err) {
      setAlert({
        text: err.response?.data?.message || 'Error occurred while removing staff.',
        type: 'error',
      });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
      setTimeout(() => setAlert({ text: '', type: '' }), 4000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Busy':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Inactive':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Staff & Technicians
            </h1>
            <p className="text-sm text-slate-500">
              Manage departmental technician directory, specializations, and assignment availability
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Add Staff Member
          </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, skill..."
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
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700 cursor-pointer"
              >
                <option value="All">All Availability</option>
                {STAFF_STATUSES.map((s) => (
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
                title="Sort staff personnel"
              >
                <option value="createdAt_desc">Added: Newest First</option>
                <option value="createdAt_asc">Added: Oldest First</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="department_asc">Department: A to Z</option>
                <option value="specialization_asc">Skill: A to Z</option>
                <option value="status_asc">Availability: Available First</option>
                <option value="status_desc">Availability: Inactive First</option>
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
                Total active technicians: <strong className="text-slate-800">{staffList.length}</strong>
                {sortedStaff.length > 0 && (
                  <span className="text-slate-400 ml-1.5">
                    (Showing {Math.min((currentPage - 1) * pageSize + 1, sortedStaff.length)}-
                    {Math.min(currentPage * pageSize, sortedStaff.length)} of {sortedStaff.length}
                    {sortedStaff.length !== staffList.length ? ' filtered' : ''})
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
                  {departmentFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Dept: {departmentFilter}
                      <button onClick={() => setDepartmentFilter('All')} className="hover:text-blue-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('All')} className="hover:text-emerald-900">
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

        {/* Staff Table */}
        {loading ? (
          <LoadingSpinner label="Loading staff personnel..." />
        ) : staffList.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No staff members found"
            description="Create your first facility staff profile to start assigning incoming complaints."
            actionLabel={hasActiveFilters ? 'Clear All Filters' : '+ Add New Staff'}
            onAction={hasActiveFilters ? handleClearFilters : openAddModal}
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
                        onClick={() => handleSort('name')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                        title="Sort by Name"
                      >
                        Staff Member
                        {renderSortIcon('name')}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('email')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                        title="Sort by Contact Email"
                      >
                        Contact Info
                        {renderSortIcon('email')}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('department')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                        title="Sort by Department"
                      >
                        Department
                        {renderSortIcon('department')}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('specialization')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                        title="Sort by Specialization"
                      >
                        Specialization
                        {renderSortIcon('specialization')}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('status')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                        title="Sort by Availability"
                      >
                        Availability
                        {renderSortIcon('status')}
                      </button>
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStaff.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{s.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{s.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-medium text-slate-800">
                        {s.department}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {s.specialization || 'General Maintenance'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                            s.status
                          )}`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(s)}
                            title="Edit Staff Member"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            title="Delete Staff Member"
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
              {/* Left: count & page size select */}
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  Showing{' '}
                  <strong className="text-slate-900 font-semibold">
                    {sortedStaff.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-slate-900 font-semibold">
                    {Math.min(currentPage * pageSize, sortedStaff.length)}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-slate-900 font-semibold">
                    {sortedStaff.length}
                  </strong>{' '}
                  technicians
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
                    title="Technicians per page"
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

        {/* ADD / EDIT MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    {editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Raj Patel"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="raj.patel@campus.edu"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 11111"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Availability Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    >
                      {STAFF_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value })
                    }
                    placeholder="e.g. High-voltage wiring, HVAC diagnosis, Sanitary valves"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                {!editingStaff && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Initial Staff Password (for login)
                    </label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Password123!"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Technician can log in using this password to view their assigned jobs.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {modalLoading
                      ? 'Saving...'
                      : editingStaff
                      ? 'Update Staff'
                      : 'Create Staff Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION */}
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete Staff Member"
          message={`Are you sure you want to remove ${deleteTarget?.name} from the technician directory?`}
          confirmText="Yes, Remove Staff"
          confirmVariant="danger"
          isLoading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      </main>
    </div>
  );
};

export default ManageStaff;
