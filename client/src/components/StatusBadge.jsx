// components/StatusBadge.jsx - Color-coded complaint status badge
import React from 'react';
import { getStatusBadgeStyle } from '../utils/helpers';

const StatusBadge = ({ status = 'Pending', className = '' }) => {
  const style = getStatusBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
