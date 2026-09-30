import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication token missing or invalid', [], 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return errorResponse(res, 'User no longer exists', [], 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'User account is deactivated', [], 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please log in again.', [], 401);
    }
    return errorResponse(res, 'Invalid authentication token', [], 401);
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', [], 401);
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: Access requires one of [${roles.join(', ')}] roles. Your role is '${req.user.role}'`,
        [],
        403
      );
    }

    next();
  };
};
