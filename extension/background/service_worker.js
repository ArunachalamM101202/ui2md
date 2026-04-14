/**
 * UI2MD — Background Service Worker
 * Orchestrates: debugger attach, CDP pseudo-state, content script injection,
 * LLM call (if configured), and markdown generation.
 */

import { generateMarkdown } from '../formatter/markdown.js';
import { callGemini, GEMINI_MODEL } from '../llm/gemini.js';

// ─── State ────────────────────────────────────────────────────────────────────
let analysisInProgress = false;

// ─── Message Router ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'START_ANALYSIS') {
    if (analysisInProgress) {
      sendResponse({ error: 'Analysis already in progress' });
      return true;
    }
    runFullAnalysis(message.tabId)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ error: err.message || String(err) }));
    return true; // keep channel open for async response
  }
});

// ─── Main Orchestrator ────────────────────────────────────────────────────────
async function runFullAnalysis(tabId) {
  analysisInProgress = true;
  let debuggerAttached = false;

  try {
    // Step 1: Inject content script and get basic DOM data
    sendProgress(tabId, 10, 'Injecting page analyzer...');
    const [injectionResult] = await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/analyzer.js']
    });

    const domData = injectionResult?.result;
    if (!domData) throw new Error('Content script returned no data. Try refreshing the page.');

    // Step 2: Attach debugger for CDP access
    sendProgress(tabId, 25, 'Attaching DevTools inspector...');
    await attachDebugger(tabId);
    debuggerAttached = true;

    sendProgress(tabId, 35, 'Enabling CSS protocol...');
    await sendCDP(tabId, 'DOM.enable', {});
    await sendCDP(tabId, 'CSS.enable', {});

    // Step 3: Get document root
    const { root } = await sendCDP(tabId, 'DOM.getDocument', { depth: -1, pierce: true });

    // Step 4: Extract hover/focus states for key elements
    sendProgress(tabId, 45, 'Capturing hover & focus states...');
    const pseudoData = await extractPseudoStates(tabId, root);

    // Step 5: Get deep CSS custom properties via CDP
    sendProgress(tabId, 60, 'Reading CSS custom properties...');
    const deepTokens = await extractDeepCSSTokens(tabId, root);

    // Step 6: Detach debugger
    sendProgress(tabId, 72, 'Releasing DevTools connection...');
    await detachDebugger(tabId);
    debuggerAttached = false;

    const fullData = { ...domData, pseudoStates: pseudoData, deepTokens };

    // Step 7: LLM or programmatic markdown
    const llmSettings = await loadLLMSettings();
    let markdown;
    let usedLLM = false;

    if (llmSettings.apiKey) {
      try {
        sendProgress(tabId, 80, `Generating markdown with Gemini...`);
        markdown = await callGemini(llmSettings.apiKey, null, fullData);
        usedLLM = true;
        sendProgress(tabId, 95, 'Finalizing...');
      } catch (llmErr) {
        if (llmSettings.fallback) {
          sendProgress(tabId, 80, `Gemini failed — using built-in formatter`);
          markdown = generateMarkdown(fullData);
        } else {
          throw new Error(`Gemini error: ${llmErr.message}`);
        }
      }
    } else {
      sendProgress(tabId, 80, 'Generating markdown (no API key)...');
      markdown = generateMarkdown(fullData);
    }

    sendProgress(tabId, 100, 'Done!');
    return {
      markdown,
      summary: buildSummary(domData),
      usedLLM,
      llmProvider: usedLLM ? `Gemini (${GEMINI_MODEL})` : null
    };

  } catch (err) {
    if (debuggerAttached) {
      await detachDebugger(tabId).catch(() => {});
    }
    throw err;
  } finally {
    analysisInProgress = false;
  }
}

// ─── LLM Settings Loader ──────────────────────────────────────────────────────
async function loadLLMSettings() {
  const { gemini_api_key, llm_fallback } = await chrome.storage.sync.get([
    'gemini_api_key', 'llm_fallback'
  ]);

  return {
    apiKey:  gemini_api_key?.trim() || null,
    fallback: llm_fallback !== false
  };
}

// ─── CDP Helpers ──────────────────────────────────────────────────────────────
function sendCDP(tabId, method, params = {}) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, method, params, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result || {});
      }
    });
  });
}

function attachDebugger(tabId) {
  return new Promise((resolve, reject) => {
    chrome.debugger.attach({ tabId }, '1.3', () => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve();
    });
  });
}

function detachDebugger(tabId) {
  return new Promise((resolve) => {
    chrome.debugger.detach({ tabId }, () => resolve()); // silent on error
  });
}

// ─── Pseudo-State Extraction ──────────────────────────────────────────────────
async function extractPseudoStates(tabId, root) {
  const componentSelectors = [
    'button', 'a', 'input', 'nav a',
    '[class*="btn"]', '[class*="card"]', '[class*="link"]',
    '[class*="nav"]', '[class*="menu-item"]', '[class*="tab"]'
  ];

  const results = {};

  for (const selector of componentSelectors) {
    try {
      const { nodeId } = await sendCDP(tabId, 'DOM.querySelector', {
        nodeId: root.nodeId,
        selector
      });
      if (!nodeId) continue;

      const normal = await getMatchedStyles(tabId, nodeId);

      await sendCDP(tabId, 'CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] });
      const hover = await getMatchedStyles(tabId, nodeId);
      await sendCDP(tabId, 'CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });

      await sendCDP(tabId, 'CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['focus'] });
      const focus = await getMatchedStyles(tabId, nodeId);
      await sendCDP(tabId, 'CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });

      await sendCDP(tabId, 'CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['focus-visible'] });
      const focusVisible = await getMatchedStyles(tabId, nodeId);
      await sendCDP(tabId, 'CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });

      const normalFlat = flattenStyles(normal);
      results[selector] = {
        normal:       normalFlat,
        hover:        flattenStyles(hover),
        focus:        flattenStyles(focus),
        focusVisible: flattenStyles(focusVisible),
        hoverDelta:   computeDelta(normalFlat, flattenStyles(hover)),
        focusDelta:   computeDelta(normalFlat, flattenStyles(focus))
      };
    } catch { /* element not found or CDP error — skip silently */ }
  }

  return results;
}

async function getMatchedStyles(tabId, nodeId) {
  try {
    return await sendCDP(tabId, 'CSS.getMatchedStylesForNode', { nodeId });
  } catch { return {}; }
}

function flattenStyles(matchedStyles) {
  const flat = {};
  const sources = [
    ...(matchedStyles.matchedCSSRules || []).map(r => r.rule?.style?.cssProperties || []),
    matchedStyles.inlineStyle?.cssProperties || []
  ];
  sources.forEach(props => {
    props.forEach(({ name, value }) => {
      if (name && value) flat[name] = value;
    });
  });
  return flat;
}

function computeDelta(normal, altered) {
  const delta = {};
  const allKeys = new Set([...Object.keys(normal), ...Object.keys(altered)]);
  allKeys.forEach(key => {
    if (normal[key] !== altered[key]) {
      delta[key] = { from: normal[key] || null, to: altered[key] || null };
    }
  });
  return delta;
}

// ─── Deep CSS Token Extraction ────────────────────────────────────────────────
async function extractDeepCSSTokens(tabId, root) {
  try {
    const { nodeId: htmlNodeId } = await sendCDP(tabId, 'DOM.querySelector', {
      nodeId: root.nodeId,
      selector: 'html'
    });
    if (!htmlNodeId) return {};

    const { computedStyle } = await sendCDP(tabId, 'CSS.getComputedStyleForNode', { nodeId: htmlNodeId });
    const tokens = {};
    if (computedStyle) {
      computedStyle.forEach(({ name, value }) => {
        if (name.startsWith('--')) tokens[name] = value;
      });
    }
    return tokens;
  } catch { return {}; }
}

// ─── Progress Broadcast ───────────────────────────────────────────────────────
function sendProgress(tabId, percent, message) {
  chrome.runtime.sendMessage({
    action: 'ANALYSIS_PROGRESS',
    tabId,
    percent,
    message
  }).catch(() => {});
}

// ─── Summary Builder ──────────────────────────────────────────────────────────
function buildSummary(data) {
  return {
    hostname:    data.metadata?.hostname || 'Unknown',
    colors:      data.colors?.all?.length || 0,
    fonts:       data.typography?.families?.length || 0,
    components:  Object.keys(data.components || {}).filter(k => data.components[k]?.found).length,
    breakpoints: data.breakpoints?.length || 0
  };
}
