/**
 * UI2MD — Gemini Provider
 *
 * Uses the Google GenAI REST API directly (no SDK needed in MV3 service workers).
 * Default model: gemini-3-flash-preview
 * Endpoint confirmed: https://ai.google.dev/gemini-api/docs/gemini-3
 */

import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

export const GEMINI_MODEL = 'gemini-3-flash-preview';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Call Gemini to generate a design system markdown document.
 * @param {string} apiKey - User's Gemini API key (AIza...)
 * @param {string|null} model - Model ID, or null to use default
 * @param {object} analysisData - Full raw analysis from content script + CDP
 * @returns {Promise<string>} - Complete markdown output
 */
export async function callGemini(apiKey, model, analysisData) {
  const key     = apiKey.trim();
  const modelId = (model && model.trim()) || GEMINI_MODEL;
  if (!key) throw new Error('No Gemini API key provided');

  const systemPrompt = buildSystemPrompt();
  const userPrompt   = buildUserPrompt(analysisData);

  const endpoint = `${API_BASE}/${modelId}:generateContent`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,        // low temp = factual, consistent output
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 65536,  // design docs can be long
      thinkingConfig: {
        thinkingLevel: 'low'   // faster, sufficient for structured generation
      }
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key          // confirmed header format from Gemini 3 docs
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Gemini API error: ${msg}`);
  }

  const data = await response.json();

  // Extract text from response
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const reason = data?.candidates?.[0]?.finishReason || 'unknown';
    throw new Error(`Gemini returned no content (finishReason: ${reason})`);
  }

  return text;
}

// ─── Provider Class ───────────────────────────────────────────────────────────

export class GeminiProvider {
  get name()         { return 'Gemini'; }
  get id()           { return 'gemini'; }
  get defaultModel() { return GEMINI_MODEL; }

  get models() {
    return [
      { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Default)' },
      { id: 'gemini-2.5-pro-preview-05-06', label: 'Gemini 2.5 Pro (Best quality)' }
    ];
  }

  get keyPlaceholder() { return 'AIza...'; }
  get keyDocsUrl()     { return 'https://aistudio.google.com/apikey'; }

  async call(apiKey, model, analysisData) {
    return callGemini(apiKey, model, analysisData);
  }

  validateKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.trim().length > 10;
  }
}
