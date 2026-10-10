// components/LoadingSpinner.jsx - Reusable loading indicator
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading...', size = 'md', fullPage = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className={`${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} animate-spin text-indigo-600`} />
      {label && <p className={`text-slate-500 font-medium ${sizeClasses[size].split(' ')[2]}`}>{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
