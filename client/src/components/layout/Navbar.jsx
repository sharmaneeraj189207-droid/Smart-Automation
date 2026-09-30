import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import {
  Bell,
  Plus,
  LogOut,
  User,
  Shield,
  Briefcase,
  Menu,
  CheckCheck,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'MANAGER':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <span className="font-bold font-mono text-base">FP</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                FlowPilot <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Create Request CTA */}
          <Link
            to="/requests/new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Request</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-50 animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Notifications ({unreadCount} new)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No notifications yet.</p>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          markAsRead(n._id);
                          if (n.requestId) navigate(`/requests/${n.requestId}`);
                          setShowNotifications(false);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer text-xs transition border ${
                          n.isRead
                            ? 'bg-slate-950/40 text-slate-400 border-slate-800/40'
                            : 'bg-indigo-950/30 text-slate-200 border-indigo-500/20 hover:border-indigo-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white truncate pr-2">{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-slate-400">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 transition"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 uppercase">
                {user?.name?.slice(0, 2) || 'FP'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">{user?.name}</span>
                <span className="text-[10px] text-slate-400">{user?.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-panel bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-slide-up">
                <div className="p-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-1.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeStyle(user?.role)}`}>
                      ROLE: {user?.role}
                    </span>
                  </div>
                </div>

                <div className="py-1 space-y-0.5 text-xs">
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Account Settings</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
