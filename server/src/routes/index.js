import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import requestRoutes from './requestRoutes.js';
import workflowRoutes from './workflowRoutes.js';
import taskRoutes from './taskRoutes.js';
import aiRoutes from './aiRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import auditRoutes from './auditRoutes.js';
import ruleRoutes from './ruleRoutes.js';
import departmentRoutes from './departmentRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/requests', requestRoutes);
router.use('/workflows', workflowRoutes);
router.use('/tasks', taskRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/rules', ruleRoutes);
router.use('/departments', departmentRoutes);

export default router;
