# Theme UI handoff brief — 2026-05-14

> **▲ v2 CORRECTION (2026-06-03):** This brief targets the **v1** schema and
> assumes the Theme UI is a separate repo. Both are now historical: the work
> shipped **in this repo** (`app/brand/theme/page.tsx`) against **v2** (shipped
> 2026-05-19). Canonical is vendored at `lib/theme-schema/` (component-demo
> `2fbc394` + local `ctaBorderHover`/`midStopHexDark`). Current state:
> **`docs/THEME-STATUS.md`**.

**Audience:** Claude Code instance working on the Theme UI repo (the brand-facing UI for creating/updating themes).

**Goal:** update that repo's theme-creation UI to match the v1 theme schema. **Keep the UI's existing layout and style intact.** Update only the values, fields, selections, derivation displays, and validations to reflect the schema as it now stands.

**Don't duplicate** the component-demo repo's docs — this brief is self-contained for the Theme UI's needs.

---

## Answers to the questions the other Claude Code instance raised

**Q1 — Which artifact to update?** This brief (option c). Treat it as the source of truth for what the Theme UI needs to support. Update the Theme UI repo's own documentation to match. No need to copy docs from the component-demo repo.

**Q2 — Is the schema final or in-flux?** **Final / stable.** This is the v1 target state as of end-of-session 2026-05-14. The page-templates work has completed; the schema is settled. Subsequent changes will be additive (per principle P11) and won't break existing UI fields.

**Q3 — Hybrid or auto-compute path?** **Hybrid-leaning-manual.** The brand declares all base primitives manually (color hex, typeface families, weight selections). The UI computes 3 derived primitive values (formulas below) — these display as read-only "auto-computed" outputs but should be overridable so brands can hand-tune if needed. This matches the established UX pattern.

---

## 1. The revised schema

Two canonical files (copy them or reference them; both describe the same data shape):

- **TypeScript types:** `schema/theme-schema.ts` — primary contract; preferable for the UI's type system if it's TS-based.
- **JSON Schema (draft-07):** `schema/theme-schema.json` — usable with `ajv` or any draft-07 validator at runtime.

Also useful as reference instances:
- `schema/themes/javvy.json` — calibration brand (cool purple/yellow palette, complementary)
- `schema/themes/solstice.json` — portability foil (warm orange/amber palette, single-family)

The reference themes show every field populated with realistic values. If the UI needs sample data for previews/playgrounds, use these.

**Top-level shape:**

```typescript
interface PageStyle {
  baseFontSize?: number;          // default 16; brand-overridable; px
  colors?: ColorTokens;
  typography?: TypographyMap;
  brandAssets?: BrandAssets;
}

interface ColorTokens {
  primitives: Record<string, string>;        // primName → hex (#RRGGBB)
  semantic: {
    light: Partial<Record<SemanticRoleName, string>>;  // role → primName
    dark?:  Partial<Record<SemanticRoleName, string>>;
  };
  pairs?: Record<string, { onSurface: 'light' | 'dark' }>;
  gradients?: { subtle?: GradientPrimitive };
}

interface GradientPrimitive {
  surface: 'light' | 'dark';   // determines endpoint (paper for 'light', brand-dark for 'dark')
  midStopHex?: string;          // curation-emitted concrete hex (e.g. "#EFECF9"); NOT a primitive name
  // Tint is implicit: consumes surfaceBrandSubtle role at the declared surface.
  // One brand decision (the brand-subtle wash primitive) serves both
  // surfaceBrandSubtle role AND the gradient plateau.
}

interface TypographyMap {
  title?:             TextRoleStyle;
  h1?: h2?: h3?: h4?: h5?: h6?: TextRoleStyle;
  body?:              TextRoleStyle;
  ui?:                TextRoleStyle;
  condensed?:         TextRoleStyle;
  accordionQuestion?: TextRoleStyle;
  meta?:              TextRoleStyle;
  muted?:             MutedRoleStyle;        // color-only
}

interface TextRoleStyle {
  family?:        string;                // CSS font-family value
  weight?:        number;                // 100–900; MUST be in font's shipped face set
  lineHeight?:    number | string;
  letterSpacing?: string;
  color?:         SemanticRoleName;       // semantic role ref, NOT primitive
  align?:         'left' | 'center' | 'right' | 'inherit';
}

interface BrandAssets {
  logo?: { light?: string; dark?: string };  // URLs
}
```

**Semantic role vocabulary (14 roles):**

```typescript
type SemanticRoleName =
  | 'textPrimary' | 'textMuted' | 'textBrand' | 'textLink'
  | 'background' | 'surfaceMuted' | 'surfaceBrandSubtle' | 'border'
  | 'primary' | 'primaryForeground'
  | 'cta' | 'ctaForeground' | 'ctaBorder' | 'ctaHover'
  | 'textAlert' | 'surfaceWarning';
```

**Typography role vocabulary (12 + muted):**

```
title, h1, h2, h3, h4, h5, h6, body, ui, condensed, accordionQuestion, meta, muted
```

---

## 2. Field-level diff (added/changed since the UI was likely last built)

The UI was built before today's session. The schema has evolved across two days; here's everything the UI may not yet support.

### Added semantic roles

| Role | When added | Purpose |
|---|---|---|
| `surfaceBrandSubtle` | 2026-05-13 | Brand-tinted subtle section wash. Distinct from `surfaceMuted` (neutral muted per shadcn convention). Same primitive often serves `gradients.subtle.tint`. |
| `cta` | 2026-05-13 | CTA action button background. Brand-specific; in Javvy/Solstice it's distinct from `primary` (which is brand-color surface). |
| `ctaForeground` | 2026-05-13 | Text color on the CTA. Typically `ink`-equivalent. |
| `ctaBorder` | 2026-05-14 | CTA border color. Derived from `cta` (see §3 Derivation rules). |
| `ctaHover` | 2026-05-14 | CTA hover-state background. Derived from `cta` + `ctaBorder` (see §3). |

### Added typography role

| Role | Purpose |
|---|---|
| `meta` | Fine-print prose register — footer attribution, disclaimers, captions. 12px / mixed case. Distinct from `text-label` (uppercase UI register) and from `body` (paragraph reading). |
| `accordionQuestion` (was added earlier; reaffirmed today) | FAQ accordion question heading. 14px / uppercase / bold. Distinct register; not title-of-body. |

### Gradient schema (v1.1 simplification)

`gradients.subtle` now declares only `surface` + optional `midStopHex` (curation-emitted concrete hex). The tint is **implicit** — the gradient consumes the `surfaceBrandSubtle` semantic role at the matching surface. One brand decision (which primitive maps to `surfaceBrandSubtle`) serves three consumers automatically:

1. The solid `surfaceBrandSubtle` role (used for section bg washes)
2. The `gradients.subtle` plateau (gradient mid color)
3. The `midStopHex` derivation input (curation computes from this)

**Brand decision count went from 5 to 2** for the gradient (was: tint primitive + midStop primitive + tint sub-field + midStop sub-field + pair declaration → now: surface + optional midStopHex). The redundant `midStop` primitive doesn't exist as a separately-named primitive anymore — the derived value lives as a concrete hex on the gradient role itself.

**Theme UI implication:** the gradient editor in the UI is now much simpler. Brand picks "which surface should the subtle gradient render on" (or omits entirely if no subtle gradient). The UI auto-computes and displays `midStopHex` as a derived value. No "pick a tint primitive" or "pick a midStop primitive" inputs — both are derived from `surfaceBrandSubtle`.

### Removed / restructured

**Nothing was removed.** All v1 changes were additive (per principle P11 — schema vocabulary expands, not stretches).

### Type / shape changes

- `baseFontSize` — settled at default `16`. UI can let brand override (8–32 range), but 16 is the canonical assumption.
- Typography sizes — **template-fixed via rem multipliers**, not brand-overridable. Brands declare family/weight/lineHeight/letterSpacing per role; the renderer computes size from baseFontSize × role multiplier. **UI should NOT collect per-role sizes from brand.**

---

## 3. Derivation rules

Three derived primitive values. Brand picks the base inputs; UI auto-computes the derived. Display as read-only with optional override.

| Derived primitive | Formula | Inputs |
|---|---|---|
| `ctaBorder` | `oklab-mix(cta, black 10%)` — 10% darker CTA color in perceptual space | `cta` primitive hex |
| `gradients.subtle.midStopHex` | `srgb-mix(surfaceBrandSubtle 70%, surface-endpoint)` — 70/30 blend; emitted as concrete hex (not a primitive name) | `surfaceBrandSubtle` role's resolved primitive hex + surface endpoint (paper if `surface: 'light'`; brand-dark if `surface: 'dark'`) |
| `ctaHover` | `oklab-mix(cta 85%, ctaBorder 15%)` — brand-tonal deepening | `cta` hex + `ctaBorder` hex |

### Implementation note for the UI

Use the browser's `color-mix()` CSS function indirectly via canvas rasterization to compute. Example (validated approach from component-demo):

```javascript
function computeDerivedHex(expression) {
  const probe = document.createElement('div');
  probe.style.backgroundColor = expression;  // e.g., 'color-mix(in oklab, #FFD61E, black 10%)'
  document.body.appendChild(probe);
  const computed = window.getComputedStyle(probe).backgroundColor;
  document.body.removeChild(probe);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  const toHex = n => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
}
```

For reference, the values these formulas produced for Javvy + Solstice:

| Brand | `cta` input | `ctaBorder` (10% darker oklab) | `ctaHover` (85/15 oklab mix) |
|---|---|---|---|
| Javvy | `#FFD61E` (yellow) | `#DEBA19` | `#FAD21D` |
| Solstice | `#FFB347` (amber) | `#DE9B3D` | `#FAAF45` |

| Brand | `surfaceBrandSubtle` resolved primitive | `gradients.subtle.midStopHex` (70% + paper) |
|---|---|---|
| Javvy | `#E8E4F7` (javvyPurpleSubtle) | `#EFECF9` |
| Solstice | `#FAEBE0` (solsticeSubtlePeach) | `#FCF1E9` |

### UX call

Show derived values as read-only with a small "auto-computed from brand color" label. Allow override via a toggle ("manually override this derivation") — but warn that the manual value won't update if the source color changes. Most brands won't override.

---

## 4. Validation rules

### Per-field

| Field | Constraint |
|---|---|
| Primitive hex values | Must match `^#[0-9A-Fa-f]{3,8}$` (3, 6, or 8 digits) |
| Primitive names (keys) | `[a-zA-Z][a-zA-Z0-9]*` (camelCase suggested) |
| Semantic role values | Must reference a primitive declared in `primitives` |
| Pair primitive names | Must be in `primitives` |
| Gradient `tint` and `midStop` | Must be primitives in `primitives` |
| Typography weight | Must be in the **font's actually-shipped face set** — NOT just any number 100–900. See §6 (no font synthesis) |
| Typography color | Must be a `SemanticRoleName` enum value |
| Typography lineHeight | Number or string (CSS-valid) |
| Brand asset URLs | Valid URI format |

### Cross-field

| Rule | Why |
|---|---|
| Every `semantic.light.{role}` value must exist as a key in `primitives` | Catches typos that produce silent unset CSS vars |
| Every `semantic.dark.{role}` value must exist as a key in `primitives` | Same |
| Every `pairs.{name}` must exist in `primitives` | Pair declarations for non-existent primitives are dead config |
| `gradients.subtle.tint` and `midStop` must exist in `primitives` | Same |
| `typography.{role}.color` (SemanticRoleName) must be a populated role in `semantic.light` at minimum | Otherwise the role's color CSS var resolves to fallback |
| `typography.{role}.weight` must be available in `typography.{role}.family` | Catches the synthesis bug (see §6) |

### Theme-complete criteria (when brand can "save / publish")

A theme is **considered complete** when:

1. `colors.primitives` has at minimum: the brand's primary primitives + the neutral set (`ink`, `paper`, `rule`, `alert`) + status set (`success`, `warningSubtle`) + at least one brand-tinted subtle (`*Subtle`).
2. `colors.semantic.light` populates: `textPrimary`, `background`, `border`, `primary`, `cta`, `ctaForeground`, `ctaBorder`, `textAlert`. Other roles can fall back via the renderer's brand-neutral fallback chain but should ideally be set.
3. `colors.pairs` declares pairings for all primitives used as section backgrounds in any preset (UI may not know this; safest is to require pairing for every primitive the brand declares).
4. `gradients.subtle.tint` + `gradients.subtle.surface` set (midStop optional but recommended for clean design-tool import).
5. `typography.body` + at least one heading role (h1 or title) populated with family + weight.
6. `brandAssets.logo.light` URL set; `dark` recommended.
7. All weight declarations pass the synthesis check (see §6).

Surface incomplete state as inline warnings rather than blocking save — let the brand iterate.

---

## 5. What the schema does NOT cover

The Theme UI should **not** try to collect any of these. They live in template/content/preset data, owned by separate workflows:

- **Compositional shape** — Section / Grid / Cell / Content (the page structure). Theme is shape-agnostic.
- **Per-page authoring** — copy text, image content, layout choices, cell padding/margins per section.
- **Per-content overrides** — content-level color or font-size inline fields on a specific instance (e.g., a one-off badge with `badgeBackgroundColor: 'javvyPurple'`).
- **Component design hardcodes** — the bespoke accent values intentionally outside the role vocabulary. Examples from component-demo's work:
  - `#C9980A` — banner gold CTA background (per-design intent)
  - Product-comparison per-product visual differentiator colors (per-product identity, not theme)
- **Template-level structural decisions** — which section types appear in what order, which content types belong in which cells.
- **Authored design patterns** — e.g., the inline ruled-label HTML pattern for "Choose your bundle" headings. These are authoring conventions in rich-text data, not theme tokens.
- **Page-level CTAs** — copy, URL, behavior of individual buttons. The theme provides the styling vocabulary; pages decide what to label and link.

**Boundary check:** the brand should make ~20–30 decisions in the Theme UI (primitives, semantic role mappings, typography role styling, brand assets). If the UI is collecting >50 fields, it's leaked beyond the theme layer.

---

## 6. Tech stack / architectural changes affecting UI implementation

### baseFontSize

Settled at **16** as the default. UI should let the brand override (8–32 range) but 16 is the standard. All typography role sizes are computed as `rem`-equivalent multipliers off this base — brands don't override per-role sizes.

### Rem-based size lockdown

The renderer's CSS exposes role sizes via `--fs-{role}` tokens computed as `calc(var(--page-base-font-size) * <multiplier>)`. Multipliers are template-fixed. **Brands cannot set `typography.{role}.size`** — this field doesn't exist in the schema. Sizes scale proportionally when brand changes `baseFontSize`.

### Brand-neutral CSS fallbacks

Component-template (and any production renderer following the integration guide) emits brand-neutral fallback values for every theme CSS variable. So `var(--page-h1-family, system-ui, sans-serif)` falls back to `system-ui` if the brand doesn't set h1's family. **Implication for the UI:** an incomplete theme renders legibly but obviously unstyled — that's intentional. UI should warn the brand if critical roles are unset but doesn't need to enforce completeness for the theme to render.

### Font weight validation (no synthesis)

**Critical for UI logic.** The browser silently synthesizes faux-bold when a declared weight isn't in the font's actually-shipped face set. This produces visually degraded rendering (algorithmic stroke thickening, no optical refinement). The schema's P14 principle: **declared weights must map to a real shipped face**.

**UI requirement:** validate every `typography.{role}.weight` against the brand's chosen font's shipped weight set. **NOT** against the URL declaration — Google Fonts silently drops unsupported weights from URL requests, so URL-level checks miss the bug.

**How to know what a font ships:**
- Google Fonts Developer API: `https://www.googleapis.com/webfonts/v1/webfonts?key=YOUR_API_KEY` — returns per-family list of available variants
- Or maintain a registry: most popular Google Fonts ship a documented weight set (e.g., Lato: 100, 300, 400, 700, 900; Libre Baskerville: 400, 700 only)
- Variable fonts support any integer weight in their declared axis range

**Surface as a validation error if the brand picks a weight the font doesn't ship.** Show the available weights as a dropdown (not free numeric input) to make synthesis-prevention foolproof.

### Renderer color-resolution asymmetry (v1 limitation)

Documented for completeness because it affects how the UI captures CTA background color decisions:

- For **text + border** fields, brand can reference either a primitive name (e.g., `"javvyYellow"`) or a semantic role name (e.g., `"cta"`).
- For **background** fields, brand should reference a **primitive name only** in v1 (semantic role refs aren't resolved by the renderer's `bgWithSurface` helper).

**Implication for the UI:** when offering color choices for "CTA background" fields, only show primitive names — don't show role names. Or show both but disambiguate clearly.

Works in practice because brands typically map `cta`/`ctaForeground`/`ctaBorder`/`ctaHover` roles to the same primitive on light and dark surfaces (Javvy and Solstice both do this). For brands that diverge, this is a known v1 limitation; flag it in advanced/edge cases.

### No new runtime dependencies

The schema is plain TypeScript + JSON. UI can validate via `ajv` (JSON Schema draft-07 validator) if needed, but nothing exotic is required. Optional `color-mix()` capability is browser-native; no library needed for derivations.

---

## 7. The why behind each material change

One sentence per added/changed field — to help with UX calls (obvious vs. buried, required vs. optional, etc.):

| Change | Why | UX implication |
|---|---|---|
| `cta` + `ctaForeground` roles added | Brand CTAs aren't always the brand primary (Javvy: brand purple, CTA yellow). Pre-existing schema conflated these. | Surface CTA color as a prominent brand-decision input, separate from "brand primary" |
| `surfaceBrandSubtle` role added | shadcn's `surfaceMuted` is neutral; brand-tinted section wash is a distinct concept. | Brand picks one "subtle brand wash" primitive; UI explains it serves both `surfaceBrandSubtle` and `gradients.subtle.tint` (one decision, two consumers) |
| `ctaBorder` role added | CTAs need visible "pop" border; brand declares `cta` once, derivation produces the border. | Display as auto-computed from `cta`; allow manual override |
| `ctaHover` role added | Brand-tonal hover state (avoids black sRGB blending which muddies saturated colors). | Display as auto-computed from `cta` + `ctaBorder`; allow manual override |
| `meta` typography role | Footer attribution and disclaimers need a fine-print register distinct from body and from text-label (uppercase). | Include in typography role list; default to body's family at smaller size |
| `accordionQuestion` typography role | FAQ stacked question lists need a register distinct from card-heading H4. | Include in typography role list; defaults to body family at 14px / uppercase / bold |
| `gradients.subtle.midStop` sub-field | Pre-blended hex imports cleanly into design-tool plugins (Figma html.to.design can't always evaluate runtime `color-mix()`). Also moves derivation from paint-time to curation-time. | Auto-compute from `tint` + surface; display read-only with optional override |
| Typography sizes removed from brand control | Sizes are template-fixed via rem multipliers; brand control over per-role sizes leaked into composition decisions. | Don't offer size input per typography role; offer only `baseFontSize` as a global slider |
| No raw `target="_blank"` for footer policy links | Engineering hardcodes this in the renderer; brand doesn't pick per-link target. | Footer links UI should collect label + URL only; no `target` field |
| "Return Policy" default label | Default policy-link label changed from `"Returns & Refunds"` to `"Return Policy"` across all preset content (data convention). | If the UI offers default footer link labels, use the new convention |

---

## 8. Token-reference vs. resolved-value

**Decision: the schema separates THEME from CONTENT. Preset content uses TOKEN REFERENCES (primitive names + semantic role names), NOT resolved hex.**

### What the Theme UI produces

The Theme UI's job is to produce **theme JSON** that conforms to the `PageStyle` schema. This is consumed by:
- The component-template renderer (which emits `:root` CSS variables from the theme data)
- The Theme Curation agent (when one exists; consumes the theme to bulk-generate or update preset content)

The Theme UI does **NOT** edit preset content directly. It produces theme data; preset content consumes the theme via token references.

### What this means for the UI

**It doesn't.** The UI doesn't need migration logic. It produces a clean theme JSON output; preset content's relationship to the theme is engineering's concern (renderer wiring + preset data migrations are separate).

**The exception** — if the UI ever offers preview rendering (e.g., "see your theme applied to a sample preset"), it should consume **token references** in the sample content data and the renderer resolves them via the theme. Token-correct sample content is the right approach; resolved-hex sample content would be a regression.

### When token references break down

A handful of values in real preset content are intentional bespoke (not token-bound):

- Banner gold CTA background (`#C9980A` in component-demo's preset 66 + 139 + 141) — per-design-intent gold accent that isn't a system role
- Per-product visual differentiator colors (`#e8f4ff` for Grande Coffee column in comparison tables) — per-product identity, not theme

These are documented as exceptions. The Theme UI doesn't need to handle them — they live in preset content authoring, not theme curation.

---

## Implementation checklist for the Theme UI update

A condensed action list for the Claude Code instance working on the Theme UI repo:

### Schema-driven fields to add/update

- [ ] Color primitives input: add support for any new brand-named primitives (UI was likely flexible here already; verify it can handle ~12–17 primitives per brand)
- [ ] Semantic role mappings (per surface): add inputs for `surfaceBrandSubtle`, `cta`, `ctaForeground`, `ctaBorder`, `ctaHover` (5 new roles since the UI was last built)
- [ ] Gradient schema simplified — `gradients.subtle` now has only `surface` + optional `midStopHex` (curation-emitted concrete hex). Tint is implicit via `surfaceBrandSubtle` role. Remove any `tint` or `midStop` primitive-name inputs that may have existed in the older UI. Show `midStopHex` as auto-computed from `surfaceBrandSubtle` value + surface endpoint.
- [ ] Typography roles: add `meta` to the role list; ensure `accordionQuestion` is present
- [ ] Remove typography size inputs per role (sizes are template-fixed; brands only control `baseFontSize`)
- [ ] Pair declarations: ensure the UI handles new primitives the brand adds (each primitive needs an `onSurface: light | dark` pair declaration)

### Derivation displays

- [ ] Add auto-computed display for `ctaBorder` derived from `cta`
- [ ] Add auto-computed display for `ctaHover` derived from `cta` + `ctaBorder`
- [ ] Add auto-computed display for `gradients.subtle.midStop` derived from `tint` + surface endpoint
- [ ] All derivations should be overridable (let the brand manually pin if desired)

### Validation logic

- [ ] Per-field hex format validation
- [ ] Cross-field reference validation (semantic role values must exist in primitives)
- [ ] Font weight validation against the chosen font's shipped face set (no synthesis)
- [ ] Theme-complete criteria check (see §4 list)
- [ ] Optional: WCAG contrast warnings on text/background color pairs

### UX guidance

- [ ] Keep the existing layout/style intact (per user instruction)
- [ ] CTA background fields: show only primitive names (not semantic role names) — see §6 renderer asymmetry
- [ ] Mark derived values as auto-computed with override toggle (don't surprise brands with non-editable fields)
- [ ] Surface incomplete theme state as inline warnings, not blocking errors

### Documentation update

- [ ] Update the Theme UI repo's own docs (if any) to reflect the v1 schema as documented here
- [ ] No need to copy this brief into the Theme UI repo; reference it or extract relevant sections
- [ ] If the UI repo has a "what's new" or changelog, add a note for the 2026-05-14 schema update with the 5 new semantic roles + `meta` typography role + `midStop` sub-field

---

## Reference materials in the component-demo repo (if needed)

If the Theme UI needs additional context, the canonical sources are:

- `schema/theme-schema.ts` — primary TypeScript types
- `schema/theme-schema.json` — JSON Schema for validators
- `schema/themes/javvy.json` + `solstice.json` — fully populated reference instances
- `docs/theme-design-principles.md` — 14 principles. UI's design decisions should respect them.
- `docs/theme-integration-guide.md` — how the schema is consumed by renderers. Useful if UI offers preview rendering.
- `scripts/_audit-font-weight-synthesis.mjs` — example of how to validate weight-vs-shipped-faces logic.

The Theme UI doesn't need any of these to update its fields. They're available if you want to dig deeper.

---

**End of brief.** If something here is ambiguous, the principles doc (`docs/theme-design-principles.md`) is the constraint authority and the reference themes (`schema/themes/javvy.json`, `solstice.json`) are the empirical authority — "what should this look like in JSON" is answerable by inspecting those files.
