# Theme Page — Current State Summary

For validation against page templates. This documents every input the portal collects, the default values, and how each maps to the live preview.

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

### Colors (15 fields)

Grouped into 4 sections in the UI, but presented as a flat list of editable hex inputs:

**Primary (2)**

| Field | Default (Javvy) | Preview mapping |
|---|---|---|
| Primary | #3D358B | Bullet check background tint, secondary banner bg, image caption overlay bg |
| Primary Dark | #312A6F | Urgency banner bg, footer bg |

**Accents (3)**

| Field | Default (Javvy) | Preview mapping |
|---|---|---|
| Accent 1 | #E2F4FF | Placeholder section 1 gradient (white→accent1→white) |
| Accent 2 | #FDF4DF | Placeholder section 2 gradient (white→accent2→white) |
| Accent 3 | #ECEBF4 | Placeholder section 3 gradient (white→accent3→white) |

**Buttons (4)**

| Field | Default (Javvy) | Preview mapping |
|---|---|---|
| Button Primary | #312A6F | Hero CTA button background |
| Button Primary Text | #FFFFFF | Hero CTA button text (overridden by auto-contrast) |
| Button Secondary | #FFD61E | Secondary CTA button background |
| Button Secondary Text | #000000 | Secondary CTA button text (overridden by auto-contrast) |

**UI Elements (6)**

| Field | Default (Javvy) | Preview mapping |
|---|---|---|
| Background Primary | #FFFFFF | Hero section background, page background |
| Border Default | #D1D1D1 | Preview frame border |
| Border Subtle | #D1D1D1 | Navbar bottom border, hero body/bullet divider |
| Surface Subtle | #F7F7F7 | Not directly in preview (available for template use) |
| Surface Inverse | #D1D1D1 | Not directly in preview (available for template use) |
| Danger | #DC2627 | Not directly in preview (available for template use) |

### Typography (9 font roles + 1 base size)

Each role has: **font family** (dropdown with search + custom upload), **weight** (native select 200–900), **color** (hex picker).

**Headings (6 roles)**

| Role | Default Family | Default Weight | Default Color | Preview mapping |
|---|---|---|---|---|
| Heading 1 | Libre Baskerville | 800 | #3d348b | Hero H1, section headings |
| Heading 2 | Libre Baskerville | 700 | #1a1a1a | Section subheadings |
| Heading 3 | DM Sans | 700 | #1a1a1a | Section 3 heading showcase |
| Heading 4 | DM Sans | 600 | #1a1a1a | Section 3 heading showcase |
| Heading 5 | DM Sans | 600 | #1a1a1a | Section 3 heading showcase |
| Heading 6 | DM Sans | 600 | #1a1a1a | Section 3 heading showcase |

**Body & UI (3 roles)**

| Role | Default Family | Default Weight | Default Color | Preview mapping |
|---|---|---|---|---|
| Regular Font | DM Sans | 500 | #1a1a1a | Hero body text, section body text, bullets, footer copyright |
| UI Font | Geist | 700 | #1a1a1a | Banners, navbar links, CTA button labels, image captions, footer links, star rating count |
| Condensed Font | Barlow | 900 | #1a1a1a | Urgency banner text |

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
- Star rating color (hardcoded amber #f59e0b)
- Image placeholder color (#f0f0f0)

---

## File Reference

- **Theme page:** `app/brand/theme/page.tsx`
- **Color picker component:** `components/ui/color-picker.tsx` (built but not yet wired into theme page)
- **Schema doc:** `public/brand-theme-schema.md` (out of date — theme page is now the source of truth)
- **Preview snippet reference:** `docs/theme-preview-snippet.md`
