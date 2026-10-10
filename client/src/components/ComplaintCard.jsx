// components/ComplaintCard.jsx - Card representation of a single complaint
import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { MapPin, Calendar, Eye, Edit3, Trash2, Tag } from 'lucide-react';
import { formatDateOnly, truncateText } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const ComplaintCard = ({ complaint, onDelete }) => {
  const { user, isAdmin } = useAuth();
  const canEdit = (complaint.status === 'Pending' && complaint.reportedBy?._id === user?._id) || isAdmin;
  const canDelete = (complaint.status === 'Pending' && complaint.reportedBy?._id === user?._id) || isAdmin;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            #{complaint.complaintId}
          </span>
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Complaint Title */}
        <h3 className="font-semibold text-base text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
          {complaint.title}
        </h3>

        {/* Complaint Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {truncateText(complaint.description, 110)}
        </p>

        {/* Meta Info */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-medium text-slate-700">{complaint.category}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{complaint.department}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{complaint.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formatDateOnly(complaint.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/complaints/${complaint._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1.5 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </Link>

        <div className="flex items-center gap-1">
          {canEdit && (
            <Link
              to={`/complaints/edit/${complaint._id}`}
              title="Edit Complaint"
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
          )}

          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(complaint)}
              title="Delete Complaint"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
