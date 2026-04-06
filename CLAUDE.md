# Project: Component Demo — Headless CMS Grid System

## What this is
A Next.js demo app proving out a new component architecture for a headless CMS.
The core idea: instead of creating a new component for every visual variation, a small set of primitive content types (textBox, image, video, ctaButton, etc.) are composed inside a configurable grid of cells. Each cell has a width, style, and an ordered list of content blocks. The result is a flexible layout engine that can replicate virtually any page section with a handful of actual React components.

Deployed to Vercel: https://component-demo-three.vercel.app/
GitHub: https://github.com/beckettashley/component-demo
Vercel project: https://vercel.com/ashley-mttrcas-projects/component-demo

---

## Stack
- **Framework:** Next.js 15.2.0 (App Router, React 19)
- **Language:** TypeScript — `.tsx` for all production code
- **Styling:** Tailwind CSS v4 — use `cn()` from `@/lib/utils` for conditional classes
- **Design tokens:** shadcn/ui conventions (`bg-card`, `border-border`, `text-muted-foreground`, etc.)
- **Icons:** lucide-react
- **Package manager:** pnpm (pnpm-lock.yaml present — always use `pnpm`, never `npm`)
- **Persistence:** Neon Postgres (`@neondatabase/serverless`) via API routes — `DATABASE_URL` env var required
- **Hosting:** Vercel (auto-deploy from GitHub `main`)

---

## Core architecture

### Data model
Everything flows through `GridConfig` (defined in `@/types/grid`):
```
GridConfig
  └── cells: GridCell[]          — ordered, flat list (no nesting)
        ├── id: string
        ├── width: number        — percentage of row width (e.g. 100, 50, 40, 60)
        ├── contents: Content[]  — ordered list of content blocks in this cell
        │     ├── id: string
        │     ├── type: ContentType   — "textBox" | "image" | "video" | "ctaButton" |
        │     │                          "articleDetails" | "productComparison" | "spacer" | ...
        │     └── [type-prefixed props]  — e.g. videoUrl, videoAutoplay, ctaText, ctaUrl
        └── style: CellStyle     — backgroundColor, borderColor, borderWidth,
                                   borderRadius, padding, textAlign, alignItems
  └── gridStyle: GridStyle       — backgroundColor, padding, borderRadius, gap
```

### Key conventions
- **Cells are flat** — the grid is a single-dimensional list of cells. Width percentages determine visual columns (two 50% cells sit side by side). There is no row model.
- **Content props are type-prefixed** — to avoid collisions, every content-type-specific prop uses the type name as a prefix: `videoUrl`, `videoAutoplay`, `ctaText`, `ctaBackgroundColor`, `articleAuthor`, etc.
- **Width is a percentage** — always a number (not a string), always sums to 100 within a visual row.
- **Style is flat per-cell** — no nested style objects inside content blocks. Layout/visual styling belongs on the cell, not on individual content items.
- **Viewport is a first-class concept** — `ViewportSize = "desktop" | "tablet" | "mobile"` (widths: 1200, 768, 375). Passed to `GridPreview` and should inform rendering decisions.

### Key files
```
app/
  page.tsx                       # Main editor page — GridEditor + GridPreview side by side
  api/
    presets/route.ts             # GET (list) + POST (upsert) presets — Neon DB
    presets/[id]/route.ts        # DELETE preset by id — Neon DB
types/
  grid.ts                        # GridConfig, GridCell, CellContent, ContentType, CellStyle, GridStyle
  banner.ts                      # BannerConfig, PrimaryBanner, SecondaryBanner, BannerCTA, BannerCountdown
lib/
  grid-render.tsx                # GridPreview — renders a live GridConfig as HTML/CSS
  utils.ts                       # cn() helper
components/
  banner-preview.tsx             # BannerPreview — renders a live BannerConfig (sticky/static, countdown, CTA)
  grid/
    grid-editor.tsx              # Left sidebar editor — cell/content CRUD
    cell-editor.tsx              # Per-cell content and style editor
    mini-grid-editor.tsx         # Visual layout drag/width editor
    rich-text-editor.tsx         # Tiptap rich text editor
    component-library.tsx        # COMPONENT_LIBRARY — all content type definitions
    component-picker.tsx         # Dialog for adding components to a cell
    banner-editor.tsx            # BannerEditor — editor UI for BannerConfig
    color-picker.tsx             # ColorPicker — reusable hex+alpha color input (used in banner-editor)
.claude/
  global-agent-senior-engineer.md   # Senior engineer agent
  global-agent-product-designer.md  # Product designer agent
  global-agent-debugger.md          # Debugger agent
  knowledge/
    claude-code-best-practices.md   # Session operating rules
    product-principles.md           # Product scope and feature decisions
    uiux-principles.md              # Design principles reference
scripts/
  *.mjs                          # One-off dev/data manipulation scripts — not production code
```

### Viewport sizes
```typescript
type ViewportSize = "desktop" | "tablet" | "mobile"
// widths: desktop=1200, tablet=768, mobile=375
```

### Preset persistence
Presets are saved and loaded via **Neon Postgres API routes** — `DATABASE_URL` env var required.

- API: `GET /api/presets` (list), `POST /api/presets` (upsert by name), `DELETE /api/presets/[id]`
- DB table: `presets` with columns `id`, `name`, `sections`, `created_at`, `updated_at`
- Hardcoded `SAMPLE_CONFIGS` in `page.tsx` serve as factory defaults (injected at runtime, never persisted to DB)
- User presets: saved with a name to the DB, loaded from dropdown, deletable
- UI: "Save Preset" button in header → name prompt → POST to API; dropdown shows factory + user presets in separate groups; trash icon deletes user presets via DELETE

### Environment variables
```
DATABASE_URL    — Neon Postgres connection string (server-only, never expose to client)
```

---

## Current state

### Built and working
- Grid editor with flat cell model, width-based layout, viewport preview (desktop/tablet/mobile)
- All core content types: textBox, image, video, ctaButton, bulletList, spacer, divider, badge, starRating, articleDetails, productComparison
- Cell style editor (background, border, padding, alignment)
- Mini grid editor (visual drag/width control)
- Rich text editor (Tiptap)
- Mobile layout system: `hideOnMobile`, `hideOnDesktop`, `mobileOrder` per cell
- Preset system: save/load/delete via Neon DB API routes
- Factory default presets (SAMPLE_CONFIGS in page.tsx — runtime only, not persisted)
- Banner system (types, preview, editor) — **built but not yet wired into page.tsx**
- ColorPicker component — used by banner-editor, available for reuse

### In progress / not yet integrated
- `BannerPreview` + `BannerEditor` + `types/banner.ts` are complete but not mounted in the main editor page

### Not production code
- `scripts/*.mjs` — one-off data manipulation scripts from development

---

## Feature Development Workflow

This project uses **spec-kit for formal feature development** and **standard agent workflow for small changes**.

### When to Use Spec-Kit
Use the formal spec-kit workflow for:
- **New content types** (textBox, video, image, ctaButton extensions or new types)
- **Major UI additions** (new editor panels, preview modes, layout features)
- **Data model changes** (GridConfig, CellStyle, ContentType extensions)
- **Features touching >3 files** or requiring new TypeScript types

### When to Use Standard Agent Workflow
Use the standard pre-execution loop for:
- **Bug fixes** (rendering issues, interaction bugs, type errors)
- **Style tweaks** (color, spacing, border adjustments)
- **Single-file changes** (component refactors, utility additions)
- **Preset additions** (new SAMPLE_CONFIGS)

### Spec-Kit Commands
- **`/speckit-specify`** — Create feature spec with quality validation (generates spec.md, runs requirements checklist)
- **`/speckit-clarify`** — Resolve ambiguities in spec (max 5 interactive questions, updates spec.md)
- **`/speckit-plan`** — Generate implementation plan (creates plan.md, data-model.md, contracts/, quickstart.md)
- **`/speckit-tasks`** — Break down into dependency-ordered tasks (generates tasks.md with checklist format)
- **`/speckit-checklist [domain]`** — Generate quality gates (domains: `ux`, `api`, `security`, `performance`)
- **`/speckit-implement`** — Execute tasks with progress tracking (processes tasks.md phase by phase)
- **`/speckit-analyze`** — Validate cross-artifact consistency (read-only analysis of spec/plan/tasks)

**Workflow:** `/speckit-specify` → `/speckit-clarify` (if needed) → `/speckit-plan` → `/speckit-tasks` → `/speckit-checklist` → `/speckit-implement`

All specs live in `.specify/features/[number]-[name]/` and are version-controlled alongside code.

---

## Commands
```bash
pnpm dev       # Local development (http://localhost:3000)
pnpm build     # Production build
pnpm verify    # tsc --noEmit --skipLibCheck — run before every commit
```

---

## Conventions
- **Never hardcode secrets or API keys.** All env vars in `.env` (gitignored) and Vercel dashboard.
- **Content types are the extension point.** Adding a new capability = adding a new `ContentType` value + rendering logic in `grid-render.tsx` + editor controls in `cell-editor.tsx`. Do not create new top-level components for variations.
- **Props stay type-prefixed.** Every new prop on a content type must be prefixed with the type name (e.g. `imageAlt`, not just `alt`).
- **Width is always a number.** Never store width as a string or CSS value.
- **Tailwind is the styling pattern** — not inline styles. Use design tokens for UI chrome. Inline styles are acceptable inside `GridPreview` when rendering user-configured values (backgroundColor, padding, etc.) from `GridConfig`.
- **cn() for conditional classes** — always use `cn()` from `@/lib/utils`, never string concatenation.
- **Lucide for all icons** — do not import from other icon libraries.

---

## Agent rules
- **Constitution is the authority** — `.specify/memory/constitution.md` contains non-negotiable principles (component architecture, type-prefixed props, UI/UX standards, code quality, scope control). Check before major changes.
- **Use spec-kit for features** — New content types, major UI work, data model changes → formal spec-kit workflow (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`)
- **Quality gates before implementation** — Run `/speckit-checklist [domain]` for quality validation (domains: `ux` for UI features, `api` for endpoints, `security` for auth/data protection, `performance` for optimization)
- **TypeScript errors do not block Vercel builds** (`ignoreBuildErrors: true` in next.config.mjs). `pnpm verify` is the only gate — a green Vercel deploy does not mean type-clean code.
- **Run `pnpm verify` before committing.** If it fails, fix the errors first.
- **Never create a new component for a visual variation** — that is exactly what this architecture is designed to avoid. If a new visual need arises, add a `variant` prop or a new content type instead.
- **Commit each logical unit separately.** One concern per commit.
- **Do not add features beyond what was asked.** Keep solutions minimal and focused.
- **Do not create files unless absolutely necessary.** Prefer editing existing files.

---

## AGENTS

### Agent files
| Agent | File | Activate when |
|---|---|---|
| Senior Engineer | `.claude/global-agent-senior-engineer.md` | Any code, architecture, or technical task |
| Product Designer | `.claude/global-agent-product-designer.md` | Any UI, layout, UX, or component design task |
| Debugger | `.claude/global-agent-debugger.md` | Anything not working as expected |

### Knowledge files
| File | Use when |
|---|---|
| `.claude/knowledge/claude-code-best-practices.md` | Always — governs how to work |
| `.claude/knowledge/product-principles.md` | Any scope or product decision |
| `.claude/knowledge/uiux-principles.md` | Any UI design or review task |

### Agent dispatch
| Task type | Agents |
|---|---|
| Code, types, rendering logic | senior-engineer |
| Editor UI, layout, component design | senior-engineer + product-designer |
| New content type end-to-end | senior-engineer + product-designer |
| Bug, broken rendering, visual regression | debugger + senior-engineer |
| UI bug | debugger + senior-engineer + product-designer |

### Pre-execution loop
Before writing any code, the invoked agents must:
1. Restate the requirement in one sentence
2. Identify files to create or modify
3. Flag any conflicts with the core architecture (flat cells, type-prefixed props, no new components for variations)
4. State the approach and confirm before proceeding

### Post-execution validation
After completing any task, before committing:
- senior-engineer confirms: `pnpm verify` passes, no inline styles on editor UI, no new top-level components created for variations
- product-designer confirms (UI tasks): empty/error/loading states exist, interactions consistent with existing patterns

### Session shortcuts
Say once at session start — applies for the entire session:
- `eng mode` — senior-engineer agent for all tasks
- `design mode` — product-designer agent for all tasks
- `full mode` — senior-engineer + product-designer for all tasks
- `debug mode` — debugger + senior-engineer for all tasks

Default when no mode is set: senior-engineer applies to all tasks.

### Standing rule
Do not cite these documents in responses unless asked. Apply them — don't perform them.
