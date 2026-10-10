// admin/ManageUsers.jsx - User Directory & Account Status Control
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { adminService } from '../services/adminService';
import { formatDateOnly } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  CheckCircle2,
  AlertCircle,
  UserCheck,
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

const ROLE_ORDER = {
  admin: 3,
  staff: 2,
  user: 1,
};

const STATUS_ORDER = {
  active: 1,
  blocked: 2,
};

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting
  const [sortField, setSortField] = useState('createdAt'); // 'createdAt' | 'name' | 'email' | 'phone' | 'role' | 'status'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toggle status dialog state
  const [targetUser, setTargetUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ text: '', type: '' });

  const hasActiveFilters =
    search.trim() !== '' ||
    roleFilter !== 'All' ||
    statusFilter !== 'All' ||
    sortField !== 'createdAt' ||
    sortDirection !== 'desc';

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('All');
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        search: search || undefined,
        role: roleFilter,
        status: statusFilter,
      });
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, roleFilter, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, pageSize]);

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let result = 0;
      switch (sortField) {
        case 'name':
          result = (a.name || '').localeCompare(b.name || '');
          break;
        case 'email':
          result = (a.email || '').localeCompare(b.email || '');
          break;
        case 'phone':
          result = (a.phone || '').localeCompare(b.phone || '');
          break;
        case 'role': {
          const rA = ROLE_ORDER[a.role] || 0;
          const rB = ROLE_ORDER[b.role] || 0;
          result = rA - rB;
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
  }, [users, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

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

  const handleStatusToggle = async () => {
    if (!targetUser) return;
    try {
      setUpdating(true);
      const newStatus = targetUser.status === 'active' ? 'blocked' : 'active';
      const res = await adminService.updateUserStatus(targetUser._id, newStatus);
      if (res.success) {
        setAlert({
          text: `User ${targetUser.name} is now ${newStatus}.`,
          type: 'success',
        });
        setUsers((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, status: newStatus } : u))
        );
      } else {
        setAlert({ text: res.message || 'Status change failed', type: 'error' });
      }
    } catch (err) {
      setAlert({
        text: err.response?.data?.message || 'Failed to update user status.',
        type: 'error',
      });
    } finally {
      setUpdating(false);
      setTargetUser(null);
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
              User Management
            </h1>
            <p className="text-sm text-slate-500">
              Manage registered campus users, staff roles, and activate or suspend accounts
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone..."
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

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700 cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
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
                title="Sort users"
              >
                <option value="createdAt_desc">Joined: Newest First</option>
                <option value="createdAt_asc">Joined: Oldest First</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="email_asc">Email: A to Z</option>
                <option value="role_desc">Role: Admin First</option>
                <option value="role_asc">Role: User First</option>
                <option value="status_asc">Status: Active First</option>
                <option value="status_desc">Status: Blocked First</option>
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
                Total records: <strong className="text-slate-800">{users.length}</strong>
                {sortedUsers.length > 0 && (
                  <span className="text-slate-400 ml-1.5">
                    (Showing {Math.min((currentPage - 1) * pageSize + 1, sortedUsers.length)}-
                    {Math.min(currentPage * pageSize, sortedUsers.length)} of {sortedUsers.length}
                    {sortedUsers.length !== users.length ? ' filtered' : ''})
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
                  {roleFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      Role: {roleFilter}
                      <button onClick={() => setRoleFilter('All')} className="hover:text-purple-900">
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

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner label="Loading user directory..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="No user accounts match your search or filter options."
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
                        onClick={() => handleSort('name')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                        title="Sort by Name"
                      >
                        Name & Email
                        {renderSortIcon('name')}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('phone')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                        title="Sort by Phone"
                      >
                        Phone
                        {renderSortIcon('phone')}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('role')}
                        className="group inline-flex items-center gap-1 hover:text-indigo-600 transition-colors uppercase font-bold text-[11px]"
                        title="Sort by Role"
                      >
                        Role
                        {renderSortIcon('role')}
                      </button>
                    </th>
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
                        title="Sort by Joined Date"
                      >
                        Joined Date
                        {renderSortIcon('createdAt')}
                      </button>
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {u.phone || <span className="text-slate-300 italic">None</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : u.role === 'staff'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              u.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {formatDateOnly(u.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => setTargetUser(u)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                u.status === 'active'
                                  ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                                  : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                              }`}
                            >
                              {u.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
                    {sortedUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-slate-900 font-semibold">
                    {Math.min(currentPage * pageSize, sortedUsers.length)}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-slate-900 font-semibold">
                    {sortedUsers.length}
                  </strong>{' '}
                  users
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
                    title="Users per page"
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

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!targetUser}
          title={
            targetUser?.status === 'active' ? 'Deactivate User Account' : 'Activate User Account'
          }
          message={`Are you sure you want to ${
            targetUser?.status === 'active' ? 'block access for' : 're-activate'
          } ${targetUser?.name} (${targetUser?.email})?`}
          confirmText={targetUser?.status === 'active' ? 'Deactivate' : 'Activate'}
          confirmVariant={targetUser?.status === 'active' ? 'danger' : 'primary'}
          isLoading={updating}
          onConfirm={handleStatusToggle}
          onClose={() => setTargetUser(null)}
        />
      </main>
    </div>
  );
};

export default ManageUsers;
