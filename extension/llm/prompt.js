/**
 * UI2MD — Prompt Builder (v3)
 *
 * Changes from v2:
 * - validRoles now filters both fontSize AND lineHeight === '0px'
 * - Bold Choices moved to section 3 (after Philosophy) so it doesn't get truncated
 * - System prompt far more explicit: do NOT re-dump token lists, curate 8-12 colors
 * - CSS module class filter improved: catches both __hash__ and ModuleName-module patterns
 * - filterDelta: -webkit preserved for focus states, stripped only from hover
 * - Token groups sent as explicit tables, not raw lists
 * - Breakpoints bucketed with tier names in the input itself
 */

// ─── System Prompt ────────────────────────────────────────────────────────────
export function buildSystemPrompt() {
  return `You are a world-class design systems engineer and technical writer at a top-tier design agency. You analyze raw extracted web design data and produce a DEFINITIVE design system Markdown document — authoritative, curated, and immediately actionable.

Your audience: AI coding assistants and senior frontend engineers who will use this document to faithfully build or extend this design system.

═══════════════════════════════════════════════════════
CRITICAL RULES — READ BEFORE WRITING ANYTHING
═══════════════════════════════════════════════════════

1. DO NOT dump or reproduce token lists verbatim. The data sent to you is raw extraction — YOU must curate it.
2. For Colors: write ONLY 8-12 core semantic tokens. Give each a name, exact hex, and one-sentence purpose.
3. For Typography: write a proper TABLE — Role | Family | Size(px) | Size(rem) | Weight | Line-Height | Use
4. REMOVE all CSS module class patterns from your output. These look like: "__abc123__", "ModuleName-module-scss-module__HASH__class". Never reproduce them. Clean element names only (e.g. "a", "button", "nav").
5. Bold Choices section MUST appear — it is required output. Do not skip it.
6. "What Success Looks Like" section MUST appear — required output. Do not skip.
7. "What This Design Is NOT" section MUST appear — required output.
8. The DNA section must have at least 4 numbered characteristics with prose paragraphs, not bullets.
9. Component sections: write prose behavioral description + a minimal style block. Not just raw CSS.
10. Breakpoints: group into tiers (mobile/tablet/desktop/wide). Never list 20+ raw pixel values.
11. Total target length: 400-700 lines. Dense and specific, not padded.

═══════════════════════════════════════════════════════
EXACT OUTPUT STRUCTURE
═══════════════════════════════════════════════════════

Output ONLY this — nothing before <role>, nothing after </design-system>:

<role>
Write 5-7 sentences as a briefing for an AI code assistant:
- Name the site, its purpose, and extraction date
- Name the design style with a crisp one-sentence characterization
- The single most important design rule — make it memorable and specific
- 3 things to do before writing any code
- End with: what the consuming AI must NEVER do
</role>

<design-system>

# Design Style: [Specific Evocative Name]
Not "Clean Modern" — qualify it: e.g. "Warm Ivory Editorial", "Clean Corporate Monochrome",
"Soft Organic SaaS", "Dark Technical Dashboard", "Bold Brutalist Commerce"

## Design Philosophy

### Core Principle
3-5 sentences of flowing prose — not a list. What does this design BELIEVE?
What is it saying about the brand? What is the philosophical intent?

### Visual Vibe
**Emotional Keywords**: [8-10 precise adjectives]

This is the visual language of:
- [specific cultural/brand reference — magazine, luxury brand, product category]
- [another reference]
- [another]

[One sentence on HOW this design achieves its effect.]

### What This Design Is NOT
- ❌ [specific thing avoided — name a competing style]
- ❌ [another — be specific, not generic]
- ❌ [another]
- ❌ [another]
- ❌ [another]

### The DNA of [Style Name]

#### 1. [Characteristic Name]
[2-3 sentences with specific values from the data]

#### 2. [Characteristic Name]
[2-3 sentences]

#### 3. [Characteristic Name]
[2-3 sentences]

#### 4. [Characteristic Name]
[2-3 sentences]

(Add 5-6 if the data supports more)

---

## Bold Choices (Non-Negotiable)
[Put this EARLY so it always appears in output]

1. **[Specific choice]** — [one sentence directive with exact values]
2. **[Specific choice]** — [directive]
3. [Continue for 6-10 total]

---

## Design Token System

### Colors

| Token | Hex | Role |
|-------|-----|------|
| background | #XXXXXX | [purpose] |
| foreground | #XXXXXX | [purpose] |
| [8-12 total rows max] |

[One "Palette Insight" paragraph: what story does this palette tell?]

### Typography

| Role | Family | px | rem | Weight | Line-Height | Use |
|------|--------|----|-----|--------|-------------|-----|
[FILTER OUT any row where size is 0px — those are DOM measurement artifacts]
[Only include roles with real, non-zero font sizes]

[Typography Insight paragraph]

### Spacing System
[Only if spacing tokens exist — list the named scale: micro/sm/md/lg/xl/2xl with px values]

### Border Radius
[State the philosophy + exact values. "Sharp everywhere (0px)" OR explain the radius system]

### Borders & Lines
\`\`\`
hairline: [value] — [use]
thin:     [value] — [use]
...
\`\`\`

### Shadows
[NONE with explanation, OR list with semantic roles]

### Motion & Easing
[Named easing tokens if present. State motion philosophy: Instant / Subtle / Expressive]

---

## Component Stylings

### [Component Name]

**Normal state:**
\`\`\`
background: [value]
color:      [value]
border:     [value]
padding:    [value]
font:       [size / weight / family]
\`\`\`

**Hover:** [prose — what changes and WHY. Include exact deltas if available]
\`\`\`
[property]: [from] → [to]
\`\`\`

**Focus / Focus-Visible:** [prose + values — include outline specs]

**Intent:** [one sentence on the interaction design philosophy for this component]

[Repeat for each detected component]

---

## Layout Strategy

### Container
[max-width, padding, derived philosophy]

### Section Spacing
[vertical rhythm, named tokens if available]

### Grid System
[patterns found — column counts, gaps, alignment philosophy]
[OMIT CSS module class names — describe patterns only]

---

## Effects & Animation

**Motion Philosophy:** [Instant / Subtle / Expressive — explain why]

[Named easing curves from token data]

[Per-component transitions — use clean selector names only, no CSS module hashes]

---

## Iconography
[Only if icons detected]
Style, stroke weight, size, color treatment, contextual use

---

## Responsive Strategy

| Tier | Range | Key Adaptations |
|------|-------|-----------------|
| Mobile  | [min]–[max] | [how design adapts] |
| Tablet  | [min]–[max] | [adaptations] |
| Desktop | [min]–[max] | [adaptations] |
| Wide    | [min]+      | [adaptations] |

[One paragraph on the responsive philosophy]

---

## Accessibility

**Contrast:** [fg] on [bg] = [ratio]:1 — WCAG [AA/AAA] ✅

**Focus system:** [describe the focus style philosophy — what visual treatment do focused elements get]
\`\`\`
button: [outline spec]
a:      [outline spec]
input:  [outline spec]
\`\`\`

**ARIA:** [landmark status — main/nav/header/footer present/missing]

**Skip links:** [present/absent]

---

## What Success Looks Like

**It should feel like:** [2-3 sentences — evocative, specific cultural/sensory references, name real things]

**It must NOT feel like:** [2-3 sentences — name specific failure modes to avoid]

</design-system>

═══════════════════════════════════════════════════════
FINAL REMINDERS
═══════════════════════════════════════════════════════
- Bold Choices and "What Success Looks Like" are REQUIRED — do not omit
- No CSS module class names anywhere in your output
- Typography table: skip any row where px size is 0
- Color section: max 12 rows, named and annotated — NO token dumps
- Write with the authority of someone who built this design system themselves`;
}

// ─── User Prompt ──────────────────────────────────────────────────────────────
export function buildUserPrompt(analysisData) {
  const {
    metadata, cssTokens, colors, typography, layout,
    bordersAndShadows, textures, animations, components,
    breakpoints, icons, accessibility, pseudoStates, deepTokens
  } = analysisData;

  const sections = [];

  // ── 1. Page Metadata ──────────────────────────────────────────────────────
  sections.push(`## PAGE METADATA
URL:         ${metadata?.url || 'Unknown'}
Hostname:    ${metadata?.hostname || 'Unknown'}
Path:        ${metadata?.path || '/'}
Title:       ${metadata?.title || 'Unknown'}
Description: ${metadata?.description || 'None'}
Theme Color: ${metadata?.themeColor || 'None'}
Analyzed:    ${formatDate(metadata?.timestamp)}`);

  // ── 2. CSS Design Tokens — semantically grouped, curated ─────────────────
  const allRaw = {
    ...deepTokens,
    ...(cssTokens?.colors  || {}),
    ...(cssTokens?.spacing || {}),
    ...(cssTokens?.radii   || {}),
    ...(cssTokens?.fontSizes || {}),
    ...(cssTokens?.shadows || {}),
    ...(cssTokens?.other   || {})
  };

  const tg = groupTokens(allRaw);
  const tokenOut = [];

  if (tg.colors.length) {
    tokenOut.push('COLOR TOKENS (use these to identify the semantic palette):\n' +
      tg.colors.slice(0, 40).join('\n'));
  }
  if (tg.fontSizes.length) {
    tokenOut.push('TYPE SCALE TOKENS:\n' + tg.fontSizes.slice(0, 25).join('\n'));
  }
  if (tg.spacing.length) {
    tokenOut.push('SPACING TOKENS:\n' + tg.spacing.slice(0, 20).join('\n'));
  }
  if (tg.radii.length) {
    tokenOut.push('BORDER RADIUS TOKENS:\n' + tg.radii.join('\n'));
  }
  if (tg.borders.length) {
    tokenOut.push('BORDER TOKENS:\n' + tg.borders.join('\n'));
  }
  if (tg.easing.length) {
    tokenOut.push('EASING / MOTION TOKENS:\n' + tg.easing.join('\n'));
  }
  if (tg.fonts.length) {
    tokenOut.push('FONT FAMILY TOKENS:\n' + tg.fonts.join('\n'));
  }
  if (tg.weights.length) {
    tokenOut.push('FONT WEIGHT TOKENS:\n' + tg.weights.join('\n'));
  }

  if (tokenOut.length) {
    sections.push('## CSS DESIGN TOKENS (raw data — YOU must curate these into the document)\n\n' +
      'IMPORTANT: Do NOT reproduce this list. Use it to IDENTIFY semantic roles and write curated descriptions.\n\n' +
      tokenOut.join('\n\n'));
  }

  // ── 3. Color Palette ──────────────────────────────────────────────────────
  if (colors) {
    const lines = [];
    if (colors.background) lines.push(`Most-used light color (background):    ${colors.background}`);
    if (colors.foreground) lines.push(`Most-used dark color (foreground/text): ${colors.foreground}`);
    if (colors.accent)     lines.push(`Most saturated / accent:               ${colors.accent}`);
    (colors.muted || []).slice(0, 5).forEach((c, i) => lines.push(`Surface ${i + 1}:                            ${c}`));
    lines.push('');
    lines.push('All unique page colors by frequency:');
    (colors.all || []).slice(0, 16).forEach((c, i) => lines.push(`  ${String(i + 1).padStart(2)}. ${c}`));
    sections.push('## EXTRACTED COLOR PALETTE\n\n' + lines.join('\n'));
  }

  // ── 4. Typography (pre-filtered) ──────────────────────────────────────────
  if (typography) {
    const lines = [];
    if (typography.families?.length) {
      lines.push(`Font families in use: ${typography.families.join(', ')}`);
    }

    // Filter zero-size headings
    const validHeadings = (typography.headingScale || [])
      .filter(h => h.size && h.size !== '0px' && parseInt(h.size) > 0);
    if (validHeadings.length) {
      lines.push('\nHeading scale (non-zero only):');
      validHeadings.forEach(h => lines.push(`  ${h.tag}: ${h.size} / weight ${h.weight}`));
    }

    // Filter zero-size AND zero-lineHeight roles
    const validRoles = Object.entries(typography.roles || {}).filter(
      ([, s]) =>
        s &&
        s.fontSize && s.fontSize !== '0px' && parseInt(s.fontSize) > 0 &&
        s.lineHeight && s.lineHeight !== '0px'
    );
    if (validRoles.length) {
      lines.push('\nType roles (zero-size entries removed):');
      validRoles.forEach(([role, s]) => {
        const family = s.fontFamily?.split(',')[0]?.trim().replace(/["']/g, '') || 'default';
        lines.push(`  ${role.padEnd(12)}: ${s.fontSize} / weight ${s.fontWeight} / lh ${s.lineHeight} / ${family}`);
      });
    }
    sections.push('## TYPOGRAPHY\n\n' + lines.join('\n'));
  }

  // ── 5. Borders & Shadows ──────────────────────────────────────────────────
  if (bordersAndShadows) {
    const b = bordersAndShadows;
    sections.push(`## BORDERS & SHADOWS
Border radius: ${b.isSharp ? 'SHARP — all 0px' : (b.radii || []).slice(0, 6).join(', ') || 'Not detected'}
Border widths: ${(b.borderWidths || []).join(', ') || 'None prominent'}
Border colors: ${(b.borderColors || []).slice(0, 4).join(', ') || 'None'}
Shadows:       ${!(b.shadows?.length) ? 'NONE' : b.shadows.slice(0, 4).join(' | ')}`);
  }

  // ── 6. Layout ─────────────────────────────────────────────────────────────
  if (layout) {
    const lines = [];
    (layout.containers || []).forEach(c => {
      lines.push(`Container: max-width ${c.maxWidth}, padding ${c.padding}`);
    });

    const pads = [...new Set((layout.sections || []).map(s => s.paddingTop).filter(p => p && p !== '0px'))];
    if (pads.length) lines.push(`Section vertical padding: ${pads.slice(0, 5).join(', ')}`);

    // Grid — clean up CSS module class names
    const grids = (layout.gridSystems || [])
      .filter(g => g.gridTemplateColumns && !g.gridTemplateColumns.includes('none'))
      .slice(0, 4);
    if (grids.length) {
      lines.push('\nGrid patterns:');
      grids.forEach(g => lines.push(`  cols: ${g.gridTemplateColumns} / gap: ${g.gap}`));
    }

    const flexUniq = deduplicateFlex(layout.flexSystems || []).slice(0, 4);
    if (flexUniq.length) {
      lines.push('\nFlex patterns:');
      flexUniq.forEach(f => lines.push(`  ${f.flexDirection} / justify:${f.justifyContent} / align:${f.alignItems} / gap:${f.gap}`));
    }

    if (lines.length) sections.push('## LAYOUT\n\n' + lines.join('\n'));
  }

  // ── 7. Animations ─────────────────────────────────────────────────────────
  if (animations) {
    const lines = [`Motion: ${animations.motionPhilosophy} (avg transition: ${animations.avgDurationMs}ms)`];

    // Strip CSS module garbage from transition element names
    const cleanTrans = (animations.transitions || [])
      .filter(t => !isCSSModule(t.el))
      .slice(0, 8);
    if (cleanTrans.length) {
      lines.push('\nKey transitions (clean element names):');
      cleanTrans.forEach(t => lines.push(`  ${cleanSelector(t.el)}: ${t.value}`));
    }
    sections.push('## ANIMATIONS\n\n' + lines.join('\n'));
  }

  // ── 8. Components + pseudo-states ─────────────────────────────────────────
  const compBlocks = [];
  Object.entries(components || {}).forEach(([name, comp]) => {
    if (!comp?.found) return;
    const meaningful = Object.entries(comp.styles || {}).filter(([, v]) =>
      v && v !== 'none' && v !== 'normal' && v !== 'auto' &&
      v !== '0px' && v !== 'rgba(0, 0, 0, 0)' && v !== ''
    );
    if (meaningful.length === 0) return;

    const lines = [`# ${name.toUpperCase()}`];
    lines.push('Normal state:');
    meaningful.slice(0, 10).forEach(([k, v]) => lines.push(`  ${k}: ${v}`));

    // Hover & focus deltas
    const pk = findPseudoKey(name, pseudoStates || {});
    if (pk) {
      const pd = pseudoStates[pk];

      // Hover: strip webkit
      const hd = filterDelta(pd.hoverDelta, { stripWebkit: true });
      if (hd.length) {
        lines.push(':hover delta:');
        hd.forEach(([k, d]) => lines.push(`  ${k}: "${d.from}" → "${d.to}"`));
      }

      // Focus: PRESERVE webkit-focus-ring-color — it IS design signal
      const fd = filterDelta(pd.focusDelta, { stripWebkit: false });
      if (fd.length) {
        lines.push(':focus delta:');
        fd.forEach(([k, d]) => lines.push(`  ${k}: "${d.from}" → "${d.to}"`));
      }

      // Focus-visible: show outline-related props
      const fv = pd.focusVisible || {};
      const fvRelevant = Object.entries(fv).filter(([k]) =>
        ['outline', 'outline-color', 'outline-style', 'outline-width', 'outline-offset'].includes(k)
      );
      if (fvRelevant.length) {
        lines.push(':focus-visible outline:');
        fvRelevant.forEach(([k, v]) => lines.push(`  ${k}: ${v}`));
      }
    }

    compBlocks.push(lines.join('\n'));
  });

  if (compBlocks.length) {
    sections.push('## COMPONENTS\n\n' + compBlocks.join('\n\n'));
  }

  // ── 9. Icons ──────────────────────────────────────────────────────────────
  if (icons) {
    sections.push(`## ICONOGRAPHY
Style:         ${icons.style}
Count:         ${icons.count}
Sizes:         ${(icons.sizes || []).slice(0, 4).join(', ') || 'Unknown'}
Stroke widths: ${(icons.strokeWidths || []).join(', ') || 'Unknown'}
Color:         ${icons.color || 'Inherited/currentColor'}`);
  }

  // ── 10. Breakpoints — bucketed with tier names ────────────────────────────
  if (breakpoints?.length) {
    const tiers = bucketBreakpoints(breakpoints);
    const lines = ['Breakpoints grouped into design tiers:'];
    Object.entries(tiers).forEach(([tier, values]) => {
      if (values.length) lines.push(`  ${tier.padEnd(8)}: ${values.join(', ')}`);
    });
    lines.push('\nDo NOT list raw pixel values — use tier names in the document.');
    sections.push('## RESPONSIVE BREAKPOINTS\n\n' + lines.join('\n'));
  }

  // ── 11. Accessibility ─────────────────────────────────────────────────────
  if (accessibility) {
    const a = accessibility;
    const lines = [];
    if (a.bodyContrast?.fg) {
      lines.push(`Body text contrast: ${a.bodyContrast.fg} on ${a.bodyContrast.bg}`);
    }
    if (a.ariaLandmarks) {
      const lms = Object.entries(a.ariaLandmarks)
        .map(([k, v]) => `${k}:${v ? '✓' : '✗'}`).join('  ');
      lines.push(`ARIA landmarks: ${lms}`);
    }
    lines.push(`Skip links: ${a.skipLinks ? 'Present' : 'Not detected'}`);

    // Focus styles — keep meaningful ones (include webkit ring — it's real behavior)
    const focusEntries = Object.entries(a.focusStyles || {});
    if (focusEntries.length) {
      lines.push('Focus styles (as-computed):');
      focusEntries.forEach(([tag, s]) => {
        lines.push(`  ${tag}: outline: ${s.outline}; offset: ${s.outlineOffset}`);
      });
    }

    if (lines.length) sections.push('## ACCESSIBILITY\n\n' + lines.join('\n'));
  }

  // ── 12. Final instruction ─────────────────────────────────────────────────
  sections.push(`## YOUR TASK

Using ALL the data above, generate the design system document following your system instructions exactly.

CRITICAL REMINDERS:
1. Bold Choices section is REQUIRED — put it right after Design Philosophy
2. "What Success Looks Like" is REQUIRED — it must appear at the very end
3. "What This Design Is NOT" is REQUIRED — include it in Design Philosophy
4. Typography table: SKIP any role/heading with 0px font-size or 0px line-height
5. Colors: MAXIMUM 12 rows, named and annotated — no raw token dumps
6. CSS module class names (patterns like "__abc123__" or "ModuleName-module-scss-module__HASH__") must NEVER appear in your output
7. Group breakpoints into named tiers — no raw pixel value lists
8. Aim for 400-700 lines: specific and curated, not padded

Do NOT output anything before <role> or after </design-system>.`);

  return sections.join('\n\n---\n\n');
}

// ─── Data Curation Utilities ──────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return 'Unknown';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return iso; }
}

/**
 * Group CSS custom properties into semantic buckets for cleaner LLM input.
 */
function groupTokens(raw) {
  const groups = {
    colors: [], fontSizes: [], spacing: [], radii: [],
    borders: [], easing: [], fonts: [], weights: []
  };

  Object.entries(raw).forEach(([name, val]) => {
    const n = name.toLowerCase();
    const v = (val || '').trim();
    if (!v || v === '0') return;

    const line = `${name}: ${v}`;

    if (/^#([0-9a-f]{3,8})$|^rgb|^hsl/i.test(v)) {
      groups.colors.push(line);
    } else if (/cubic-bezier|ease-in|ease-out|ease(?!-)/.test(v)) {
      groups.easing.push(line);
    } else if (
      (/font(-family)?$|^--.*(?:font|typeface)$/.test(n) || /styrene|copernicus|tiempos|anthropic|jetbrains|mono(?:space)?$/.test(n)) &&
      (v.includes('"') || v.includes("'"))
    ) {
      groups.fonts.push(line);
    } else if (/weight/.test(n) && /^\d+$/.test(v)) {
      groups.weights.push(line);
    } else if (/radius|^--br-\d|rounded/.test(n) && /px|%|rem/.test(v)) {
      groups.radii.push(line);
    } else if (/^--border(?!-radius)/.test(n) && /px/.test(v)) {
      groups.borders.push(line);
    } else if (
      (/font-size|^--(?:display|headline|body|paragraph|detail|caption|mono|micro)/.test(n)) &&
      /px|rem/.test(v)
    ) {
      groups.fontSizes.push(line);
    } else if (
      /^--(sp-|spacer|gap-|gutter|padding|section-spacer|card-padding|page-margins)/.test(n) &&
      /px|rem|%/.test(v)
    ) {
      groups.spacing.push(line);
    }
  });

  return groups;
}

/**
 * Detect CSS module class name patterns.
 * Catches: __abc123__, ModuleName-module-scss-module__HASH__className
 */
function isCSSModule(sel) {
  if (!sel) return false;
  return (
    /__[a-zA-Z0-9]{4,}__/.test(sel) ||          // __abc123__
    /[A-Z][a-zA-Z]+(-module|-scss|-css)/.test(sel) || // ModuleName-module-scss
    /module--/.test(sel) ||
    /[a-zA-Z]{2,}__[a-zA-Z0-9_-]{4,}/.test(sel)  // BEM-module hybrids
  );
}

/**
 * Strip module class from a selector — return just the tag.
 */
function cleanSelector(sel) {
  if (!sel) return sel;
  if (isCSSModule(sel)) {
    // Return just the HTML element tag (A, NAV, DIV, etc.)
    return sel.split('.')[0].toLowerCase();
  }
  return sel;
}

/**
 * Deduplicate flex patterns.
 */
function deduplicateFlex(flexSystems) {
  const seen = new Set();
  return flexSystems.filter(f => {
    const key = `${f.flexDirection}|${f.justifyContent}|${f.alignItems}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Bucket breakpoints into named design tiers.
 */
function bucketBreakpoints(bps) {
  const nums = [...new Set(
    bps.map(b => parseInt(b)).filter(n => !isNaN(n))
  )].sort((a, b) => a - b);

  const tiers = { mobile: [], tablet: [], desktop: [], wide: [] };
  nums.forEach(n => {
    if (n < 600)       tiers.mobile.push(n + 'px');
    else if (n < 1024) tiers.tablet.push(n + 'px');
    else if (n < 1440) tiers.desktop.push(n + 'px');
    else               tiers.wide.push(n + 'px');
  });
  return tiers;
}

/**
 * Find the pseudo-state entry for a component name.
 */
function findPseudoKey(componentName, pseudoStates) {
  const map = {
    button:    ['button', '[class*="btn"]'],
    nav:       ['nav a', '[class*="nav"]'],
    card:      ['[class*="card"]'],
    input:     ['input'],
    link:      ['a', '[class*="link"]'],
    tab:       ['[class*="tab"]'],
    hero:      ['[class*="hero"]'],
  };
  for (const c of (map[componentName] || [])) {
    if (pseudoStates[c]) return c;
  }
  return null;
}

/**
 * Filter delta to visual-only properties.
 * Option: stripWebkit — for hover states strip -webkit; for focus states preserve it.
 */
function filterDelta(delta, { stripWebkit = true } = {}) {
  if (!delta) return [];

  const VISUAL_PROPS = new Set([
    'color', 'background', 'background-color', 'border-color', 'border-width',
    'border', 'outline', 'outline-color', 'outline-width', 'outline-offset',
    'outline-style', 'opacity', 'transform', 'text-decoration', 'text-decoration-line',
    'box-shadow', 'filter', 'backdrop-filter', 'font-weight', 'letter-spacing',
    'text-underline-offset'
  ]);

  return Object.entries(delta).filter(([prop, { from, to }]) => {
    if (!VISUAL_PROPS.has(prop)) return false;
    if (from === to) return false;
    if (!from && !to) return false;
    // For hover: strip webkit. For focus: keep it (webkit-focus-ring-color IS meaningful)
    if (stripWebkit && ((from || '').includes('-webkit') || (to || '').includes('-webkit'))) {
      return false;
    }
    return true;
  });
}
