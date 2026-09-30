import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { analyticsApi } from '../api/analyticsApi.js';
import { requestApi } from '../api/requestApi.js';
import { workflowApi } from '../api/workflowApi.js';
import { StatCard } from '../components/common/StatCard.jsx';
import { StatusBadge, PriorityBadge } from '../components/common/Badge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import {
  FileText,
  Clock,
  CheckCircle2,
  CheckSquare,
  AlertTriangle,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  Play
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export const DashboardPage = () => {
  const { user, isManager } = useAuth();
  const [data, setData] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slaRunning, setSlaRunning] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, requestsRes] = await Promise.all([
        analyticsApi.getDashboard(),
        requestApi.getAll({ limit: 5 })
      ]);

      if (analyticsRes.data) {
        setData(analyticsRes.data);
      }
      if (requestsRes.data?.requests) {
        setRecentRequests(requestsRes.data.requests);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunSlaCheck = async () => {
    try {
      setSlaRunning(true);
      await workflowApi.runSlaCheck();
      await fetchDashboardData();
    } catch (err) {
      console.error('Error running SLA watcher:', err);
    } finally {
      setSlaRunning(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-slate-900 rounded-lg animate-pulse" />
          <div className="h-9 w-32 bg-slate-900 rounded-lg animate-pulse" />
        </div>
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  const cards = data?.cards || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-8">
      {/* Header with Welcome and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time telemetry and workflow orchestration status across all departments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isManager && (
            <button
              onClick={handleRunSlaCheck}
              disabled={slaRunning}
              className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${slaRunning ? 'animate-spin' : ''}`} />
              <span>{slaRunning ? 'Evaluating...' : 'Run SLA Watcher'}</span>
            </button>
          )}

          <Link
            to="/requests/new"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Request</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={cards.totalRequests || 0}
          icon={FileText}
          subtitle="All lifecycle stages"
          color="indigo"
        />
        <StatCard
          title="Pending Approvals"
          value={cards.pendingApprovals || 0}
          icon={Clock}
          subtitle="Human review queue"
          color="amber"
          change={cards.pendingApprovals > 0 ? 'Requires Action' : 'All Clear'}
          trend={cards.pendingApprovals > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Completed Workflows"
          value={cards.completedWorkflows || 0}
          icon={CheckCircle2}
          subtitle="Processed & archived"
          color="emerald"
        />
        <StatCard
          title="Automation Rate"
          value={`${cards.automationRate || 0}%`}
          icon={Zap}
          subtitle={`${cards.estimatedHoursSaved || 0}h estimated saved`}
          color="cyan"
          change="AI Accelerated"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Requests by Category
            </h3>
            <span className="text-[11px] text-slate-500">Autonomous Classification</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            {charts.categoryDistribution && charts.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {charts.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No category telemetry available yet</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800 text-[11px]">
            {charts.categoryDistribution?.map((cat, idx) => (
              <div key={cat.category} className="flex items-center gap-2 text-slate-300 capitalize">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{cat.category}: <strong>{cat.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Automation vs Manual Breakdown */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Straight-Through Automation vs Manual Review
            </h3>
            <span className="text-[11px] text-slate-500">Policy Evaluation</span>
          </div>

          <div className="h-64">
            {charts.automationBreakdown && charts.automationBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.automationBreakdown}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500 py-16 text-center">No automation telemetry available</p>
            )}
          </div>

          <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Average automated processing latency:</span>
            <strong className="text-emerald-400 font-mono">{cards.averageProcessingTime || '3.5 min'}</strong>
          </div>
        </div>
      </div>

      {/* Recent Requests Feed */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Recent Automated Workflows
            </h3>
            <p className="text-xs text-slate-400">Latest pipeline executions and state transitions</p>
          </div>
          <Link
            to="/requests"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Tracking ID</th>
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No requests submitted yet. Create your first request!
                  </td>
                </tr>
              ) : (
                recentRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-3 font-mono text-indigo-400 font-medium">
                      {req.trackingNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-white max-w-xs truncate">
                      {req.title}
                    </td>
                    <td className="py-3 px-3 uppercase text-[11px] font-mono text-slate-400">
                      {req.category}
                    </td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-200">
                      {req.amount ? `${req.currency} ${req.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/requests/${req._id}`}
                        className="text-xs text-indigo-400 hover:text-white px-2.5 py-1 rounded bg-slate-900 hover:bg-indigo-600 transition"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
