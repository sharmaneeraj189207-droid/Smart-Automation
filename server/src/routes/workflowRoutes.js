import express from 'express';
import {
  getWorkflows,
  getWorkflowById,
  processWorkflow,
  approveWorkflow,
  rejectWorkflow,
  escalateWorkflow,
  runSlaCheck
} from '../controllers/workflowController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { approveWorkflowSchema, rejectWorkflowSchema, escalateWorkflowSchema } from '../validators/workflowValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getWorkflows);
router.get('/:id', getWorkflowById);

// Trigger automation re-run
router.post('/:id/process', requireRole(['ADMIN', 'MANAGER']), processWorkflow);

// Approvals & Rejections (Admin and Manager)
router.post('/:id/approve', requireRole(['ADMIN', 'MANAGER']), validate(approveWorkflowSchema), approveWorkflow);
router.post('/:id/reject', requireRole(['ADMIN', 'MANAGER']), validate(rejectWorkflowSchema), rejectWorkflow);
router.post('/:id/escalate', requireRole(['ADMIN', 'MANAGER']), validate(escalateWorkflowSchema), escalateWorkflow);

// SLA check endpoint
router.post('/sla-check', runSlaCheck);

export default router;
