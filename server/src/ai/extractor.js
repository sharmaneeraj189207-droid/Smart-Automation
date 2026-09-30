import { z } from 'zod';
import { callGeminiJSON } from './geminiClient.js';

export const extractionResponseSchema = z.object({
  amount: z.number().nullable().optional(),
  currency: z.string().default('INR'),
  purpose: z.string().default(''),
  date: z.string().default(''),
  urgency: z.string().default('NORMAL'),
  vendor: z.string().default(''),
  missingFields: z.array(z.string()).default([])
});

/**
 * Heuristic fallback extractor using regex and pattern matching
 */
export const heuristicExtract = (text = '') => {
  let amount = null;
  let currency = 'INR';
  let date = '';
  let purpose = '';
  let urgency = 'NORMAL';
  let vendor = '';
  const missingFields = [];

  // Match currency and amount e.g. ₹8,500, INR 8500, Rs. 1200, $500, 8,500, etc.
  const amountMatch = text.match(/(?:₹|rs\.?|inr|\$|€|\?)\s*([\d,]+(?:\.\d+)?)/i) ||
                      text.match(/\b([\d]{1,3}(?:,\d{2,3})+(?:\.\d+)?)\b/) ||
                      text.match(/([\d,]+(?:\.\d+)?)\s*(?:rupees|inr|rs)/i) ||
                      text.match(/\b([\d]{2,8}(?:\.\d{1,2})?)\b/);

  if (amountMatch) {
    const rawVal = amountMatch[1].replace(/,/g, '');
    const parsedNum = parseFloat(rawVal);
    if (!isNaN(parsedNum)) {
      amount = parsedNum;
    }
  }

  if (text.includes('$')) {
    currency = 'USD';
  } else if (text.includes('€')) {
    currency = 'EUR';
  } else {
    currency = 'INR';
  }

  // Date matching
  const dateMatch = text.match(/\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/) ||
                    text.match(/\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(?:\d{4})?)\b/i);
  if (dateMatch) {
    date = dateMatch[1];
  } else {
    date = new Date().toISOString().split('T')[0];
  }

  // Purpose extraction
  const lower = text.toLowerCase();
  if (lower.includes('for ')) {
    const parts = text.split(/for\s+/i);
    if (parts[1]) {
      purpose = parts[1].split(/[.,\n]/)[0].trim();
    }
  } else if (lower.includes('spent on ')) {
    const parts = text.split(/spent on\s+/i);
    if (parts[1]) {
      purpose = parts[1].split(/[.,\n]/)[0].trim();
    }
  } else {
    purpose = text.slice(0, 80).trim();
  }

  // Vendor detection
  const vendorMatch = text.match(/(?:from|vendor|merchant|at)\s+([A-Z][a-zA-Z0-9\s&]+?)(?:\s+(?:for|on|dated|\.|\,)|$)/);
  if (vendorMatch) {
    vendor = vendorMatch[1].trim();
  }

  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately') || lower.includes('critical')) {
    urgency = 'HIGH';
  }

  if (amount === null && (lower.includes('reimbursement') || lower.includes('expense') || lower.includes('purchase'))) {
    missingFields.push('amount');
  }

  return {
    amount,
    currency,
    purpose,
    date,
    urgency,
    vendor,
    missingFields
  };
};

/**
 * Extract structured information using Gemini with Zod validation
 */
export const extractInformation = async (title = '', description = '') => {
  const combinedText = `${title}\n${description}`.trim();

  const prompt = `
Extract structured fields from this workplace request:
"""
${combinedText}
"""

Extract the following in strict JSON:
{
  "amount": number (or null if not mentioned),
  "currency": "INR" | "USD" | "EUR" | other (default "INR"),
  "purpose": "short summary of the purpose or reason",
  "date": "YYYY-MM-DD or date string mentioned (or empty string)",
  "urgency": "NORMAL" | "HIGH" | "CRITICAL",
  "vendor": "vendor/store name if mentioned (or empty string)",
  "missingFields": ["array of missing vital fields like 'amount', 'date', 'receipt' if incomplete"]
}
`;

  const aiResult = await callGeminiJSON(prompt, 'You are an enterprise information extraction AI. Return strict JSON only.');

  if (aiResult.success) {
    try {
      const validated = extractionResponseSchema.parse(aiResult.data);
      return validated;
    } catch (validationErr) {
      console.warn('[Extractor] AI response failed Zod validation, falling back to heuristic:', validationErr.message);
    }
  }

  return heuristicExtract(combinedText);
};
