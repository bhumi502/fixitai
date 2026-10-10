// components/ComplaintTable.jsx - Professional Table Layout for Complaints
import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Eye, Edit3, Trash2, MapPin } from 'lucide-react';
import { formatDateOnly, truncateText } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const ComplaintTable = ({ complaints = [], onDelete, onAssign, onStatusChange }) => {
  const { user, isAdmin, isStaff } = useAuth();

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
            <th className="py-3.5 px-4">ID</th>
            <th className="py-3.5 px-4">Title & Details</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Priority</th>
            <th className="py-3.5 px-4">Location</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Reported</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {complaints.map((item) => {
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
    </div>
  );
};

export default ComplaintTable;
