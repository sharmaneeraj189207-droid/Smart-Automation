import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { Building2, Plus, Users, DollarSign } from 'lucide-react';

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDepartments();
        if (res.data?.departments) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error('[DepartmentsPage] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Organizational Departments
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cost centers, budget allocations, and departmental managers for approval routing
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div key={dept._id} className="glass-card rounded-2xl p-6 border border-slate-800">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{dept.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">CODE: {dept.code}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4">{dept.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/80">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Department Lead</span>
                  <span className="text-white font-medium">{dept.managerId?.name || 'Sarah Jenkins'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Quarterly Budget</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ₹{dept.budget ? dept.budget.toLocaleString() : '1,500,000'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
