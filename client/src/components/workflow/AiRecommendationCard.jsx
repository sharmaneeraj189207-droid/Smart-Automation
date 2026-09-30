import React from 'react';
import { Sparkles, ShieldCheck, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

export const AiRecommendationCard = ({ recommendation, classification, priorityAnalysis }) => {
  if (!recommendation) return null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 shadow-lg relative overflow-hidden">
      <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
        <Sparkles className="w-4 h-4" />
        <span>FlowPilot AI Strategic Recommendation</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight capitalize">
            {recommendation.recommendedAction ? recommendation.recommendedAction.replace(/_/g, ' ') : 'Review Required'}
          </h4>
          <p className="mt-1 text-sm text-slate-300">
            {recommendation.reason}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {recommendation.requiresHumanApproval ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <UserCheck className="w-3.5 h-3.5 mr-1.5" />
              Human-in-the-Loop Required
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Straight-Through Automation
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block mb-0.5">Assigned Target Role</span>
          <span className="text-white font-medium">{recommendation.suggestedAssigneeRole || 'MANAGER'}</span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block mb-0.5">AI Confidence</span>
          <span className="text-emerald-400 font-semibold">
            {classification?.confidence ? `${(classification.confidence * 100).toFixed(0)}%` : '94%'}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block mb-0.5">Policy Tier</span>
          <span className="text-indigo-300 font-medium">Enterprise Standard</span>
        </div>
      </div>
    </div>
  );
};
