import { Task } from '../models/Task.js';
import { Workflow } from '../models/Workflow.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, workflowId, assignedUser, myTasks, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (workflowId) query.workflowId = workflowId;

    if (myTasks === 'true' || req.user.role === 'EMPLOYEE') {
      query.$or = [{ assignedUser: req.user._id }, { assignedRole: req.user.role }];
    } else if (assignedUser) {
      query.assignedUser = assignedUser;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedUser', 'name email role')
      .populate('requestId', 'title trackingNumber category amount status')
      .populate('workflowId')
      .sort({ createdAt: -1 });

    return successResponse(res, { tasks, count: tasks.length }, 'Tasks retrieved');
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, workflowId, requestId, assignedUser, assignedRole, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      workflowId,
      requestId,
      assignedUser: assignedUser || null,
      assignedRole: assignedRole || 'EMPLOYEE',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null
    });

    await logAudit({
      actor: req.user,
      action: 'TASK_CREATED',
      entity: 'Task',
      entityId: task._id.toString(),
      metadata: { title, workflowId, assignedRole },
      ipAddress: req.ip
    });

    if (assignedUser) {
      await createNotification({
        recipientId: assignedUser,
        senderId: req.user._id,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `You were assigned: "${title}"`,
        requestId,
        workflowId
      });
    }

    return successResponse(res, { task }, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', [], 404);
    }

    const { title, description, assignedUser, assignedRole, priority, status, dueDate } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedUser !== undefined) task.assignedUser = assignedUser;
    if (assignedRole) task.assignedRole = assignedRole;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate) task.dueDate = new Date(dueDate);

    await task.save();

    await logAudit({
      actor: req.user,
      action: 'TASK_UPDATED',
      entity: 'Task',
      entityId: task._id.toString(),
      metadata: req.body,
      ipAddress: req.ip
    });

    return successResponse(res, { task }, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const { completionNotes = 'Task completed' } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return errorResponse(res, 'Task not found', [], 404);
    }

    task.status = 'COMPLETED';
    task.completedAt = new Date();
    task.completedBy = req.user._id;
    task.completionNotes = completionNotes;
    await task.save();

    await logAudit({
      actor: req.user,
      action: 'TASK_COMPLETED',
      entity: 'Task',
      entityId: task._id.toString(),
      metadata: { completionNotes },
      ipAddress: req.ip
    });

    return successResponse(res, { task }, 'Task marked as completed');
  } catch (error) {
    next(error);
  }
};
