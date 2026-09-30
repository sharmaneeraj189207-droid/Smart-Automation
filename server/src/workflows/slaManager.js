import { Workflow } from '../models/Workflow.js';
import { Request } from '../models/Request.js';
import { User } from '../models/User.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const calculateSlaDeadline = (hours = 24) => {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};

export const checkAndEscalateOverdueWorkflows = async () => {
  const now = new Date();
  
  // Find workflows that have a deadline, are past due, are not yet completed/rejected/cancelled/escalated
  const overdueWorkflows = await Workflow.find({
    'sla.deadline': { $lt: now },
    'sla.isOverdue': false,
    currentState: { $in: ['PENDING_APPROVAL', 'IN_PROGRESS', 'PENDING_INFORMATION', 'CLASSIFIED'] }
  }).populate('requestId');

  const escalatedResults = [];

  for (const workflow of overdueWorkflows) {
    workflow.sla.isOverdue = true;
    workflow.sla.escalatedAt = now;
    const oldState = workflow.currentState;
    workflow.previousState = oldState;
    workflow.currentState = 'ESCALATED';

    workflow.stateHistory.push({
      fromState: oldState,
      toState: 'ESCALATED',
      triggerType: 'SYSTEM',
      action: 'SLA_BREACH_ESCALATION',
      notes: `Workflow breached SLA target deadline (${workflow.sla.deadline.toISOString()}). Automatically escalated.`
    });

    await workflow.save();

    // Update Request status
    if (workflow.requestId) {
      await Request.findByIdAndUpdate(workflow.requestId._id, { status: 'ESCALATED' });
    }

    // Notify Managers and Admins
    const managers = await User.find({ role: { $in: ['ADMIN', 'MANAGER'] }, isActive: true });
    for (const manager of managers) {
      await createNotification({
        recipientId: manager._id,
        type: 'WORKFLOW_ESCALATED',
        title: '⚠️ SLA Breach: Workflow Escalated',
        message: `Workflow for "${workflow.requestId?.title || 'Request'}" (${workflow.requestId?.trackingNumber || workflow._id}) breached SLA deadline and requires immediate intervention.`,
        requestId: workflow.requestId?._id,
        workflowId: workflow._id
      });
    }

    // Audit log
    await logAudit({
      actorName: 'SYSTEM_SLA_WATCHER',
      actorRole: 'SYSTEM',
      action: 'WORKFLOW_ESCALATED',
      entity: 'Workflow',
      entityId: workflow._id.toString(),
      metadata: {
        previousState: oldState,
        deadline: workflow.sla.deadline,
        reason: 'SLA deadline exceeded'
      }
    });

    escalatedResults.push(workflow._id);
  }

  return escalatedResults;
};
