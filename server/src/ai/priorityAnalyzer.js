import { z } from 'zod';
import { callGeminiJSON } from './geminiClient.js';

export const priorityResponseSchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.number().min(0).max(1),
  reason: z.string()
});

/**
 * Heuristic fallback for priority analysis
 */
export const heuristicPriority = (text = '', category = '', amount = null) => {
  const lower = text.toLowerCase();

  if (lower.includes('down') || lower.includes('outage') || lower.includes('security breach') || lower.includes('production blocked') || lower.includes('emergency')) {
    return {
      priority: 'CRITICAL',
      confidence: 0.95,
      reason: 'Keywords indicate a severe operational outage or production blocker.'
    };
  }

  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediate') || lower.includes('client meeting tomorrow') || (amount && amount > 25000)) {
    return {
      priority: 'HIGH',
      confidence: 0.88,
      reason: amount && amount > 25000
        ? 'High value financial threshold exceeded requiring accelerated review.'
        : 'Urgent timeline keywords detected.'
    };
  }

  if (category === 'expense' && amount && amount > 5000) {
    return {
      priority: 'MEDIUM',
      confidence: 0.85,
      reason: 'Standard expense amount requiring manager approval.'
    };
  }

  if (category === 'administrative' || lower.includes('stationery') || lower.includes('routine')) {
    return {
      priority: 'LOW',
      confidence: 0.82,
      reason: 'Standard non-time-critical operational request.'
    };
  }

  return {
    priority: 'MEDIUM',
    confidence: 0.75,
    reason: 'Standard business workflow priority evaluated.'
  };
};

/**
 * Analyze priority using Gemini with Zod validation
 */
export const analyzePriority = async (title = '', description = '', category = '', amount = null) => {
  const combinedText = `${title}\n${description}`.trim();

  const prompt = `
Analyze the priority for this workplace request:
Category: ${category}
Amount: ${amount ? amount : 'N/A'}
Text:
"""
${combinedText}
"""

Evaluate if this is LOW, MEDIUM, HIGH, or CRITICAL priority.
Output strict JSON:
{
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number between 0.0 and 1.0,
  "reason": "Clear justification for this priority level"
}
`;

  const aiResult = await callGeminiJSON(prompt, 'You are an enterprise SLA priority detection AI. Return strict JSON only.');

  if (aiResult.success) {
    try {
      const validated = priorityResponseSchema.parse(aiResult.data);
      return validated;
    } catch (validationErr) {
      console.warn('[PriorityAnalyzer] AI response failed Zod validation, falling back to heuristic:', validationErr.message);
    }
  }

  return heuristicPriority(combinedText, category, amount);
};
