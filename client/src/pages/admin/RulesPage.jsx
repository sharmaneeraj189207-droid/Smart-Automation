import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { Modal } from '../../components/common/Modal.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { Sliders, Plus, CheckCircle, XCircle, Power, Edit3, Trash2 } from 'lucide-react';

export const RulesPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'expense',
    priorityOrder: 1,
    minAmount: '',
    maxAmount: '',
    autoApprove: false,
    requiresManagerApproval: true,
    requiresAdminApproval: false,
    slaHours: 24
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRules();
      if (res.data?.rules) {
        setRules(res.data.rules);
      }
    } catch (err) {
      console.error('[RulesPage] Failed to fetch rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleActive = async (rule) => {
    try {
      await adminApi.updateRule(rule._id, { isActive: !rule.isActive });
      await fetchRules();
    } catch (err) {
      alert(err.message || 'Failed to update rule');
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        priorityOrder: parseInt(formData.priorityOrder, 10),
        conditions: {
          minAmount: formData.minAmount ? parseFloat(formData.minAmount) : null,
          maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null
        },
        actions: {
          autoApprove: formData.autoApprove,
          requiresManagerApproval: formData.requiresManagerApproval,
          requiresAdminApproval: formData.requiresAdminApproval,
          slaHours: parseInt(formData.slaHours, 10)
        }
      };

      await adminApi.createRule(payload);
      setShowCreateModal(false);
      await fetchRules();
    } catch (err) {
      alert(err.message || 'Failed to create rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Rule Engine Configuration
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              POLICY AUTOMATION
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Define declarative business rules, threshold policies, and routing directives for the automation service
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Rule</span>
        </button>
      </div>

      {/* Rules List */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : rules.length === 0 ? (
        <p className="text-xs text-slate-500 py-8 text-center">No rules configured.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule._id}
              className={`glass-card rounded-2xl p-6 border transition flex flex-col justify-between ${
                rule.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-indigo-400 flex items-center justify-center">
                      #{rule.priorityOrder}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {rule.category}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleActive(rule)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 transition ${
                      rule.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{rule.isActive ? 'Active' : 'Disabled'}</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{rule.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{rule.description}</p>

                {/* Conditions / Actions Box */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Amount:</span>
                    <span className="text-slate-200">{rule.conditions?.minAmount ? `₹${rule.conditions.minAmount}` : 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Amount:</span>
                    <span className="text-slate-200">{rule.conditions?.maxAmount ? `₹${rule.conditions.maxAmount}` : 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auto Approve:</span>
                    <span className={rule.actions?.autoApprove ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {rule.actions?.autoApprove ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SLA Window:</span>
                    <span className="text-amber-400">{rule.actions?.slaHours || 24} Hours</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Rule Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Workflow Rule"
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">Rule Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Expedited Travel Reimbursement Rule"
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="State policy rationale..."
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="expense">Expense</option>
                <option value="leave">Leave</option>
                <option value="purchase">Purchase</option>
                <option value="it_support">IT Support</option>
                <option value="ALL">All Categories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Priority Order</label>
              <input
                type="number"
                value={formData.priorityOrder}
                onChange={(e) => setFormData({ ...formData, priorityOrder: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Min Amount (₹)</label>
              <input
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Max Amount (₹)</label>
              <input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.autoApprove}
                onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Enable Straight-Through Auto-Approval</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.requiresManagerApproval}
                onChange={(e) => setFormData({ ...formData, requiresManagerApproval: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Mandate Department Manager Review</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition"
            >
              Save Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
