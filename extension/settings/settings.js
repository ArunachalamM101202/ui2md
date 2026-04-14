/**
 * UI2MD — Settings Page (Simplified)
 * Just: Gemini API key + output options.
 */

// ─── DOM ──────────────────────────────────────────────────────────────────────
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

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  const saved = await chrome.storage.sync.get([
    'gemini_api_key', 'llm_fallback',
    'output_include_role', 'output_include_tokens'
  ]);

  if (saved.gemini_api_key) {
    apiKeyInput.value = saved.gemini_api_key;
    showKeyStatus(saved.gemini_api_key);
  } else {
    keyStatus.textContent = 'No key saved';
    keyStatus.className = 'key-status empty';
  }

  fallbackToggle.checked      = saved.llm_fallback !== false;
  includeRoleToggle.checked   = saved.output_include_role !== false;
  includeTokensToggle.checked = !!saved.output_include_tokens;
}

// ─── Key Status ───────────────────────────────────────────────────────────────
function showKeyStatus(key) {
  if (!key || key.length < 10) {
    keyStatus.textContent = '✗ Key too short — check it';
    keyStatus.className = 'key-status invalid';
    apiKeyInput.classList.remove('has-key');
    apiKeyInput.classList.add('invalid');
    return;
  }

  const masked = key.slice(0, 6) + '•'.repeat(Math.max(0, key.length - 10)) + key.slice(-4);
  keyStatus.textContent = `✓ Key ready: ${masked}`;
  keyStatus.className = 'key-status valid';
  apiKeyInput.classList.add('has-key');
  apiKeyInput.classList.remove('invalid');
}

// ─── Events ───────────────────────────────────────────────────────────────────
apiKeyInput.addEventListener('input', () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    keyStatus.textContent = '';
    keyStatus.className = 'key-status';
    apiKeyInput.classList.remove('has-key', 'invalid');
  } else {
    showKeyStatus(key);
  }
});

keyToggleBtn.addEventListener('click', () => {
  const isHidden = apiKeyInput.type === 'password';
  apiKeyInput.type = isHidden ? 'text' : 'password';
  keyToggleBtn.textContent = isHidden ? '🙈' : '👁';
});

clearKeyBtn?.addEventListener('click', async () => {
  apiKeyInput.value = '';
  keyStatus.textContent = 'Key cleared';
  keyStatus.className = 'key-status empty';
  apiKeyInput.classList.remove('has-key', 'invalid');
  await chrome.storage.sync.remove('gemini_api_key');
});

saveBtn.addEventListener('click', async () => {
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;

  try {
    const apiKey = apiKeyInput.value.trim();

    const data = {
      llm_fallback:          fallbackToggle.checked,
      output_include_role:   includeRoleToggle.checked,
      output_include_tokens: includeTokensToggle.checked
    };

    if (apiKey) {
      data.gemini_api_key = apiKey;
    } else {
      await chrome.storage.sync.remove('gemini_api_key');
    }

    await chrome.storage.sync.set(data);

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
