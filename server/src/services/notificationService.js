import { Notification } from '../models/Notification.js';

export const createNotification = async ({
  recipientId,
  senderId = null,
  type,
  title,
  message,
  requestId = null,
  workflowId = null,
  metadata = {}
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      message,
      requestId,
      workflowId,
      metadata
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
};

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipientId: userId, isRead: false });
};
