# v2 migration — answers to STOP questions + sequenced plan

> **STATUS: COMPLETED — historical.** The sequenced plan below executed; the v2
> editor shipped on `main`. Two details here are now stale: the schema was
> vendored at component-demo `2fbc394` (A3 cleanup) — **not** `1b73a46` named
> below — and carries two local additions (`ctaBorderHover`, `midStopHexDark`).
> Kept for rationale only — do not implement from it. Current state:
> **`docs/THEME-STATUS.md`**.

---

Q1 (repo location) and Q4 (v1 state observed in `app/brand/theme/page.tsx`) are settled from your audit. Q2, Q3, Q5, Q6 are answered below with the precision details you'll need to implement correctly. After the answers, there's a sequenced work plan with per-step approval gates — do not touch UI code until each gate clears.

---

## Answers to STOP questions

### Q2 — Schema source: **vendor copy with sync contract**

- Vendor `schema/theme-schema.ts` and `schema/theme-schema.json` from `github.com/beckettashley/component-demo` (commit `1b73a46`, 2026-05-19) into this repo at:
  - `lib/theme-schema/theme-schema.ts`
  - `lib/theme-schema/theme-schema.json`
- Prepend each file with this header verbatim:
  ```
  // MIRRORED from github.com/beckettashley/component-demo/schema/<file>
  // as of commit 1b73a46 (2026-05-19). Sync rule: when schema changes in
  // component-demo, update here BEFORE updating UI consumers.
  ```
  (`<file>` = `theme-schema.ts` or `theme-schema.json` respectively)
- The TypeScript file is self-contained — no external imports. The JSON file is draft-07 and validates with stock Ajv (`new Ajv({ strict: false })`).
- Combined size: ~637 lines. Future schema changes will be additive (per P11); sync cost is low.

### Q3 — Neon DB writes: **out of scope for this migration**

- The UI stays local-state-only for v2. You confirmed no `@neondatabase/serverless`, no `pg`, no `presets.sections` references — don't add them as part of this task.
- This task is *update the UI to fit v2*, not *add a persistence layer*. Scope creep would double the migration's blast radius and conflate two concerns in the same PR.
- The v2 update produces a JSON document that conforms to `theme-schema.json`. Export/import to/from Neon is a separate task with its own surface area (auth, error handling, snapshots, post-write verification per §9 of the brief).
- §9 of the brief therefore does not apply to this work. Re-read §9 only if/when DB-write capability is later added.

### Q5 — OKLCH conversion: **port `hexToOklch`, render preview in OKLCH (option c)**

**Source:** `lib/color-tokens.ts` lines 52-94 in `beckettashley/component-demo`. The function is 43 lines of pure math. Only dependency is `Math`. No PageStyle, no React, no DOM. **Fully portable.**

**Behavior:**

- Input forms: 6-digit hex (`#FFD61E` / `FFD61E` / `ffd61e`), 3-digit hex (expanded internally), 8-digit hex with alpha (alpha stripped with `console.warn` if not `FF`), idempotent on `oklch(...)` (pass-through if input already starts with `oklch(`).
- Output: `oklch(L C H)` with 3-decimal precision. Neutral grays (`C < 0.0001`) emit `oklch(L 0 0)` (shadcn pattern).
- Throws on invalid input — fail loudly at the theme-emission boundary, not silently produce invalid CSS.

**Where to put it in this repo:** `lib/hex-to-oklch.ts` as a single-export module. Import wherever the UI generates preview CSS.

**Verification harness:** `scripts/_verify-hex-to-oklch.mjs` in component-demo runs both implementations (yours and `colorjs.io`) over Javvy + Solstice primitives (32 colors) and prints a comparison table. Port the verification script too — requires adding `colorjs.io` as a devDependency, then `node scripts/_verify-hex-to-oklch.mjs` confirms bit-for-bit parity.

**Storage convention:** the theme JSON stores hex (`#1A1A1A`). OKLCH is render-time only. UI input → hex; UI preview → `hexToOklch(hex)` → CSS. The schema dictates hex; don't change storage.

### Q6 — `midStopHex` derivation: **auto-compute with manual-override escape hatch**

**The formula (encoded in `components/section-renderer.tsx:259-292` of component-demo):**

```
midStopHex = srgb-mix(brandSubtle 70%, surface-endpoint)
```

Where `surface-endpoint` is the brand's `background` role primitive at the gradient's declared surface.

**Verified against ship:** For Javvy light gradient — brandSubtle=`javvyPurpleSubtle`=#E8E4F7, background=`paper`=#FFFFFF. Linear sRGB mix at 0.7: R=0.7×232+0.3×255=239=0xEF, G=0.7×228+0.3×255=236=0xEC, B=0.7×247+0.3×255=249=0xF9 → **#EFECF9**. Javvy's shipped `midStopHex` is `#EFECF9`. Formula matches ship exactly.

**Implementation for `light` surface gradient:**

```ts
const brandSubtlePrim = pageStyle.colors.semantic.light.brandSubtle    // e.g. 'javvyPurpleSubtle'
const backgroundPrim  = pageStyle.colors.semantic.light.background     // e.g. 'paper'
const brandSubtleHex  = pageStyle.colors.primitives[brandSubtlePrim]   // e.g. '#E8E4F7'
const backgroundHex   = pageStyle.colors.primitives[backgroundPrim]    // e.g. '#FFFFFF'

// srgb-mix at 70% brandSubtle, 30% background.
// Linear interpolation in gamma-encoded 8-bit sRGB channels (NOT linearized).
// Matches CSS `color-mix(in srgb, A 70%, B)`.
function mixSrgb(hexA: string, hexB: string, t: number): string {
  const [ra, ga, ba] = parseHex(hexA)
  const [rb, gb, bb] = parseHex(hexB)
  const r = Math.round(t * ra + (1 - t) * rb)
  const g = Math.round(t * ga + (1 - t) * gb)
  const b = Math.round(t * ba + (1 - t) * bb)
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0').toUpperCase()).join('')
}

const midStopHex = mixSrgb(brandSubtleHex, backgroundHex, 0.7)
```

For **dark** surface gradient: same formula, but read from `semantic.dark.brandSubtle` and `semantic.dark.background`.

**Dark-surface edge case — block declaration when input missing:**

Neither Javvy nor Solstice ships a dark subtle gradient. Javvy's `semantic.dark` doesn't declare `brandSubtle` (North-star Gap 5 in the brief). If a brand author selects `surface: 'dark'` and `semantic.dark.brandSubtle` is not declared, the formula has no input.

**Rule:** if user picks `surface: 'dark'`, the UI must require `semantic.dark.brandSubtle` to be declared. Block declaration with this error message verbatim:

> Dark gradient requires `semantic.dark.brandSubtle` to be set. Set `semantic.dark.brandSubtle` first, then declare the dark gradient.

**Manual-override behavior:**

- Auto-compute by default. Recompute whenever `semantic.{surface}.brandSubtle` or `semantic.{surface}.background` changes for the same surface.
- Manual-override toggle: when ON, user types a hex; when OFF, value is recomputed from inputs (overwrites any prior manual value).
- Show the computed value alongside the formula as a tooltip so brand authors understand what's happening.

---

## How to handle pre-existing handoff docs in this repo

You flagged `docs/theme-ui-handoff-brief.md` and the `theme-handoff/` directory (`theme-schema.md`, `theme-tokens.html`, `theme-preview-snippet.md`, `KICKOFF_PROMPT.md`). I have no visibility into their contents from the component-demo side.

**Do this:**

1. Read each of those 5 files.
2. For each, surface a summary in under 100 words. Cover: what it claims to define, when it was written if discoverable from git/timestamps, whether its content overlaps with `docs/handoff-theme-ui-v2-2026-05-19.md`, and whether anything in it contradicts the 2026-05-19 brief.
3. Per-file recommendation: superseded / merge into the 2026-05-19 brief / keep as-is.
4. Wait for my decision per-file before deleting, merging, or modifying anything.

**Default rule when in doubt:** the 2026-05-19 brief (`docs/handoff-theme-ui-v2-2026-05-19.md`) is authoritative for v2. If anything in the older docs contradicts it, the brief wins.

---

## Sequenced work plan — per-step approval gates

Match the per-step discipline from component-demo's Phase 3: each step surfaces output and **waits for my explicit approval before proceeding to the next**. No batching, no chaining. Do not touch `app/brand/theme/page.tsx` until Step 3 gate clears.

### Step 1 — Read prior handoff docs, surface summaries

Read all 5 files listed above. Surface 5 summaries (under 100 words each). Make per-file recommendations: superseded / merge / keep. **Wait for my decision per-file before proceeding.**

### Step 2 — Full v1→v2 inventory pass on `app/brand/theme/page.tsx`

After Step 1 gates clear, do a full audit of `app/brand/theme/page.tsx`. Surface:

- Every v1 role name reference with line number (e.g., `surfaceBrandSubtle` at 562, 563, 568, 577, 761, 792, 803, 822 — and any others not yet identified).
- Every section of the page that handles a part of the theme: primitives, semantic light, semantic dark (if present), typography, gradients, brand assets, pairs (if present), baseFontSize.
- What's missing vs. v2: cross-field validation? Canonical role enforcement? P14 weight validation? Cascade preview? Auto-compute midStopHex?
- What's present in the v1 implementation that's been deprecated or restructured in v2: surface the specifics (e.g., if there's a `gradients.subtle.tint` field as a separately-named primitive, it's been replaced by reading the `brandSubtle` role).

Output as a structured inventory table or list with file:line citations. **Wait for my approval before proceeding to Step 3.**

### Step 3 — Migration plan addressing all 9 deliverables

After Step 2 gates clear, produce a migration plan covering all 9 of these deliverables. For each, state: what changes in the UI, where (file + section), how it satisfies the principle/requirement, and any open questions.

1. **Solstice portability check.** The UI must successfully ingest `schema/themes/solstice.json` from the component-demo brief reference (warm-saturated single-color brand, serif H1 absent, 16 primitives, 19 light + 15 dark semantic roles). Round-trip: read → edit no fields → write → diff = 0. Demonstrates the schema isn't single-brand.

2. **Cross-field validation.** JSON Schema validates SHAPE but NOT cross-field references. The UI must check at edit time: every value in `semantic.{light,dark}` must reference a primitive name that exists in `primitives`. Surface clear errors when refs are dangling.

3. **P14 font-weight validation.** For each `(role, family, weight)` triple in `typography`, query the font's actually-shipped weight set (Google Fonts Developer API or a maintained catalogue). Reject themes that declare weights the font doesn't ship — browser font synthesis is forbidden per P14. Surface actionable error messages.

4. **P15 dual-semantic `primary` — value picker exposes role refs AND primitive refs.** When a downstream data field needs a "brand-surface accent" color, the field author should be able to choose either the `primary` role ref OR a primitive ref directly (e.g., `javvyPurple`). The UI's role-mapping editor must support both. Document the dual-semantic tension in the UI next to the `primary` editor.

5. **Canonical 19-role enforcement.** Role names must come from the closed v2 vocabulary (the `SemanticRoleName` union in `theme-schema.ts`). UI must not allow users to invent new role names. Treat the role set as closed per P11.

6. **Surface cascade visual preview (P2).** Side-by-side or toggle preview of the same mock page rendered on `light` surface and `dark` surface. P2 (surface-aware cascade, not a light/dark mode toggle) is the most non-obvious part of the schema — visual preview is the only way to make it tangible to brand authors.

7. **P12 coordinated values guidance (`brandSubtle` ↔ gradient).** When the user picks a "brand-subtle wash" primitive for `semantic.{surface}.brandSubtle`, the UI must default `gradients.subtle.midStopHex` (auto-computed per Q6 above) to reflect that primitive choice. Explain the coupling visibly. Allow manual override only via the explicit toggle from Q6.

8. **P17 `dark.foreground` paper-class warning.** When a brand author authors `semantic.dark.foreground`, the UI must warn (or block) if the referenced primitive is not a "paper-class" primitive (high-luminance, low-chroma). Caption-text contrast on brand-surface backgrounds depends on this. Document the fragility in the UI next to the `dark.foreground` editing field.

9. **Step 6.5 cascade fix in UI preview render path.** The UI's preview must follow the same resolution pattern as the production renderer: role-named backgrounds (`bg: 'primary'`) resolve to the primitive var (`var(--c-{primitive})`) at the current surface context, NOT to the role var. This prevents the cascade-rebinding bug fixed in `lib/color-tokens.ts:bgWithSurface()` in component-demo. Mirror the logic in the UI's preview render code.

Surface the plan as a structured document with one section per deliverable. **Wait for my approval before any code edits.**

### Step 4 — Implementation

After Step 3 gates clear, implement the migration plan. Each deliverable becomes its own logical commit. Surface diff for each before moving to the next.

---

## Standing rules for this engagement

- **No DB writes.** Q3 is settled — UI stays local-state-only.
- **No new components for variations.** Match the existing UI's compositional pattern.
- **Vendor schema is the source of truth for shape.** Imports go through `lib/theme-schema/`, not from any other location.
- **Vendor `hexToOklch` is the source of truth for OKLCH conversion.** Imports go through `lib/hex-to-oklch.ts`.
- **Surface findings before acting.** If you discover something that contradicts this prompt or the 2026-05-19 brief, surface it as a question — don't silently assume.
- **One step at a time.** Per-step gate discipline matches the rhythm we used in component-demo's Phase 3.

Q1 (repo location: `beckettashley/reporting`) and Q4 (v1 state observed) are settled. Start with Step 1.
