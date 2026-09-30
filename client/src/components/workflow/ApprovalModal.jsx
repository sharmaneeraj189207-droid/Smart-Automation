import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export const ApprovalModal = ({ isOpen, onClose, workflow, onApprove, onReject }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState('APPROVE');

  if (!workflow) return null;

  const handleSubmit = async (type) => {
    try {
      setIsSubmitting(true);
      if (type === 'APPROVE') {
        await onApprove(comment || 'Approved by reviewer');
      } else {
        if (!comment.trim()) {
          alert('Please provide a reason for rejection.');
          setIsSubmitting(false);
          return;
        }
        await onReject(comment);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review & Approval Action">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-mono">
                {workflow.requestId?.trackingNumber || 'Request'}
              </span>
              <h4 className="text-base font-semibold text-white mt-1">
                {workflow.requestId?.title || 'Workflow Request'}
              </h4>
            </div>
            {workflow.requestId?.amount && (
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Amount</span>
                <span className="text-base font-bold text-emerald-400">
                  {workflow.requestId.currency} {workflow.requestId.amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {workflow.requestId?.description}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Decision Comment / Justification
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add relevant approval note or required adjustments..."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('REJECT')}
            className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Request</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('APPROVE')}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Authorize & Approve</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
