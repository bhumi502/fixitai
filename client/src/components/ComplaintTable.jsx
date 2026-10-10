// components/ComplaintTable.jsx - Professional Table Layout for Complaints
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Eye, Edit3, Trash2, MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDateOnly, truncateText } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const ComplaintTable = ({ complaints = [], onDelete, onAssign, onStatusChange }) => {
  const { user, isAdmin, isStaff } = useAuth();
  
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
  const paginatedComplaints = sortedComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider select-none">
            <th className="py-3.5 px-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('complaintId')}>
              <div className="flex items-center gap-1 whitespace-nowrap">ID {getSortIcon('complaintId')}</div>
            </th>
            <th className="py-3.5 px-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
              <div className="flex items-center gap-1 whitespace-nowrap">Title & Details {getSortIcon('title')}</div>
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
              <div className="flex items-center gap-1 whitespace-nowrap">Reported {getSortIcon('createdAt')}</div>
            </th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {paginatedComplaints.map((item) => {
            const canEdit =
              (item.status === 'Pending' && item.reportedBy?._id === user?._id) ||
              isAdmin;
            const canDelete =
              (item.status === 'Pending' && item.reportedBy?._id === user?._id) ||
              isAdmin;

            return (
              <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                {/* ID */}
                <td className="py-3.5 px-4 font-mono font-semibold text-xs text-indigo-700 whitespace-nowrap">
                  #{item.complaintId}
                </td>

                {/* Title */}
                <td className="py-3.5 px-4 max-w-xs">
                  <Link
                    to={`/complaints/${item._id}`}
                    className="font-medium text-slate-900 hover:text-indigo-600 block transition-colors leading-snug"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {truncateText(item.description, 60)}
                  </p>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                </td>

                {/* Priority */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <PriorityBadge priority={item.priority} />
                </td>

                {/* Location */}
                <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[140px]">{item.location}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                  {formatDateOnly(item.createdAt)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/complaints/${item._id}`}
                      title="View Details"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {canEdit && (
                      <Link
                        to={`/complaints/edit/${item._id}`}
                        title="Edit Complaint"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    )}

                    {canDelete && onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        title="Delete Complaint"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
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
  );
};

export default ComplaintTable;
