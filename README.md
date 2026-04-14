# UI2MD

A Chrome extension that extracts the complete design system from any webpage and exports it as a structured Markdown document — ready to drop into your AI coding assistant.

## Why

Inspired by [designprompts.dev](https://designprompts.dev) and the idea of writing rich, custom design prompts for AI tools. The problem: crafting those prompts from scratch takes time. UI2MD lets you get instantly inspired by any website — land on a page you like, click once, and get a full design system document you can hand straight to your AI.

## What it extracts

- Full color palette ranked by usage frequency
- Typography scale, font roles, heading hierarchy
- Spacing, layout containers, grid and flex patterns
- Hover and focus states via Chrome DevTools Protocol (no manual hovering)
- Component styles — buttons, cards, inputs, nav, hero, badges
- Animations and easing curves
- Breakpoints, ARIA landmarks, contrast ratios
- Detected design style (Glassmorphic Dark, Minimalist Monochrome, Clean Modern, etc.)

## Output

Generates a `ui2md_[hostname]_[date].md` file in this format:

```
<role>
  AI assistant briefing — site purpose, design style, rules to follow
</role>

<design-system>
  Design Philosophy · Token System · Components · Layout · Accessibility
</design-system>
```

## BYOK — Bring Your Own Key

UI2MD uses your own API key to generate the document. Two providers supported:

| Provider | Model | Get a key |
|----------|-------|-----------|
| **Google Gemini** | gemini-3-flash-preview | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Anthropic Claude** | claude-opus-4-6 | [console.anthropic.com](https://console.anthropic.com/settings/keys) |

No key? The extension falls back to a built-in formatter automatically.


## Notes

- A "DevTools is debugging this browser" banner appears briefly during analysis — this is normal, required for hover/focus state capture, and disappears automatically
- Cross-origin stylesheets are skipped
- Page traversal is capped at ~2000 elements
