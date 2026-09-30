import { Workflow } from '../models/Workflow.js';
import { Request } from '../models/Request.js';
import { Approval } from '../models/Approval.js';
import { Task } from '../models/Task.js';
import { canTransition } from './stateMachine.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { generateWorkflowSummary, generateNotificationMessage } from '../ai/summaryGenerator.js';

export const transitionWorkflow = async ({
  workflowId,
  nextState,
  user = null,
  triggerType = 'USER',
  action = 'STATE_TRANSITION',
  notes = ''
}) => {
  const workflow = await Workflow.findById(workflowId).populate('requestId');
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const fromState = workflow.currentState;

  // Validate state machine rule
  if (!canTransition(fromState, nextState)) {
    throw new Error(`Invalid state transition: Cannot transition workflow from ${fromState} to ${nextState}`);
  }

  workflow.previousState = fromState;
  workflow.currentState = nextState;

  workflow.stateHistory.push({
    fromState,
    toState: nextState,
    triggeredBy: user?._id || null,
    triggerType,
    action,
    notes,
    timestamp: new Date()
  });

  // If completed, generate AI summary and complete remaining tasks
  if (nextState === 'COMPLETED' || nextState === 'APPROVED') {
    if (nextState === 'COMPLETED') {
      const approvals = await Approval.find({ workflowId: workflow._id });
      const tasks = await Task.find({ workflowId: workflow._id });

      try {
        const summaryText = await generateWorkflowSummary({
          request: workflow.requestId,
          workflow,
          approvals,
          tasks
        });

        workflow.summary = {
          content: summaryText,
          generatedAt: new Date(),
          modelUsed: 'Gemini-1.5-Flash'
        };

        // Mark open tasks completed
        await Task.updateMany(
          { workflowId: workflow._id, status: { $in: ['TODO', 'IN_PROGRESS'] } },
          { status: 'COMPLETED', completedAt: new Date(), completionNotes: 'Auto-completed upon workflow conclusion' }
        );
      } catch (sumErr) {
        console.warn('[WorkflowEngine] Error generating summary:', sumErr.message);
      }
    }
  }

  await workflow.save();

  // Update associated Request document status
  if (workflow.requestId) {
    const requestUpdate = { status: nextState };
    if (workflow.summary?.content) {
      requestUpdate['aiAnalysis.completionSummary'] = {
        summary: workflow.summary.content,
        generatedAt: workflow.summary.generatedAt
      };
    }
    await Request.findByIdAndUpdate(workflow.requestId._id, requestUpdate);
  }

  // Audit log
  await logAudit({
    actor: user,
    action: `WORKFLOW_${nextState}`,
    entity: 'Workflow',
    entityId: workflow._id.toString(),
    metadata: {
      fromState,
      toState: nextState,
      notes,
      requestId: workflow.requestId?._id
    }
  });

  // Notify request creator
  if (workflow.requestId?.creator) {
    const message = await generateNotificationMessage({
      eventType: `WORKFLOW_${nextState}`,
      request: workflow.requestId
    });

    await createNotification({
      recipientId: workflow.requestId.creator,
      type: nextState === 'COMPLETED' ? 'WORKFLOW_COMPLETED' : 'SYSTEM_ALERT',
      title: `Workflow ${nextState}: ${workflow.requestId.title}`,
      message,
      requestId: workflow.requestId._id,
      workflowId: workflow._id
    });
  }

  return workflow;
};
