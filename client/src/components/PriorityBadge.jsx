// components/PriorityBadge.jsx - Color-coded complaint priority badge
import React from 'react';
import { getPriorityBadgeStyle } from '../utils/helpers';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

const PriorityBadge = ({ priority = 'Medium', showIcon = true, className = '' }) => {
  const style = getPriorityBadgeStyle(priority);

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (priority) {
      case 'Critical':
        return <AlertCircle className="w-3 h-3 text-red-600 animate-pulse" />;
      case 'High':
        return <ArrowUp className="w-3 h-3 text-orange-600" />;
      case 'Medium':
        return <AlertTriangle className="w-3 h-3 text-amber-600" />;
      case 'Low':
        return <ArrowDown className="w-3 h-3 text-slate-500" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {renderIcon()}
      {priority}
    </span>
  );
};

export default PriorityBadge;
