import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { requestApi } from '../api/requestApi.js';
import { workflowApi } from '../api/workflowApi.js';
import { taskApi } from '../api/taskApi.js';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badge.jsx';
import { WorkflowProgressBar } from '../components/workflow/WorkflowProgressBar.jsx';
import { AiProcessingTimeline } from '../components/workflow/AiProcessingTimeline.jsx';
import { AiRecommendationCard } from '../components/workflow/AiRecommendationCard.jsx';
import { ApprovalModal } from '../components/workflow/ApprovalModal.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  History,
  FileCheck2,
  Check,
  Send,
  AlertTriangle
} from 'lucide-react';

export const RequestDetailPage = () => {
  const { id } = useParams();
  const { user, isManager } = useAuth();

  const [request, setRequest] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const res = await requestApi.getById(id);
      if (res.data) {
        setRequest(res.data.request);
        setTasks(res.data.tasks || []);
        setApprovals(res.data.approvals || []);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('[RequestDetailPage] Failed to load request:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleApprove = async (comment) => {
    if (!request?.workflowId?._id) return;
    try {
      await workflowApi.approve(request.workflowId._id, { comment });
      setActionSuccess('Workflow successfully approved and completed!');
      await fetchRequestDetails();
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (comment) => {
    if (!request?.workflowId?._id) return;
    try {
      await workflowApi.reject(request.workflowId._id, { comment });
      setActionSuccess('Workflow rejected.');
      await fetchRequestDetails();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskApi.complete(taskId, { completionNotes: `Completed by ${user?.name}` });
      await fetchRequestDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !request) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-white">Request Not Found</h2>
        <Link to="/requests" className="text-indigo-400 text-xs mt-2 inline-block">
          Return to requests list
        </Link>
      </div>
    );
  }

  const aiAnalysis = request.aiAnalysis || {};
  const workflow = request.workflowId;
  const isPendingApproval = workflow?.currentState === 'PENDING_APPROVAL';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/requests"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-400">
                {request.trackingNumber}
              </span>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {request.title}
            </h1>
          </div>
        </div>

        {/* Manager Action Trigger */}
        {isManager && isPendingApproval && (
          <button
            onClick={() => setShowApprovalModal(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition flex items-center gap-2 self-start sm:self-auto ai-pulse-border"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Review & Authorize Request</span>
          </button>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Workflow Progress Bar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <WorkflowProgressBar currentState={workflow?.currentState || request.status} />
      </div>

      {/* Main Grid: Left side AI & details, Right side tasks & approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendation Banner */}
          <AiRecommendationCard
            recommendation={aiAnalysis.nextActionRecommendation}
            classification={aiAnalysis.categoryClassification}
            priorityAnalysis={aiAnalysis.priorityAnalysis}
          />

          {/* AI Extracted Parameters Box */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Extracted Operational Entities
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Parsed Amount</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {request.amount ? `${request.currency} ${request.amount.toLocaleString()}` : 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Detected Category</span>
                <CategoryBadge category={request.category} />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Department Route</span>
                <span className="font-semibold text-slate-200">{request.departmentName || 'General'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">SLA Target</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {workflow?.sla?.durationHours ? `${workflow.sla.durationHours} Hours` : '24 Hours'}
                </span>
              </div>
            </div>

            {/* Potential Duplicate Alert if flagged */}
            {aiAnalysis.duplicateCheck?.isPotentialDuplicate && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block font-semibold">AI Audit Alert: Potential Duplicate Submission</strong>
                  <span>{aiAnalysis.duplicateCheck.reason}</span>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">Submitted Description</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                {request.description}
              </p>
            </div>
          </div>

          {/* AI Completion Executive Summary (when finished) */}
          {(workflow?.summary?.content || aiAnalysis.completionSummary?.summary) && (
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/10">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <FileCheck2 className="w-4 h-4" />
                <span>AI Executive Completion Summary</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {workflow?.summary?.content || aiAnalysis.completionSummary?.summary}
              </p>
              <div className="mt-3 text-[10px] text-slate-500 font-mono">
                Generated autonomously via Gemini-1.5-Flash on conclusion of workflow.
              </div>
            </div>
          )}

          {/* 10-Step Automation Timeline Visualizer */}
          <AiProcessingTimeline steps={aiAnalysis.processingSteps || []} />
        </div>

        {/* Right Column (Tasks, Approvals, Submitter Info) */}
        <div className="space-y-6">
          {/* Submitter Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Request Metadata
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Created By</span>
                <span className="text-white font-medium">{request.creator?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Email</span>
                <span className="text-slate-300 font-mono text-[11px]">{request.creator?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Submitted At</span>
                <span className="text-slate-300">{new Date(request.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Assigned Reviewer</span>
                <span className="text-indigo-400 font-medium">
                  {workflow?.assignedUser?.name || 'Department Manager'}
                </span>
              </div>
            </div>
          </div>

          {/* Associated Action Tasks */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assigned Action Items ({tasks.length})
              </h4>
            </div>

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No open action items</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-3 rounded-xl border text-xs transition ${
                      task.status === 'COMPLETED'
                        ? 'bg-slate-950/40 border-slate-800/40 text-slate-400'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`font-semibold block ${task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                          Assigned to: {task.assignedUser?.name || task.assignedRole}
                        </span>
                      </div>

                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCompleteTask(task._id)}
                          className="px-2 py-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audit / Approval History */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Approval & Decision History
            </h4>

            {approvals.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No decisions recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {approvals.map((app) => (
                  <div key={app._id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">
                        {app.approverId?.name || 'Manager'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.action === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {app.action}
                      </span>
                    </div>
                    {app.comment && (
                      <p className="text-slate-300 italic mt-1 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                        "{app.comment}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(app.decisionDate).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        workflow={workflow}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
