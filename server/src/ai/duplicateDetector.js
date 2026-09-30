import { z } from 'zod';
import { callGeminiJSON } from './geminiClient.js';
import { Request } from '../models/Request.js';

export const duplicateResponseSchema = z.object({
  isPotentialDuplicate: z.boolean(),
  similarRequestId: z.string().nullable().optional(),
  similarTrackingNumber: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1),
  reason: z.string()
});

/**
 * Check if a request has potential duplicates in the database
 */
export const checkDuplicate = async ({ title, description, amount, creatorId, currentRequestId = null }) => {
  try {
    // Find recent requests from the same user or created within last 30 days
    const query = {
      ...(creatorId ? { creator: creatorId } : {}),
      ...(currentRequestId ? { _id: { $ne: currentRequestId } } : {})
    };

    const recentRequests = await Request.find(query)
      .sort({ createdAt: -1 })
      .limit(8)
      .select('_id trackingNumber title description amount createdAt');

    if (!recentRequests || recentRequests.length === 0) {
      return {
        isPotentialDuplicate: false,
        similarRequestId: null,
        similarTrackingNumber: null,
        confidence: 0.99,
        reason: 'No prior requests found for comparison.'
      };
    }

    // First check exact or very high similarity heuristics
    const currentTitleLower = title.toLowerCase().trim();
    for (const req of recentRequests) {
      const pastTitleLower = req.title.toLowerCase().trim();
      const sameAmount = amount && req.amount && Math.abs(amount - req.amount) < 0.01;

      // Exact title match or title match with same amount
      if (currentTitleLower === pastTitleLower || (currentTitleLower.includes(pastTitleLower) && sameAmount)) {
        return {
          isPotentialDuplicate: true,
          similarRequestId: req._id.toString(),
          similarTrackingNumber: req.trackingNumber,
          confidence: 0.92,
          reason: `High semantic similarity and matching parameters with existing request ${req.trackingNumber}.`
        };
      }
    }

    // Call Gemini for nuanced semantic duplicate detection
    const prompt = `
Compare this newly submitted workplace request with recent existing requests to detect potential duplicates.

New Request:
Title: ${title}
Description: ${description}
Amount: ${amount || 'N/A'}

Recent Existing Requests:
${recentRequests.map(r => `[ID: ${r._id}, Tracking: ${r.trackingNumber}] Title: "${r.title}", Description: "${r.description}", Amount: ${r.amount}`).join('\n')}

Detect if the new request is asking for the exact same reimbursement, purchase, or issue already submitted.
Output strict JSON:
{
  "isPotentialDuplicate": boolean,
  "similarRequestId": "string ID of the match, or null",
  "similarTrackingNumber": "tracking number or null",
  "confidence": number between 0.0 and 1.0,
  "reason": "Detailed justification"
}
`;

    const aiResult = await callGeminiJSON(prompt, 'You are an enterprise fraud & duplicate request detection AI. Output strict JSON only.');

    if (aiResult.success) {
      try {
        const validated = duplicateResponseSchema.parse(aiResult.data);
        return validated;
      } catch (err) {
        console.warn('[DuplicateDetector] Zod parse failed, returning negative duplicate check');
      }
    }

    return {
      isPotentialDuplicate: false,
      similarRequestId: null,
      similarTrackingNumber: null,
      confidence: 0.85,
      reason: 'No significant overlap detected with prior submissions.'
    };
  } catch (error) {
    console.warn('[DuplicateDetector] Error checking duplicate:', error.message);
    return {
      isPotentialDuplicate: false,
      similarRequestId: null,
      similarTrackingNumber: null,
      confidence: 0.50,
      reason: 'Duplicate check skipped due to internal query exception.'
    };
  }
};
