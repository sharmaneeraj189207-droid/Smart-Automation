import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

const DEFAULT_PIPELINE_STEPS = [
  'Request received',
  'Validating information',
  'AI classification',
  'Extracting information',
  'Priority detection',
  'Checking policy',
  'Detecting duplicates',
  'Assigning workflow',
  'Creating tasks',
  'Routing approval',
  'Sending notification'
];

export const AiProcessingTimeline = ({ steps = [], isLiveProcessing = false }) => {
  const stepMap = new Map();
  steps.forEach((s) => stepMap.set(s.step, s));

  return (
    <div className="glass-card rounded-2xl p-6 border border-indigo-500/20 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ai-pulse-border">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              FlowPilot Automation Pipeline
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                10-STEP ENGINE
              </span>
            </h3>
            <p className="text-xs text-slate-400">Autonomous request decomposition, policy analysis, and routing</p>
          </div>
        </div>

        {isLiveProcessing && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>AI Processing...</span>
          </div>
        )}
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
        {DEFAULT_PIPELINE_STEPS.map((stepTitle, idx) => {
          const recorded = stepMap.get(stepTitle);
          const isDone = Boolean(recorded && recorded.status === 'completed');
          const isFailed = Boolean(recorded && recorded.status === 'failed');
          const isInProgress = Boolean(recorded && recorded.status === 'in_progress');

          return (
            <div key={idx} className="relative group">
              {/* Step indicator node */}
              <div
                className={`absolute -left-[30px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : isFailed
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                    : isInProgress
                    ? 'bg-indigo-500 text-white animate-spin border border-indigo-400'
                    : 'bg-slate-900 text-slate-600 border border-slate-800'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isFailed ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-mono">{idx + 1}</span>
                )}
              </div>

              {/* Step content */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isDone
                        ? 'text-slate-200'
                        : isFailed
                        ? 'text-rose-400'
                        : isInProgress
                        ? 'text-indigo-400 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {stepTitle}
                  </span>
                  {recorded?.timestamp && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(recorded.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>

                {recorded?.details && (
                  <p className="mt-1 text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 font-mono">
                    {recorded.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
