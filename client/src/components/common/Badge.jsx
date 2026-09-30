import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PENDING_APPROVAL':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'AI_PROCESSING':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CLASSIFIED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'PENDING_INFORMATION':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'ESCALATED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse font-semibold';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'Pending Approval';
      case 'AI_PROCESSING':
        return 'AI Ingesting...';
      case 'PENDING_INFORMATION':
        return 'Info Requested';
      case 'IN_PROGRESS':
        return 'In Progress';
      default:
        return status ? status.replace(/_/g, ' ') : 'Unknown';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {getLabel()}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getStyles = () => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'LOW':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider border ${getStyles()}`}>
      {priority}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const getLabel = () => {
    switch (category) {
      case 'leave': return 'Leave & PTO';
      case 'expense': return 'Expense Reimbursement';
      case 'purchase': return 'Procurement';
      case 'it_support': return 'IT Support';
      case 'administrative': return 'Admin & Facilities';
      default: return category ? category.replace(/_/g, ' ') : 'General';
    }
  };

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {getLabel()}
    </span>
  );
};
