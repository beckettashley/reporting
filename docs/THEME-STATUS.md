# Theme — current state (source of truth)

> Read this first. It is the single current-state reference for the theme
> work. If any other theme doc disagrees with this file, this file wins.
> Last reconciled against the code: 2026-06-03.

## TL;DR

- The theme schema is **v2** (shadcn-aligned canonical vocabulary). v2 shipped
  in `component-demo` in production on **2026-05-19**. There is no "v1 migration"
  outstanding — it's done.
- The canonical contract this repo edits against is **vendored in-repo** at
  `lib/theme-schema/`. We do not import it live from `component-demo`.
- The theme editor UI is `app/brand/theme/page.tsx`. It produces and ingests
  v2-shaped data. No v1 role names remain in it.

## What "canonical" means here

| Thing | Location | Notes |
|---|---|---|
| TypeScript types | `lib/theme-schema/theme-schema.ts` | Adapted from `component-demo` commit `2fbc394` (A3 cleanup) |
| JSON Schema (draft-07) | `lib/theme-schema/theme-schema.json` | Validates with `new Ajv({ strict: false })` |
| Reference instances | `lib/theme-schema/themes/javvy.json`, `…/solstice.json` | Javvy = real calibration brand; Solstice = portability foil |
| OKLCH conversion | `lib/hex-to-oklch.ts` | Render-time only; storage stays hex |
| Editor UI | `app/brand/theme/page.tsx` | ~2000 lines; the runtime that consumes/produces themes |

### Local divergence from upstream (intentional)

The vendored schema is **`2fbc394` plus two local-only additions** that are
still pending parallel canonical PRs back into `component-demo`:

1. `ctaBorderHover` semantic role (cta family)
2. `midStopHexDark` field on `GradientPrimitive` (dark-surface counterpart to
   `midStopHex`, mirroring the role/roleDark pattern)

The vendored file headers record this. **Sync rule:** when the schema changes
upstream, update `lib/theme-schema/` *before* touching UI consumers, and
re-apply the two local additions.

## What has shipped in the editor

All on `main`, deployed to prod (Vercel auto-deploy):

- v2 vocabulary throughout (primitives + semantic roles per surface; no flat
  legacy fields)
- Typography editor: role rows with per-role `lineHeight` / `letterSpacing` /
  `align`, uniform reset, `baseFontSize`-scaled preview samples
- Typography preview in the main Preview pane + font loading
- Side-by-side preview with OKLCH emission and primitive-var resolution
- Gradient mid-stop auto-derivation (`srgb-mix(brandSubtle 70%, surface-endpoint)`)
- Export JSON + preset menu
- Export validator (cross-field: semantic refs must resolve to a declared primitive)
- `FONT_SHIPPED_WEIGHTS` synthesis validator across all 19 fonts in `FONT_OPTIONS`
- P15 (primary annotation) + P17 (dark.foreground warning) principle checks

## Local vs production

Code on local `main` is even with `origin/main`; prod has everything above.
The only uncommitted local work is documentation (this reconciliation).

## Historical docs (do not implement from these)

- `docs/archive/post-v2-migration/` — the v2 migration handoff + work plan.
  **Completed.** Kept for rationale only.
- `docs/archive/pre-v2/` — pre-v2 (flat-schema) bootstrap and v1-target
  briefs. Superseded. The folder name is the signal; each file also carries a
  correction banner pointing here.
