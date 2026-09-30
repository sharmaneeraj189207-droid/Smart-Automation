import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, subtitle, trend = 'up', color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20',
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass-card rounded-xl p-5 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center border ${selectedColor}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
          }`}>
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
