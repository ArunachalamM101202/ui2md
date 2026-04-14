<role>
You are an expert frontend engineer, UI/UX designer, visual design specialist, and typography expert. Your goal is to help the user integrate this design system into their codebase in a way that is visually consistent, maintainable, and idiomatic to their tech stack.

This design system was automatically extracted from **www.anthropic.com** on April 13, 2026.

> A new initiative to secure the world’s most critical software and give defenders a durable advantage in the coming AI-driven era of cybersecurity.

The page follows a **Clean Modern** visual style. All design decisions documented below are derived from computed styles, CSS custom properties, and live DOM analysis — including hover and focus states captured via CDP pseudo-state forcing.

Before proposing or writing any code, first build a clear mental model of the current system:
- Identify the tech stack and existing component patterns.
- Understand the design tokens documented below (colors, spacing, typography, radii, shadows).
- Review the component architecture and naming conventions.
- Preserve the established visual language — especially the `Clean Modern` aesthetic identity.

Always aim to:
- Preserve or improve accessibility.
- Maintain visual consistency with this design system.
- Leave the codebase cleaner and more coherent than you found it.
- Make deliberate design choices that express the **Clean Modern** personality.
</role>

<design-system>
# Design Style: Clean Modern

## Design Philosophy

### Core Principle

**Rounded geometry and measured color accents create warmth without sacrificing clarity**

### Visual Vibe

**Emotional Keywords**: Confident, Approachable, Fresh, Professional, Friendly, Clear

This design draws inspiration from:
- SaaS products, productivity tools, consumer apps

---

## Design Token System

### Colors

**CSS Custom Properties (Design Tokens)**:

```
--color-cactus: #bcd1ca
--color-clay: #d97757
--color-cloud-dark: #87867f
--color-cloud-light: #d1cfc5
--color-cloud-medium: #b0aea5
--color-coral: #ebcece
--color-dark: #0f0f0e
--color-error: #bf4d43
--color-fig: #c46686
--color-focus: #2c84db
--color-heather: #cbcadb
--color-ivory-dark: #e8e6dc
--color-ivory-light: #faf9f5
--color-ivory-medium: #f0eee6
--color-light: #fff
--color-oat: #e3dacc
--color-olive: #788c5d
--color-sky: #6a9bcc
--color-slate-000: #fff
--color-slate-050: #faf9f5
--color-slate-100: #f5f4ed
--color-slate-1000: #0f0f0e
--color-slate-150: #f0eee6
--color-slate-200: #e8e6dc
--color-slate-250: #dedcd1
--color-slate-300: #d1cfc5
--color-slate-350: #c2c0b6
--color-slate-400: #b0aea5
--color-slate-450: #9c9a92
--color-slate-500: #87867f
--color-slate-550: #73726c
--color-slate-600: #5e5d59
--color-slate-650: #4d4c48
--color-slate-700: #3d3d3a
--color-slate-750: #30302e
--color-slate-800: #262624
--color-slate-850: #1f1e1d
--color-slate-900: #1a1918
--color-slate-950: #141413
--color-slate-dark: #141413
--color-slate-light: #5e5d59
--color-slate-medium: #3d3d3a
--color-tint-10: #1919191a
--color-tint-20: #19191933
--weight-display-bold: 700
--spacer-01: 4px
--page-margins: 64px
--leading-155: 155%
--headline-5: 25px
--sp-96: 96px
--gap-md: 32px
--gap-sm: 24px
--text-column-max-width: 640px
--spacer-06: 32px
--weight-display-medium: 500
--paragraph-s: 18px
--anthropic-mono: "anthropicMono","anthropicMono Fallback"
--media-max-width: 880px
--headline-6: 19px
--gap-xs: 16px
--br-4: 4px
--ease-in-out-quart: cubic-bezier(.77,0,.175,1)
--display-l: 48px
--border-lg: 2px
--card-padding-sm: 24px
--display-xs: 20px
--leading-125: 125%
--sp-56: 56px
--spacer-05: 24px
--spacer-02: 8px
--headline-1: 52px
--border-sm: 1px
--spacer-10: 80px
--column-count: 2
--vh: 100vh
--br-32: 32px
--display-2: 64px
--radius-sm: 12px
--ease-out-quart: cubic-bezier(.165,.84,.44,1)
--sp-4: 4px
--header-nav-height: 68px
--radius-max: 1000px
--headline-2: 44px
--br-12: 12px
--sp-40: 40px
--body-2: 17px
--container-max-width: 1400px
--spacer-07: 40px
--breakpoint-desktop: 1024px
--body-large-2: 23px
--border-xs: .5px
--body-1: 20px
--display-s: 24px
--detail-s: 14px
--spacer-small: 24px
--spacer-11: 96px
--styrene-a: "styreneA","styreneA Fallback"
--section-spacer-lg: 96px
--radius-md: 16px
--radius-lg: 24px
--card-padding-md: 32px
--ease-in-quart: cubic-bezier(.895,.03,.685,.22)
--spacer-micro: 12px
--sp-2: 2px
--border-md: 1.5px
--br-2: 2px
--spacer-09: 64px
--gap-xxs: 8px
--detail-xs: 12px
--sp-20: 20px
--display-xxl: 80px
--paragraph-m: 20px
--caption: 14px
--weight-display-semibold: 600
--weight-text-bold: 700
--jetbrains-mono: "jetBrainsMono","jetBrainsMono Fallback"
--copernicus: "copernicus","copernicus Fallback"
--sp-8: 8px
--weight-mono-regular: 400
--br-24: 24px
--body-4: 12px
--spacer-huge: 192px
--sp-6: 6px
--spacer-medium: 48px
--anthropic-sans: "anthropicSans","anthropicSans Fallback"
--ease-in-out-expo: cubic-bezier(1,0,0,1)
--detail-xl: 24px
--mono: 15px
--sp-48: 48px
--weight-text-medium: 500
--br-16: 16px
--sp-24: 24px
--display-1: 72px
--styrene-b: "styreneB","styreneB Fallback"
--headline-3: 36px
--spacer-large: 96px
--anthropic-serif: "anthropicSerif","anthropicSerif Fallback"
--gutter-x: 32px
--spacer-08: 48px
--detail-l: 18px
--br-6: 6px
--media-max-height: 540px
--display-m: 32px
--sp-128: 128px
--gap-xl: 64px
--breakpoint-mobile: 567px
--sp-64: 64px
--leading-120: 120%
--spacer-03: 12px
--paragraph-l: 24px
--headline-4: 32px
--sp-32: 32px
--leading-100: 100%
--br-8: 8px
--detail-m: 16px
--weight-text-semibold: 600
--sp-80: 80px
--micro: 10px
--tiempos-text: "tiemposText","tiemposText Fallback"
--gutter-y: 32px
--weight-display-regular: 400
--section-spacer-0: 0
--leading-140: 140%
--sp-12: 12px
--paragraph-xs: 16px
--display-xl: 64px
--body-large-1: 25px
--radius-xs: 8px
--section-spacer-sm: 48px
--spacer-04: 16px
--card-padding-lg: 64px
--sp-200: 200px
--gap-lg: 48px
--spacer-12: 128px
--body-3: 15px
--weight-text-regular: 400
--breakpoint-tablet: 992px
--card-padding-xs: 16px
--gutter: 32px
--sp-16: 16px
```

**Extracted Color Palette** (by frequency on page):

```
background:      #FAF9F5  (Primary background)
foreground:      #141413  (Primary foreground/text)
accent:          #0000EE  (Accent/highlight color)
muted-1:       #FFFFFF
muted-2:       #E8E6DC
muted-3:       #000000
muted-4:       #1F1E1D
```

**All Detected Colors** (ranked by usage frequency):

1. `#FAF9F5` · 2. `#FFFFFF` · 3. `#141413` · 4. `#E8E6DC` · 5. `#0000EE` · 6. `#000000` · 7. `#1F1E1D`


---

### Typography

**Font Families Detected**:

- `anthropicSerif`
- `anthropicSans`

**Heading Scale**:

| Tag | Font Size | Font Weight |
|-----|-----------|-------------|
| `h1` | 80px (5rem) | 400 |
| `h2` | 0px (0rem) | 600 |
| `h3` | 12px (0.75rem) | 700 |
| `h4` | 22px (1.375rem) | 400 |

**Type Roles**:

```
body        : 20px / 400 / 30px — anthropicSerif
button      : 15px / 400 / 21px — anthropicSans
display     : 80px / 400 / 80px — anthropicSerif
headline    : 0px / 600 / 0px — anthropicSans
nav         : 15px / 400 / 21px — anthropicSans
small       : 12px / 400 / 16.8px — anthropicSans
subheading  : 12px / 700 / 16.8px — anthropicSans
```


---

### Spacing & Layout

**Containers**:

```
[class*="wrapper"]: max-width 1400px, padding 64px 64px
```

**Section Vertical Rhythm**: 16px, 24px



---

### Border Radius

```
0px 0px 16px 16px
8px 0px 0px 8px
8px
```

### Borders & Lines

```
No prominent borders detected.
```


---

### Shadows

```
NONE — This design uses zero drop shadows.
Depth is created through: color contrast, border weight variation, scale, and negative space.
```


---

### Textures & Patterns

_No background textures or patterns detected._


---

## Component Stylings

### Buttons

```
Text:          #FFFFFF
Border:        0px none #FFFFFF
Border Radius: 0px
Padding:       0px 0px 0px 0px
Font Size:     15px
Font Weight:   400
```

**Hover State Changes**:
```
text-decoration: none → underline
text-decoration-line: none → underline
```

### Navs

```
Text:          #FFFFFF
Border:        0px none #FFFFFF
Border Radius: 0px
Padding:       0px 0px 0px 0px
Font Size:     16px
Font Weight:   400
```

**Hover State Changes**:
```
text-decoration-line: none → underline
text-decoration: none → underline
```

### Heros

```
Text:          #FAF9F5
Border:        0px none #FAF9F5
Border Radius: 0px
Padding:       0px 80px 0px 80px
Font Size:     16px
Font Weight:   400
```

### Badges

```
Text:          #FAF9F5
Border:        0px none #FAF9F5
Border Radius: 0px
Padding:       0px 0px 0px 0px
Font Size:     16px
Font Weight:   400
```

### Footers

```
Background:    #141413
Text:          #FAF9F5
Border:        0px none #FAF9F5
Border Radius: 0px
Padding:       0px 0px 0px 0px
Font Size:     16px
Font Weight:   400
```



---

## Effects & Animation

**Motion Philosophy**: Instant

**Average Transition Duration**: 37ms

**Detected Transitions**:

```
A.SiteHeader-module-scss-module__zKj4Ca__skipLink: all
A.SiteHeader-module-scss-module__zKj4Ca__skipLink: all
A: color 0.1s cubic-bezier(0.165, 0.84, 0.44, 1)
NAV.SiteHeader-module-scss-module__zKj4Ca__nav: all
UL.SiteHeader-module-scss-module__zKj4Ca__navList: all
LI.body-3: all
A.SiteHeader-module-scss-module__zKj4Ca__navText: all
LI.body-3: all
A.SiteHeader-module-scss-module__zKj4Ca__navText: all
LI.body-3: all
```



---

## Iconography

**Style**: Solid/filled

**Count detected**: 10

**Sizes**: 143x16, 32x32, 12x6.13, 24x24, 20x20, 12x12

**Color**: `#141413`


---

## Layout Strategy

### Grid System

**CSS Grid Usage**:

```
div.GwLogoWall-module-scss-module__2KP8BW__wall: grid-template-columns: 262px 262px 262px 262px, gap: 64px
div.GwBarGraphCarousel-module-scss-module__FqcE3G__stage: grid-template-columns: 633px, gap: normal
div.GwQuoteCarousel-module-scss-module__4ittMa__logoStage: grid-template-columns: 160px, gap: normal
div.GwQuoteCarousel-module-scss-module__4ittMa__stage: grid-template-columns: 633px, gap: normal
div.GwBarGraphCarousel-module-scss-module__FqcE3G__stage: grid-template-columns: 633px, gap: normal
```

**Flexbox Usage**:

```
div: flex-direction: row, justify: space-between, align: center, gap: normal
div: flex-direction: row, justify: normal, align: center, gap: normal
div: flex-direction: row, justify: normal, align: center, gap: 24px
nav: flex-direction: row, justify: normal, align: center, gap: normal
ul: flex-direction: row, justify: normal, align: normal, gap: 24px
```


---

## Responsive Strategy

**Detected Breakpoints**:

```
376px
390px
420px
430px
450px
455px
480px
567px
640px
680px
700px
767px
768px
780px
800px
870px
950px
992px
1024px
1025px
1090px
1091px
1100px
1200px
1250px
1290px
1291px
1300px
1920px
2160px
```


---

## Accessibility

**Body Text Contrast**: `#141413` on `#FAF9F5` ≈ 17.5:1 — WCAG AAA ✅

**Focus Styles Detected**:

```
a: outline: rgb(250, 249, 245) none 0px; outline-offset: 0px
button: outline: rgb(20, 20, 19) none 3px; outline-offset: 0px
```

**Focus-Visible Styles (CDP captured)**:

```
button:focus-visible {
  appearance: none;
  margin-top: 0em;
  margin-right: 0em;
  margin-bottom: 0em;
  margin-left: 0em;
}
a:focus-visible {
  outline-color: -webkit-focus-ring-color;
  outline-style: auto;
  outline-width: 1px;
  color: var(--color-light);
  text-decoration-line: none;
}
nav a:focus-visible {
  outline-color: -webkit-focus-ring-color;
  outline-style: auto;
  outline-width: 1px;
  color: inherit;
  text-decoration-line: none;
}
[class*="link"]:focus-visible {
  outline-color: -webkit-focus-ring-color;
  outline-style: auto;
  outline-width: 1px;
  color: -webkit-link;
  text-decoration-line: none;
}
[class*="nav"]:focus-visible {
  display: flex;
  unicode-bidi: isolate;
  outline-color: -webkit-focus-ring-color;
  outline-style: auto;
  outline-width: 1px;
}
[class*="tab"]:focus-visible {
  display: flex;
  unicode-bidi: isolate;
  outline-color: -webkit-focus-ring-color;
  outline-style: auto;
  outline-width: 1px;
}
```

**ARIA Landmarks**:

- `<main>`: ✅ Present
- `<nav>`: ✅ Present
- `<header>`: ✅ Present
- `<footer>`: ✅ Present
- Skip links: ✅ Present


</design-system>