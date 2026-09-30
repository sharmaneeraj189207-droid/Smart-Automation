import { z } from 'zod';
import { callGeminiJSON } from './geminiClient.js';

export const recommendationResponseSchema = z.object({
  recommendedAction: z.string(),
  reason: z.string(),
  requiresHumanApproval: z.boolean().default(true),
  suggestedAssigneeRole: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).default('MANAGER')
});

/**
 * Heuristic recommendation engine based on enterprise rules
 */
export const heuristicRecommend = ({ category, amount, priority, missingFields = [] }) => {
  if (missingFields.length > 0) {
    return {
      recommendedAction: 'request_information',
      reason: `Required information missing: ${missingFields.join(', ')}. Request details from the submitter.`,
      requiresHumanApproval: false,
      suggestedAssigneeRole: 'EMPLOYEE'
    };
  }

  if (category === 'expense') {
    if (amount !== null && amount < 5000) {
      return {
        recommendedAction: 'auto_process',
        reason: `Expense amount (₹${amount}) is below the ₹5,000 threshold and eligible for automated processing.`,
        requiresHumanApproval: false,
        suggestedAssigneeRole: 'EMPLOYEE'
      };
    } else if (amount !== null && amount > 25000) {
      return {
        recommendedAction: 'admin_and_manager_approval',
        reason: `Expense amount (₹${amount}) exceeds ₹25,000 requiring dual approval by Manager and Finance Admin.`,
        requiresHumanApproval: true,
        suggestedAssigneeRole: 'ADMIN'
      };
    } else {
      return {
        recommendedAction: 'manager_approval',
        reason: `Expense amount (${amount ? '₹' + amount : 'unspecified'}) requires standard Department Manager review and approval.`,
        requiresHumanApproval: true,
        suggestedAssigneeRole: 'MANAGER'
      };
    }
  }

  if (category === 'purchase') {
    return {
      recommendedAction: 'manager_approval',
      reason: 'Procurement requests require Department Manager verification and quotation audit.',
      requiresHumanApproval: true,
      suggestedAssigneeRole: 'MANAGER'
    };
  }

  if (category === 'leave') {
    return {
      recommendedAction: 'manager_approval',
      reason: 'Time-off and PTO requests require manager sign-off for team coverage.',
      requiresHumanApproval: true,
      suggestedAssigneeRole: 'MANAGER'
    };
  }

  if (priority === 'CRITICAL') {
    return {
      recommendedAction: 'immediate_escalation',
      reason: 'Critical priority incident requires immediate escalation to IT lead or Admin.',
      requiresHumanApproval: true,
      suggestedAssigneeRole: 'ADMIN'
    };
  }

  return {
    recommendedAction: 'manager_approval',
    reason: 'Standard workflow routing to department manager for review.',
    requiresHumanApproval: true,
    suggestedAssigneeRole: 'MANAGER'
  };
};

/**
 * Recommend next action using Gemini with Zod validation
 */
export const recommendNextAction = async ({ title, description, category, amount, priority, missingFields = [] }) => {
  const prompt = `
Recommend the appropriate next operational workflow action for this request:
Title: ${title}
Description: ${description}
Category: ${category}
Amount: ${amount}
Priority: ${priority}
Missing fields: ${missingFields.join(', ')}

Corporate Approval Thresholds:
- Expense < ₹5,000: Auto-process if complete
- Expense ₹5,000 - ₹25,000: Manager approval
- Expense > ₹25,000: Dual Manager + Admin approval
- Purchase: Manager approval
- Missing vital information: Request more info from submitter
- Critical priority: Escalation

Output strict JSON:
{
  "recommendedAction": "manager_approval" | "auto_process" | "admin_and_manager_approval" | "request_information" | "immediate_escalation",
  "reason": "Clear explanation of rule or policy justification",
  "requiresHumanApproval": boolean,
  "suggestedAssigneeRole": "ADMIN" | "MANAGER" | "EMPLOYEE"
}
`;

  const aiResult = await callGeminiJSON(prompt, 'You are an enterprise workflow routing recommendation engine. Return strict JSON only.');

  if (aiResult.success) {
    try {
      const validated = recommendationResponseSchema.parse(aiResult.data);
      return validated;
    } catch (validationErr) {
      console.warn('[RecommendationEngine] AI response failed Zod validation, falling back to heuristic:', validationErr.message);
    }
  }

  return heuristicRecommend({ category, amount, priority, missingFields });
};
