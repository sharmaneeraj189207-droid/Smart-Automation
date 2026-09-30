import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../api/requestApi.js';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Search, Plus, Filter, ArrowUpDown, ChevronRight, FileText } from 'lucide-react';

export const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;

      const res = await requestApi.getAll(params);
      if (res.data?.requests) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('[RequestsPage] Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const statusTabs = [
    { label: 'All Requests', value: '' },
    { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Escalated', value: 'ESCALATED' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Workflow Requests
          </h1>
          <p className="text-xs text-slate-400">
            Search, filter, and inspect incoming operational requests and automation states
          </p>
        </div>

        <Link
          to="/requests/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              statusFilter === tab.value
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking number (e.g. FP-2026-1024), title, or details..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Categories</option>
            <option value="expense">Expense</option>
            <option value="leave">Leave / PTO</option>
            <option value="purchase">Purchase</option>
            <option value="it_support">IT Support</option>
            <option value="administrative">Administrative</option>
          </select>

          <button
            onClick={fetchRequests}
            className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No requests match your filter"
          description="Try adjusting your search criteria or create a new request."
          actionLabel="Create Request"
          onAction={() => window.location.href = '/requests/new'}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Request Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {requests.map((req) => (
                  <tr
                    key={req._id}
                    className="hover:bg-slate-900/50 transition cursor-pointer group"
                    onClick={() => window.location.href = `/requests/${req._id}`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-indigo-400">
                      {req.trackingNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white group-hover:text-indigo-300 transition block max-w-sm truncate">
                        {req.title}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        By {req.creator?.name || 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <CategoryBadge category={req.category} />
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {req.amount ? `${req.currency} ${req.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/requests/${req._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
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
