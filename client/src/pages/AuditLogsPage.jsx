import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi.js';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { History, Search, Shield, Filter, Database, Calendar } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;

      const res = await adminApi.getAuditLogs(params);
      if (res.data?.logs) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('[AuditLogsPage] Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadge = (action) => {
    if (action.includes('APPROVED') || action.includes('COMPLETED')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (action.includes('REJECTED') || action.includes('CANCELLED')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (action.includes('ESCALATED')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (action.includes('AI_') || action.includes('AUTOMATION')) {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Compliance & Audit Trail
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            IMMUTABLE
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete, tamper-evident log of system mutations, AI actions, approvals, and user transactions
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, actor name, or entity ID..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Actions</option>
            <option value="REQUEST_CREATED">REQUEST_CREATED</option>
            <option value="POLICY_AUTO_APPROVAL">POLICY_AUTO_APPROVAL</option>
            <option value="REQUEST_APPROVED">REQUEST_APPROVED</option>
            <option value="REQUEST_REJECTED">REQUEST_REJECTED</option>
            <option value="TASK_CREATED">TASK_CREATED</option>
            <option value="TASK_COMPLETED">TASK_COMPLETED</option>
            <option value="WORKFLOW_ESCALATED">WORKFLOW_ESCALATED</option>
          </select>

          <button
            onClick={fetchLogs}
            className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No audit entries found"
          description="Try broadening your search query."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      {log.actorName || log.actor?.name || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {log.actorRole || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4 text-indigo-400">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[120px]">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate font-mono text-[10px]">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
