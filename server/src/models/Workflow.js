import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true
    },
    workflowType: {
      type: String,
      enum: ['leave', 'expense', 'purchase', 'it_support', 'administrative', 'custom'],
      required: true
    },
    currentState: {
      type: String,
      enum: [
        'CREATED',
        'AI_PROCESSING',
        'CLASSIFIED',
        'PENDING_INFORMATION',
        'PENDING_APPROVAL',
        'APPROVED',
        'IN_PROGRESS',
        'COMPLETED',
        'REJECTED',
        'CANCELLED',
        'ESCALATED'
      ],
      default: 'CREATED',
      index: true
    },
    previousState: {
      type: String,
      default: null
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedRole: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      default: 'MANAGER'
    },
    automationStatus: {
      type: String,
      enum: ['PENDING', 'AUTOMATED', 'MANUAL_REQUIRED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    approvalPolicy: {
      requiresManagerApproval: { type: Boolean, default: false },
      requiresAdminApproval: { type: Boolean, default: false },
      isAutoApproved: { type: Boolean, default: false },
      thresholdRuleApplied: { type: String, default: null },
      managerApproved: { type: Boolean, default: false },
      adminApproved: { type: Boolean, default: false }
    },
    sla: {
      durationHours: { type: Number, default: 24 },
      deadline: { type: Date },
      isOverdue: { type: Boolean, default: false, index: true },
      escalatedAt: { type: Date, default: null }
    },
    stateHistory: [
      {
        fromState: String,
        toState: String,
        triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        triggerType: { type: String, enum: ['USER', 'AI_ENGINE', 'RULE_ENGINE', 'SYSTEM'], default: 'SYSTEM' },
        action: String,
        notes: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    summary: {
      content: String,
      generatedAt: Date,
      modelUsed: String
    }
  },
  {
    timestamps: true
  }
);

export const Workflow = mongoose.model('Workflow', workflowSchema);
