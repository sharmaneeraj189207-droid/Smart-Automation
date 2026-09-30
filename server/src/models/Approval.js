import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    approverRole: {
      type: String,
      enum: ['ADMIN', 'MANAGER'],
      required: true
    },
    action: {
      type: String,
      enum: ['APPROVE', 'REJECT', 'REQUEST_INFO', 'ESCALATE'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'INFO_REQUESTED'],
      default: 'APPROVED'
    },
    comment: {
      type: String,
      default: ''
    },
    decisionDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const Approval = mongoose.model('Approval', approvalSchema);
