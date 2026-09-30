import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

let genAI = null;

if (config.geminiApiKey && config.geminiApiKey.trim() !== '' && config.geminiApiKey !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    console.log('[AI Service] Google Gemini API initialized successfully.');
  } catch (err) {
    console.warn('[AI Service] Failed to initialize Google Gemini client, will use heuristic engine:', err.message);
  }
} else {
  console.log('[AI Service] GEMINI_API_KEY not configured or placeholder detected. Operating in intelligent local heuristic mode.');
}

/**
 * Execute Gemini call requesting strict JSON output.
 * Retries once on invalid JSON, with fallback on failure.
 */
export const callGeminiJSON = async (prompt, systemInstruction = '', retryCount = 1) => {
  if (!genAI) {
    return { success: false, reason: 'NO_API_KEY' };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      },
      systemInstruction: systemInstruction || 'You are an intelligent business workflow automation engine. Return strictly valid JSON only.'
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      return { success: true, data: parsed };
    } catch (parseErr) {
      if (retryCount > 0) {
        console.warn('[AI Service] JSON parse failed, retrying once...');
        return await callGeminiJSON(prompt + '\n\nIMPORTANT: Return ONLY valid, RFC 8259 compliant JSON. No markdown ticks, no preamble.', systemInstruction, retryCount - 1);
      }
      return { success: false, reason: 'INVALID_JSON', raw: text };
    }
  } catch (error) {
    console.warn('[AI Service] Gemini API call error:', error.message);
    return { success: false, reason: 'API_ERROR', error: error.message };
  }
};
