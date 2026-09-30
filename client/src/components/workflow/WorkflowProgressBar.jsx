import React from 'react';
import { Check, Clock, AlertCircle, XCircle } from 'lucide-react';

const PROGRESS_STAGES = [
  { key: 'CREATED', label: 'Submitted' },
  { key: 'AI_PROCESSING', label: 'AI Analyzed' },
  { key: 'PENDING_APPROVAL', label: 'Review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'COMPLETED', label: 'Completed' }
];

export const WorkflowProgressBar = ({ currentState = 'CREATED' }) => {
  const getStageIndex = (state) => {
    switch (state) {
      case 'CREATED': return 0;
      case 'AI_PROCESSING':
      case 'CLASSIFIED': return 1;
      case 'PENDING_INFORMATION':
      case 'PENDING_APPROVAL':
      case 'ESCALATED': return 2;
      case 'APPROVED':
      case 'IN_PROGRESS': return 3;
      case 'COMPLETED': return 4;
      case 'REJECTED':
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentState);
  const isTerminated = currentState === 'REJECTED' || currentState === 'CANCELLED';

  if (isTerminated) {
    return (
      <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
        <XCircle className="w-5 h-5 flex-shrink-0" />
        <span>Workflow has concluded with state: <strong>{currentState}</strong></span>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 w-full z-0 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 z-0 transition-all duration-500 rounded-full"
          style={{ width: `${(Math.max(0, currentIndex) / (PROGRESS_STAGES.length - 1)) * 100}%` }}
        />

        {PROGRESS_STAGES.map((stage, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isPassed
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-md shadow-indigo-500/30'
                    : 'bg-slate-900 text-slate-500 border border-slate-700'
                }`}
              >
                {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium whitespace-nowrap ${
                  isCurrent ? 'text-indigo-400 font-semibold' : isPassed ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
