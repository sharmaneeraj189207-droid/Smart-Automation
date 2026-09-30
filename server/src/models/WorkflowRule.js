import mongoose from 'mongoose';

const workflowRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['leave', 'expense', 'purchase', 'it_support', 'administrative', 'ALL'],
      default: 'ALL',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    priorityOrder: {
      type: Number,
      default: 1
    },
    conditions: {
      minAmount: { type: Number, default: null },
      maxAmount: { type: Number, default: null },
      priorityLevel: [{ type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }],
      keywords: [{ type: String }],
      requiresFields: [{ type: String }]
    },
    actions: {
      autoApprove: { type: Boolean, default: false },
      requiresManagerApproval: { type: Boolean, default: false },
      requiresAdminApproval: { type: Boolean, default: false },
      assignDepartmentCode: { type: String, default: null },
      assignRole: { type: String, enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], default: 'MANAGER' },
      slaHours: { type: Number, default: 24 },
      notificationMessage: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

export const WorkflowRule = mongoose.model('WorkflowRule', workflowRuleSchema);
