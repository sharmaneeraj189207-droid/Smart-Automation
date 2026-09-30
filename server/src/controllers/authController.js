import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { config } from '../config/env.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAudit } from '../services/auditService.js';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: '7d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'EMPLOYEE', department, title } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', [], 409);
    }

    let deptId = null;
    if (department) {
      const foundDept = await Department.findOne({
        $or: [{ _id: department.match(/^[0-9a-fA-F]{24}$/) ? department : null }, { name: department }, { code: department }]
      });
      if (foundDept) deptId = foundDept._id;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department: deptId,
      title: title || (role === 'ADMIN' ? 'System Administrator' : role === 'MANAGER' ? 'Department Manager' : 'Staff Member')
    });

    const token = generateToken(user._id, user.role);

    await logAudit({
      actor: user,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user._id.toString(),
      metadata: { role: user.role, email: user.email },
      ipAddress: req.ip
    });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          department: user.department
        }
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('department');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', [], 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', [], 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Please contact an administrator.', [], 403);
    }

    const token = generateToken(user._id, user.role);

    await logAudit({
      actor: user,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip
    });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          department: user.department
        }
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    return successResponse(res, { user }, 'Current user profile retrieved');
  } catch (error) {
    next(error);
  }
};
