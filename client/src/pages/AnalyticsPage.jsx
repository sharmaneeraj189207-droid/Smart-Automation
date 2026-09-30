import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/analyticsApi.js';
import { StatCard } from '../components/common/StatCard.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import {
  TrendingUp,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calculator,
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getAutomation();
        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('[AnalyticsPage] Error loading metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  const formula = data?.formulaExplanation || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Automation Telemetry & ROI Analytics
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            AUDIT-READY FORMULAS
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Operational efficiency benchmarks, throughput improvements, and executive time savings calculation
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workflows"
          value={data?.totalWorkflows || 0}
          icon={Layers}
          subtitle={`${data?.automatedWorkflows || 0} automated / ${data?.manualWorkflows || 0} manual`}
          color="indigo"
        />
        <StatCard
          title="Automation Rate"
          value={`${data?.automationPercentage || 0}%`}
          icon={Zap}
          subtitle="Straight-through processing"
          color="emerald"
          change="AI Accelerated"
          trend="up"
        />
        <StatCard
          title="Estimated Hours Saved"
          value={`${data?.estimatedHoursSaved || 0} hrs`}
          icon={Clock}
          subtitle="Compared to manual baseline"
          color="cyan"
          change="High ROI"
          trend="up"
        />
        <StatCard
          title="Efficiency Improvement"
          value={data?.estimatedOperationalEfficiencyImprovement || '90%'}
          icon={TrendingUp}
          subtitle="Cycle time compression"
          color="purple"
        />
      </div>

      {/* Transparent Formula Breakdown Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Calculator className="w-4 h-4" />
          <span>Transparent Operational Time Savings Formula</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Manual Enterprise Baseline</span>
            <span className="text-xl font-bold font-mono text-white">30 Minutes</span>
            <p className="text-[11px] text-slate-500 mt-1">Average handling time for manual review, entry, and email back-and-forth.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">FlowPilot Automated Latency</span>
            <span className="text-xl font-bold font-mono text-emerald-400">3.5 Minutes</span>
            <p className="text-[11px] text-slate-500 mt-1">Autonomous classification, policy checks, and task generation.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Net Gain Per Workflow</span>
            <span className="text-xl font-bold font-mono text-indigo-400">26.5 Minutes</span>
            <p className="text-[11px] text-slate-500 mt-1">Saved on every straight-through automated execution.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
          <span className="text-xs font-mono font-semibold text-indigo-300 block mb-1">
            Active Mathematical Formula (Labeled Estimates):
          </span>
          <code className="text-xs font-mono text-white block bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            {formula.timeSavedFormula || 'timeSaved = (automatedWorkflows) × (manualAverageTime - automatedAverageTime)'}
          </code>
        </div>
      </div>

      {/* Workflow Outcomes Breakdown */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">
          Lifecycle Outcome Distribution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-emerald-400 font-semibold block">Completed Workflows</span>
              <span className="text-2xl font-bold text-white font-mono mt-1 block">
                {data?.completedWorkflows || 0}
              </span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
          </div>

          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
            <div>
              <span className="text-rose-400 font-semibold block">Rejected Submissions</span>
              <span className="text-2xl font-bold text-white font-mono mt-1 block">
                {data?.rejectedWorkflows || 0}
              </span>
            </div>
            <XCircle className="w-8 h-8 text-rose-500/40" />
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-amber-400 font-semibold block">SLA Escalations</span>
              <span className="text-2xl font-bold text-white font-mono mt-1 block">
                {data?.escalatedWorkflows || 0}
              </span>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
