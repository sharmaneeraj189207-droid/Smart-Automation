import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actorName: {
      type: String,
      default: 'SYSTEM'
    },
    actorRole: {
      type: String,
      default: 'SYSTEM'
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entity: {
      type: String,
      enum: ['Request', 'Workflow', 'Task', 'Approval', 'User', 'Department', 'WorkflowRule', 'System'],
      required: true,
      index: true
    },
    entityId: {
      type: String,
      required: true,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
