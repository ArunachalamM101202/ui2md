# UI2MD — Design System Extractor

A Chrome Extension that analyzes any webpage and exports a rich **design system Markdown document** — capturing colors, typography, spacing, component styles, hover states, focus states, and layout patterns.

## What It Does

- 🎨 **Extracts the full color palette** — CSS custom properties, computed colors, ranked by usage frequency  
- 🔤 **Maps typography** — font families, heading scale, type roles (display/body/label/code)  
- 📐 **Documents layout** — containers, grid systems, flexbox patterns, section spacing  
- 🖱️ **Captures hover & focus states** — via Chrome DevTools Protocol `CSS.forcePseudoState` (no manual hovering needed)  
- 🔲 **Profiles components** — buttons, cards, inputs, nav, hero, badges, modals (with before/after state deltas)  
- 🎞️ **Detects animations** — transition durations, easing, motion philosophy  
- ♿ **Checks accessibility** — WCAG contrast ratio, focus styles, ARIA landmarks  
- 📱 **Reads breakpoints** — all detected `@media` query values  
- 🏷️ **Classifies design style** — Minimalist Monochrome, Glassmorphic Dark, Neon Dark, Clean Modern, etc.

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load Unpacked**
4. Select the `extension/` folder in this project
5. The **UI→MD** icon will appear in your toolbar

## Usage

1. Navigate to any webpage you want to analyze
2. Click the **UI→MD** extension icon
3. Click **Analyze Page**
4. Wait for the analysis to complete (a DevTools yellow banner will briefly appear — this is normal)
5. View the summary stats in the popup
6. Click **Download .md** to save your design system document

## Output Format

The generated `ui2md_[hostname]_[date].md` follows a structured format:

```
<role>
  Context for AI tools consuming this design system
</role>

<design-system>
  # Design Style: [Detected Style Name]
  ## Design Philosophy + Visual Vibe
  ## Design Token System (Colors, Typography, Spacing, Radii, Shadows)
  ## Component Stylings (with hover/focus state deltas)
  ## Layout Strategy
  ## Effects & Animation
  ## Iconography
  ## Responsive Strategy
  ## Accessibility
</design-system>
```

## Notes

- Chrome shows a **"DevTools is debugging this browser"** yellow banner during analysis — this is required for CDP pseudo-state access and disappears automatically when done
- Cross-origin stylesheets (loaded from a different domain) cannot be read and will be skipped
- Full-page traversal is capped at ~2000 elements for performance

## File Structure

```
extension/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── content/
│   └── analyzer.js
├── background/
│   └── service_worker.js
├── formatter/
│   └── markdown.js
└── assets/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
