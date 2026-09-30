import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({
  actor = null,
  actorName = 'SYSTEM',
  actorRole = 'SYSTEM',
  action,
  entity,
  entityId,
  metadata = {},
  ipAddress = '127.0.0.1'
}) => {
  try {
    const log = await AuditLog.create({
      actor: actor?._id || actor || null,
      actorName: actor?.name || actorName,
      actorRole: actor?.role || actorRole,
      action,
      entity,
      entityId: String(entityId),
      metadata,
      ipAddress
    });
    return log;
  } catch (error) {
    console.error('[AuditService] Failed to write audit log:', error.message);
    return null;
  }
};
