/**
 * UI2MD — LLM Provider Interface & Factory
 *
 * This is the abstraction layer for all LLM providers.
 * To add a new provider (e.g. OpenAI, Claude):
 *   1. Create a new file: llm/openai.js implementing BaseLLMProvider
 *   2. Import it here and add a case to createProvider()
 *   3. Add it to PROVIDERS registry and settings UI
 *
 * Interface contract every provider must satisfy:
 *   - name: string                          → Display name
 *   - id: string                            → Unique ID used in storage
 *   - models: Array<{id, label}>            → Available models
 *   - defaultModel: string                  → Default model id
 *   - call(apiKey, model, prompt): string   → Make API call, return markdown string
 *   - validateKey(apiKey): boolean          → Basic key format validation
 */

import { GeminiProvider } from './gemini.js';

// ─── Provider Registry ────────────────────────────────────────────────────────
// Add new providers here as they are implemented.
export const PROVIDERS = {
  gemini: new GeminiProvider(),
  // openai: new OpenAIProvider(),   ← future
  // claude: new ClaudeProvider(),   ← future
};

// ─── Factory ──────────────────────────────────────────────────────────────────
/**
 * Create a configured provider instance.
 * @param {string} providerId - e.g. 'gemini'
 * @returns {BaseLLMProvider}
 */
export function getProvider(providerId) {
  const provider = PROVIDERS[providerId];
  if (!provider) {
    throw new Error(`Unknown LLM provider: "${providerId}". Registered: ${Object.keys(PROVIDERS).join(', ')}`);
  }
  return provider;
}

/**
 * Returns list of all registered providers for the settings UI.
 * @returns {Array<{id, name, models, defaultModel}>}
 */
export function listProviders() {
  return Object.entries(PROVIDERS).map(([id, p]) => ({
    id,
    name: p.name,
    models: p.models,
    defaultModel: p.defaultModel,
    keyPlaceholder: p.keyPlaceholder,
    keyDocsUrl: p.keyDocsUrl
  }));
}

// ─── Base Class (documentation / duck-typing contract) ────────────────────────
export class BaseLLMProvider {
  /** Human-readable display name */
  get name() { throw new Error('Not implemented'); }

  /** Unique identifier used in chrome.storage */
  get id() { throw new Error('Not implemented'); }

  /** Available models: [{id: string, label: string}] */
  get models() { return []; }

  /** Default model id */
  get defaultModel() { return this.models[0]?.id; }

  /** Placeholder text for API key input */
  get keyPlaceholder() { return 'Paste your API key here'; }

  /** URL to docs for getting an API key */
  get keyDocsUrl() { return null; }

  /**
   * Generates markdown from raw analysis data using this LLM.
   * @param {string} apiKey
   * @param {string} model
   * @param {object} analysisData - full raw data from content script + CDP
   * @returns {Promise<string>} - complete markdown output
   */
  async call(apiKey, model, analysisData) {
    throw new Error('Not implemented');
  }

  /**
   * Validates the format of an API key (client-side only, not verified with API).
   * @param {string} apiKey
   * @returns {boolean}
   */
  validateKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.trim().length > 10;
  }
}
