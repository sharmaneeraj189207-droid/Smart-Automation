import { z } from 'zod';
import { callGeminiJSON } from './geminiClient.js';

export const summaryResponseSchema = z.object({
  summary: z.string(),
  highlights: z.array(z.string()).optional(),
  outcome: z.string().optional()
});

/**
 * Generate completion summary of a completed or rejected workflow
 */
export const generateWorkflowSummary = async ({ request, workflow, approvals = [], tasks = [] }) => {
  const prompt = `
Generate a concise, professional executive workflow completion summary:
Request Title: ${request.title}
Tracking ID: ${request.trackingNumber}
Category: ${request.category}
Amount: ${request.amount ? request.currency + ' ' + request.amount : 'N/A'}
Status: ${workflow.currentState}
Approvals: ${approvals.map(a => `${a.approverRole} (${a.action}): ${a.comment}`).join(' | ') || 'None'}
Tasks: ${tasks.map(t => `${t.title} [${t.status}]`).join(' | ') || 'None'}

Provide:
1. Concise executive summary (3-4 sentences)
2. Highlights of key decisions and timeline
3. Final outcome

Output strict JSON:
{
  "summary": "Executive summary text covering request, actions taken, approvals, and final result",
  "highlights": ["Key decision 1", "Key timeline 2"],
  "outcome": "Approved and processed successfully"
}
`;

  const aiResult = await callGeminiJSON(prompt, 'You are an enterprise workflow audit summarizer. Return strict JSON only.');

  if (aiResult.success) {
    try {
      const validated = summaryResponseSchema.parse(aiResult.data);
      return validated.summary;
    } catch (err) {
      console.warn('[SummaryGenerator] Zod validation failed, using structured template fallback');
    }
  }

  // Deterministic professional template fallback
  const approverNotes = approvals.length > 0
    ? `Review conducted by ${approvals[0].approverRole || 'Manager'} with decision: ${approvals[0].action} ("${approvals[0].comment || 'Approved'}").`
    : 'Automated processing rules were applied without manual intervention.';

  const amountNote = request.amount ? ` Valued at ${request.currency} ${request.amount.toLocaleString()}.` : '';

  return `Workflow ${request.trackingNumber} for "${request.title}" (${request.category.toUpperCase()}) has concluded with status ${workflow.currentState}.${amountNote} ${approverNotes} All associated action items have been marked complete and recorded in the audit log.`;
};

/**
 * Generate professional notification message for specific workflow event
 */
export const generateNotificationMessage = async ({ eventType, request, approverName = '', reason = '' }) => {
  switch (eventType) {
    case 'APPROVAL_REQUIRED':
      return `Action Required: Request "${request.title}" (${request.trackingNumber}) requires your review and approval.`;
    case 'REQUEST_APPROVED':
      return `Good news! Your request "${request.title}" (${request.trackingNumber}) was approved by ${approverName || 'Management'}.`;
    case 'REQUEST_REJECTED':
      return `Notice: Your request "${request.title}" was rejected. Reason: ${reason || 'Does not comply with current expense policy'}.`;
    case 'TASK_ASSIGNED':
      return `New task assigned to you for workflow "${request.title}" (${request.trackingNumber}).`;
    case 'WORKFLOW_COMPLETED':
      return `Workflow "${request.title}" (${request.trackingNumber}) has been completed successfully.`;
    case 'WORKFLOW_ESCALATED':
      return `URGENT: Request "${request.title}" (${request.trackingNumber}) has breached SLA thresholds and has been escalated.`;
    case 'AI_FLAGGED_DUPLICATE':
      return `AI Audit Warning: Potential duplicate detected for request "${request.title}". Please verify before processing.`;
    default:
      return `Update on request "${request.title}" (${request.trackingNumber}): Status changed to ${request.status}.`;
  }
};
