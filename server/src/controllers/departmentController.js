import { Department } from '../models/Department.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).populate('managerId', 'name email role');
    return successResponse(res, { departments }, 'Departments retrieved');
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, managerId, budget } = req.body;
    const department = await Department.create({
      name,
      code,
      description,
      managerId: managerId || null,
      budget: budget || 0
    });

    await logAudit({
      actor: req.user,
      action: 'DEPARTMENT_CREATED',
      entity: 'Department',
      entityId: department._id.toString(),
      metadata: req.body,
      ipAddress: req.ip
    });

    return successResponse(res, { department }, 'Department created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) {
      return errorResponse(res, 'Department not found', [], 404);
    }

    await logAudit({
      actor: req.user,
      action: 'DEPARTMENT_UPDATED',
      entity: 'Department',
      entityId: department._id.toString(),
      metadata: req.body,
      ipAddress: req.ip
    });

    return successResponse(res, { department }, 'Department updated');
  } catch (error) {
    next(error);
  }
};
