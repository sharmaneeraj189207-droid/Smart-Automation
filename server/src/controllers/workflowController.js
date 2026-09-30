import { Workflow } from '../models/Workflow.js';
import { Request } from '../models/Request.js';
import { Approval } from '../models/Approval.js';
import { Task } from '../models/Task.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { transitionWorkflow } from '../workflows/workflowEngine.js';
import { checkAndEscalateOverdueWorkflows } from '../workflows/slaManager.js';
import { processNewRequestAutomation } from '../services/automationService.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

export const getWorkflows = async (req, res, next) => {
  try {
    const { state, priority, automationStatus, page = 1, limit = 50 } = req.query;
    const query = {};

    if (state) query.currentState = state;
    if (priority) query.priority = priority;
    if (automationStatus) query.automationStatus = automationStatus;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Workflow.countDocuments(query);
    const workflows = await Workflow.find(query)
      .populate('requestId')
      .populate('assignedUser', 'name email role')
      .populate('assignedDepartment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return successResponse(res, { workflows, total }, 'Workflows retrieved');
  } catch (error) {
    next(error);
  }
};

export const getWorkflowById = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('requestId')
      .populate('assignedUser', 'name email role')
      .populate('assignedDepartment');

    if (!workflow) {
      return errorResponse(res, 'Workflow not found', [], 404);
    }

    const approvals = await Approval.find({ workflowId: workflow._id }).populate('approverId', 'name email role');
    const tasks = await Task.find({ workflowId: workflow._id }).populate('assignedUser', 'name email role');

    return successResponse(res, { workflow, approvals, tasks }, 'Workflow retrieved');
  } catch (error) {
    next(error);
  }
};

export const processWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return errorResponse(res, 'Workflow not found', [], 404);
    }

    const updated = await processNewRequestAutomation(workflow.requestId);
    return successResponse(res, updated, 'Workflow automation pipeline re-executed');
  } catch (error) {
    next(error);
  }
};

export const approveWorkflow = async (req, res, next) => {
  try {
    const { comment = 'Approved' } = req.body;
    const workflow = await Workflow.findById(req.params.id).populate('requestId');

    if (!workflow) {
      return errorResponse(res, 'Workflow not found', [], 404);
    }

    if (workflow.currentState !== 'PENDING_APPROVAL' && workflow.currentState !== 'ESCALATED') {
      return errorResponse(res, `Workflow is not in a state awaiting approval (Current state: ${workflow.currentState})`, [], 400);
    }

    // Record Approval
    const approval = await Approval.create({
      requestId: workflow.requestId._id,
      workflowId: workflow._id,
      approverId: req.user._id,
      approverRole: req.user.role,
      action: 'APPROVE',
      status: 'APPROVED',
      comment,
      decisionDate: new Date()
    });

    if (req.user.role === 'ADMIN') {
      workflow.approvalPolicy.adminApproved = true;
    }
    if (req.user.role === 'MANAGER' || req.user.role === 'ADMIN') {
      workflow.approvalPolicy.managerApproved = true;
    }

    // Complete approval tasks
    await Task.updateMany(
      { workflowId: workflow._id, status: { $in: ['TODO', 'IN_PROGRESS'] } },
      { status: 'COMPLETED', completedAt: new Date(), completedBy: req.user._id, completionNotes: comment }
    );

    // Transition state
    await transitionWorkflow({
      workflowId: workflow._id,
      nextState: 'APPROVED',
      user: req.user,
      triggerType: 'USER',
      action: 'HUMAN_APPROVAL',
      notes: `Approved by ${req.user.name} (${req.user.role}): ${comment}`
    });

    // Move to IN_PROGRESS and then COMPLETED
    await transitionWorkflow({
      workflowId: workflow._id,
      nextState: 'IN_PROGRESS',
      user: req.user,
      triggerType: 'SYSTEM',
      action: 'EXECUTE_PROCESSING',
      notes: 'Processing completed payment/fulfillment steps.'
    });

    const completedWorkflow = await transitionWorkflow({
      workflowId: workflow._id,
      nextState: 'COMPLETED',
      user: req.user,
      triggerType: 'SYSTEM',
      action: 'WORKFLOW_FINALIZED',
      notes: 'Workflow successfully concluded.'
    });

    // Notify submitter
    await createNotification({
      recipientId: workflow.requestId.creator,
      senderId: req.user._id,
      type: 'REQUEST_APPROVED',
      title: '🎉 Request Approved!',
      message: `Your request "${workflow.requestId.title}" has been approved by ${req.user.name}.`,
      requestId: workflow.requestId._id,
      workflowId: workflow._id
    });

    await logAudit({
      actor: req.user,
      action: 'REQUEST_APPROVED',
      entity: 'Workflow',
      entityId: workflow._id.toString(),
      metadata: { comment, approverRole: req.user.role },
      ipAddress: req.ip
    });

    return successResponse(res, { workflow: completedWorkflow, approval }, 'Workflow approved and completed successfully');
  } catch (error) {
    next(error);
  }
};

export const rejectWorkflow = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const workflow = await Workflow.findById(req.params.id).populate('requestId');

    if (!workflow) {
      return errorResponse(res, 'Workflow not found', [], 404);
    }

    // Record Rejection
    const approval = await Approval.create({
      requestId: workflow.requestId._id,
      workflowId: workflow._id,
      approverId: req.user._id,
      approverRole: req.user.role,
      action: 'REJECT',
      status: 'REJECTED',
      comment: comment || 'Rejected',
      decisionDate: new Date()
    });

    // Transition state to REJECTED
    const updatedWorkflow = await transitionWorkflow({
      workflowId: workflow._id,
      nextState: 'REJECTED',
      user: req.user,
      triggerType: 'USER',
      action: 'HUMAN_REJECTION',
      notes: `Rejected by ${req.user.name} (${req.user.role}): ${comment}`
    });

    // Notify creator
    await createNotification({
      recipientId: workflow.requestId.creator,
      senderId: req.user._id,
      type: 'REQUEST_REJECTED',
      title: 'Request Rejected',
      message: `Your request "${workflow.requestId.title}" was rejected. Reason: ${comment}`,
      requestId: workflow.requestId._id,
      workflowId: workflow._id
    });

    await logAudit({
      actor: req.user,
      action: 'REQUEST_REJECTED',
      entity: 'Workflow',
      entityId: workflow._id.toString(),
      metadata: { comment, approverRole: req.user.role },
      ipAddress: req.ip
    });

    return successResponse(res, { workflow: updatedWorkflow, approval }, 'Workflow rejected');
  } catch (error) {
    next(error);
  }
};

export const escalateWorkflow = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const workflow = await Workflow.findById(req.params.id).populate('requestId');

    if (!workflow) {
      return errorResponse(res, 'Workflow not found', [], 404);
    }

    workflow.sla.isOverdue = true;
    workflow.sla.escalatedAt = new Date();
    await workflow.save();

    const updatedWorkflow = await transitionWorkflow({
      workflowId: workflow._id,
      nextState: 'ESCALATED',
      user: req.user,
      triggerType: 'USER',
      action: 'MANUAL_ESCALATION',
      notes: reason || 'Manually escalated by supervisor'
    });

    return successResponse(res, { workflow: updatedWorkflow }, 'Workflow escalated');
  } catch (error) {
    next(error);
  }
};

export const runSlaCheck = async (req, res, next) => {
  try {
    const escalatedIds = await checkAndEscalateOverdueWorkflows();
    return successResponse(res, { escalatedCount: escalatedIds.length, escalatedIds }, 'SLA check completed');
  } catch (error) {
    next(error);
  }
};
