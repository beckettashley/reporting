# Brand Theme Schema — What the Portal Collects

Every brand gets one of these. The system uses it to render all page types (sales, checkout, upsell, presell). Template-level defaults (spacing, radii, shadows, motion) are set per template — not per brand.

**Assumed brand profile:** Light page background, dark text. Derivation rules are optimized for this. Brands outside this profile (dark-mode, very light or very dark primaries) should use Advanced overrides — auto-derivation will degrade for them.

---

## What the brand owner provides (portal fields)

### Colors — 9 fields collected, 12 derived

**Collected from the brand:**

| # | Field | Type | What it controls | Example (Javvy) |
|---|---|---|---|---|
| 1 | **Brand Primary** | hex | Core brand color — section accents, brand surfaces, link color | `#3d348b` |
| 2 | **Accent** | hex | High-contrast attention color — urgency banners, sticky CTA bar | `#ffd61f` |
| 3 | **Text Primary** | hex | All body text and headlines on light surfaces | `#1a1a1a` |
| 4 | **Background** | hex | Page background, card interiors | `#ffffff` |
| 5 | **Gradient Tint 1** | hex or rgba | Section background gradient fill — hero | `#faf8f6` |
| 6 | **Gradient Tint 2** | hex or rgba | Section background gradient fill — mid-page | `#fcf3df` |
| 7 | **Gradient Tint 3** | hex or rgba | Section background gradient fill — features | `#e1f3ff` |
| 8 | **Gradient Tint 4** | rgba | Accent gradient fill — lower stop | `rgba(20,245,255,0.125)` |
| 9 | **Gradient Tint 5** | rgba | Accent gradient fill — upper stop | `rgba(153,143,255,0.125)` |

**Derived automatically (overridable in Advanced):**

| Field | Derived from | Rule | Default (Javvy) |
|---|---|---|---|
| Brand Primary Dark | Brand Primary | Darken 20%. If Brand Primary luminance < 25%, use Brand Primary as-is (already dark enough for CTA contrast). | `#2a2552` |
| Brand Primary Subtle | Brand Primary | 10% opacity on Background | `#e8e4f7` |
| Accent Subtle | Accent | 15% opacity on Background | `#fef9c3` |
| Text Inverse | — | Always `#ffffff` | `#ffffff` |
| Surface Subtle | Background | If Background luminance > 50%: darken 3%. If ≤ 50%: lighten 5%. | `#f0f0f0` |
| Surface Inverse | — | Always `#000000` | `#000000` |
| Surface Scrim | — | Always `rgba(255,255,255,0.9)` | `rgba(255,255,255,0.9)` |
| Border Default | Text Primary | If Background luminance > 50%: Text Primary @ 20% opacity. If ≤ 50%: Text Inverse @ 20% opacity. | `#cccccc` |
| Border Subtle | Text Primary | Same logic, 10% opacity | `#e5e7eb` |
| Border Contrast | Text Primary | Same source as Border Default, full opacity | `#000000` |
| Border Muted Inverse | Text Inverse | 30% opacity | `rgba(255,255,255,0.3)` |
| Danger | — | Always `#dc2626` | `#dc2626` |

---

### Typography — 4 font families + 1 base size

**Collected from the brand:**

| # | Field | Type | What it controls | Example (Javvy) |
|---|---|---|---|---|
| 10 | **Display Font** | font family name | Hero H1s, section display headlines | `Libre Baskerville` |
| 11 | **Body Font** | font family name | Paragraphs, benefit descriptions, ingredient bullets | `DM Sans` |
| 12 | **UI Font** | font family name | CTA buttons, table cells, badges, timer digits, nav | `Geist` |
| 13 | **Condensed Font** | font family name | Urgency banners — "UP TO 58% OFF" style headlines | `Barlow` |
| 14 | **Base Font Size** | number (px) | Scales the entire type ladder proportionally | `16` |

**How the type scale works:**

The template defines 8 type scale steps internally. Each step bundles size, weight, family, tracking, and line-height. The brand's 4 font families slot into the steps by role:

| Step | Font role used | What renders at this step | Typical size range |
|---|---|---|---|
| Display | Display or Condensed | Hero H1, urgency headlines | 24–28px |
| Headline | Body or Display | Section H2/H3, card titles | 18–24px |
| Body Large | Body | Hero description, section intros | 18px |
| Body | UI or Body | Default paragraphs, bullets | 15–16px |
| Body Small | UI or Body | Fine print, captions, legal | 11–13px |
| Eyebrow | UI or Body | Section labels, FAQ triggers, column headers (uppercase) | 12–18px |
| CTA | UI | Button labels | 18–20px |
| Numeric Display | UI | Large-format numbers — review scores, countdown timers, prices | 20–56px |

> Weights (200–900), letter-spacing, and line-heights are template-level defaults per step — not collected from brands.

---

### Images — 5 fields

| # | Field | Type | What it controls | Example |
|---|---|---|---|---|
| 15 | **Logo** | URL or file upload | Navbar logo on light surfaces | `https://brand.com/logo.svg` |
| 16 | **Logo (Dark Variant)** | URL or file upload (optional) | Logo on dark surfaces (footer, brand sections). Falls back to Logo if not provided. | `https://brand.com/logo-white.svg` |
| 17 | **Favicon** | URL or file upload | Browser tab icon | `https://brand.com/favicon.png` |
| 18 | **OG Image** | URL or file upload | Social share preview image | `https://brand.com/og.png` |
| 19 | **Logo Link** | URL | Where clicking the logo navigates to | `https://brand.com` |

---

## Total: 19 fields collected from brands

| Category | Collected | Derived | Total available to renderer |
|---|---|---|---|
| Colors | 9 | 12 | 21 |
| Typography | 5 | 0 (template maps internally) | 5 + 8 scale steps |
| Images | 5 | 0 | 5 |
| **Total** | **19** | **12** | **31+** |

---

## What the template owns (not in the brand theme)

These are set per template type (sales, checkout, upsell, presell) and apply identically across all brands using that template:

- Spacing scale (padding, margins, gaps)
- Border radius values
- Shadow definitions
- Motion / animation timing
- Gradient shapes (radial, linear geometry — brands supply only the fill colors via tints)
- Type scale step definitions (size/weight/tracking per step — brands supply only the font families)
- Component layout (button padding, card structure, section ordering)
- Green incentive pill colors (#dcfce7 / #15803d) — template-level, brand-invariant
- Marquee edge-fade gradient (mask-edge) — brand-invariant, uses white/transparent only

Templates can override these defaults at the page level if a specific page needs different structural values.

---

## Engineering integration rules

1. **Footer / Final CTA dark accents** — any inline Javvy hex values for dark brand surfaces (#270061, #351979) must resolve to **Brand Primary Dark** at render time, not stay hardcoded. Otherwise every brand's footer renders as Javvy purple.

2. **mask-edge gradient is brand-invariant** — it uses only white and transparent. Do not wire tint slots to it. The 5 tint slots map to gradients 1–5 only.

3. **CTA colors are brand defaults, overridable per page** — the renderer accepts per-content `ctaBackgroundColor` / `ctaTextColor`. Brand Primary Dark is the default CTA background; Text Inverse is the default CTA text. Pages can override these without changing the brand theme.

4. **Logo dark variant fallback** — if Logo (Dark Variant) is not provided, use the primary Logo on dark surfaces. Brands with dark logos should be prompted to upload a light variant.

---

## How this plugs into page generation

```
Brand Theme (19 fields)
    │
    ├─ Colors (9 collected + 12 derived = 21 tokens)
    ├─ Typography (4 families + base size → 8 scale steps resolved)
    └─ Images (5 assets)
    │
    ▼
Template (sales / checkout / upsell / presell)
    │
    ├─ Structural defaults (spacing, radii, shadows, motion)
    ├─ Type scale step definitions (size/weight/tracking per step)
    ├─ Gradient shapes (geometry, referencing brand tint slots 1–5)
    ├─ Brand-invariant elements (incentive pills, marquee mask)
    └─ Component composition (buttons = Brand Primary Dark + CTA type step)
    │
    ▼
Rendered Page
    (brand colors + brand fonts + brand images
     inside template structure)
```

Any brand's theme plugs into any template. The template resolves the 19 brand inputs + its own structural defaults into a fully styled page.

---

## Mapping to CEO's brand_theme.md

| CEO's field | This schema | Status |
|---|---|---|
| `colors.primary` | Brand Primary | ✅ Same |
| `colors.secondary` | — | Dropped — not used by any page |
| `colors.accent` | Accent | ✅ Renamed to explicit attention/warning role |
| `colors.background` | Background | ✅ Same |
| `colors.textPrimary` | Text Primary | ✅ Same |
| `colors.link` | — | Dropped — derives from Brand Primary |
| `typography.fontFamilies.primary` | Body Font | ✅ Same |
| `typography.fontFamilies.heading` | Display Font | ✅ Same |
| `typography.fontSizes.h1/h2/body` | Base Font Size | Simplified — one base size, template scales the rest |
| `spacing.baseUnit` | — | Dropped — template-level |
| `spacing.borderRadius` | — | Dropped — template-level |
| `components.buttonPrimary` | — | Dropped — template composes from brand colors + CTA step |
| `components.buttonSecondary` | — | Dropped |
| `images.logo` | Logo | ✅ Same |
| `images.favicon` | Favicon | ✅ Same |
| `images.ogImage` | OG Image | ✅ Same |
| `images.logoHref` | Logo Link | ✅ Same |
| `personality.*` | — | Moved to brand_guidelines.md — not visual |
| — | UI Font | **New** — CEO's schema didn't have this |
| — | Condensed Font | **New** — CEO's schema didn't have this |
| — | Gradient Tints 1–5 | **New** — CEO's schema didn't have gradient concept |
| — | Logo (Dark Variant) | **New** — for dark-surface logo rendering |
| — | Derived colors (12) | **New** — auto-generated from collected colors |
