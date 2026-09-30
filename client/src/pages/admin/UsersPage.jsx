import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { Users, Shield, Mail, CheckCircle, Ban, Search } from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({ search });
      if (res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('[UsersPage] Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleDeactivate = async (user) => {
    try {
      if (user.isActive) {
        await adminApi.deleteUser(user._id);
      } else {
        await adminApi.updateUser(user._id, { isActive: true });
      }
      await fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Enterprise User Management
          </h1>
          <p className="text-xs text-slate-400">
            RBAC roles (ADMIN, MANAGER, EMPLOYEE) and department assignments
          </p>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSkeleton count={4} type="table" />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 font-bold flex items-center justify-center uppercase text-[10px]">
                          {u.name?.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{u.name}</span>
                          <span className="text-[10px] text-slate-500">{u.title || 'Staff Member'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        u.role === 'MANAGER' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {u.department?.name || 'General Operations'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] ${
                        u.isActive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleDeactivate(u)}
                        className={`text-xs px-2.5 py-1 rounded transition ${
                          u.isActive
                            ? 'text-rose-400 hover:bg-rose-500/10'
                            : 'text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
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
