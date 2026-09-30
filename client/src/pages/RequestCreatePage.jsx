import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestApi } from '../api/requestApi.js';
import { Sparkles, ArrowRight, Loader2, Zap, Info, DollarSign, Calendar, Tag, ShieldAlert } from 'lucide-react';

export const RequestCreatePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    amount: '',
    currency: 'INR',
    departmentName: 'Finance & Accounts',
    requestedDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      ...formData,
      ...preset
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        departmentName: formData.departmentName,
        currency: formData.currency
      };

      if (formData.category) payload.category = formData.category;
      if (formData.priority) payload.priority = formData.priority;
      if (formData.amount !== '') payload.amount = parseFloat(formData.amount);
      if (formData.requestedDate) payload.requestedDate = formData.requestedDate;

      const res = await requestApi.create(payload);
      const createdRequest = res.data?.request;

      if (createdRequest?._id) {
        navigate(`/requests/${createdRequest._id}`);
      } else {
        navigate('/requests');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit workflow request');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Submit New Operational Request
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            AI-ENHANCED
          </span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Unstructured text will be automatically classified, extracted, and routed according to enterprise policies.
        </p>
      </div>

      {/* 1-Click Preset Demo Scenarios */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 bg-indigo-950/20">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Demo Scenarios (Click to Autofill)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                title: 'Need reimbursement of ₹8,500 for client travel',
                description: 'Cab travel, flight tickets and meals for client meetings in Bangalore.',
                category: '',
                priority: '',
                amount: '',
                departmentName: 'Finance & Accounts'
              })
            }
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 text-left transition"
          >
            <div className="text-xs font-semibold text-white mb-1">
              ✨ Main Demo: ₹8,500 Expense
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Triggers mid-tier manager approval workflow with automatic ₹8,500 extraction.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                title: 'Taxi fare reimbursement ₹1,450 for client presentation',
                description: 'Uber ride from office to client site for quarterly product review meeting.',
                category: 'expense',
                priority: 'LOW',
                amount: '1450',
                departmentName: 'Finance & Accounts'
              })
            }
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-left transition"
          >
            <div className="text-xs font-semibold text-emerald-300 mb-1">
              ⚡ Auto-Approval: ₹1,450
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Straight-through processing under the ₹5,000 policy threshold.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                title: 'Emergency: Production API gateway outage impacting 200 users',
                description: 'Core microservices cannot connect to database cluster. Critical incident requires immediate IT lead escalation.',
                category: 'it_support',
                priority: 'CRITICAL',
                amount: '',
                departmentName: 'Information Technology'
              })
            }
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500/50 text-left transition"
          >
            <div className="text-xs font-semibold text-rose-300 mb-1">
              🚨 Critical SLA Escalation
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Demonstrates 2-hour SLA response target and priority routing.
            </p>
          </button>
        </div>
      </div>

      {/* Main Creation Form */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Request Title <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Need reimbursement of ₹8,500 for client travel"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Detailed Description <span className="text-indigo-400">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the operational request, business purpose, context, or issue. The AI model will parse amounts, dates, and intent automatically."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Category (Optional)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">✨ Let AI Auto-Classify</option>
                <option value="expense">Expense Reimbursement</option>
                <option value="leave">Leave / Vacation (PTO)</option>
                <option value="purchase">Purchase Procurement</option>
                <option value="it_support">IT Support</option>
                <option value="administrative">Administrative & Facilities</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Leave empty for autonomous AI classification
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Priority (Optional)
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">✨ Let AI Detect Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                AI evaluates SLA urgency from context
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Amount (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Auto-extracted if blank"
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Department
              </label>
              <select
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Operations & Facilities">Operations</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/requests')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Automation Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch AI Workflow</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
