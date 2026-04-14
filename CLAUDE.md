# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

UI2MD is a Chrome Extension (Manifest V3) that analyzes any webpage's design system and exports a structured Markdown document — capturing colors, typography, spacing, hover/focus states, and component styles.

## Installation & Development

There is no build step. Load the extension directly in Chrome:

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click **Load Unpacked** → select the `extension/` folder
4. After editing any JS/CSS file, click the reload icon on the extension card in `chrome://extensions`

There are no tests, no npm scripts, and no bundler.

## Architecture

### Data Flow

```
popup.js  →  START_ANALYSIS message  →  service_worker.js
                                              │
                                    1. Inject content/analyzer.js (DOM extraction)
                                    2. Attach Chrome Debugger (CDP)
                                    3. Extract pseudo-states (hover/focus via CSS.forcePseudoState)
                                    4. Extract deep CSS tokens (CSS.getComputedStyleForNode)
                                    5a. Gemini API (if key set) via llm/gemini.js + llm/prompt.js
                                    5b. Fallback: formatter/markdown.js (programmatic)
                                              │
                                    ← result (markdown + summary)
```

### Key Files

| File | Role |
|------|------|
| `background/service_worker.js` | Orchestrator — CDP attach/detach, pseudo-state extraction, LLM/formatter dispatch |
| `content/analyzer.js` | Injected into the analyzed page — extracts colors, typography, layout, components, accessibility |
| `formatter/markdown.js` | Programmatic markdown generator (used when no API key is configured) |
| `llm/prompt.js` | Builds the system + user prompts sent to the LLM |
| `llm/gemini.js` | Gemini REST API caller (no SDK — direct fetch for MV3 service worker compatibility) |
| `llm/provider.js` | Provider abstraction: `BaseLLMProvider` base class + `PROVIDERS` registry |
| `popup/popup.js` | Popup UI — sends messages to service worker, renders progress/stats/download |
| `settings/settings.js` | Settings page — saves `gemini_api_key` and `llm_fallback` to `chrome.storage.sync` |

### Two Output Paths

- **With Gemini API key**: `service_worker.js` calls `callGemini()` → uses `buildSystemPrompt()` + `buildUserPrompt()` from `prompt.js` → LLM generates the full markdown
- **Without API key** (or on LLM failure with `llm_fallback=true`): `generateMarkdown()` from `formatter/markdown.js` produces the document programmatically

### Adding a New LLM Provider

1. Create `extension/llm/<provider>.js` implementing `BaseLLMProvider` from `provider.js`
2. Import and register it in the `PROVIDERS` object in `provider.js`
3. Add the provider to the settings UI in `settings/settings.html` + `settings/settings.js`

### Output Format

All generated documents follow this structure:

```
<role>
  AI assistant briefing (5-7 sentences)
</role>

<design-system>
  # Design Style: [Name]
  ## Design Philosophy
  ## Bold Choices
  ## Design Token System (Colors, Typography, Spacing, Radii, Shadows, Motion)
  ## Component Stylings (with hover/focus deltas)
  ## Layout Strategy
  ## Effects & Animation
  ## Responsive Strategy
  ## Accessibility
  ## What Success Looks Like
</design-system>
```

### Chrome DevTools Protocol (CDP)

The extension uses `chrome.debugger` to attach CDP to the active tab. This:
- Triggers a yellow "DevTools is debugging this browser" banner — expected behavior
- Requires the `debugger` permission in `manifest.json`
- Allows `CSS.forcePseudoState` to capture hover/focus styles without manual interaction
- The debugger is always detached after analysis (even on error)

### Storage Keys

`chrome.storage.sync` stores:
- `active_provider` — `'gemini'` | `'claude'` (which provider is selected)
- `gemini_api_key` — user's Gemini API key (`AIza...`)
- `claude_api_key` — user's Anthropic API key (`sk-ant-...`)
- `llm_fallback` — boolean, whether to fall back to programmatic formatter on LLM error (default: `true`)

### Adding a New LLM Provider

1. Create `extension/llm/<provider>.js` — implement a class with `name`, `id`, `models`, `defaultModel`, `keyPlaceholder`, `keyDocsUrl`, `call(apiKey, model, data)`, `validateKey(key)` properties
2. Import and register it in `PROVIDERS` in `provider.js`
3. Add its storage key and metadata to `PROVIDER_META` in `settings/settings.js`
