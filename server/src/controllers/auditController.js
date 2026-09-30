import { AuditLog } from '../models/AuditLog.js';
import { successResponse } from '../utils/apiResponse.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entity, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { actorName: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return successResponse(res, { logs, total }, 'Audit logs retrieved');
  } catch (error) {
    next(error);
  }
};
