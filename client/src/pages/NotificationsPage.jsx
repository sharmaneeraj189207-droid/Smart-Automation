import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Bell, CheckCheck, Clock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (n) => {
    markAsRead(n._id);
    if (n.requestId) {
      navigate(`/requests/${n.requestId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time workflow alerts, pending review notifications, and audit warnings
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-400 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are completely caught up with all operational alerts."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`glass-card rounded-2xl p-4 border transition cursor-pointer flex items-start gap-4 ${
                n.isRead
                  ? 'border-slate-800/60 bg-slate-900/40 text-slate-400'
                  : 'border-indigo-500/30 bg-slate-900/80 hover:border-indigo-500/60 shadow-lg shadow-indigo-500/5 text-slate-200'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.isRead ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white truncate">{n.title}</h4>
                  <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
