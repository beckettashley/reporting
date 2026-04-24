# Theme Portal — Field Requirements

What the portal's Theme section must collect from the brand owner so generated pages render correctly.

Source: `sales-page-theme-tokens.md` (what the page actually uses), filtered to brand-controllable variables only. Template-level values (spacing, radii, shadows, motion) excluded — those ship with the template.

Gap analysis vs. CEO's `brand_theme.md` included per field.

---

## Colors

### Brand (3 fields)

| Field | Type | What it controls on the page | Example (Javvy) | brand_theme.md status |
|---|---|---|---|---|
| Brand Primary | hex color | Primary surface accents — guarantee section background, brand-tinted elements | `#3d348b` | ✅ Collected as `colors.primary` |
| Brand Primary Dark | hex color | CTA button fill, emphasized text on light surfaces | `#2a2552` | ❌ **Gap** — not collected. brand_theme.md has no dark variant. Portal needs this. |
| Brand Primary Subtle | hex color | Soft brand surface — step cards, subtle brand panels | `#e8e4f7` | ❌ **Gap** — not collected. Portal needs a pale/tinted variant of the primary. |

### Accent (7 fields)

| Field | Type | What it controls on the page | Example (Javvy) | brand_theme.md status |
|---|---|---|---|---|
| Warning | hex color | High-contrast attention color — sticky CTA bar, urgency banners | `#ffd61f` | ❌ **Gap** — mapped loosely to `colors.accent` but not semantically the same. |
| Warning Subtle | hex color | Soft warning surface — sell-out risk banners, scarcity notices | `#fef9c3` | ❌ **Gap** — not collected. |
| Gradient Tint 1 | hex or rgba | Fill for hero background gradient | `#faf8f6` | ❌ **Gap** — no gradient tint concept in brand_theme.md. |
| Gradient Tint 2 | hex or rgba | Fill for "how it works" background gradient | `#fcf3df` | ❌ **Gap** |
| Gradient Tint 3 | hex or rgba | Fill for "benefits" background gradient | `#e1f3ff` | ❌ **Gap** |
| Gradient Tint 4 | rgba | First gradient fill for accent sections | `rgba(20,245,255,0.125)` | ❌ **Gap** |
| Gradient Tint 5 | rgba | Second gradient fill for accent sections | `rgba(153,143,255,0.125)` | ❌ **Gap** |

> Tint slots are generic — brands fill them with whatever palette colors fit (warm, cool, neutral). The template uses them in fixed gradient shapes.

### Semantic (1 field)

| Field | Type | What it controls on the page | Example (Javvy) | brand_theme.md status |
|---|---|---|---|---|
| Danger | hex color | Negative indicators — competitor comparison "worse" values, countdown timer digits | `#dc2626` | ❌ **Gap** — not collected. Could default to a standard red. |

### Text (2 fields)

| Field | Type | What it controls on the page | Example (Javvy) | brand_theme.md status |
|---|---|---|---|---|
| Text Primary | hex color | All body text and headlines | `#1a1a1a` | ✅ Collected as `colors.textPrimary` |
| Text Inverse | hex color | Text on dark surfaces (brand sections, dark bands) | `#ffffff` | ❌ **Gap** — not collected. Usually white, but should be explicit. |

### Surface (4 fields)

| Field | Type | What it controls on the page | Example (Javvy) | brand_theme.md status |
|---|---|---|---|---|
| Surface Default | hex color | Page background, card interiors | `#ffffff` | ✅ Collected as `colors.background` |
| Surface Subtle | hex color | Secondary card surface, table row alternation | `#f0f0f0` | ❌ **Gap** — not collected. |
| Surface Inverse | hex color | Dark band surface (marquee, dark sections) | `#000000` | ❌ **Gap** — not collected. |
| Surface Scrim | rgba color | Translucent overlay for controls on imagery | `rgba(255,255,255,0.9)` | ❌ **Gap** — not collected. |

### Border (4 fields)

| Field | Type | What it controls on the page | Example (Javvy) | brand_theme.md status |
|---|---|---|---|---|
| Border Default | hex color | Default dividers and card borders | `#cccccc` | ❌ **Gap** — not collected. |
| Border Subtle | hex color | Quiet row dividers, soft separators | `#e5e7eb` | ❌ **Gap** — not collected. |
| Border Contrast | hex color | Active selection indicator, strong emphasis borders | `#000000` | ❌ **Gap** — not collected. |
| Border Muted Inverse | rgba color | Subtle divider on dark surfaces | `rgba(255,255,255,0.3)` | ❌ **Gap** — not collected. |

**Color totals: 21 fields needed. brand_theme.md collects 3. Portal gap: 18 fields.**

---

## Typography

### Font Families (4 fields)

| Field | Type | What it controls on the page | Example (Javvy) | brand_theme.md status |
|---|---|---|---|---|
| Sans / UI Font | font family name | CTA labels, table cells, timer digits, footer, UI elements | `Geist` | ⚠️ Partially — collected as `fonts[role=body]` but no distinct "UI" role |
| Body Font | font family name | Long-form prose — benefit paragraphs, ingredient bullets | `DM Sans` | ✅ Collected as `typography.fontFamilies.primary` |
| Display Font | font family name | Display headlines — hero H1, section H1s | `Libre Baskerville` | ✅ Collected as `typography.fontFamilies.heading` |
| Condensed Font | font family name | Urgency display — "UP TO 58% OFF" banners | `Barlow` | ❌ **Gap** — no condensed/urgency font role in brand_theme.md |

### Type Scale (6–8 brand-facing steps)

Per the other Claude's guidance, the 19 template-specific tokens (timer-digit, step-label, badge, etc.) collapse to 6–8 brand-facing steps. The template maps component-specific tokens to these steps internally.

| Field | Type | What it controls on the page | Example (Javvy) | brand_theme.md status |
|---|---|---|---|---|
| Display | size + weight + family + tracking bundle | Hero H1, urgency headlines, large display text | 26–28px / 800–900 / Display or Condensed / tight | ⚠️ Partially — `fontSizes.h1` exists but no weight/tracking/family binding |
| Headline | size + weight + family + tracking bundle | Section H2/H3 titles, card headlines | 18–24px / 600–800 / Body or Display / slight tight | ⚠️ `fontSizes.h2` exists but incomplete |
| Body Large | size + weight + family + tracking bundle | Hero description, section intros, larger prose | 18px / 500 / Body / normal | ❌ **Gap** — not collected |
| Body | size + weight + family + tracking bundle | Default paragraph text, bullets, step descriptions | 15–16px / 500 / Sans or Body / normal | ⚠️ `fontSizes.body` size only |
| Body Small | size + weight + family + tracking bundle | Fine print, guarantee sub-copy, captions | 11–13px / 400–500 / Sans or Body / normal | ❌ **Gap** — not collected |
| Eyebrow | size + weight + family + tracking bundle + uppercase | Section labels, FAQ triggers, column headers | 12–18px / 600–700 / Sans / wide tracking / uppercase | ❌ **Gap** — not collected |
| CTA | size + weight + family + tracking bundle | Button labels — primary and secondary CTAs | 18–20px / 700 / Sans / slight wide | ❌ **Gap** — not collected |

> Each "step" is a bundle: font size, line height, weight, family, letter-spacing, and optionally text-transform. The portal collects the bundle; the template resolves component-specific tokens from these steps.

**Typography totals: 4 families + 7 scale steps = 11 bundles. brand_theme.md collects ~3 sizes and 2 families. Portal gap: significant.**

---

## Gradient Tint Slots (5 fields)

Already listed under Accent colors above. Restated here for clarity:

| Field | Type | What it controls | brand_theme.md status |
|---|---|---|---|
| Tint 1–5 | hex or rgba each | Fill colors for template gradient shapes. Brands supply 5 colors; template owns the gradient geometry (radial, linear, fade). | ❌ **Gap** — no gradient concept in brand_theme.md |

> Gradient shapes are template-level (not collected from brands). Only the fill colors are brand-level.

---

## Images (4 fields)

| Field | Type | What it controls on the page | Example | brand_theme.md status |
|---|---|---|---|---|
| Logo | URL or upload | Site logo in navbar and footer | absolute URL | ✅ Collected as `images.logo` |
| Favicon | URL or upload | Browser tab icon | absolute URL | ✅ Collected as `images.favicon` |
| OG Image | URL or upload | Social share preview image | absolute URL | ✅ Collected as `images.ogImage` |
| Logo Link | URL | Where logo click navigates to | `https://brand.com` | ✅ Collected as `images.logoHref` |

**Images: fully covered by brand_theme.md. No gaps.**

---

## Fields brand_theme.md Collects But No Page Uses

These are candidates to drop from the portal (or keep for future use):

| Field | In brand_theme.md | Page usage | Recommendation |
|---|---|---|---|
| `colors.secondary` | ✅ | Not in sales-page-tokens.md | **Review** — may be used by other templates. Keep if multi-template. |
| `colors.link` | ✅ | Not tokenized — aliased to `brand.primary` in practice | **Drop** — link color should derive from brand primary. |
| `spacing.baseUnit` | ✅ | Template-level, not brand-level | **Drop from portal** — template owns spacing. |
| `spacing.borderRadius` | ✅ | Template-level, not brand-level | **Drop from portal** — template owns radii. |
| `components.buttonPrimary` | ✅ | Button styling derives from brand colors + CTA type scale | **Simplify** — portal collects colors + type; template composes buttons. |
| `components.buttonSecondary` | ✅ | Same | **Simplify** |
| `personality.tone/energy/targetAudience` | ✅ | Advisory for voice pipeline, not visual rendering | **Keep** — but in brand_guidelines.md, not theme portal. |

---

## Summary: Portal Gap Count

| Category | Fields needed | brand_theme.md covers | Gap |
|---|---|---|---|
| Colors — Brand | 3 | 1 | **2** |
| Colors — Accent/Tints | 7 | 0 | **7** |
| Colors — Semantic | 1 | 0 | **1** |
| Colors — Text | 2 | 1 | **1** |
| Colors — Surface | 4 | 1 | **3** |
| Colors — Border | 4 | 0 | **4** |
| Typography — Families | 4 | 2 | **2** |
| Typography — Scale Steps | 7 | ~1 (sizes only) | **~6** |
| Images | 4 | 4 | **0** |
| **Total** | **36** | **~10** | **~26** |

---

## Decisions Already Settled

Per the sales-page-tokens.md audit:

1. **Text = 2 tokens only** (primary + inverse). No muted/secondary/tertiary ladder.
2. **Brand = 3 core** (primary, primary-dark, primary-subtle). No extended palette.
3. **Gradients = template-owned shapes + 5 brand-supplied tint colors** (tint-1 through tint-5).
4. **Typography scale = 6–8 brand-facing steps.** Component-specific tokens (timer-digit, step-label, badge) are template-internal mappings, not portal fields.
5. **Spacing, radii, shadows, motion = template-level.** Not collected from brands.
