/**
 * UI2MD — Content Script Analyzer
 * Runs inside the target page. Extracts all visual design data.
 */

(function () {
  'use strict';

  // ─── Utilities ────────────────────────────────────────────────────────────

  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function pxToRem(px) {
    const num = parseFloat(px);
    if (isNaN(num)) return px;
    return `${(num / 16).toFixed(4).replace(/\.?0+$/, '')}rem`;
  }

  function getEl(selector) {
    try { return document.querySelector(selector); } catch { return null; }
  }

  function getEls(selector) {
    try { return Array.from(document.querySelectorAll(selector)); } catch { return []; }
  }

  function getStyle(el) {
    if (!el) return {};
    return window.getComputedStyle(el);
  }

  function pick(style, props) {
    const result = {};
    props.forEach(p => { result[p] = style.getPropertyValue(p).trim(); });
    return result;
  }

  function unique(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function frequencyMap(arr) {
    const map = {};
    arr.forEach(v => { map[v] = (map[v] || 0) + 1; });
    return map;
  }

  function topN(freqMap, n = 10) {
    return Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k);
  }

  // ─── 1. CSS Custom Properties ─────────────────────────────────────────────

  function extractCSSCustomProperties() {
    const tokens = { colors: {}, spacing: {}, radii: {}, fontSizes: {}, shadows: {}, zIndex: {}, other: {} };

    try {
      for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules; } catch { continue; }
        if (!rules) continue;

        for (const rule of rules) {
          if (rule instanceof CSSStyleRule) {
            const sel = rule.selectorText || '';
            if (sel === ':root' || sel === 'html' || sel === '*') {
              for (const prop of rule.style) {
                if (prop.startsWith('--')) {
                  const val = rule.style.getPropertyValue(prop).trim();
                  if (/^#|rgb|hsl/.test(val)) tokens.colors[prop] = val;
                  else if (/px|rem|em|%/.test(val)) {
                    if (/radius|round/.test(prop)) tokens.radii[prop] = val;
                    else if (/font-size|text/.test(prop)) tokens.fontSizes[prop] = val;
                    else tokens.spacing[prop] = val;
                  } else if (/shadow/.test(prop)) tokens.shadows[prop] = val;
                  else if (/z-index|z_index/.test(prop)) tokens.zIndex[prop] = val;
                  else tokens.other[prop] = val;
                }
              }
            }
          }
        }
      }
    } catch (e) { /* cross-origin sheets silently skipped */ }

    return tokens;
  }

  // ─── 2. Color Palette ─────────────────────────────────────────────────────

  function extractColors() {
    const colorProps = ['color', 'background-color', 'border-color', 'outline-color'];
    const selectors = [
      'body', 'html', 'main', 'header', 'footer', 'nav',
      'h1', 'h2', 'h3', 'h4', 'p', 'a', 'span', 'li',
      'button', 'input', 'textarea', 'select',
      'section', 'article', 'aside', 'div'
    ];

    const allColors = [];
    const sampleEls = [];

    selectors.forEach(sel => {
      const els = getEls(sel).slice(0, 5);
      sampleEls.push(...els);
    });

    // Also sample class-based components
    ['card', 'btn', 'badge', 'tag', 'chip', 'nav', 'hero', 'banner', 'modal', 'toast'].forEach(kw => {
      getEls(`[class*="${kw}"]`).slice(0, 3).forEach(el => sampleEls.push(el));
    });

    const seen = new WeakSet();
    sampleEls.forEach(el => {
      if (seen.has(el)) return;
      seen.add(el);
      const s = getStyle(el);
      colorProps.forEach(p => {
        const hex = rgbToHex(s.getPropertyValue(p));
        if (hex) allColors.push(hex);
      });
    });

    const freq = frequencyMap(allColors);
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);

    // Classify
    const palette = {
      background: null, foreground: null, accent: null,
      muted: [], border: null, all: sorted.map(([c]) => c)
    };

    sorted.forEach(([color, count]) => {
      const isLight = isLightColor(color);
      if (!palette.background && isLight && count > 2) palette.background = color;
      else if (!palette.foreground && !isLight && count > 2) palette.foreground = color;
      else if (!palette.accent && isAccentColor(color)) palette.accent = color;
      else palette.muted.push(color);
    });

    return palette;
  }

  function isLightColor(hex) {
    if (!hex) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Perceived luminance
    return (0.299 * r + 0.587 * g + 0.114 * b) > 128;
  }

  function isAccentColor(hex) {
    if (!hex) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    return saturation > 0.3 && max > 80; // colorful enough
  }

  // ─── 3. Typography ─────────────────────────────────────────────────────────

  function extractTypography() {
    const typographyMap = {};
    const tags = {
      display: 'h1',
      headline: 'h2',
      subheading: 'h3',
      body: 'p',
      label: 'label',
      small: 'small',
      code: 'code',
      nav: 'nav a',
      button: 'button'
    };

    const fontFamilies = new Set();
    const fontSizes = [];

    Object.entries(tags).forEach(([role, sel]) => {
      const el = getEl(sel);
      if (!el) return;
      const s = getStyle(el);
      const entry = {
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontSizeRem: pxToRem(s.fontSize),
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        textTransform: s.textTransform,
        color: rgbToHex(s.color)
      };
      typographyMap[role] = entry;
      if (s.fontFamily) fontFamilies.add(s.fontFamily.split(',')[0].trim().replace(/["']/g, ''));
      if (s.fontSize) fontSizes.push(parseFloat(s.fontSize));
    });

    // Detect heading scale
    const h1 = getEl('h1'), h2 = getEl('h2'), h3 = getEl('h3'), h4 = getEl('h4'), h5 = getEl('h5'), h6 = getEl('h6');
    const headingScale = [h1, h2, h3, h4, h5, h6].map((el, i) => {
      if (!el) return null;
      const s = getStyle(el);
      return { tag: `h${i + 1}`, size: s.fontSize, sizeRem: pxToRem(s.fontSize), weight: s.fontWeight };
    }).filter(Boolean);

    return {
      roles: typographyMap,
      families: [...fontFamilies],
      headingScale,
      fontSizeRange: fontSizes.length ? { min: Math.min(...fontSizes), max: Math.max(...fontSizes) } : null
    };
  }

  // ─── 4. Spacing & Layout ──────────────────────────────────────────────────

  function extractLayout() {
    const layout = {
      containers: [],
      sections: [],
      gridSystems: [],
      flexSystems: []
    };

    // Container widths
    const containerSelectors = ['main', '.container', '.wrapper', '#app', '#root', '[class*="container"]', '[class*="wrapper"]', '[class*="layout"]'];
    containerSelectors.forEach(sel => {
      const el = getEl(sel);
      if (!el) return;
      const s = getStyle(el);
      if (s.maxWidth && s.maxWidth !== 'none') {
        layout.containers.push({ selector: sel, maxWidth: s.maxWidth, padding: `${s.paddingLeft} ${s.paddingRight}` });
      }
    });

    // Section spacing
    getEls('section, main, header, footer, [class*="section"]').slice(0, 12).forEach(el => {
      const s = getStyle(el);
      layout.sections.push({
        tag: el.tagName.toLowerCase(),
        className: el.className?.toString().slice(0, 60),
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft,
        display: s.display
      });
    });

    // Grid systems
    getEls('*').filter(el => {
      const s = getStyle(el);
      return s.display === 'grid';
    }).slice(0, 10).forEach(el => {
      const s = getStyle(el);
      layout.gridSystems.push({
        tag: el.tagName.toLowerCase(),
        className: el.className?.toString().slice(0, 60),
        gridTemplateColumns: s.gridTemplateColumns,
        gap: s.gap,
        rowGap: s.rowGap,
        columnGap: s.columnGap
      });
    });

    // Flex systems
    getEls('*').filter(el => {
      const s = getStyle(el);
      return s.display === 'flex';
    }).slice(0, 10).forEach(el => {
      const s = getStyle(el);
      layout.flexSystems.push({
        tag: el.tagName.toLowerCase(),
        className: el.className?.toString().slice(0, 60),
        flexDirection: s.flexDirection,
        flexWrap: s.flexWrap,
        gap: s.gap,
        alignItems: s.alignItems,
        justifyContent: s.justifyContent
      });
    });

    return layout;
  }

  // ─── 5. Borders & Shadows ─────────────────────────────────────────────────

  function extractBordersAndShadows() {
    const radii = [], shadows = [], borderWidths = [], borderColors = [];

    const allEls = getEls('button, input, textarea, [class*="card"], [class*="modal"], [class*="dialog"], nav, header, footer, a, img, section').slice(0, 50);

    allEls.forEach(el => {
      const s = getStyle(el);
      if (s.borderRadius && s.borderRadius !== '0px') radii.push(s.borderRadius);
      if (s.boxShadow && s.boxShadow !== 'none') shadows.push(s.boxShadow);
      if (s.borderWidth && s.borderWidth !== '0px') {
        borderWidths.push(s.borderWidth);
        borderColors.push(rgbToHex(s.borderColor));
      }
    });

    return {
      radii: unique(radii),
      shadows: unique(shadows),
      borderWidths: unique(borderWidths),
      borderColors: unique(borderColors.filter(Boolean)),
      isSharp: radii.length === 0 || radii.every(r => r === '0px')
    };
  }

  // ─── 6. Background Textures & Patterns ────────────────────────────────────

  function extractTextures() {
    const textures = [];
    const allEls = getEls('body, main, section, header, footer, [class*="hero"], [class*="banner"], [class*="bg"]').slice(0, 20);

    allEls.forEach(el => {
      const s = getStyle(el);
      const bgImage = s.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        textures.push({
          selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.toString().split(' ')[0] : ''),
          backgroundImage: bgImage.length > 300 ? bgImage.slice(0, 300) + '...' : bgImage,
          backgroundSize: s.backgroundSize,
          backgroundRepeat: s.backgroundRepeat,
          opacity: s.opacity
        });
      }
    });

    return textures;
  }

  // ─── 7. Animations & Transitions ─────────────────────────────────────────

  function extractAnimations() {
    const transitions = [], animations = [], durations = [];

    getEls('button, a, [class*="btn"], [class*="card"], [class*="nav"], input, [class*="link"]').slice(0, 30).forEach(el => {
      const s = getStyle(el);
      if (s.transition && s.transition !== 'none' && s.transition !== 'all 0s ease 0s') {
        transitions.push({ el: el.tagName + (el.className ? '.' + el.className.toString().split(' ')[0] : ''), value: s.transition });
        const dur = s.transitionDuration;
        if (dur) durations.push(parseFloat(dur) * 1000); // ms
      }
      if (s.animationName && s.animationName !== 'none') {
        animations.push({ el: el.tagName, animationName: s.animationName, duration: s.animationDuration });
      }
    });

    const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    let motionPhilosophy = 'instant';
    if (avgDuration > 300) motionPhilosophy = 'slow';
    else if (avgDuration > 100) motionPhilosophy = 'fast';

    return { transitions: transitions.slice(0, 10), animations: animations.slice(0, 10), avgDurationMs: Math.round(avgDuration), motionPhilosophy };
  }

  // ─── 8. Component Profiling ───────────────────────────────────────────────

  function extractComponents() {
    const components = {};

    const componentMap = {
      button: ['button', '[role="button"]', '[class*="btn"]', '[class*="button"]'],
      card: ['[class*="card"]', 'article', '[class*="tile"]', '[class*="panel"]'],
      input: ['input[type="text"]', 'input[type="email"]', 'input[type="search"]', 'textarea'],
      nav: ['nav', '[role="navigation"]'],
      hero: ['[class*="hero"]', '[class*="banner"]'],
      footer: ['footer'],
      badge: ['[class*="badge"]', '[class*="tag"]', '[class*="chip"]', '[class*="pill"]'],
      modal: ['[role="dialog"]', '[class*="modal"]', '[class*="drawer"]']
    };

    Object.entries(componentMap).forEach(([name, selectors]) => {
      let el = null;
      for (const sel of selectors) {
        el = getEl(sel);
        if (el) break;
      }
      if (!el) return;

      const s = getStyle(el);
      components[name] = {
        found: true,
        selector: el.tagName.toLowerCase(),
        className: el.className?.toString().slice(0, 80),
        styles: {
          color: rgbToHex(s.color),
          backgroundColor: rgbToHex(s.backgroundColor),
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
          margin: `${s.marginTop} ${s.marginRight} ${s.marginBottom} ${s.marginLeft}`,
          border: `${s.borderWidth} ${s.borderStyle} ${rgbToHex(s.borderColor) || s.borderColor}`,
          borderRadius: s.borderRadius,
          boxShadow: s.boxShadow,
          display: s.display,
          transition: s.transition
        }
      };
    });

    return components;
  }

  // ─── 9. Breakpoints (from media queries) ─────────────────────────────────

  function extractBreakpoints() {
    const breakpoints = new Set();
    try {
      for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules; } catch { continue; }
        if (!rules) continue;
        for (const rule of rules) {
          if (rule instanceof CSSMediaRule) {
            const text = rule.conditionText || rule.media?.mediaText || '';
            const matches = text.match(/\d+px/g);
            if (matches) matches.forEach(m => breakpoints.add(m));
          }
        }
      }
    } catch {}
    return [...breakpoints].sort((a, b) => parseInt(a) - parseInt(b));
  }

  // ─── 10. Iconography ──────────────────────────────────────────────────────

  function extractIcons() {
    const svgs = getEls('svg').slice(0, 10);
    if (svgs.length === 0) return null;

    const sizes = svgs.map(svg => ({ w: svg.getAttribute('width'), h: svg.getAttribute('height') }));
    const strokeWidths = svgs.map(svg => {
      const paths = svg.querySelectorAll('path, line, circle, rect, polyline, polygon');
      const sws = Array.from(paths).map(p => p.getAttribute('stroke-width')).filter(Boolean);
      return sws[0] || null;
    }).filter(Boolean);

    const s = getStyle(svgs[0]);
    return {
      count: svgs.length,
      sizes: unique(sizes.map(s => s.w ? `${s.w}x${s.h}` : null).filter(Boolean)),
      strokeWidths: unique(strokeWidths),
      color: rgbToHex(s.color) || rgbToHex(s.fill),
      style: strokeWidths.some(sw => parseFloat(sw) <= 1.5) ? 'outlined-thin' : 'solid'
    };
  }

  // ─── 11. Accessibility Signals ───────────────────────────────────────────

  function extractAccessibility() {
    const focusableEls = getEls('button, a, input, select, textarea, [tabindex]').slice(0, 20);
    const focusStyles = {};

    focusableEls.forEach(el => {
      const s = getStyle(el);
      const outline = s.outline;
      const outlineOffset = s.outlineOffset;
      if (outline && outline !== 'none' && outline !== '0px') {
        const tag = el.tagName.toLowerCase();
        focusStyles[tag] = { outline, outlineOffset };
      }
    });

    // Check contrast between body text and background
    const bodyStyle = getStyle(document.body);
    const fgHex = rgbToHex(bodyStyle.color);
    const bgHex = rgbToHex(bodyStyle.backgroundColor);

    return {
      focusStyles,
      bodyContrast: { fg: fgHex, bg: bgHex },
      ariaLandmarks: {
        hasMain: !!getEl('[role="main"], main'),
        hasNav: !!getEl('[role="navigation"], nav'),
        hasHeader: !!getEl('[role="banner"], header'),
        hasFooter: !!getEl('[role="contentinfo"], footer')
      },
      skipLinks: getEls('[href="#main"], [href="#content"], .skip-link, [class*="skip"]').length > 0
    };
  }

  // ─── 12. Page Metadata ────────────────────────────────────────────────────

  function extractMetadata() {
    return {
      title: document.title,
      url: window.location.href,
      hostname: window.location.hostname,
      description: document.querySelector('meta[name="description"]')?.content || null,
      themeColor: document.querySelector('meta[name="theme-color"]')?.content || null,
      viewport: document.querySelector('meta[name="viewport"]')?.content || null,
      timestamp: new Date().toISOString()
    };
  }

  // ─── Main ─────────────────────────────────────────────────────────────────

  function analyze() {
    return {
      metadata: extractMetadata(),
      cssTokens: extractCSSCustomProperties(),
      colors: extractColors(),
      typography: extractTypography(),
      layout: extractLayout(),
      bordersAndShadows: extractBordersAndShadows(),
      textures: extractTextures(),
      animations: extractAnimations(),
      components: extractComponents(),
      breakpoints: extractBreakpoints(),
      icons: extractIcons(),
      accessibility: extractAccessibility()
    };
  }

  // Expose to be called by service worker via chrome.scripting.executeScript
  return analyze();
})();
