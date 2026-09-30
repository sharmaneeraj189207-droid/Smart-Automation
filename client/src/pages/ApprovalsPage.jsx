import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workflowApi } from '../api/workflowApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PriorityBadge, CategoryBadge } from '../components/common/Badge.jsx';
import { ApprovalModal } from '../components/workflow/ApprovalModal.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import {
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const ApprovalsPage = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const res = await workflowApi.getAll({ state: 'PENDING_APPROVAL' });
      if (res.data?.workflows) {
        setWorkflows(res.data.workflows);
      }
    } catch (err) {
      console.error('[ApprovalsPage] Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleOpenReview = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowModal(true);
  };

  const handleApprove = async (comment) => {
    if (!selectedWorkflow) return;
    try {
      await workflowApi.approve(selectedWorkflow._id, { comment });
      setSuccessMsg(`Workflow ${selectedWorkflow.requestId?.trackingNumber || ''} approved successfully!`);
      await fetchPendingApprovals();
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (comment) => {
    if (!selectedWorkflow) return;
    try {
      await workflowApi.reject(selectedWorkflow._id, { comment });
      setSuccessMsg(`Workflow ${selectedWorkflow.requestId?.trackingNumber || ''} rejected.`);
      await fetchPendingApprovals();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Manager Review & Approval Queue
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {workflows.length} Pending
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Human-in-the-loop governance for requests exceeding automated policy thresholds
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Approvals Cards */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Approval Queue is Empty"
          description="There are currently no workflows awaiting manager authorization."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((wf) => {
            const req = wf.requestId || {};
            return (
              <div
                key={wf._id}
                className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {req.trackingNumber || 'Request'}
                    </span>
                    <PriorityBadge priority={wf.priority} />
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 mb-1">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {req.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Requested Amount</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {req.amount ? `${req.currency || 'INR'} ${req.amount.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Category</span>
                      <CategoryBadge category={wf.workflowType} />
                    </div>
                  </div>

                  {wf.approvalPolicy?.thresholdRuleApplied && (
                    <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 mb-4 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">Policy: {wf.approvalPolicy.thresholdRuleApplied}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <Link
                    to={`/requests/${req._id}`}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <span>Full Context</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleOpenReview(wf)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Authorize / Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <ApprovalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        workflow={selectedWorkflow}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
