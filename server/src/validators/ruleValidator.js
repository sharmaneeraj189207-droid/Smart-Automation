import { z } from 'zod';

export const createRuleSchema = z.object({
  name: z.string().min(3, 'Rule name is required'),
  description: z.string().optional().default(''),
  category: z.enum(['leave', 'expense', 'purchase', 'it_support', 'administrative', 'ALL']).default('ALL'),
  isActive: z.boolean().optional().default(true),
  priorityOrder: z.number().optional().default(1),
  conditions: z.object({
    minAmount: z.number().nullable().optional(),
    maxAmount: z.number().nullable().optional(),
    priorityLevel: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])).optional(),
    keywords: z.array(z.string()).optional(),
    requiresFields: z.array(z.string()).optional()
  }).optional().default({}),
  actions: z.object({
    autoApprove: z.boolean().optional().default(false),
    requiresManagerApproval: z.boolean().optional().default(false),
    requiresAdminApproval: z.boolean().optional().default(false),
    assignDepartmentCode: z.string().nullable().optional(),
    assignRole: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional().default('MANAGER'),
    slaHours: z.number().optional().default(24),
    notificationMessage: z.string().optional().default('')
  }).optional().default({})
});

export const updateRuleSchema = createRuleSchema.partial();
