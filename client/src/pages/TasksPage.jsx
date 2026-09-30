import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskApi } from '../api/taskApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PriorityBadge } from '../components/common/Badge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { CheckSquare, Check, Clock, Search, Calendar, ChevronRight } from 'lucide-react';

export const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (myTasksOnly) params.myTasks = 'true';

      const res = await taskApi.getAll(params);
      if (res.data?.tasks) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('[TasksPage] Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, myTasksOnly]);

  const handleComplete = async (taskId) => {
    try {
      await taskApi.complete(taskId, { completionNotes: `Marked done by ${user?.name}` });
      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Operational Tasks
          </h1>
          <p className="text-xs text-slate-400">
            Action items autonomously generated and routed by the workflow engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
              myTasksOnly
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {myTasksOnly ? 'Showing My Tasks' : 'Filter: Assigned to Me'}
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { label: 'All Tasks', value: '' },
          { label: 'To Do', value: 'TODO' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMPLETED' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              statusFilter === tab.value
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match criteria"
          description="All assigned tasks are clear or completed."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Task Title</th>
                  <th className="py-3 px-4">Workflow Request</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold block ${task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {task.description}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-400">
                      {task.requestId ? (
                        <Link to={`/requests/${task.requestId._id}`} className="hover:underline">
                          {task.requestId.trackingNumber || 'Request'}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {task.assignedUser?.name || task.assignedRole}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {task.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => handleComplete(task._id)}
                          className="px-3 py-1 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition flex items-center gap-1 ml-auto"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 justify-end">
                          <Check className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
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
