# Sales Page Template — Theme Token Reference

Reference doc. Lists the brand-specific design values used by the Sales Page Template, where each one appears, and a concrete example to look at in the preview.

**Preview:** https://component-demo-three.vercel.app/preview?id=66

**Scope:** this doc covers **theme tokens only** — the values that change per brand (colors and typography). Structural decisions the template carries across every brand — spacing, radii, shadows, motion — live with the template, not the theme.

Each row: one variable, one value, where it's used, and a specific example from the template.

---

## Colors

### Brand

| Variable | Value | Used for | Example |
|---|---|---|---|
| `color.brand.primary` | `#3d348b` | Brand purple — primary surface accents | "Happiness Guarantee" section background |
| `color.brand.primary-dark` | `#2a2552` | Action color — CTA backgrounds, emphasized text | "CLAIM YOUR DISCOUNT" button fill |
| `color.brand.primary-subtle` | `#e8e4f7` | Pale lavender — soft brand surface | "Step 1 / 2 / 3" card backgrounds |

> Three brand tokens. The prototype declared six near-identical purples; `primary` and `primary-mid` (#41388a) were duplicates (ΔE 5.7, imperceptible) and merged. `primary-dark` is the single action color. Two rare one-off shades from the prototype — #270061 (Footer) and #351979 (Final CTA accent) — remain in the preset as inline values. They are not canonical brand tokens.

### Accent

| Variable | Value | Used for | Example |
|---|---|---|---|
| `color.accent.warning` | `#ffd61f` | High-contrast attention yellow | Sticky bottom CTA bar background |
| `color.accent.warning-subtle` | `#fef9c3` | Soft warning surface | "Sell-Out Risk" banner background |
| `color.accent.tint-1` | `#faf8f6` | Fill for `gradient.background-1` | Hero background |
| `color.accent.tint-2` | `#fcf3df` | Fill for `gradient.background-2` | "How It Works" background |
| `color.accent.tint-3` | `#e1f3ff` | Fill for `gradient.background-3` | "Benefits" background |
| `color.accent.tint-4` | `rgba(20,245,255,0.125)` | First fill for `gradient.background-4` + `background-5` | "Final CTA" low stop |
| `color.accent.tint-5` | `rgba(153,143,255,0.125)` | Second fill for `gradient.background-4` + `background-5` | "Final CTA" high stop |

> Tints are **brand-supplied** fill colors for the gradient shapes below. Each tint is a slot — brands supply whatever color fits their palette. Names are intentionally generic (`tint-1`, `tint-2`, …) — the template makes no assumption about warm/cool/neutral. A brand whose palette is all cool, all warm, or all neutral fills each slot accordingly. The values above are what Javvy happens to use.

### Semantic

| Variable | Value | Used for | Example |
|---|---|---|---|
| `color.semantic.danger` | `#dc2626` | Negative indicator — worse values, warnings | Competitor comparison "worse" cell values, countdown timer digits |

### Text

| Variable | Value | Used for | Example |
|---|---|---|---|
| `color.text.primary` | `#1a1a1a` | All body text and headlines | Hero H1, benefit body, ingredient bullets, FAQ subtitle |
| `color.text.inverse` | `#ffffff` | Text on dark surfaces | "Happiness Guarantee" heading and subtitle on purple |

> Two text tokens. The prototype had seven; this version drops the entire "muted" / "secondary" / "tertiary" ladder. Body text is one color, period — all paragraph, bullet, subtitle, and fine-print copy uses `text.primary` #1a1a1a. Inverse is either white or it isn't. Also dropped: `text.link` (aliased `color.brand.primary`) and `text.inverse-muted` (translucent white that read as muted grey on dark surfaces).

### Surface

| Variable | Value | Used for | Example |
|---|---|---|---|
| `color.surface.default` | `#ffffff` | Page background, card interiors | Benefit card backgrounds |
| `color.surface.subtle` | `#f0f0f0` | Secondary card surface | Table row alt background |
| `color.surface.inverse` | `#000000` | Dark band surface | "AS SEEN ON" marquee strip |
| `color.surface.scrim` | `rgba(255,255,255,0.9)` | Translucent controls over imagery | Carousel prev / next button background |

### Border

| Variable | Value | Used for | Example |
|---|---|---|---|
| `color.border.default` | `#cccccc` | Default dividers and card borders | Accordion row separators |
| `color.border.subtle` | `#e5e7eb` | Quiet row dividers | Competitor comparison table rows |
| `color.border.contrast` | `#000000` | Active selection indicator | Selected carousel thumbnail outline |
| `color.border.muted-inverse` | `rgba(255,255,255,0.3)` | Subtle divider on dark surface | Footer section divider |

> Four border tokens. The prototype's `border.strong` (#d0d0d0) was a phantom — never used on the page and imperceptibly different from `border.default` (#cccccc).

---

## Gradients

Gradient **shapes** are theme-defined. Fill colors are tokenized — each gradient references one or more `color.accent.tint-*` slots, and the brand supplies whatever tint values fit their palette (all neutral, all warm, all cool — the template doesn't care). White and transparent stops are brand-invariant and stay as literals.

| Variable | Value | Used for | Example |
|---|---|---|---|
| `gradient.background-1` | `radial-gradient(50% 50%, #fff 0%, {color.accent.tint-1} 50%, #fff 100%)` | Radial wash (single center stop) | Hero section background |
| `gradient.background-2` | `radial-gradient(50% 50%, #fff 0%, {color.accent.tint-2} 30%, {color.accent.tint-2} 70%, #fff 100%)` | Radial with plateau (30%–70% hold) | "How It Works" section background |
| `gradient.background-3` | `radial-gradient(50% 50%, #fff 0%, {color.accent.tint-3} 50%, #fff 100%)` | Radial wash (same shape as `background-1`) | "Benefits" section background |
| `gradient.background-4` | `linear-gradient({color.accent.tint-4} 0%, {color.accent.tint-5} 100%)` | Two-color linear (full-bleed) | Subtle section accent |
| `gradient.background-5` | `linear-gradient(transparent 0%, {color.accent.tint-5} 15%, {color.accent.tint-4} 85%, transparent 100%)` | Two-color linear with transparent ends (fade in/out) | "Final CTA" section background |
| `gradient.mask-edge` | `linear-gradient(to right, transparent 0%, #fff 25%, #fff 75%, transparent 100%)` | Horizontal edge-fade mask (white, no tint slot) | "AS SEEN ON" marquee edges |

> Token refs (`{color.accent.tint-2}`, etc.) are the canonical form. The preset currently has the resolved Javvy values inlined as hex — a transitional state until the token resolver ships. Swapping brands = swapping the five `color.accent.tint-*` values; gradient shapes stay constant.

---

## Typography — families

| Variable | Value | Used for | Example |
|---|---|---|---|
| `font.sans` | `Geist` | Default UI | CTA labels, table cells, timer digits, footer |
| `font.body` | `DM Sans` | Long-form prose | Benefit card paragraphs, ingredient bullets |
| `font.display` | `Libre Baskerville` | Display headlines | Hero H1, section H1s |
| `font.condensed` | `Barlow` | Urgency display | "UP TO 58% OFF / FOR A LIMITED TIME ONLY!" headline |

## Typography — weights

| Variable | Value | Used for | Example |
|---|---|---|---|
| `weight.extralight` | `200` | Very-light supporting copy | "This limited-time deal…" paragraph |
| `weight.light` | `300` | Light supporting copy | "30-Day Money-Back Guarantee" line |
| `weight.regular` | `400` | Default body, quiet labels | Timer unit labels |
| `weight.medium` | `500` | Body prose | Benefit card body, reviews count |
| `weight.semibold` | `600` | Badge labels, eyebrow uppercase | "NO SUGAR ADDED" feature badge |
| `weight.bold` | `700` | CTA buttons, FAQ triggers | "CLAIM YOUR DISCOUNT" button label |
| `weight.extrabold` | `800` | H1s, emphasized figures | Hero H1, "4.8" review score |
| `weight.black` | `900` | Urgency headline, numerics | Countdown timer digits, "SPRING SPECIAL" |

## Typography — letter-spacing

| Variable | Value | Used for | Example |
|---|---|---|---|
| `tracking.tight-lg` | `-0.66px` | Display and H1 headlines | Hero H1 (−0.7 absorbed from urgency display) |
| `tracking.tight-sm` | `-0.18px` | Card headlines (H2 / H3 / H4) | Benefit, Mechanism, Callout titles (−0.36, −0.088 absorbed) |
| `tracking.normal` | `0` | Body copy | Default paragraphs |
| `tracking.wide-md` | `0.52px` | CTAs and small eyebrows | "CLAIM YOUR DISCOUNT" CTA, FAQ triggers (0.36, 0.4, 0.42, 0.6, 0.88, 0.96 absorbed) |
| `tracking.widest` | `1.8px` | Widest eyebrow | "AS SEEN ON", "FREE GIFTS WITH YOUR ORDER" (1.3 absorbed) |

> Five primitive tracking steps, down from eleven. The prototype's intermediate values (−0.7, −0.36, −0.088, 0.36, 0.4, 0.42, 0.6, 0.88, 0.96, 1.3) are each within perceptual-adjacent range of a canonical step and resolve to the nearest one above. Consumers that need pixel-exact fidelity read the tracking value from the relevant `type.*` scale token below, where the original value is preserved.

## Typography — scale

Each scale token is a bundle of five sub-properties: `size`, `line-height`, `weight`, `family`, `tracking`. Uppercase tokens also carry `text-transform`.

### At-a-glance summary

| Variable | Size / Line / Weight / Family / Tracking | Used for | Example |
|---|---|---|---|
| `type.display-xl` | 28 / 32.34 / 900 / Barlow / -0.7px | Urgency display | "UP TO 58% OFF / FOR A LIMITED TIME ONLY!" |
| `type.display-lg` | 26.4 / 30.5 / 800 / Libre Baskerville / -0.66px | Page and section H1s | Hero H1 |
| `type.display-md` | 24 / 28.8 / 900 / DM Sans / -0.36px | Callout H2 | "Reaching #11…" callout |
| `type.display-sm` | 17.6 / 22.88 / 800 / DM Sans / -0.088px | Mechanism H4s | Mechanism card titles |
| `type.headline` | 18 / 22.5 / 600 / DM Sans / -0.18px | Benefit card titles (H3) | Benefit card titles |
| `type.body-lg` | 18 / 28.8 / 500 / DM Sans / 0 | Hero description, intros | Hero paragraph |
| `type.body` | 16 / 20.8 / 500 / Geist / 0 | Default body | Step bodies, feature bullets |
| `type.body-sm` | 15 / 24 / 500 / DM Sans / 0 | Prose body | Benefit body, ingredient bullets |
| `type.body-xs` | 13 / 16.9 / 400 / Geist / 0 | Smaller body | Guarantee sub-copy |
| `type.caption` | 12 / 18 / 500 / DM Sans / 0 | Caption | Mechanism body, table cell values |
| `type.caption-xs` | 11 / 15.4 / 500 / DM Sans / 0 | Fine print | Legal footnotes |
| `type.eyebrow-lg` | 18 / 21.6 / 700 / DM Sans / 1.8px, uppercase | Large eyebrow | "AS SEEN ON" |
| `type.eyebrow` | 13 / 19.5 / 700 / Geist / 0.52px, uppercase | Accordion trigger | FAQ questions |
| `type.eyebrow-sm` | 12 / 18 / 600 / Geist / 0.96px, uppercase | Table column labels | Competitor comparison column headers |
| `type.badge` | 14 / 18.2 / 600 / Geist / 0 | Feature badges | "No Added Sugar", "Real Coffee", "Clean Label", "Waistline-Friendly" badges |
| `type.cta-lg` | 20 / 28.57 / 700 / Geist / 0.4px | Large CTA | "GET 58% OFF" button |
| `type.cta` | 18 / 25.7 / 700 / Geist / 0.36px | Default CTA | "CLAIM YOUR DISCOUNT" button |
| `type.step-label` | 12 / 18 / 700 / Geist / 0 | Step pill label | "Step 1" / "Step 2" / "Step 3" pills |
| `type.timer-digit` | 20 / 20 / 900 / Geist / 0 | Countdown numeric | Timer "03" digits |
| `type.timer-unit` | 10 / 15 / 400 / Geist / 0.6px | Countdown label | "HRS" / "MIN" / "SEC" labels |
| `type.score-xl` | 56 / 56 / 800 / Geist / 0 | Large numeric | "4.8" review score |

### Expanded — one variable per row

Below, each sub-property is its own addressable row (`type.display-lg.size`, `type.display-lg.line-height`, …) for indexing and lookup.

#### `type.display-xl` — urgency display ("UP TO 58% OFF / FOR A LIMITED TIME ONLY!")

| Variable | Value |
|---|---|
| `type.display-xl.size` | `28px` |
| `type.display-xl.line-height` | `32.34px` |
| `type.display-xl.weight` | `900` |
| `type.display-xl.family` | `Barlow` |
| `type.display-xl.tracking` | `-0.7px` |

#### `type.display-lg` — page and section H1s (Hero H1)

| Variable | Value |
|---|---|
| `type.display-lg.size` | `26.4px` |
| `type.display-lg.line-height` | `30.5px` |
| `type.display-lg.weight` | `800` |
| `type.display-lg.family` | `Libre Baskerville` |
| `type.display-lg.tracking` | `-0.66px` |

#### `type.display-md` — callout H2 ("Reaching #11…")

| Variable | Value |
|---|---|
| `type.display-md.size` | `24px` |
| `type.display-md.line-height` | `28.8px` |
| `type.display-md.weight` | `900` |
| `type.display-md.family` | `DM Sans` |
| `type.display-md.tracking` | `-0.36px` |

#### `type.display-sm` — mechanism card titles (H4)

| Variable | Value |
|---|---|
| `type.display-sm.size` | `17.6px` |
| `type.display-sm.line-height` | `22.88px` |
| `type.display-sm.weight` | `800` |
| `type.display-sm.family` | `DM Sans` |
| `type.display-sm.tracking` | `-0.088px` |

#### `type.headline` — benefit card titles (H3)

| Variable | Value |
|---|---|
| `type.headline.size` | `18px` |
| `type.headline.line-height` | `22.5px` |
| `type.headline.weight` | `600` |
| `type.headline.family` | `DM Sans` |
| `type.headline.tracking` | `-0.18px` |

#### `type.body-lg` — hero description, section intros

| Variable | Value |
|---|---|
| `type.body-lg.size` | `18px` |
| `type.body-lg.line-height` | `28.8px` |
| `type.body-lg.weight` | `500` |
| `type.body-lg.family` | `DM Sans` |
| `type.body-lg.tracking` | `0` |

#### `type.body` — default body (step bodies, feature bullets)

| Variable | Value |
|---|---|
| `type.body.size` | `16px` |
| `type.body.line-height` | `20.8px` |
| `type.body.weight` | `500` |
| `type.body.family` | `Geist` |
| `type.body.tracking` | `0` |

#### `type.body-sm` — prose body (benefit body, ingredient bullets)

| Variable | Value |
|---|---|
| `type.body-sm.size` | `15px` |
| `type.body-sm.line-height` | `24px` |
| `type.body-sm.weight` | `500` |
| `type.body-sm.family` | `DM Sans` |
| `type.body-sm.tracking` | `0` |

#### `type.body-xs` — smaller body (guarantee sub-copy)

| Variable | Value |
|---|---|
| `type.body-xs.size` | `13px` |
| `type.body-xs.line-height` | `16.9px` |
| `type.body-xs.weight` | `400` |
| `type.body-xs.family` | `Geist` |
| `type.body-xs.tracking` | `0` |

#### `type.caption` — caption (mechanism body, table cell values)

| Variable | Value |
|---|---|
| `type.caption.size` | `12px` |
| `type.caption.line-height` | `18px` |
| `type.caption.weight` | `500` |
| `type.caption.family` | `DM Sans` |
| `type.caption.tracking` | `0` |

#### `type.caption-xs` — fine print (legal footnotes)

| Variable | Value |
|---|---|
| `type.caption-xs.size` | `11px` |
| `type.caption-xs.line-height` | `15.4px` |
| `type.caption-xs.weight` | `500` |
| `type.caption-xs.family` | `DM Sans` |
| `type.caption-xs.tracking` | `0` |

#### `type.eyebrow-lg` — large eyebrow ("AS SEEN ON")

| Variable | Value |
|---|---|
| `type.eyebrow-lg.size` | `18px` |
| `type.eyebrow-lg.line-height` | `21.6px` |
| `type.eyebrow-lg.weight` | `700` |
| `type.eyebrow-lg.family` | `DM Sans` |
| `type.eyebrow-lg.tracking` | `1.8px` |
| `type.eyebrow-lg.text-transform` | `uppercase` |

#### `type.eyebrow` — accordion trigger (FAQ questions)

| Variable | Value |
|---|---|
| `type.eyebrow.size` | `13px` |
| `type.eyebrow.line-height` | `19.5px` |
| `type.eyebrow.weight` | `700` |
| `type.eyebrow.family` | `Geist` |
| `type.eyebrow.tracking` | `0.52px` |
| `type.eyebrow.text-transform` | `uppercase` |

#### `type.eyebrow-sm` — table column labels

| Variable | Value |
|---|---|
| `type.eyebrow-sm.size` | `12px` |
| `type.eyebrow-sm.line-height` | `18px` |
| `type.eyebrow-sm.weight` | `600` |
| `type.eyebrow-sm.family` | `Geist` |
| `type.eyebrow-sm.tracking` | `0.96px` |
| `type.eyebrow-sm.text-transform` | `uppercase` |

#### `type.badge` — feature badges

| Variable | Value |
|---|---|
| `type.badge.size` | `14px` |
| `type.badge.line-height` | `18.2px` |
| `type.badge.weight` | `600` |
| `type.badge.family` | `Geist` |
| `type.badge.tracking` | `0` |

#### `type.cta-lg` — large CTA ("GET 58% OFF")

| Variable | Value |
|---|---|
| `type.cta-lg.size` | `20px` |
| `type.cta-lg.line-height` | `28.57px` |
| `type.cta-lg.weight` | `700` |
| `type.cta-lg.family` | `Geist` |
| `type.cta-lg.tracking` | `0.4px` |

#### `type.cta` — default CTA ("CLAIM YOUR DISCOUNT")

| Variable | Value |
|---|---|
| `type.cta.size` | `18px` |
| `type.cta.line-height` | `25.7px` |
| `type.cta.weight` | `700` |
| `type.cta.family` | `Geist` |
| `type.cta.tracking` | `0.36px` |

#### `type.step-label` — step pill label ("Step 1" / "Step 2" / "Step 3")

| Variable | Value |
|---|---|
| `type.step-label.size` | `12px` |
| `type.step-label.line-height` | `18px` |
| `type.step-label.weight` | `700` |
| `type.step-label.family` | `Geist` |
| `type.step-label.tracking` | `0` |

#### `type.timer-digit` — countdown numeric (timer "03")

| Variable | Value |
|---|---|
| `type.timer-digit.size` | `20px` |
| `type.timer-digit.line-height` | `20px` |
| `type.timer-digit.weight` | `900` |
| `type.timer-digit.family` | `Geist` |
| `type.timer-digit.tracking` | `0` |

#### `type.timer-unit` — countdown label ("HRS" / "MIN" / "SEC")

| Variable | Value |
|---|---|
| `type.timer-unit.size` | `10px` |
| `type.timer-unit.line-height` | `15px` |
| `type.timer-unit.weight` | `400` |
| `type.timer-unit.family` | `Geist` |
| `type.timer-unit.tracking` | `0.6px` |

#### `type.score-xl` — large numeric ("4.8" review score)

| Variable | Value |
|---|---|
| `type.score-xl.size` | `56px` |
| `type.score-xl.line-height` | `56px` |
| `type.score-xl.weight` | `800` |
| `type.score-xl.family` | `Geist` |
| `type.score-xl.tracking` | `0` |

---

## Not part of the theme

Spacing, radii, shadows, border widths, and motion are **template-level** decisions — the Sales Page Template carries the same values across every brand. They live with the template, not with the theme. When a new brand plugs into this template, they supply only the values in the sections above; the template's structural rhythm stays constant.

For reference, the template's structural values are preserved in the preset (raw hex, px, ms) — they are not tokenized as brand-facing variables.
