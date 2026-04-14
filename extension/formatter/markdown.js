/**
 * UI2MD — Markdown Formatter
 * Converts raw analysis data into a rich design-system markdown document.
 */

export function generateMarkdown(data) {
  const {
    metadata, cssTokens, colors, typography, layout,
    bordersAndShadows, textures, animations, components,
    breakpoints, icons, accessibility, pseudoStates, deepTokens
  } = data;

  const styleName = detectStyleName(data);
  const styleProfile = getStyleProfile(styleName);

  const sections = [
    generateRoleSection(metadata, styleName),
    generateDesignSystemSection({
      styleName, styleProfile, metadata, cssTokens, colors, typography,
      layout, bordersAndShadows, textures, animations, components,
      breakpoints, icons, accessibility, pseudoStates, deepTokens
    })
  ];

  return sections.join('\n\n');
}

// ─── Style Detection ──────────────────────────────────────────────────────────

function detectStyleName(data) {
  const { colors, bordersAndShadows, typography, animations } = data;

  const bg = colors?.background || '#FFFFFF';
  const fg = colors?.foreground || '#000000';
  const isDarkBg = !isLightColor(bg);
  const hasRoundedCorners = !bordersAndShadows?.isSharp;
  const hasShadows = (bordersAndShadows?.shadows?.length || 0) > 0;
  const hasBlur = JSON.stringify(data).includes('blur') || JSON.stringify(data).includes('backdrop');
  const accent = colors?.accent;
  const hasAccentColor = accent && accent !== fg && accent !== bg;
  const isSerif = (typography?.families?.join('') || '').toLowerCase().match(/serif|georgia|garamond|playfair|merriweather/);
  const isSansSerif = (typography?.families?.join('') || '').toLowerCase().match(/sans|inter|roboto|poppins|nunito|outfit/);
  const isMonochrome = (colors?.all?.length || 0) < 4;
  const isPureMonochrome = isMonochrome && !hasAccentColor;
  const slowMotion = animations?.motionPhilosophy === 'slow';

  // Scoring system
  if (isDarkBg && hasBlur) return 'Glassmorphic Dark';
  if (isDarkBg && hasShadows && hasAccentColor && isLightNeon(accent)) return 'Neon Dark';
  if (isDarkBg && !hasShadows && !hasAccentColor) return 'Minimal Dark';
  if (!isDarkBg && isPureMonochrome && !hasRoundedCorners && isSerif) return 'Minimalist Monochrome';
  if (!isDarkBg && !hasAccentColor && !hasRoundedCorners && isSansSerif) return 'Minimalist Modern';
  if (!isDarkBg && hasAccentColor && hasRoundedCorners && isSansSerif) return 'Clean Modern';
  if (hasRoundedCorners && isEarthTone(bg)) return 'Organic Warm';
  if (!isDarkBg && isAllPastel(colors?.all || [], bg)) return 'Soft Pastel';
  if (!isDarkBg && !hasRoundedCorners && !isSansSerif && !isSerif) return 'Bold Geometric';
  if (!hasRoundedCorners && isMonochrome) return 'Editorial Dense';
  if (isDarkBg) return 'Dark Professional';
  return 'Contemporary Web';
}

function getStyleProfile(styleName) {
  const profiles = {
    'Minimalist Monochrome': {
      keywords: ['Austere', 'Authoritative', 'Timeless', 'Editorial', 'Intellectual', 'Refined'],
      inspiration: 'High-end fashion editorials, architectural monographs, luxury brand identities',
      principle: 'Reduction to Essence — black, white, and typography alone create impact'
    },
    'Glassmorphic Dark': {
      keywords: ['Ethereal', 'Futuristic', 'Luminous', 'Depth-layered', 'Premium', 'Tech-forward'],
      inspiration: 'macOS interfaces, modern SaaS dashboards, glass-effect design systems',
      principle: 'Frosted-glass translucency and layered depth create visual richness without flat surfaces'
    },
    'Neon Dark': {
      keywords: ['Electric', 'High-energy', 'Dramatic', 'Vivid', 'Bold', 'Cyberpunk'],
      inspiration: 'Gaming UIs, music platforms, developer tools, crypto dashboards',
      principle: 'Dark canvas amplifies vivid neons — contrast is the primary design language'
    },
    'Clean Modern': {
      keywords: ['Confident', 'Approachable', 'Fresh', 'Professional', 'Friendly', 'Clear'],
      inspiration: 'SaaS products, productivity tools, consumer apps',
      principle: 'Rounded geometry and measured color accents create warmth without sacrificing clarity'
    },
    'Organic Warm': {
      keywords: ['Natural', 'Inviting', 'Earthy', 'Human', 'Tactile', 'Wellness'],
      inspiration: 'D2C brands, food & wellness products, artisan commerce',
      principle: 'Earth tones and organic forms evoke nature, craft, and authenticity'
    },
    'Soft Pastel': {
      keywords: ['Gentle', 'Joyful', 'Light', 'Friendly', 'Accessible', 'Playful'],
      inspiration: 'Children products, lifestyle brands, creative tools',
      principle: 'Pastel palettes and soft curves reduce visual tension and invite exploration'
    },
    'Minimal Dark': {
      keywords: ['Sleek', 'Focused', 'Sophisticated', 'Dense', 'Technical', 'Sharp'],
      inspiration: 'Developer tools, code editors, analytics dashboards',
      principle: 'Dark background reduces eye strain and puts content front and center'
    },
    'Dark Professional': {
      keywords: ['Executive', 'Powerful', 'Dense', 'Data-driven', 'Technical'],
      inspiration: 'Financial platforms, enterprise software, professional tools',
      principle: 'Dark palette with structured hierarchy signals authority and precision'
    }
  };

  return profiles[styleName] || {
    keywords: ['Modern', 'Clean', 'Professional', 'Accessible'],
    inspiration: 'Contemporary web design best practices',
    principle: 'Clear hierarchy and purposeful use of space guide the user experience'
  };
}

// ─── Role Section ─────────────────────────────────────────────────────────────

function generateRoleSection(metadata, styleName) {
  return `<role>
You are an expert frontend engineer, UI/UX designer, visual design specialist, and typography expert. Your goal is to help the user integrate this design system into their codebase in a way that is visually consistent, maintainable, and idiomatic to their tech stack.

This design system was automatically extracted from **${metadata?.hostname || 'a web page'}** on ${formatDate(metadata?.timestamp)}.
${metadata?.description ? `\n> ${metadata.description}\n` : ''}
The page follows a **${styleName}** visual style. All design decisions documented below are derived from computed styles, CSS custom properties, and live DOM analysis — including hover and focus states captured via CDP pseudo-state forcing.

Before proposing or writing any code, first build a clear mental model of the current system:
- Identify the tech stack and existing component patterns.
- Understand the design tokens documented below (colors, spacing, typography, radii, shadows).
- Review the component architecture and naming conventions.
- Preserve the established visual language — especially the \`${styleName}\` aesthetic identity.

Always aim to:
- Preserve or improve accessibility.
- Maintain visual consistency with this design system.
- Leave the codebase cleaner and more coherent than you found it.
- Make deliberate design choices that express the **${styleName}** personality.
</role>`;
}

// ─── Design System Section ────────────────────────────────────────────────────

function generateDesignSystemSection(opts) {
  const {
    styleName, styleProfile, metadata, cssTokens, colors, typography,
    layout, bordersAndShadows, textures, animations, components,
    breakpoints, icons, accessibility, pseudoStates, deepTokens
  } = opts;

  return `<design-system>
# Design Style: ${styleName}

## Design Philosophy

### Core Principle

**${styleProfile.principle}**

### Visual Vibe

**Emotional Keywords**: ${styleProfile.keywords.join(', ')}

This design draws inspiration from:
- ${styleProfile.inspiration}

---

${generateColorSection(colors, cssTokens, deepTokens)}

---

${generateTypographySection(typography)}

---

${generateSpacingSection(layout)}

---

${generateBorderSection(bordersAndShadows)}

---

${generateShadowSection(bordersAndShadows)}

---

${generateTextureSection(textures)}

---

${generateComponentSection(components, pseudoStates)}

---

${generateAnimationSection(animations)}

---

${icons ? generateIconSection(icons) + '\n\n---\n\n' : ''}${generateLayoutSection(layout)}

---

${generateResponsiveSection(breakpoints)}

---

${generateAccessibilitySection(accessibility, pseudoStates)}

</design-system>`;
}

// ─── Color Section ────────────────────────────────────────────────────────────

function generateColorSection(colors, cssTokens, deepTokens) {
  let out = '## Design Token System\n\n### Colors\n\n';

  // From CSS custom properties first (most reliable)
  const allTokenColors = { ...cssTokens?.colors, ...deepTokens };
  const hasTokenColors = Object.keys(allTokenColors).length > 0;

  if (hasTokenColors) {
    out += '**CSS Custom Properties (Design Tokens)**:\n\n```\n';
    Object.entries(allTokenColors).forEach(([name, val]) => {
      out += `${name}: ${val}\n`;
    });
    out += '```\n\n';
  }

  if (colors) {
    out += '**Extracted Color Palette** (by frequency on page):\n\n';
    out += '```\n';
    if (colors.background) out += `background:      ${colors.background}  (Primary background)\n`;
    if (colors.foreground) out += `foreground:      ${colors.foreground}  (Primary foreground/text)\n`;
    if (colors.accent) out += `accent:          ${colors.accent}  (Accent/highlight color)\n`;
    if (colors.muted?.length) {
      colors.muted.slice(0, 8).forEach((c, i) => {
        out += `muted-${i + 1}:       ${c}\n`;
      });
    }
    out += '```\n\n';

    if (colors.all?.length > 0) {
      out += '**All Detected Colors** (ranked by usage frequency):\n\n';
      out += colors.all.slice(0, 20).map((c, i) => `${i + 1}. \`${c}\``).join(' · ') + '\n';
    }
  }

  return out;
}

// ─── Typography Section ───────────────────────────────────────────────────────

function generateTypographySection(typography) {
  if (!typography) return '### Typography\n\n_No typography data extracted._';

  let out = '### Typography\n\n';

  if (typography.families?.length) {
    out += '**Font Families Detected**:\n\n';
    typography.families.forEach(f => { out += `- \`${f}\`\n`; });
    out += '\n';
  }

  if (typography.headingScale?.length) {
    out += '**Heading Scale**:\n\n';
    out += '| Tag | Font Size | Font Weight |\n|-----|-----------|-------------|\n';
    typography.headingScale.forEach(h => {
      out += `| \`${h.tag}\` | ${h.size} (${h.sizeRem}) | ${h.weight} |\n`;
    });
    out += '\n';
  }

  if (typography.roles) {
    out += '**Type Roles**:\n\n';
    out += '```\n';
    Object.entries(typography.roles).forEach(([role, styles]) => {
      if (styles) {
        out += `${role.padEnd(12)}: ${styles.fontSize} / ${styles.fontWeight} / ${styles.lineHeight} — ${styles.fontFamily?.split(',')[0]?.trim()}\n`;
      }
    });
    out += '```\n';
  }

  return out;
}

// ─── Spacing Section ──────────────────────────────────────────────────────────

function generateSpacingSection(layout) {
  if (!layout) return '### Spacing & Layout\n\n_No layout data extracted._';

  let out = '### Spacing & Layout\n\n';

  if (layout.containers?.length) {
    out += '**Containers**:\n\n```\n';
    layout.containers.forEach(c => {
      out += `${c.selector}: max-width ${c.maxWidth}, padding ${c.padding}\n`;
    });
    out += '```\n\n';
  }

  const sectionPaddings = layout.sections?.map(s => s.paddingTop).filter(p => p && p !== '0px');
  if (sectionPaddings?.length) {
    const uniquePad = [...new Set(sectionPaddings)];
    out += `**Section Vertical Rhythm**: ${uniquePad.slice(0, 4).join(', ')}\n\n`;
  }

  const cssSpacing = {};
  if (layout) {
    Object.entries(layout.sections || {}).forEach(([, s]) => {
      if (s.paddingTop) cssSpacing[s.paddingTop] = true;
    });
  }

  return out;
}

// ─── Border Section ───────────────────────────────────────────────────────────

function generateBorderSection(b) {
  if (!b) return '### Border Radius\n\n_No border data extracted._';

  let out = '### Border Radius\n\n';
  if (b.isSharp) {
    out += '```\nALL VALUES: 0px\n```\n\nAll elements use sharp, 90-degree corners. This is a defining characteristic of the design\'s architectural precision.\n';
  } else if (b.radii?.length) {
    out += '```\n';
    b.radii.slice(0, 8).forEach(r => { out += `${r}\n`; });
    out += '```\n';
  } else {
    out += '```\nDefault (browser default)\n```\n';
  }

  out += '\n### Borders & Lines\n\n```\n';
  if (b.borderWidths?.length) {
    b.borderWidths.slice(0, 6).forEach((w, i) => {
      const color = b.borderColors?.[i] || '#000';
      const label = categorizeBorderWidth(parseFloat(w));
      out += `${label.padEnd(10)}: ${w} solid ${color}\n`;
    });
  } else {
    out += 'No prominent borders detected.\n';
  }
  out += '```\n';

  return out;
}

function categorizeBorderWidth(px) {
  if (px <= 0) return 'none';
  if (px <= 1) return 'hairline';
  if (px <= 2) return 'thin';
  if (px <= 3) return 'medium';
  if (px <= 4) return 'thick';
  return 'ultra';
}

// ─── Shadow Section ───────────────────────────────────────────────────────────

function generateShadowSection(b) {
  let out = '### Shadows\n\n```\n';
  if (!b?.shadows?.length) {
    out += 'NONE — This design uses zero drop shadows.\n';
    out += 'Depth is created through: color contrast, border weight variation, scale, and negative space.\n';
  } else {
    b.shadows.slice(0, 6).forEach((s, i) => {
      out += `shadow-${i + 1}: ${s}\n`;
    });
  }
  out += '```\n';
  return out;
}

// ─── Texture Section ──────────────────────────────────────────────────────────

function generateTextureSection(textures) {
  let out = '### Textures & Patterns\n\n';
  if (!textures?.length) {
    out += '_No background textures or patterns detected._\n';
    return out;
  }

  textures.slice(0, 5).forEach(t => {
    out += `**${t.selector}**:\n\`\`\`css\nbackground-image: ${t.backgroundImage};\nbackground-size: ${t.backgroundSize};\nbackground-repeat: ${t.backgroundRepeat};\n\`\`\`\n\n`;
  });

  return out;
}

// ─── Component Section ────────────────────────────────────────────────────────

function generateComponentSection(components, pseudoStates) {
  let out = '## Component Stylings\n\n';

  if (!components || Object.keys(components).length === 0) {
    return out + '_No components detected._\n';
  }

  const componentOrder = ['button', 'card', 'input', 'nav', 'hero', 'badge', 'footer', 'modal'];

  componentOrder.forEach(name => {
    const comp = components[name];
    if (!comp?.found) return;

    out += `### ${capitalize(name)}s\n\n`;
    out += '```\n';
    const s = comp.styles;
    if (s.backgroundColor) out += `Background:    ${s.backgroundColor}\n`;
    if (s.color) out += `Text:          ${s.color}\n`;
    if (s.border) out += `Border:        ${s.border}\n`;
    if (s.borderRadius) out += `Border Radius: ${s.borderRadius}\n`;
    if (s.padding) out += `Padding:       ${s.padding}\n`;
    if (s.fontSize) out += `Font Size:     ${s.fontSize}\n`;
    if (s.fontWeight) out += `Font Weight:   ${s.fontWeight}\n`;
    if (s.boxShadow && s.boxShadow !== 'none') out += `Box Shadow:    ${s.boxShadow}\n`;
    out += '```\n\n';

    // Hover state
    const hoverKey = Object.keys(pseudoStates || {}).find(k => k.includes(name === 'button' ? 'button' : name === 'nav' ? 'nav' : name));
    if (hoverKey && pseudoStates[hoverKey]) {
      const { hoverDelta, focusDelta } = pseudoStates[hoverKey];

      if (hoverDelta && Object.keys(hoverDelta).length > 0) {
        out += '**Hover State Changes**:\n```\n';
        Object.entries(hoverDelta).forEach(([prop, { from, to }]) => {
          out += `${prop}: ${from || 'unset'} → ${to || 'unset'}\n`;
        });
        out += '```\n\n';
      }

      if (focusDelta && Object.keys(focusDelta).length > 0) {
        out += '**Focus State Changes**:\n```\n';
        Object.entries(focusDelta).forEach(([prop, { from, to }]) => {
          out += `${prop}: ${from || 'unset'} → ${to || 'unset'}\n`;
        });
        out += '```\n\n';
      }
    }
  });

  return out;
}

// ─── Animation Section ────────────────────────────────────────────────────────

function generateAnimationSection(animations) {
  if (!animations) return '## Effects & Animation\n\n_No animation data extracted._\n';

  let out = '## Effects & Animation\n\n';
  out += `**Motion Philosophy**: ${capitalize(animations.motionPhilosophy)}\n\n`;
  out += `**Average Transition Duration**: ${animations.avgDurationMs}ms\n\n`;

  if (animations.transitions?.length) {
    out += '**Detected Transitions**:\n\n```\n';
    animations.transitions.forEach(t => {
      out += `${t.el}: ${t.value}\n`;
    });
    out += '```\n\n';
  }

  if (animations.animations?.length) {
    out += '**Detected Animations**:\n\n```\n';
    animations.animations.forEach(a => {
      out += `${a.el}: animation-name: ${a.animationName}, duration: ${a.duration}\n`;
    });
    out += '```\n';
  }

  return out;
}

// ─── Icon Section ─────────────────────────────────────────────────────────────

function generateIconSection(icons) {
  let out = '## Iconography\n\n';
  out += `**Style**: ${icons.style === 'outlined-thin' ? 'Outlined, thin strokes' : 'Solid/filled'}\n\n`;
  out += `**Count detected**: ${icons.count}\n\n`;
  if (icons.sizes?.length) out += `**Sizes**: ${icons.sizes.join(', ')}\n\n`;
  if (icons.strokeWidths?.length) out += `**Stroke Widths**: ${icons.strokeWidths.join(', ')}\n\n`;
  if (icons.color) out += `**Color**: \`${icons.color}\`\n`;
  return out;
}

// ─── Layout Section ───────────────────────────────────────────────────────────

function generateLayoutSection(layout) {
  let out = '## Layout Strategy\n\n### Grid System\n\n';

  if (layout?.gridSystems?.length) {
    out += '**CSS Grid Usage**:\n\n```\n';
    layout.gridSystems.slice(0, 5).forEach(g => {
      out += `${g.tag}${g.className ? '.' + g.className.split(' ')[0] : ''}: grid-template-columns: ${g.gridTemplateColumns}, gap: ${g.gap}\n`;
    });
    out += '```\n\n';
  }

  if (layout?.flexSystems?.length) {
    out += '**Flexbox Usage**:\n\n```\n';
    layout.flexSystems.slice(0, 5).forEach(f => {
      out += `${f.tag}: flex-direction: ${f.flexDirection}, justify: ${f.justifyContent}, align: ${f.alignItems}, gap: ${f.gap}\n`;
    });
    out += '```\n';
  }

  return out;
}

// ─── Responsive Section ───────────────────────────────────────────────────────

function generateResponsiveSection(breakpoints) {
  let out = '## Responsive Strategy\n\n';
  if (!breakpoints?.length) {
    out += '_No media query breakpoints detected._\n';
    return out;
  }
  out += '**Detected Breakpoints**:\n\n```\n';
  breakpoints.forEach(bp => { out += `${bp}\n`; });
  out += '```\n';
  return out;
}

// ─── Accessibility Section ────────────────────────────────────────────────────

function generateAccessibilitySection(accessibility, pseudoStates) {
  let out = '## Accessibility\n\n';

  if (accessibility?.bodyContrast) {
    const { fg, bg } = accessibility.bodyContrast;
    if (fg && bg) {
      const ratio = estimateContrastRatio(fg, bg);
      out += `**Body Text Contrast**: \`${fg}\` on \`${bg}\` ≈ ${ratio.toFixed(1)}:1 — ${getWCAGLabel(ratio)}\n\n`;
    }
  }

  if (Object.keys(accessibility?.focusStyles || {}).length) {
    out += '**Focus Styles Detected**:\n\n```\n';
    Object.entries(accessibility.focusStyles).forEach(([tag, s]) => {
      out += `${tag}: outline: ${s.outline}; outline-offset: ${s.outlineOffset}\n`;
    });
    out += '```\n\n';
  }

  // From pseudo-states — focus-visible deltas
  const focusVisibleData = [];
  Object.entries(pseudoStates || {}).forEach(([sel, data]) => {
    const fv = data.focusVisible;
    if (fv && Object.keys(fv).length > 0) {
      focusVisibleData.push({ sel, styles: fv });
    }
  });

  if (focusVisibleData.length) {
    out += '**Focus-Visible Styles (CDP captured)**:\n\n```\n';
    focusVisibleData.slice(0, 6).forEach(({ sel, styles }) => {
      out += `${sel}:focus-visible {\n`;
      Object.entries(styles).slice(0, 5).forEach(([k, v]) => { out += `  ${k}: ${v};\n`; });
      out += `}\n`;
    });
    out += '```\n\n';
  }

  if (accessibility?.ariaLandmarks) {
    const l = accessibility.ariaLandmarks;
    out += '**ARIA Landmarks**:\n\n';
    out += `- \`<main>\`: ${l.hasMain ? '✅ Present' : '❌ Missing'}\n`;
    out += `- \`<nav>\`: ${l.hasNav ? '✅ Present' : '❌ Missing'}\n`;
    out += `- \`<header>\`: ${l.hasHeader ? '✅ Present' : '❌ Missing'}\n`;
    out += `- \`<footer>\`: ${l.hasFooter ? '✅ Present' : '❌ Missing'}\n`;
    out += `- Skip links: ${accessibility.skipLinks ? '✅ Present' : '❌ Missing'}\n`;
  }

  return out;
}

// ─── Color Utilities ──────────────────────────────────────────────────────────

function isLightColor(hex) {
  if (!hex || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128;
}

function isLightNeon(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max - min) / max > 0.5 && max > 150;
}

function isEarthTone(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r > 120 && g > 90 && b < 120 && Math.abs(r - g) < 60;
}

function isAllPastel(colors, bg) {
  if (!colors?.length) return false;
  return colors.slice(0, 8).every(hex => {
    if (!hex || hex.length < 7) return true;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r > 150 && g > 150 && b > 150;
  });
}

function estimateContrastRatio(fgHex, bgHex) {
  const lum = hex => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  try {
    const l1 = lum(fgHex);
    const l2 = lum(bgHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch { return 1; }
}

function getWCAGLabel(ratio) {
  if (ratio >= 7) return 'WCAG AAA ✅';
  if (ratio >= 4.5) return 'WCAG AA ✅';
  if (ratio >= 3) return 'WCAG AA (Large Text) ⚠️';
  return 'Fails WCAG ❌';
}

// ─── Misc Utilities ───────────────────────────────────────────────────────────

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(iso) {
  if (!iso) return 'Unknown date';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
