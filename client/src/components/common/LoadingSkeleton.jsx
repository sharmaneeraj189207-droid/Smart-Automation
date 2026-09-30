import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={
            type === 'table'
              ? 'h-12 bg-slate-900/60 rounded-lg border border-slate-800'
              : 'h-24 bg-slate-900/60 rounded-xl border border-slate-800 p-4'
          }
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
