import { config } from '../config/env.js';
import { errorResponse } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, [], 404);
};

export const errorHandler = (err, req, res, next) => {
  console.error('[Error caught in centralized handler]:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return errorResponse(res, `Resource not found with id of ${err.value}`, [], 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, `Duplicate entry for ${field}. Value already exists.`, [], 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
    return errorResponse(res, 'Database validation error', errors, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authentication token', [], 401);
  }

  // Fallback server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = config.isProduction ? [] : [err.stack];

  return errorResponse(res, message, errors, statusCode);
};
