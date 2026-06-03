# Handoff brief — Theme UI project: ingest the v2 vocabulary

> **STATUS: COMPLETED — historical.** This v2 migration shipped. The editor
> (`app/brand/theme/page.tsx`) now produces and ingests v2-shaped data, and the
> schema is vendored at `lib/theme-schema/`. The six STOP questions below were
> answered (see the companion `handoff-prompt-for-reporting-cc.md`). Kept for
> rationale only — do not implement from it. Current state: **`docs/THEME-STATUS.md`**.

---

**Purpose.** The schema this UI edits has migrated from v1 to v2 (shadcn-aligned canonical vocabulary). The component-demo repo (sales-page renderer + 3 preset DBs) is live in production on v2 as of 2026-05-19. The Theme UI project must update its editing interface to produce and ingest v2-shaped data.

**Source repo:** `https://github.com/beckettashley/component-demo`. This brief was assembled from the v2 canonical files on `main`:
- `schema/theme-schema.ts` — TypeScript types
- `schema/theme-schema.json` — JSON Schema (draft-07) for validation
- `schema/themes/javvy.json` — reference brand instance (real)
- `schema/themes/solstice.json` — reference brand instance (fictional, used as portability test)
- `docs/theme-design-principles.md` — P1–P17 + North-star gaps
- `docs/refactor-protocols.md` — Protocols A–E + addenda
- `CLAUDE.md` — project-level rules

When this brief and any other doc disagree, the schema files win.

---

## ⛔ STOP — Verify with Ashley before implementing

**These six items were material to drafting this brief but could not be answered from the canonical files. Surface answers to ALL SIX in your first session response before touching any UI code.** Implementing on top of wrong assumptions here will produce code that has to be torn out.

1. **What is the Theme UI project's repo location?** This brief assumes a separate repo distinct from `beckettashley/component-demo`. The UI's own structure (React/Vue/other; package manager; etc.) isn't documented here.

2. **Does the UI import the schema files directly from the component-demo repo, or does it maintain its own copy?** If direct import: UI inherits canonical v2 automatically. If own copy: UI needs to mirror the v2 schema and stay in sync with future updates.

3. **Does the UI write themes back to the same Neon DB that the component-demo renderer reads from?** If yes: the wrapper-preservation rules in §9 are MANDATORY. If no (UI writes to its own storage; deploys to component-demo via separate export): the wrapper rule applies only to the export step.

4. **What's the current state of the UI's v1 implementation?** The brief assumes the UI exists and currently produces v1 data. Specifics of what needs updating depend on what UI components currently exist for which roles/decisions.

5. **Is OKLCH conversion expected at the UI layer, or only at the renderer?** Schema stores hex. Renderer emits OKLCH via `hexToOklch()` (in `lib/color-tokens.ts` of the source repo). If the UI implements its own preview, it may want to do the same conversion locally. Source repo's `scripts/_verify-hex-to-oklch.mjs` has the verified implementation (cross-checked against colorjs.io).

6. **Is the Theme UI expected to handle gradient `midStopHex` derivation (the `srgb-mix(brandSubtle 70%, surface-endpoint)` curation rule documented in the schema), or is that downstream curation tooling's job?**

---

## ⚠️ Doc-drift warning — read schema files, not stale docs

**Several docs in the component-demo repo still contain v1 role names in their examples; Phase 3 did not retroactively rename them. Read these with the rename map (§4 below) in hand, or you'll consume stale vocabulary as if it were canonical.**

Docs with v1 names in examples:
- `docs/theme-integration-guide.md` — written for v1; references `--text-primary`, `--surface-brand-subtle`, etc. throughout. **Treat the structural guidance as still-valid; mentally remap role names to v2 per §4.**
- `docs/theme-design-principles.md` P1–P14 — principles apply; role-name examples are v1.

Docs that are fully v2:
- Schema files (`schema/theme-schema.ts`, `schema/theme-schema.json`, `schema/themes/*.json`) — fully v2, canonical.
- Phase 3 additions (P15–P17, North-star gaps 5–7, Protocols D + E, CLAUDE.md Theme migration safety) — fully v2.

**Source-of-truth ordering when docs disagree:**
1. `schema/theme-schema.ts` and `schema/theme-schema.json` (canonical types + validation)
2. `schema/themes/javvy.json` and `schema/themes/solstice.json` (canonical instances)
3. P15–P17 + CLAUDE.md Theme migration safety (latest principles)
4. P1–P14 (still-valid principles, v1 examples)
5. `docs/theme-integration-guide.md` (structural guidance valid, v1 examples)

---

## 1. Context — what just happened

A 9-step migration ("Phase 3") shipped:
- v1 schema vocabulary → v2 canonical vocabulary (shadcn-aligned)
- All renderer code updated to v2
- Three live presets migrated in Neon DB: preset 66 (Sales Page Template), 139 (Listicle Template), 141 (Article Template)
- OKLCH emission (shadcn-default color space)
- Cascade-resolution fix for role-named backgrounds (Step 6.5 — see §5)
- Documentation: P15–P17 added; Protocols D + E (migration discipline); CLAUDE.md addendum

The UI project was, prior to this, editing the v1 shape. It now needs to ingest and produce v2.

**What's NOT changed:** the overall PageStyle shape (top-level keys: `baseFontSize`, `colors`, `typography`, `brandAssets`). The vocabulary inside `colors` changed; the structure didn't.

---

## 2. The v2 theme shape (canonical, complete)

### Top-level

```ts
export interface PageStyle {
  baseFontSize?: number;     // default 16; drives all role-size rem multipliers
  colors?: ColorTokens;
  typography?: TypographyMap;
  brandAssets?: BrandAssets;
}
```

### `ColorTokens`

```ts
export interface ColorTokens {
  primitives: ColorPrimitives;          // required
  semantic: {
    light: SemanticMap;                  // required
    dark?: SemanticMap;                  // optional
  };
  pairs?: PairingMap;
  gradients?: GradientMap;
}
```

### `ColorPrimitives`

Brand-named hex map. Per JSON Schema: `^[a-zA-Z][a-zA-Z0-9]*$` (camelCase identifier), values are hex strings (3/6/8-digit). Brands choose names.

```ts
type ColorPrimitives = Record<string, string>;
// e.g. { ink: "#1A1A1A", javvyPurple: "#3D348B", paper: "#FFFFFF", ... }
```

Conventions per schema docstrings:
- Brand-specific: `javvyPurple`, `solsticeBurntOrange`
- Universal (shared across brands): `ink`, `paper`, `rule`, `alert`, `success`, `graphite`, `warningSubtle`
- Status primitives (`alert`, `success`, `warningSubtle`) should NOT be brand-tinted — convention reads on consistency across brands

### `SemanticRoleName` — closed 19-role v2 vocabulary

```
background       primary               brandSubtle             warning             border
foreground       primaryForeground     brandSubtleForeground   warningForeground   ring
muted            textBrand                                                          cta
mutedForeground  link                                                                ctaForeground
                 textAlert                                                          ctaBorder
                                                                                    ctaHover
```

Grouped by category (matches schema/theme-schema.ts ordering):
- **Base pair (shadcn-canonical):** `background`, `foreground`
- **Surface + foreground pairs (shadcn-canonical):** `muted`/`mutedForeground`, `primary`/`primaryForeground`
- **Brand-tinted surface pair (extension):** `brandSubtle`/`brandSubtleForeground`
- **Warning surface pair (extension):** `warning`/`warningForeground`
- **Text-only roles (extensions):** `textBrand`, `link`, `textAlert`
- **Borders + focus (shadcn-canonical):** `border`, `ring`
- **CTA family (extension):** `cta`, `ctaForeground`, `ctaBorder`, `ctaHover`

Naming conventions encoded in the schema:
- Surface tokens carry the bare name (`background`, `muted`, `primary`)
- Text/icon-on-surface tokens carry the `-Foreground` suffix (`foreground`, `mutedForeground`, `primaryForeground`)
- Text-only roles that don't sit on a paired surface keep descriptive names (`textBrand`, `link`, `textAlert`)

### `SemanticMap`

Map from role name → primitive name. Required keys: none (all optional in the JSON Schema). Values must reference primitives declared in `ColorPrimitives` — JSON Schema doesn't enforce the cross-field constraint; validate at emission/UI time.

### `PairingMap`

```ts
type PairingMap = Record<string, { onSurface: 'light' | 'dark' }>;
```

For each primitive that could serve as a section background, declares which surface context text inside renders against. Brand author declares this once per primitive. Used by the renderer to set `data-surface="dark"` attribute on sections (or equivalent inline-var rebinding). Author-explicit, not runtime luminance inference.

### `GradientMap`

```ts
type GradientRoleName = 'subtle';   // closed v1 vocabulary
type GradientMap = Partial<Record<GradientRoleName, GradientPrimitive>>;

export interface GradientPrimitive {
  surface: 'light' | 'dark';   // required — determines endpoint color
  midStopHex?: string;          // optional pre-computed mid-stop hex
}
```

Renderer-baked gradient shape: vertical, paper endpoints at 0%/100%, tint plateau 25%–75%. Brand provides tint (via `brandSubtle` role at this surface) + optional `midStopHex`. UI's job: edit `surface` + optional `midStopHex`. Shape is not authorable.

### `TypographyMap`

Closed v1 vocabulary of typography role names (13 total):

```
title  h1  h2  h3  h4  h5  h6  body  ui  condensed  accordionQuestion  meta  muted
```

Per-role `TextRoleStyle`:
```ts
interface TextRoleStyle {
  family?: string;               // CSS font-family string
  weight?: number;               // 100–900 (validate per P14 — see §5)
  color?: SemanticRoleName;     // semantic role REF, not hex
  lineHeight?: number | string;  // unitless ratio or 'normal'
  letterSpacing?: string;        // e.g. '-0.025em' or '0.5px'
}
```

`muted` is the sparse case: only `color` overridable (family/weight/size inherit from `body`).

**Sizes are NOT in this interface.** Per-role sizes are template-fixed via rem multipliers off `baseFontSize`. Brands scale the whole ladder by setting `baseFontSize` (default 16, range 8–32). Brands do not override per-role sizes.

**text-align is intentionally NOT in this interface.** Alignment is layout, not theme.

### `BrandAssets`

```ts
interface BrandAssets {
  logo?: {
    light?: string;   // URL for placement on LIGHT surfaces
    dark?: string;    // URL for placement on DARK surfaces
  };
}
```

Renderer picks the surface-matched variant. Fallback: requested → other → renderer placeholder.

---

## 3. Reference theme: Javvy v2 (verbatim)

This is `schema/themes/javvy.json` — the brand the live production sales page renders against. Use it as the canonical example of a complete, valid v2 theme.

```json
{
  "$schema": "../theme-schema.json",
  "baseFontSize": 16,
  "colors": {
    "primitives": {
      "ink": "#1A1A1A",
      "inkMuted": "#555555",
      "graphite": "#666666",
      "paper": "#FFFFFF",
      "paperSubtle": "#F5F5F5",
      "rule": "#E5E7EB",
      "alert": "#DC2626",
      "success": "#11B990",
      "warningSubtle": "#FEF9C3",
      "javvyPurple": "#3D348B",
      "javvyPurpleMid": "#351979",
      "javvyPurpleDark": "#2A2552",
      "javvyPurpleSubtle": "#E8E4F7",
      "javvyYellow": "#FFD61E",
      "javvyCtaBorder": "#DEBA19",
      "javvyCtaHover": "#FAD21D"
    },
    "semantic": {
      "light": {
        "background": "paper",
        "foreground": "ink",
        "muted": "paperSubtle",
        "mutedForeground": "graphite",
        "primary": "javvyPurple",
        "primaryForeground": "paper",
        "brandSubtle": "javvyPurpleSubtle",
        "brandSubtleForeground": "ink",
        "warning": "warningSubtle",
        "warningForeground": "ink",
        "textBrand": "javvyPurple",
        "link": "javvyPurple",
        "textAlert": "alert",
        "border": "rule",
        "ring": "javvyPurple",
        "cta": "javvyYellow",
        "ctaForeground": "ink",
        "ctaBorder": "javvyCtaBorder",
        "ctaHover": "javvyCtaHover"
      },
      "dark": {
        "background": "javvyPurpleDark",
        "foreground": "paper",
        "muted": "javvyPurple",
        "mutedForeground": "rule",
        "primary": "javvyYellow",
        "primaryForeground": "ink",
        "textBrand": "javvyYellow",
        "link": "paper",
        "textAlert": "alert",
        "border": "rule",
        "ring": "javvyYellow",
        "cta": "javvyYellow",
        "ctaForeground": "ink",
        "ctaBorder": "javvyCtaBorder",
        "ctaHover": "javvyCtaHover"
      }
    },
    "pairs": {
      "ink": { "onSurface": "dark" },
      "inkMuted": { "onSurface": "dark" },
      "graphite": { "onSurface": "dark" },
      "paper": { "onSurface": "light" },
      "paperSubtle": { "onSurface": "light" },
      "rule": { "onSurface": "light" },
      "alert": { "onSurface": "dark" },
      "success": { "onSurface": "light" },
      "warningSubtle": { "onSurface": "light" },
      "javvyPurple": { "onSurface": "dark" },
      "javvyPurpleMid": { "onSurface": "dark" },
      "javvyPurpleDark": { "onSurface": "dark" },
      "javvyPurpleSubtle": { "onSurface": "light" },
      "javvyYellow": { "onSurface": "light" },
      "javvyCtaBorder": { "onSurface": "light" },
      "javvyCtaHover": { "onSurface": "light" }
    },
    "gradients": {
      "subtle": {
        "surface": "light",
        "midStopHex": "#EFECF9"
      }
    }
  },
  "typography": {
    "title": { "family": "'DM Sans', sans-serif", "weight": 900, "lineHeight": 1.05, "letterSpacing": "-0.03em" },
    "h1": { "family": "'Libre Baskerville', serif", "weight": 700, "lineHeight": 1.155, "letterSpacing": "-0.025em" },
    "h2": { "family": "'DM Sans', sans-serif", "weight": 900, "lineHeight": 1.2, "letterSpacing": "-0.015em" },
    "h3": { "family": "'DM Sans', sans-serif", "weight": 600, "lineHeight": 1.25, "letterSpacing": "-0.01em" },
    "h4": { "family": "'DM Sans', sans-serif", "weight": 800, "lineHeight": 1.3, "letterSpacing": "-0.005em" },
    "h5": { "family": "'DM Sans', sans-serif", "weight": 600, "lineHeight": 1.4, "letterSpacing": "0" },
    "h6": { "family": "'DM Sans', sans-serif", "weight": 600, "lineHeight": 1.4, "letterSpacing": "0" },
    "body": { "family": "'DM Sans', sans-serif", "weight": 500, "lineHeight": 1.6, "letterSpacing": "0" },
    "ui": { "family": "'Geist', 'Geist Fallback', sans-serif", "weight": 700, "lineHeight": 1.4, "letterSpacing": "0.01em" },
    "condensed": { "family": "'Barlow', sans-serif", "weight": 900, "lineHeight": 1.155, "letterSpacing": "-0.025em" },
    "accordionQuestion": { "family": "'DM Sans', sans-serif", "weight": 800, "lineHeight": 1.4, "letterSpacing": "0" },
    "meta": { "family": "'DM Sans', sans-serif", "weight": 500, "lineHeight": 1.5, "letterSpacing": "0" },
    "muted": { "color": "mutedForeground" }
  },
  "brandAssets": {
    "logo": {
      "light": "https://cdn.shopify.com/oxygen-v2/25194/9447/19462/3290292/javvy-logo-blue-yellow-sparkles.svg",
      "dark": "https://cdn.shopify.com/oxygen-v2/25194/9447/19462/3558695/javvy-logo-white-sparkles.png"
    }
  }
}
```

**Solstice (`schema/themes/solstice.json`)** is the second reference theme — fictional warm-saturated brand, single-color-family, serif H1 absent. Demonstrates the schema isn't single-brand. Use it for portability validation (the UI should be able to ingest both Javvy and Solstice and produce identical-shape output).

---

## 4. Changes from v1 — explicit rename map + additions

### v1 → v2 renames (6 roles)

| v1 role | v2 role | Notes |
|---|---|---|
| `textPrimary` | `foreground` | shadcn-canonical name |
| `textMuted` | `mutedForeground` | shadcn pair (matches `muted` surface) |
| `textLink` | `link` | shadcn-style bare noun |
| `surfaceMuted` | `muted` | shadcn-canonical name |
| `surfaceBrandSubtle` | `brandSubtle` | drop `surface` prefix (matches shadcn pattern) |
| `surfaceWarning` | `warning` | drop `surface` prefix |

### v2 additions (3 net-new roles)

| New role | Purpose |
|---|---|
| `brandSubtleForeground` | Text-on-brandSubtle pair (was missing in v1) |
| `warningForeground` | Text-on-warning pair (was missing in v1) |
| `ring` | Focus ring color (shadcn-canonical) |

### Roles kept unchanged across v1→v2 (10)

`background`, `border`, `primary`, `primaryForeground`, `cta`, `ctaForeground`, `ctaBorder`, `ctaHover`, `textBrand`, `textAlert`

### Structural changes

- **`typography.muted.color`** in themes that referenced `'textMuted'` need to reference `'mutedForeground'` (it's a `SemanticRoleName` ref; the rename propagates here too).
- **PairingMap, GradientMap, primitives** — structurally unchanged from v1. Same keys, same shapes.

### Total post-v2 role count

19 in `semantic.light` (canonical). `semantic.dark` is typically 14–15 (omit `brandSubtle*`, `warning*` — those are intentionally light-surface-only). Javvy ships 19 light + 15 dark. Solstice ships 19 light + 15 dark.

---

## 5. Architectural principles the UI must respect

Full source: `docs/theme-design-principles.md` (P1–P17 + North-star gaps). Below is a condensed summary of what the UI specifically needs to encode or guide users through.

### P1–P14 (pre-Phase-3; principles still apply, doc examples use v1 names)

These were authored before Phase 3 and contain v1 role-name examples (`textPrimary`, `surfaceBrandSubtle`, etc.). The PRINCIPLES are still load-bearing; mentally remap the role names per §4 above.

Key takeaways for the UI:
- **P1** Two-layer color tokens: brand defines primitives; system defines roles. UI must keep them visually and functionally distinct.
- **P2** Surface-aware cascade (not light/dark mode). Light + dark semantic maps are **section surface context**, not a user preference toggle. UI preview must illustrate this — same page can contain both light and dark sections.
- **P5** Text colors are role-driven (per surface), not freely chosen per-element. Brand author picks per-surface mappings; system applies consistently.
- **P6** Status colors decoupled from brand. UI should default `textAlert`/`warning` to universal status primitives (`alert`, `warningSubtle`), not the brand palette.
- **P7** Typography is role-based, not size-based. UI exposes per-role family/weight/lineHeight/letterSpacing; sizes are NOT brand-editable (only `baseFontSize`).
- **P9** Brand decisions stay small. The UI should NOT bloat. Aim: ~6–12 primitives, ~14 role mappings per surface, ~3–4 typefaces, 2 logo URLs.
- **P10** Gradients are roles, not arbitrary CSS. UI exposes only the named gradient roles (`subtle` for v1) + the brand's tint primitive choice. Gradient shape is renderer-baked.
- **P11** Vocabulary expands, not stretches. UI should NOT allow users to invent new role names. The role set is closed; if a use case can't be expressed, the schema needs PR-level expansion (not UI-level workaround).
- **P12** Coordinated values across coordinated decisions. The same primitive often serves multiple roles (e.g., `brandSubtle` and `gradients.subtle.tint` share a primitive in Javvy). UI should guide this coupling — when the user picks a "subtle brand wash" primitive, both consumer roles default to it.
- **P14** No browser font synthesis. UI must validate each `(role, family, weight)` triple against the font's actually-shipped weight set (query Google Fonts API or equivalent). Reject themes that declare weights the font doesn't ship.

### P15–P17 (added in Phase 3 — most critical for the UI)

**P15 — `primary` bundles two semantics: action emphasis and brand-surface accent.**

The `primary` role today carries two intents that pull in opposite cascade directions:
- **Action emphasis** (shadcn convention): `primary` is the high-emphasis action color. Flips on dark surface to stay visually prominent (light.primary = brand-purple; dark.primary = brand-yellow).
- **Brand-surface accent**: `primary` is the brand color used as a presentation surface. Wants to stay brand-colored regardless of context.

For brands where action color ≠ brand-surface color (Javvy: action=yellow, brand-surface=purple), the two semantics resolve to different primitives at different surface contexts.

**What the UI must support:**

- Editing `primary` per surface (light + dark) — standard role editing.
- Allowing data fields (in the downstream preset data) to reference EITHER the `primary` role ref OR a primitive ref directly (e.g., `javvyPurple`) for brand-surface accent fields. The UI doesn't make this choice per field — it's a per-field author decision. But the UI should expose both options when offering a value picker for fields like `cardHeaderBackgroundColor`, `captionBgColor`, etc.
- **Future redesign flag:** if a future schema version separates `primary` (action) from `brandSurface` (accent), the UI's choice between primitive ref and role ref for brand-surface accents becomes moot. Build the UI in a way that doesn't ossify the current dual-semantic state.

**P16 — Role-named backgrounds emit the resolved primitive var.**

When a data field uses a role for its background (e.g., `bg: 'primary'`), the renderer resolves the role to its primitive at the current surface context and emits the **primitive var** (`var(--c-{primitive})`), not the role var (`var(--{role})`).

**What the UI must support:** the UI doesn't directly emit CSS. But the UI should know this when previewing — if the UI renders a preview of "what the theme looks like" using the role refs, it should resolve role refs to primitive vars the same way the production renderer does. Implementation in `lib/color-tokens.ts:bgWithSurface()` of the source repo.

**P17 — Caption text contrast on brand-surface depends on `dark.foreground`.**

When a text element with `color: 'foreground'` sits on an element with `bg: 'primary'` (resolves to `light.primary` = brand-purple), the cascade flip produces correct white-on-purple contrast only because the brand's `dark.foreground` is a paper-class primitive. If a brand's `dark.foreground` were a different primitive, captions would render with off-spec color on brand-purple.

**What the UI must support:**
- **Warn or guide** when authoring a brand whose `dark.foreground` ISN'T a paper-class primitive. Either reject the configuration with a clear message, or surface a strong warning at theme-creation time.
- Document this fragility next to the `dark.foreground` editing UI.

### North-star gaps (relevant to the UI)

- **Gap 1** Bespoke per-instance brand accents — accent colors that aren't system roles. Today: handled via inline content-data hex on individual elements. UI for THIS schema doesn't need to address; future "brand decorative palette" extension might.
- **Gap 2** Multiple gradient roles — v1 only has `subtle`. UI should NOT pre-bake assumptions about additional gradient roles.
- **Gap 5** Vestigial `brandSubtle` in semantic.dark — articles 139/141 have this; harmless but worth UI-side cleanup ability (UI should allow REMOVAL of a key from semantic.dark, not just adding/editing).

### Step 6.5 cascade fix (what the UI doesn't directly touch)

During Phase 3, role-based backgrounds initially exposed a CSS-cascade bug where `var(--primary)` on an element that ALSO had `DARK_SURFACE_VARS` spread on it would resolve to `var(--primary-dark)` — the wrong color. The fix: `bgWithSurface()` now resolves role inputs to their primitive at the current surface context and emits the primitive var (P16).

**What the UI must support:** the UI doesn't have to implement this fix — it lives in the renderer code. But the UI's preview, if it implements its own render path, must follow the same pattern: role-bg inputs resolve to primitive vars at render time, not pure role vars that subject to cascade rebinding.

---

## 6. Known limitations and deferred items

Things the UI should NOT try to solve:

1. **Surface threading is limited in element files.** In the source repo, surface context is threaded through `grid-render.tsx` but NOT through standalone element files (`sticky-cta.tsx`, `navbar.tsx`, etc.). Those default to `parentSurface = 'light'`. The UI doesn't need to address this — it's a renderer-side concern. But if the UI builds its own preview renderer, follow the same pattern (default to light context unless explicit surface threading is in place).

2. **camelCase primitive vars vs kebab-case role vars.** Source repo emits `--c-javvyPurple` (primitive, camelCase preserved) and `--foreground-light` (role, kebab-case). UI doesn't need to normalize — it doesn't emit CSS. But preview-side, follow the same convention if generating var refs.

3. **`SemanticRoleName` soft enforcement.** TypeScript can't catch role-name drift at most consumer sites (the renderer's role-consuming functions accept `string`). **The UI MUST validate role names against the canonical set at edit time.** Don't rely on the type system; explicitly check against the v2 vocabulary list.

4. **`surfaceWarning.dark` is intentionally not declared in v1 themes.** Most brands don't need dark-surface warnings; the UI shouldn't require it. Allow optional declaration.

5. **Banner-secondary text contrast (initial false positive in Phase 3).** Documented in P17 — depends on cascade. The UI must guide brand authors to set `dark.foreground` correctly.

6. **Pre-write data safety on DB writes.** If the Theme UI writes pageStyle to the `presets.sections` JSONB column in Neon, it MUST use the wrapper-preserving SELECT/UPDATE pattern from CLAUDE.md (see §9). The wrapper-destruction bug previously broke the live deployed page; never repeat.

---

## 7. UI requirements

The UI is the **manual fallback** for autonomous theme generation (which is downstream — see §8 NOT in scope). The UI must:

### Must produce

A valid v2 theme JSON conforming to `schema/theme-schema.json`. Validate via:
```ts
import Ajv from 'ajv';
const ajv = new Ajv({ strict: false });
const validate = ajv.compile(themeSchema);
const valid = validate(themeData);
```

The JSON Schema validates SHAPE but NOT cross-field references (e.g., `semantic.light.primary` referencing a primitive name that exists in `primitives`). The UI must do this cross-field validation itself.

### Must ingest

Existing v2 themes (Javvy + Solstice as seed instances) for editing. Show the user the full structure: 16 primitives, 19 light role mappings, 14–15 dark role mappings, pairs map, gradients, 13 typography roles, brand assets.

### Must visualize the cascade

Surface context preview: show the same page mockup rendered as light and dark surface. P2 (surface-aware cascade) is the most non-obvious part of the schema — visual preview is the only way to make it tangible to brand authors.

### Must validate the canonical role set

When the user adds/edits a role mapping, the role name must come from the canonical 19-role set (§2). The UI should treat the role set as closed (per P11) and NOT allow users to invent new role names.

### Must guide P12 (coordinated values)

When the user picks a "brand-subtle wash" primitive, the UI should default both `semantic.light.brandSubtle` AND `gradients.subtle.midStopHex` (or the implied tint) to the same primitive choice. Explain the coupling in the UI; allow override only if intentional.

### Must validate P14 (no font synthesis)

For each `(role, family, weight)` triple in the typography map, query the font's actual shipped weight set (Google Fonts Developer API or maintained catalogue). Reject themes that declare weights the font doesn't ship. Per P14: surface a clear actionable message (example in the doc).

### Must support the P9 small-decision pattern

Brand authors aren't going to make 100 decisions. Aim for ~6–12 primitive picks, ~14 role mappings per surface, ~3–4 typeface choices. Avoid form-fatigue.

### Must show OKLCH or hex consistently

Schema stores hex (`#1A1A1A`). Renderer emits OKLCH (shadcn convention). The UI's call: show hex (matches schema, familiar to design-tool users) or OKLCH (matches what ends up in the CSS). If hex, mention the conversion at output time.

---

## 8. What's NOT in scope for the UI

- **Autonomous theme generation workflow.** That's downstream of UI work. The UI is the manual fallback.
- **Migration tooling.** Migration scripts for retroactively-updated presets are in the component-demo repo (`scripts/_migrate-preset-to-v2-vocabulary.mjs`, `_fill-canonical-v2-roles.mjs`). The UI doesn't need to replicate.
- **Renderer code.** The renderer (Next.js + Tailwind + styled-jsx) lives in the component-demo repo. The UI writes theme data; the renderer consumes it.
- **Per-instance content data.** The UI edits THEME data (PageStyle). It does NOT edit per-preset content (sections, grids, cells). That lives in `presets.sections.sections` in Neon; the source repo has its own content editor.
- **Cross-brand brand-specific assertions.** Migration scripts encode Javvy-specific counts (16 primitives, 13 typography roles). The UI should NOT enforce these counts — variable counts across brands are valid.
- **Solving the `primary` action/accent conflation (P15).** That's a future schema redesign. The UI accommodates the current dual-semantic by allowing both role refs and primitive refs in downstream data fields. The UI doesn't try to fix the schema.

---

## 9. Critical safety rules (from CLAUDE.md)

If the UI reads or writes themes from the Neon `presets.sections` JSONB column (or any equivalent DB column holding the wrapper shape):

### Required pattern

```js
const [{ sections: raw }] = await sql`SELECT sections FROM presets WHERE id = X`
const data = Array.isArray(raw) ? { sections: raw } : raw   // wrap legacy
// Mutate via wrapper. data.pageStyle stays intact.
walk(data.sections)  // or edit data.pageStyle
await sql`UPDATE presets SET sections = ${JSON.stringify(data)}::jsonb`  // writes wrapper
```

### Forbidden pattern

```js
const sections = Array.isArray(raw) ? raw : raw.sections  // STRIPS WRAPPER
walk(sections)
await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb`  // DESTROYS pageStyle
```

### Mandatory post-write verification

After every `UPDATE`:
1. SELECT the row back
2. Confirm wrapper shape preserved (`isArray` consistent, `pageStyle` present if expected)
3. Confirm `pageStyle.colors.primitives` count matches pre-write
4. If any check fails, halt and surface recovery

**Background:** This rule exists because a previous bug destroyed the live deployed page's theme by stripping the wrapper. It was restored from `schema/themes/javvy.json`. Never repeat.

---

**End of handoff brief.** Reading order is enforced: STOP gate first, doc-drift warning second, then top-to-bottom. Schema files in `beckettashley/component-demo` are the canonical source for the v2 shape. Phase 3 just shipped to production; the data layer is live in Neon; the UI is the next piece to align.
