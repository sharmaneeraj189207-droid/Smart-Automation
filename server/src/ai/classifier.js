import { z } from 'zod';
import { callGeminiJSON } from './geminiClient.js';

export const classificationResponseSchema = z.object({
  category: z.enum(['leave', 'expense', 'purchase', 'it_support', 'administrative', 'unknown']),
  confidence: z.number().min(0).max(1),
  reason: z.string()
});

/**
 * Heuristic fallback classifier if Gemini is unavailable
 */
export const heuristicClassify = (text = '') => {
  const lower = text.toLowerCase();
  
  if (lower.includes('leave') || lower.includes('vacation') || lower.includes('sick') || lower.includes('pto') || lower.includes('time off') || lower.includes('maternity') || lower.includes('paternity')) {
    return {
      category: 'leave',
      confidence: 0.94,
      reason: 'Keywords indicating employee time-off, sick day, or vacation detected.'
    };
  }
  
  if (lower.includes('reimbursement') || lower.includes('expense') || lower.includes('hotel') || lower.includes('flight') || lower.includes('travel') || lower.includes('client dinner') || lower.includes('taxi') || lower.includes('receipt') || lower.includes('spent')) {
    return {
      category: 'expense',
      confidence: 0.95,
      reason: 'The request contains reimbursement and operational business expense details.'
    };
  }

  if (lower.includes('purchase') || lower.includes('buy') || lower.includes('procure') || lower.includes('vendor') || lower.includes('subscription') || lower.includes('license') || lower.includes('hardware') || lower.includes('equipment')) {
    return {
      category: 'purchase',
      confidence: 0.92,
      reason: 'Procurement and corporate purchasing request indicators identified.'
    };
  }

  if (lower.includes('laptop') || lower.includes('password') || lower.includes('vpn') || lower.includes('access') || lower.includes('bug') || lower.includes('monitor') || lower.includes('it support') || lower.includes('software install') || lower.includes('error')) {
    return {
      category: 'it_support',
      confidence: 0.93,
      reason: 'Technical hardware, software, or account credential support required.'
    };
  }

  if (lower.includes('policy') || lower.includes('office') || lower.includes('visitor') || lower.includes('badge') || lower.includes('stationery') || lower.includes('admin') || lower.includes('facility')) {
    return {
      category: 'administrative',
      confidence: 0.89,
      reason: 'General administrative and workplace management inquiry.'
    };
  }

  return {
    category: 'unknown',
    confidence: 0.60,
    reason: 'Could not deterministically classify request category from description text.'
  };
};

/**
 * Classify a request using Gemini with Zod validation and fallback
 */
export const classifyRequest = async (title = '', description = '') => {
  const combinedText = `${title}\n${description}`.trim();

  const prompt = `
Analyze the following workplace request and classify it into exactly one of these categories:
- leave (time off, sick days, vacations, PTO)
- expense (reimbursements, travel expenses, client meals, receipts)
- purchase (buying equipment, software licenses, office assets, vendor procurement)
- it_support (laptop issues, account access, network problems, software bugs)
- administrative (office facilities, ID badges, general corporate queries)
- unknown

Request:
"""
${combinedText}
"""

Output JSON matching this schema:
{
  "category": "leave" | "expense" | "purchase" | "it_support" | "administrative" | "unknown",
  "confidence": number between 0.0 and 1.0,
  "reason": "Clear explanation of why this category was selected"
}
`;

  const aiResult = await callGeminiJSON(prompt, 'You are an enterprise AI request classifier. Output strict JSON only.');

  if (aiResult.success) {
    try {
      const validated = classificationResponseSchema.parse(aiResult.data);
      return validated;
    } catch (validationErr) {
      console.warn('[Classifier] AI response failed Zod validation, falling back to heuristic:', validationErr.message);
    }
  }

  return heuristicClassify(combinedText);
};
