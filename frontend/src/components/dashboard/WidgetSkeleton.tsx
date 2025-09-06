import React from 'react';

interface WidgetSkeletonProps {
  title?: string;
  count?: number;
  className?: string;
}

const WidgetSkeleton: React.FC<WidgetSkeletonProps> = ({ 
  title = "Widget", 
  count = 3, 
  className = "" 
}) => {
  return (
    <div className={`bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
      </div>
      
      {/* Items */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WidgetSkeleton;
