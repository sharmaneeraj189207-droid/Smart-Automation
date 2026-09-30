import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'NEW_REQUEST',
        'APPROVAL_REQUIRED',
        'REQUEST_APPROVED',
        'REQUEST_REJECTED',
        'TASK_ASSIGNED',
        'TASK_OVERDUE',
        'WORKFLOW_COMPLETED',
        'WORKFLOW_ESCALATED',
        'AI_FLAGGED_DUPLICATE',
        'SYSTEM_ALERT'
      ],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      index: true
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
