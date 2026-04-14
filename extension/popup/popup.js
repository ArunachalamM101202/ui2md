/**
 * UI2MD — Popup Controller
 * Manages UI states, LLM badge, settings link, download.
 */

// ─── DOM References ───────────────────────────────────────────────────────────
const siteUrlEl       = document.getElementById('siteUrl');
const llmBadge        = document.getElementById('llmBadge');
const settingsBtn     = document.getElementById('settingsBtn');
const idleState       = document.getElementById('idleState');
const analyzingState  = document.getElementById('analyzingState');
const doneState       = document.getElementById('doneState');
const errorState      = document.getElementById('errorState');
const progressBar     = document.getElementById('progressBar');
const progressPct     = document.getElementById('progressPct');
const progressMsg     = document.getElementById('progressMsg');
const statsGrid       = document.getElementById('statsGrid');
const analyzeBtn      = document.getElementById('analyzeBtn');
const downloadBtn     = document.getElementById('downloadBtn');
const errorMsg        = document.getElementById('errorMsg');
const errorSettingsLink = document.getElementById('errorSettingsLink');
const noLlmWarn       = document.getElementById('noLlmWarn');
const warnSettingsLink = document.getElementById('warnSettingsLink');
const footerMode      = document.getElementById('footerMode');

// Steps match the HTML data-step attributes
const STEPS = ['inject', 'debugger', 'pseudo', 'llm', 'format'];

// ─── State ────────────────────────────────────────────────────────────────────
let currentMarkdown = null;
let currentHostname = '';   // e.g. www.anthropic.com
let currentPathSlug = '';   // e.g. glasswing  (empty for root)
let llmConfigured = false;
let llmProviderName = '';

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      const parsed = new URL(tab.url);
      currentHostname = parsed.hostname || tab.title || 'Unknown';

      // Build a clean path slug:  /glasswing → 'glasswing', / → ''
      const rawPath = parsed.pathname.replace(/^\/|\/$|index\.html?$/g, '');
      currentPathSlug = rawPath
        .split('/')
        .map(seg => seg.replace(/[^a-zA-Z0-9-]/g, '_'))
        .filter(Boolean)
        .join('_');

      // Show full path in popup — truncated to fit
      const displayUrl = currentPathSlug
        ? `${currentHostname} / ${parsed.pathname.slice(1)}`
        : currentHostname;
      siteUrlEl.textContent = displayUrl;
      siteUrlEl.title = tab.url;   // full URL on hover
    } catch {
      currentHostname = tab.title || 'Unknown';
      siteUrlEl.textContent = currentHostname;
    }
  }

  await refreshLLMStatus();
}

// ─── LLM Status ───────────────────────────────────────────────────────────────
async function refreshLLMStatus() {
  const { gemini_api_key } = await chrome.storage.sync.get(['gemini_api_key']);
  const hasKey = gemini_api_key && gemini_api_key.trim().length > 10;

  if (hasKey) {
    llmConfigured = true;
    llmProviderName = 'Gemini';
    llmBadge.textContent = 'Gemini';
    llmBadge.className = 'llm-badge active';
    llmBadge.title = 'AI: Gemini (gemini-3-flash-preview)';
    noLlmWarn.classList.add('hidden');
    footerMode.textContent = 'Gemini AI';
  } else {
    llmConfigured = false;
    llmBadge.textContent = 'No AI';
    llmBadge.className = 'llm-badge inactive';
    llmBadge.title = 'No API key — using built-in formatter';
    noLlmWarn.classList.remove('hidden');
    footerMode.textContent = 'Built-in formatter';
  }
}


// ─── State Switcher ───────────────────────────────────────────────────────────
function showState(name) {
  [idleState, analyzingState, doneState, errorState].forEach(el => el.classList.add('hidden'));
  ({ idle: idleState, analyzing: analyzingState, done: doneState, error: errorState })[name]?.classList.remove('hidden');
}

function setProgress(pct, msg) {
  progressBar.style.width = `${pct}%`;
  progressPct.textContent = `${pct}%`;
  progressMsg.textContent = msg;

  // Determine active step
  let activeStep = 'inject';
  if (pct >= 95)     activeStep = 'format';
  else if (pct >= 75) activeStep = 'llm';
  else if (pct >= 45) activeStep = 'pseudo';
  else if (pct >= 25) activeStep = 'debugger';

  STEPS.forEach(step => {
    const el = document.querySelector(`[data-step="${step}"]`);
    if (!el) return;
    const idx = STEPS.indexOf(step);
    const activeIdx = STEPS.indexOf(activeStep);
    el.classList.remove('active', 'done');
    if (idx < activeIdx)      el.classList.add('done');
    else if (idx === activeIdx) el.classList.add('active');
  });
}

function showDone(summary, styleName, usedLLM, llmProvider) {
  showState('done');
  downloadBtn.classList.remove('hidden');

  statsGrid.innerHTML = `
    <div class="style-badge">
      <div>
        <div class="style-badge-label">Detected Style</div>
        <div class="style-badge-name">${escHtml(styleName || 'Contemporary Web')}</div>
      </div>
      ${usedLLM ? `<span class="badge-llm-pill">✦ ${escHtml(llmProvider || 'AI')}</span>` : ''}
    </div>
    <div class="stat-card">
      <div class="stat-label">Colors</div>
      <div class="stat-value">${summary.colors || 0}</div>
      <div class="stat-sublabel">unique</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Fonts</div>
      <div class="stat-value">${summary.fonts || 0}</div>
      <div class="stat-sublabel">families</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Components</div>
      <div class="stat-value">${summary.components || 0}</div>
      <div class="stat-sublabel">detected</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Breakpoints</div>
      <div class="stat-value">${summary.breakpoints || 0}</div>
      <div class="stat-sublabel">media queries</div>
    </div>
  `;
}

function showError(msg, showSettingsHint = false) {
  showState('error');
  errorMsg.textContent = msg;
  if (showSettingsHint) {
    errorSettingsLink.classList.remove('hidden');
  } else {
    errorSettingsLink.classList.add('hidden');
  }
}

// ─── Listen for progress from service worker ──────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'ANALYSIS_PROGRESS') {
    setProgress(message.percent, message.message);
  }
});

// ─── Open Settings ────────────────────────────────────────────────────────────
function openSettings() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('settings/settings.html')
  });
}

settingsBtn.addEventListener('click', openSettings);
warnSettingsLink?.addEventListener('click', openSettings);
errorSettingsLink?.addEventListener('click', openSettings);

// ─── Analyze Button ───────────────────────────────────────────────────────────
analyzeBtn.addEventListener('click', async () => {
  currentMarkdown = null;
  downloadBtn.classList.add('hidden');
  analyzeBtn.disabled = true;
  analyzeBtn.classList.add('btn-analyzing');
  analyzeBtn.innerHTML = '<span class="btn-icon">◉</span> Analyzing...';

  showState('analyzing');
  setProgress(5, 'Starting analysis...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab found');

    const response = await chrome.runtime.sendMessage({
      action: 'START_ANALYSIS',
      tabId: tab.id
    });

    if (response?.error) throw new Error(response.error);
    if (!response?.data) throw new Error('No response from background script');

    currentMarkdown = response.data.markdown;
    const { summary, usedLLM, llmProvider } = response.data;

    // Extract style name from LLM-generated or programmatic markdown
    const styleMatch = currentMarkdown.match(/# Design Style:\s*(.+)/);
    const styleName = styleMatch ? styleMatch[1].trim() : 'Contemporary Web';

    showDone(summary, styleName, usedLLM, llmProvider);

  } catch (err) {
    const msg = err.message || String(err);
    let showSettings = false;

    if (msg.includes('Cannot access') || msg.includes('chrome://')) {
      showError('Cannot analyze chrome:// or extension pages.');
    } else if (msg.includes('debugger') && msg.includes('already')) {
      showError('DevTools is open on this tab. Close it and try again.');
    } else if (msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
      showError(`API key error: ${msg}`, true);
      showSettings = true;
    } else if (msg.includes('Gemini API error') || msg.includes('LLM error')) {
      showError(msg, true);
    } else {
      showError(msg);
    }
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.classList.remove('btn-analyzing');
    analyzeBtn.innerHTML = '<span class="btn-icon">◎</span> Analyze Page';
  }
});

// ─── Download Button ──────────────────────────────────────────────────────────
downloadBtn.addEventListener('click', () => {
  if (!currentMarkdown) return;

  const safeHost = currentHostname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const date = new Date().toISOString().slice(0, 10);

  // Include page path in filename so subpages don't overwrite each other
  // anthropic.com + /glasswing  →  ui2md_www.anthropic.com_glasswing_2026-04-14.md
  // anthropic.com + /           →  ui2md_www.anthropic.com_2026-04-14.md
  const pathPart = currentPathSlug ? `_${currentPathSlug}` : '';
  const filename = `ui2md_${safeHost}${pathPart}_${date}.md`;

  const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// ─── Utility ──────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
init();
