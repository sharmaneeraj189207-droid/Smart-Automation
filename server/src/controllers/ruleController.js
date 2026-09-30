import { WorkflowRule } from '../models/WorkflowRule.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

export const getRules = async (req, res, next) => {
  try {
    const rules = await WorkflowRule.find().sort({ priorityOrder: 1, createdAt: -1 });
    return successResponse(res, { rules }, 'Workflow rules retrieved');
  } catch (error) {
    next(error);
  }
};

export const createRule = async (req, res, next) => {
  try {
    const rule = await WorkflowRule.create(req.body);

    await logAudit({
      actor: req.user,
      action: 'RULE_CREATED',
      entity: 'WorkflowRule',
      entityId: rule._id.toString(),
      metadata: req.body,
      ipAddress: req.ip
    });

    return successResponse(res, { rule }, 'Workflow rule created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateRule = async (req, res, next) => {
  try {
    const rule = await WorkflowRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rule) {
      return errorResponse(res, 'Rule not found', [], 404);
    }

    await logAudit({
      actor: req.user,
      action: 'RULE_UPDATED',
      entity: 'WorkflowRule',
      entityId: rule._id.toString(),
      metadata: req.body,
      ipAddress: req.ip
    });

    return successResponse(res, { rule }, 'Workflow rule updated');
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req, res, next) => {
  try {
    const rule = await WorkflowRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return errorResponse(res, 'Rule not found', [], 404);
    }

    await logAudit({
      actor: req.user,
      action: 'RULE_DELETED',
      entity: 'WorkflowRule',
      entityId: req.params.id,
      ipAddress: req.ip
    });

    return successResponse(res, null, 'Workflow rule deleted');
  } catch (error) {
    next(error);
  }
};
