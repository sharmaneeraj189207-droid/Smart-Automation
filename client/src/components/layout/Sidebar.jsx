import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  ShieldAlert,
  BarChart3,
  History,
  Users,
  Building2,
  Sliders,
  Settings,
  X,
  Sparkles,
  CheckCircle,
  Bell
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isManager } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/requests', label: 'All Requests', icon: FileText },
    { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
    ...(isManager ? [{ to: '/approvals', label: 'Approval Queue', icon: CheckCircle, highlight: true }] : []),
    { to: '/notifications', label: 'Notification Center', icon: Bell },
    { to: '/analytics', label: 'Automation Analytics', icon: BarChart3 },
    ...(isManager ? [{ to: '/audit-logs', label: 'Audit Trail', icon: History }] : []),
  ];

  const adminItems = [
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/rules', label: 'Rule Engine', icon: Sliders },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-800/80 bg-slate-950/95 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/30">
              FP
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              FlowPilot <span className="text-indigo-400">AI</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Main Operations
            </span>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.highlight && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Admin section */}
          {isAdmin && (
            <div>
              <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Administration
              </span>
              <div className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Preferences
            </span>
            <NavLink
              to="/settings"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>

        {/* Engine status footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="glass-card rounded-xl p-3 border border-indigo-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Engine
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Human-in-the-Loop Orchestration Mode
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
