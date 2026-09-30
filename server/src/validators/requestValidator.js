import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum(['leave', 'expense', 'purchase', 'it_support', 'administrative', 'unknown']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().optional().default('INR'),
  requestedDate: z.string().optional().nullable(),
  departmentName: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    fileType: z.string().optional(),
    size: z.number().optional()
  })).optional().default([])
});

export const updateRequestSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(5).optional(),
  category: z.enum(['leave', 'expense', 'purchase', 'it_support', 'administrative', 'unknown']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().optional(),
  status: z.string().optional()
});
