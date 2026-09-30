import { z } from 'zod';

export const approveWorkflowSchema = z.object({
  comment: z.string().optional().default('Approved')
});

export const rejectWorkflowSchema = z.object({
  comment: z.string().min(1, 'Reason for rejection is required')
});

export const escalateWorkflowSchema = z.object({
  reason: z.string().min(1, 'Escalation reason is required')
});

export const transitionStateSchema = z.object({
  nextState: z.enum([
    'CREATED',
    'AI_PROCESSING',
    'CLASSIFIED',
    'PENDING_INFORMATION',
    'PENDING_APPROVAL',
    'APPROVED',
    'IN_PROGRESS',
    'COMPLETED',
    'REJECTED',
    'CANCELLED',
    'ESCALATED'
  ]),
  notes: z.string().optional()
});
