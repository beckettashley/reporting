# Brand Theme — Schema & Defaults

> **▲ v2 CORRECTION (2026-06-03):** The "v1" contract referenced below was an
> interim stage, now **superseded by v2** (shipped 2026-05-19). Canonical lives
> in-repo at `lib/theme-schema/theme-schema.ts` (component-demo `2fbc394` + local
> `ctaBorderHover`/`midStopHexDark`) — not the absolute `component-demo` path
> below. Current state: **`docs/THEME-STATUS.md`**.

---

The complete shape of "a theme" in the merchant portal. Every field a brand owner can configure, the default values, and how each maps to the live preview. **This is the source of truth** for what the theme generation agent should produce.

---

## Inputs Collected

### Images (3 fields)

| Field | Type | Default | Preview mapping |
|---|---|---|---|
| Logo | File upload | none | Navbar logo, footer logo |
| Logo Dark Variant | File upload (optional) | none | Auto-used on dark backgrounds when uploaded; if not uploaded, regular logo is inverted via CSS filter |
| Favicon | File upload | none | Not shown in preview |

**Logo auto-contrast behavior:**
- Navbar: checks `backgroundPrimary` luminance. If dark → uses dark variant (or invert filter fallback). If light → regular logo.
- Footer: checks `primaryDark` luminance. Same logic.
- Threshold: luminance ≤ 0.45 = dark surface.

### Colors (17 fields)

Grouped into 5 sections in the UI, but presented as a flat list of editable hex inputs:

**Primary (2)**

| Field | Default | Preview mapping |
|---|---|---|
| Primary | #3D348B | Bullet check background tint, secondary banner bg, image caption overlay bg |
| Primary Dark | #2A2552 | Urgency banner bg, footer bg |

**Accents (3)**

| Field | Default | Preview mapping |
|---|---|---|
| Accent 1 | #E1F3FF | Placeholder section 1 gradient (white→accent1→white) |
| Accent 2 | #FCF3DF | Placeholder section 2 gradient (white→accent2→white) |
| Accent 3 | #F0EBFF | Placeholder section 3 gradient (white→accent3→white) |

**Buttons (4)**

| Field | Default | Preview mapping |
|---|---|---|
| Button Primary | #FFD61E | Hero CTA button background |
| Button Primary Text | #000000 | Hero CTA button text (overridden by auto-contrast) |
| Button Secondary | #FFD61E | Secondary CTA button background |
| Button Secondary Text | #000000 | Secondary CTA button text (overridden by auto-contrast) |

**UI Elements (5)**

| Field | Default | Preview mapping |
|---|---|---|
| Background Primary | #FFFFFF | Hero section background, page background |
| Border Default | #CCCCCC | Preview frame border |
| Border Subtle | #E5E7EB | Navbar bottom border, hero body/bullet divider |
| Surface Subtle | #F0F0F0 | Available for template use (e.g. card backgrounds) |
| Surface Inverse | #000000 | Available for template use (e.g. dark sections) |

**Semantic (3)** — split from a prior single "Danger" field

| Field | Default | Preview mapping |
|---|---|---|
| Negative | #DC2626 | Strikethrough compare-at price, error states |
| Positive | #11B990 | Success indicators, in-stock states, savings badges |
| Star Rating | #F59E0B | Star rating fills (review widgets) |

### Typography (11 font roles + 1 base size)

Each role has: **font family** (dropdown with search + custom upload), **weight** (native select 200–900), **color** (hex picker).

**Headings (7 roles — Title above H1, then standard H1–H6)**

| Role | Default Family | Default Weight | Default Color | Preview mapping |
|---|---|---|---|---|
| Title | Libre Baskerville | 800 | #1a1a1a | Page-level title (above H1 in the hierarchy). Renders 28px / 1.1 / -0.5px tracking. |
| Heading 1 | Libre Baskerville | 800 | #1a1a1a | Hero H1, section headings. 22px / 1.15 / -0.4px tracking. |
| Heading 2 | DM Sans | 900 | #1a1a1a | Section subheadings. 18px / 1.2. |
| Heading 3 | DM Sans | 700 | #1a1a1a | Heading showcase section. 16px / 1.25. |
| Heading 4 | DM Sans | 600 | #1a1a1a | Heading showcase section. 14px / 1.3. |
| Heading 5 | DM Sans | 600 | #1a1a1a | Heading showcase section. 13px / 1.3. |
| Heading 6 | DM Sans | 600 | #1a1a1a | Heading showcase section. 12px / 1.3. |

**Body & UI (4 roles)**

| Role | Default Family | Default Weight | Default Color | Preview mapping |
|---|---|---|---|---|
| Regular Font | DM Sans | 500 | #1a1a1a | Hero body text, section body text, bullets, footer copyright |
| UI Font | Geist | 700 | #1a1a1a | Banners, navbar links, CTA button labels, image captions, footer links, star rating count |
| Condensed Font | Barlow | 900 | #1a1a1a | Urgency banner text |
| Muted Font | DM Sans | 500 | #666666 | Low-contrast supporting copy: testimonial dates, comparison footnotes, offer-card subtitles, "as of [date]" tags, fine-print disclosures |

**Base Font Size**

| Field | Default | Effect |
|---|---|---|
| Base Font Size | 16 px | Scales ALL preview text proportionally via `s(px) = px * baseFontSize / 16`. Exception: button labels stay fixed at 14px. |

---

## Preview Structure (top to bottom)

The preview is a 320px-wide mini page that updates live as inputs change.

| # | Section | Background | Typography used | Colors used |
|---|---|---|---|---|
| 1 | Urgency banner | `primaryDark` | Condensed font, weight 900 | Text: auto-contrast on primaryDark |
| 2 | Secondary banner | `primary` | UI font, weight 600 | Text: auto-contrast on primary |
| 3 | Navbar | transparent (on backgroundPrimary) | UI font | Logo auto-switches variant based on bg luminance. Hamburger icon uses bodyColor. |
| 4 | Hero | `backgroundPrimary` | H1 (display), body, UI (bullets, CTA) | Star rating: amber. Bullet checks: primary tint. CTA: buttonPrimary bg, auto-contrast text. Divider: borderSubtle. |
| 5 | Section 1 | gradient white→`accent1`→white | H1, H2, body | Image placeholder: #f0f0f0. Caption: primary bg, auto-contrast text. |
| 6 | Section 2 | gradient white→`accent2`→white | H1, H2, body | Same as section 1. |
| 7 | Secondary CTA | white | UI font | Button: buttonSecondary bg, auto-contrast text. |
| 8 | Section 3 | gradient white→`accent3`→white | H1, H2, H3, H4, H5, H6, body | Full heading typography showcase. |
| 9 | Footer | `primaryDark` | UI font (links), body font (copyright) | Text: auto-contrast on primaryDark. Logo: auto dark variant. |

---

## Auto-Contrast Behavior

`contrastText(bgHex)` returns `#000000` if luminance > 0.45, `#ffffff` otherwise.

Applied to:
- Urgency banner text (on primaryDark)
- Secondary banner text (on primary)
- CTA button primary text (on buttonPrimary)
- CTA button secondary text (on buttonSecondary)
- Image caption text (on primary)
- Footer text (on primaryDark)

**Not applied to:** body text, heading text, bullet text — these use their per-role color settings directly. The system is expected to override these to white when rendering on dark section backgrounds at template level.

---

## Font Loading

Google Fonts are loaded dynamically via an injected `<link>` tag whenever font selections change. The `<link>` href is rebuilt from the 4 unique non-system font families (excluding "Geist" which ships with the app and "Custom" which is user-uploaded). All weights 200–900 are requested per family.

---

## Gradient Structure for Accent Sections

Each accent section uses the same gradient shape:
```css
linear-gradient(180deg, #ffffff 0%, #ffffff 15%, {accentN} 50%, #ffffff 85%, #ffffff 100%)
```
White at top/bottom (15%/85% stops), accent color at midpoint (50%). The accent color is at full opacity — the wide white margins create the softness.

---

## What's NOT in the Theme (template-level)

These are set per template, not per brand:
- Spacing scale (padding, margins, gaps)
- Border radius values
- Shadow definitions
- Motion / animation timing
- Gradient shapes (template controls geometry; brand supplies accent colors)
- Type scale step definitions (template maps heading roles to specific px sizes)
- Component layout (button padding, card structure, section ordering)
- Image placeholder color (#f0f0f0)

> Note: Star Rating moved INTO the theme as a semantic color (was previously hardcoded). The theme generation agent should populate it.

---

## Theme — Output Schema (JSON)

The complete shape the theme-generation agent should produce. Every field must have a value (no nulls except for the optional images).

```json
{
  "images": {
    "logo": "<url or data URL — required>",
    "logoDark": "<url or data URL — optional; falls back to logo with CSS invert filter>",
    "favicon": "<url or data URL — optional>"
  },

  "colors": {
    "primary": "#3D348B",
    "primaryDark": "#2A2552",

    "accent1": "#E1F3FF",
    "accent2": "#FCF3DF",
    "accent3": "#F0EBFF",

    "buttonPrimary": "#FFD61E",
    "buttonPrimaryText": "#000000",
    "buttonSecondary": "#FFD61E",
    "buttonSecondaryText": "#000000",

    "backgroundPrimary": "#FFFFFF",
    "borderDefault": "#CCCCCC",
    "borderSubtle": "#E5E7EB",
    "surfaceSubtle": "#F0F0F0",
    "surfaceInverse": "#000000",

    "negative": "#DC2626",
    "positive": "#11B990",
    "starRating": "#F59E0B"
  },

  "typography": {
    "baseFontSize": 16,

    "headings": {
      "Title": { "font": "Libre Baskerville", "weight": "800", "color": "#1a1a1a" },
      "H1":    { "font": "Libre Baskerville", "weight": "800", "color": "#1a1a1a" },
      "H2":    { "font": "DM Sans",            "weight": "900", "color": "#1a1a1a" },
      "H3":    { "font": "DM Sans",            "weight": "700", "color": "#1a1a1a" },
      "H4":    { "font": "DM Sans",            "weight": "600", "color": "#1a1a1a" },
      "H5":    { "font": "DM Sans",            "weight": "600", "color": "#1a1a1a" },
      "H6":    { "font": "DM Sans",            "weight": "600", "color": "#1a1a1a" }
    },

    "body":      { "font": "DM Sans", "weight": "500", "color": "#1a1a1a" },
    "ui":        { "font": "Geist",   "weight": "700", "color": "#1a1a1a" },
    "condensed": { "font": "Barlow",  "weight": "900", "color": "#1a1a1a" },
    "muted":     { "font": "DM Sans", "weight": "500", "color": "#666666" }
  }
}
```

### Field constraints (validation rules for the generation agent)

- **All hex colors**: 7-character lowercase or uppercase hex (`#rrggbb`). No 3-digit shorthand, no rgba, no named colors.
- **Font family**: must be a Google-Fonts–available family (the merchant portal loads from Google Fonts) OR `"Custom"` if the merchant uploaded a custom font.
- **Font weight**: string, one of `"100"` through `"900"` in increments of 100. The portal selector exposes 200–900.
- **Base font size**: integer 12–24, default 16.
- **Auto-contrast** is computed at runtime — the agent does not need to populate `buttonPrimaryText` / `buttonSecondaryText` carefully; the runtime overrides them based on luminance.

### Required vs optional

- `images.logo` is the only image strictly required for a believable theme. `logoDark` and `favicon` are graceful fallbacks.
- All color and typography fields must be populated. There are no nullable fields here.

### Validation checklist for the generation agent

When producing a theme, run these checks before declaring done:

- [ ] All 17 color fields populated with valid hex
- [ ] All 11 typography roles populated with `{ font, weight, color }`
- [ ] Base font size is a sensible integer (default 16; range 12–24)
- [ ] Logo is provided (URL or base64 data URL)
- [ ] **Body color contrast** vs `backgroundPrimary` ≥ 4.5:1 (WCAG AA)
- [ ] **Heading colors** vs `backgroundPrimary` ≥ 4.5:1 — or, if the heading role is intentionally on an accent surface, contrast against that accent
- [ ] **Muted color** contrast ≥ 3:1 (looser bar — supporting copy is allowed lower contrast as long as it remains legible)
- [ ] **Button auto-contrast**: the runtime overrides text color, but the *button background* (`buttonPrimary`, `buttonSecondary`) should not be the same hue as `backgroundPrimary` (would render invisible button)
- [ ] **Accents** are distinguishable from `backgroundPrimary` (otherwise the gradient sections disappear)
- [ ] **Negative / Positive / Star Rating** are recognizable as red / green / amber respectively (don't reassign these to brand-arbitrary hues; they're semantic)
- [ ] **Font families** all load from Google Fonts (or are flagged as Custom with the file provided separately)

---

## File Reference

- **Theme page (in source app):** `app/brand/theme/page.tsx`
- **Live preview snippet:** `theme-preview-snippet.md` (in this handoff folder)
- **Token reference:** `theme-tokens.html` (in this handoff folder — open in a browser for the full token table)
- **Schema doc:** `public/brand-theme-schema.md` (out of date — theme page is now the source of truth)
- **Preview snippet reference:** `docs/theme-preview-snippet.md`
