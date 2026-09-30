import { Request } from '../models/Request.js';
import { Workflow } from '../models/Workflow.js';
import { Task } from '../models/Task.js';
import { Approval } from '../models/Approval.js';
import { Comment } from '../models/Comment.js';
import { Department } from '../models/Department.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { processNewRequestAutomation } from '../services/automationService.js';
import { logAudit } from '../services/auditService.js';

const generateTrackingNumber = () => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `FP-${new Date().getFullYear()}-${randomSuffix}`;
};

export const createRequest = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      amount,
      currency = 'INR',
      requestedDate,
      departmentName,
      attachments = []
    } = req.body;

    const trackingNumber = generateTrackingNumber();

    let deptId = req.user.department;
    if (departmentName) {
      const dept = await Department.findOne({
        $or: [{ name: { $regex: departmentName, $options: 'i' } }, { code: departmentName.toUpperCase() }]
      });
      if (dept) deptId = dept._id;
    }

    const newRequest = await Request.create({
      trackingNumber,
      title,
      description,
      category: category || 'unknown',
      userCategoryProvided: Boolean(category && category !== 'unknown'),
      priority: priority || 'MEDIUM',
      userPriorityProvided: Boolean(priority),
      amount: amount !== undefined ? amount : null,
      currency,
      requestedDate: requestedDate ? new Date(requestedDate) : null,
      department: deptId,
      departmentName: departmentName || 'General Operations',
      creator: req.user._id,
      attachments,
      status: 'AI_PROCESSING'
    });

    await logAudit({
      actor: req.user,
      action: 'REQUEST_CREATED',
      entity: 'Request',
      entityId: newRequest._id.toString(),
      metadata: { trackingNumber, title, category, amount },
      ipAddress: req.ip
    });

    // Execute intelligent automation pipeline
    try {
      await processNewRequestAutomation(newRequest._id);
    } catch (autoErr) {
      console.error('[RequestController] Automation pipeline warning:', autoErr.message);
    }

    // Reload with all populated workflow details
    const populated = await Request.findById(newRequest._id)
      .populate('creator', 'name email role department')
      .populate('workflowId');

    return successResponse(res, { request: populated }, 'Request created and automated successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const { status, category, priority, search, page = 1, limit = 50 } = req.query;
    const query = {};

    // Role-based visibility
    if (req.user.role === 'EMPLOYEE') {
      query.creator = req.user._id;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Request.countDocuments(query);
    const requests = await Request.find(query)
      .populate('creator', 'name email role')
      .populate('workflowId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return successResponse(
      res,
      {
        requests,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / parseInt(limit, 10))
        }
      },
      'Requests retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('creator', 'name email role department title')
      .populate('department')
      .populate({
        path: 'workflowId',
        populate: [
          { path: 'assignedUser', select: 'name email role' },
          { path: 'assignedDepartment' }
        ]
      });

    if (!request) {
      return errorResponse(res, 'Request not found', [], 404);
    }

    // Role-based check: Employee can only see their own requests unless admin/manager
    if (req.user.role === 'EMPLOYEE' && String(request.creator._id) !== String(req.user._id)) {
      return errorResponse(res, 'You are not authorized to view this request', [], 403);
    }

    // Fetch related tasks, approvals, and comments
    const tasks = await Task.find({ requestId: request._id })
      .populate('assignedUser', 'name email role')
      .sort({ createdAt: -1 });

    const approvals = await Approval.find({ requestId: request._id })
      .populate('approverId', 'name email role')
      .sort({ decisionDate: -1 });

    const comments = await Comment.find({ requestId: request._id })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 });

    return successResponse(
      res,
      {
        request,
        tasks,
        approvals,
        comments
      },
      'Request details retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const updateRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return errorResponse(res, 'Request not found', [], 404);
    }

    if (req.user.role === 'EMPLOYEE' && String(request.creator) !== String(req.user._id)) {
      return errorResponse(res, 'Not authorized to modify this request', [], 403);
    }

    const { title, description, category, priority, amount } = req.body;
    if (title) request.title = title;
    if (description) request.description = description;
    if (category) request.category = category;
    if (priority) request.priority = priority;
    if (amount !== undefined) request.amount = amount;

    await request.save();

    await logAudit({
      actor: req.user,
      action: 'REQUEST_UPDATED',
      entity: 'Request',
      entityId: request._id.toString(),
      metadata: req.body,
      ipAddress: req.ip
    });

    return successResponse(res, { request }, 'Request updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return errorResponse(res, 'Request not found', [], 404);
    }

    if (req.user.role === 'EMPLOYEE' && String(request.creator) !== String(req.user._id)) {
      return errorResponse(res, 'Not authorized to cancel this request', [], 403);
    }

    request.status = 'CANCELLED';
    await request.save();

    if (request.workflowId) {
      await Workflow.findByIdAndUpdate(request.workflowId, {
        currentState: 'CANCELLED',
        previousState: request.status
      });
    }

    await logAudit({
      actor: req.user,
      action: 'REQUEST_CANCELLED',
      entity: 'Request',
      entityId: request._id.toString(),
      ipAddress: req.ip
    });

    return successResponse(res, null, 'Request cancelled successfully');
  } catch (error) {
    next(error);
  }
};
