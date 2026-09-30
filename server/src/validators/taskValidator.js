import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().default(''),
  workflowId: z.string().min(1, 'Workflow ID is required'),
  requestId: z.string().min(1, 'Request ID is required'),
  assignedUser: z.string().optional().nullable(),
  assignedRole: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional().default('EMPLOYEE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  dueDate: z.string().optional().nullable()
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  assignedUser: z.string().optional().nullable(),
  assignedRole: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']).optional(),
  dueDate: z.string().optional().nullable()
});

export const completeTaskSchema = z.object({
  completionNotes: z.string().optional().default('Task completed')
});
