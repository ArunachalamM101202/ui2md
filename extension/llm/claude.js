/**
 * UI2MD — Claude (Anthropic) Provider
 *
 * Calls the Anthropic Messages API directly (no SDK — MV3 service worker compatible).
 * Default model: claude-opus-4-6
 * Docs: https://docs.anthropic.com/en/api/messages
 */

import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

export const CLAUDE_MODEL = 'claude-opus-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Call Claude to generate a design system markdown document.
 * @param {string} apiKey - User's Anthropic API key (sk-ant-...)
 * @param {string|null} model - Model ID, or null to use default
 * @param {object} analysisData - Full raw analysis from content script + CDP
 * @returns {Promise<string>} - Complete markdown output
 */
export async function callClaude(apiKey, model, analysisData) {
  const key     = apiKey.trim();
  const modelId = (model && model.trim()) || CLAUDE_MODEL;
  if (!key) throw new Error('No Anthropic API key provided');

  const systemPrompt = buildSystemPrompt();
  const userPrompt   = buildUserPrompt(analysisData);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key':         key
    },
    body: JSON.stringify({
      model:      modelId,
      max_tokens: 16000,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Anthropic API error: ${msg}`);
  }

  const data = await response.json();

  const text = data?.content?.[0]?.text;
  if (!text) {
    const reason = data?.stop_reason || 'unknown';
    throw new Error(`Claude returned no content (stop_reason: ${reason})`);
  }

  return text;
}

// ─── Provider Class ───────────────────────────────────────────────────────────

export class ClaudeProvider {
  get name()         { return 'Claude'; }
  get id()           { return 'claude'; }
  get defaultModel() { return CLAUDE_MODEL; }

  get models() {
    return [
      { id: 'claude-opus-4-6',          label: 'Claude Opus 4.6 (Best quality)' },
      { id: 'claude-sonnet-4-6',        label: 'Claude Sonnet 4.6 (Balanced)' },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Fastest)' }
    ];
  }

  get keyPlaceholder() { return 'sk-ant-api03-...'; }
  get keyDocsUrl()     { return 'https://console.anthropic.com/settings/keys'; }

  async call(apiKey, model, analysisData) {
    return callClaude(apiKey, model, analysisData);
  }

  validateKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.trim().startsWith('sk-ant-');
  }
}
