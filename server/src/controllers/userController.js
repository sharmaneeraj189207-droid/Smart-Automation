import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).populate('department').sort({ createdAt: -1 });
    return successResponse(res, { users, count: users.length }, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('department');
    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }
    return successResponse(res, { user }, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, role, department, title, isActive } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (title !== undefined) updateData.title = title;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('department');
    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }

    await logAudit({
      actor: req.user,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: user._id.toString(),
      metadata: updateData,
      ipAddress: req.ip
    });

    return successResponse(res, { user }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }

    // Soft delete: deactivate user
    user.isActive = false;
    await user.save();

    await logAudit({
      actor: req.user,
      action: 'USER_DEACTIVATED',
      entity: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip
    });

    return successResponse(res, null, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};
