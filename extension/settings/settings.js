/**
 * UI2MD — Settings Page
 * Supports multiple AI providers: Gemini and Claude.
 * Storage keys: active_provider, gemini_api_key, claude_api_key, llm_fallback, output_*
 */

// ─── Provider Metadata ────────────────────────────────────────────────────────
const PROVIDER_META = {
  gemini: {
    label:       'Gemini',
    storageKey:  'gemini_api_key',
    placeholder: 'AIza...',
    docsUrl:     'https://aistudio.google.com/apikey',
    docsLabel:   'Get a Gemini key ↗',
    description: 'Uses Google Gemini to generate the design system document.'
  },
  claude: {
    label:       'Claude',
    storageKey:  'claude_api_key',
    placeholder: 'sk-ant-api03-...',
    docsUrl:     'https://console.anthropic.com/settings/keys',
    docsLabel:   'Get an Anthropic key ↗',
    description: 'Uses Anthropic Claude to generate the design system document.'
  }
};

// ─── DOM ──────────────────────────────────────────────────────────────────────
const tabGemini           = document.getElementById('tabGemini');
const tabClaude           = document.getElementById('tabClaude');
const providerDesc        = document.getElementById('providerDesc');
const apiKeyInput         = document.getElementById('apiKeyInput');
const keyToggleBtn        = document.getElementById('keyToggleBtn');
const keyStatus           = document.getElementById('keyStatus');
const fallbackToggle      = document.getElementById('fallbackToggle');
const includeRoleToggle   = document.getElementById('includeRoleToggle');
const includeTokensToggle = document.getElementById('includeTokensToggle');
const saveBtn             = document.getElementById('saveBtn');
const saveStatus          = document.getElementById('saveStatus');
const backBtn             = document.getElementById('backBtn');
const clearKeyBtn         = document.getElementById('clearKeyBtn');
const aboutProvider       = document.getElementById('aboutProvider');

// ─── State ────────────────────────────────────────────────────────────────────
let activeProvider = 'gemini';
// In-memory store for keys per provider (populated on init, updated on tab switch)
const keyCache = { gemini: '', claude: '' };

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  const saved = await chrome.storage.sync.get([
    'active_provider', 'gemini_api_key', 'claude_api_key',
    'llm_fallback', 'output_include_role', 'output_include_tokens'
  ]);

  keyCache.gemini = saved.gemini_api_key || '';
  keyCache.claude = saved.claude_api_key || '';

  activeProvider = saved.active_provider || 'gemini';

  fallbackToggle.checked      = saved.llm_fallback !== false;
  includeRoleToggle.checked   = saved.output_include_role !== false;
  includeTokensToggle.checked = !!saved.output_include_tokens;

  renderProviderTab(activeProvider);
}

// ─── Provider Tab Rendering ───────────────────────────────────────────────────
function renderProviderTab(providerId) {
  activeProvider = providerId;
  const meta = PROVIDER_META[providerId];

  // Update tab active state
  tabGemini.classList.toggle('active', providerId === 'gemini');
  tabClaude.classList.toggle('active', providerId === 'claude');

  // Update description
  providerDesc.innerHTML =
    `${meta.description} <a class="docs-link" href="${meta.docsUrl}" target="_blank">${meta.docsLabel}</a>`;

  // Update input
  apiKeyInput.placeholder = meta.placeholder;
  apiKeyInput.value = keyCache[providerId];
  apiKeyInput.type = 'password';
  keyToggleBtn.textContent = '👁';

  // Update key status display
  showKeyStatus(keyCache[providerId], providerId);

  // Update about row
  aboutProvider.textContent = meta.label;
}

// ─── Key Status ───────────────────────────────────────────────────────────────
function showKeyStatus(key, providerId) {
  if (!key || key.length < 10) {
    keyStatus.textContent = key ? '✗ Key too short — check it' : 'No key saved';
    keyStatus.className = key ? 'key-status invalid' : 'key-status empty';
    apiKeyInput.classList.remove('has-key');
    if (key) apiKeyInput.classList.add('invalid');
    else     apiKeyInput.classList.remove('invalid');
    return;
  }

  const masked = key.slice(0, 6) + '•'.repeat(Math.max(0, key.length - 10)) + key.slice(-4);
  keyStatus.textContent = `✓ Key ready: ${masked}`;
  keyStatus.className = 'key-status valid';
  apiKeyInput.classList.add('has-key');
  apiKeyInput.classList.remove('invalid');
}

// ─── Events ───────────────────────────────────────────────────────────────────
tabGemini.addEventListener('click', () => {
  // Save current input into cache before switching
  keyCache[activeProvider] = apiKeyInput.value.trim();
  renderProviderTab('gemini');
});

tabClaude.addEventListener('click', () => {
  keyCache[activeProvider] = apiKeyInput.value.trim();
  renderProviderTab('claude');
});

apiKeyInput.addEventListener('input', () => {
  const key = apiKeyInput.value.trim();
  keyCache[activeProvider] = key;
  if (!key) {
    keyStatus.textContent = '';
    keyStatus.className = 'key-status';
    apiKeyInput.classList.remove('has-key', 'invalid');
  } else {
    showKeyStatus(key, activeProvider);
  }
});

keyToggleBtn.addEventListener('click', () => {
  const isHidden = apiKeyInput.type === 'password';
  apiKeyInput.type = isHidden ? 'text' : 'password';
  keyToggleBtn.textContent = isHidden ? '🙈' : '👁';
});

clearKeyBtn.addEventListener('click', async () => {
  keyCache[activeProvider] = '';
  apiKeyInput.value = '';
  keyStatus.textContent = 'Key cleared';
  keyStatus.className = 'key-status empty';
  apiKeyInput.classList.remove('has-key', 'invalid');
  await chrome.storage.sync.remove(PROVIDER_META[activeProvider].storageKey);
});

saveBtn.addEventListener('click', async () => {
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;

  try {
    // Flush the current input into cache before saving
    keyCache[activeProvider] = apiKeyInput.value.trim();

    const data = {
      active_provider:       activeProvider,
      llm_fallback:          fallbackToggle.checked,
      output_include_role:   includeRoleToggle.checked,
      output_include_tokens: includeTokensToggle.checked
    };

    // Save or remove each provider's key
    const keysToRemove = [];
    for (const [id, meta] of Object.entries(PROVIDER_META)) {
      const key = keyCache[id];
      if (key) {
        data[meta.storageKey] = key;
      } else {
        keysToRemove.push(meta.storageKey);
      }
    }

    await chrome.storage.sync.set(data);
    if (keysToRemove.length) await chrome.storage.sync.remove(keysToRemove);

    saveStatus.textContent = '✓ Saved';
    saveStatus.className = 'save-status saved';
    setTimeout(() => {
      saveStatus.textContent = '';
      saveStatus.className = 'save-status';
    }, 2500);

  } catch (err) {
    saveStatus.textContent = `✗ ${err.message}`;
    saveStatus.className = 'save-status error';
  } finally {
    saveBtn.textContent = 'Save';
    saveBtn.disabled = false;
  }
});

backBtn.addEventListener('click', () => window.close());

// ─── Boot ─────────────────────────────────────────────────────────────────────
init();
