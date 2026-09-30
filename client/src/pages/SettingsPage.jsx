import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Shield, Sparkles, Database, Server, CheckCircle2 } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          System & Account Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Profile preferences, architecture configuration, and system telemetry
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          User Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Full Name</span>
            <span className="text-white font-semibold text-sm">{user?.name}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Work Email</span>
            <span className="text-white font-mono">{user?.email}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Assigned Role</span>
            <span className="text-indigo-400 font-bold">{user?.role}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Title & Position</span>
            <span className="text-white">{user?.title || 'Staff Member'}</span>
          </div>
        </div>
      </div>

      {/* System Infrastructure Telemetry */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Infrastructure Telemetry & AI Status
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-white font-semibold block">AI Decision Engine</span>
              <span className="text-slate-500">Google Gemini 1.5 Flash + Zod Schema Validation</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active & Validated
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-white font-semibold block">Database Engine</span>
              <span className="text-slate-500">MongoDB with Mongoose ODM & Relations</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-white font-semibold block">Security Controls</span>
              <span className="text-slate-500">Helmet Headers, CORS Whitelist, JWT Token Encryption, Rate Limiting</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Shield className="w-3.5 h-3.5" />
              Enforced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
