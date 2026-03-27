# Project: Component Demo — Headless CMS Grid System

## What this is
A Next.js demo app proving out a new component architecture for a headless CMS.
The core idea: instead of creating a new component for every visual variation, a small set of primitive content types (textBox, image, video, ctaButton, etc.) are composed inside a configurable grid of cells. Each cell has a width, style, and an ordered list of content blocks. The result is a flexible layout engine that can replicate virtually any page section with a handful of actual React components.

Deployed to Vercel: https://component-demo-three.vercel.app/
GitHub: https://github.com/beckettashley/component-demo
Vercel project: https://vercel.com/ashley-mttrcas-projects/component-demo

---

## Stack
- **Framework:** Next.js 16.2.0 (App Router, React 19)
- **Language:** TypeScript — `.tsx` for all production code (`ignoreBuildErrors: true` in next.config.mjs — run `pnpm verify` to catch type errors)
- **Styling:** Tailwind CSS v4 — use `cn()` from `@/lib/utils` for conditional classes
- **Design tokens:** shadcn/ui conventions (`bg-card`, `border-border`, `text-muted-foreground`, etc.)
- **Icons:** lucide-react
- **Package manager:** pnpm (pnpm-lock.yaml present — always use `pnpm`, never `npm`)
- **Persistence:** localStorage (no backend — demo-only)
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
  page.tsx                  # Main editor page — GridEditor + GridPreview side by side
types/
  grid.ts                   # GridConfig, GridCell, CellContent, ContentType, CellStyle, GridStyle
lib/
  grid-render.tsx           # GridPreview — renders a live GridConfig as HTML/CSS
  utils.ts                  # cn() helper
components/
  grid/
    grid-editor.tsx         # Left sidebar editor — cell/content CRUD
    cell-editor.tsx         # Per-cell content and style editor
    mini-grid-editor.tsx    # Visual layout drag/width editor
    rich-text-editor.tsx    # Tiptap rich text editor
    component-library.tsx   # COMPONENT_LIBRARY — all content type definitions
    component-picker.tsx    # Dialog for adding components to a cell
```

### Viewport sizes
```typescript
type ViewportSize = "desktop" | "tablet" | "mobile"
// widths: desktop=1200, tablet=768, mobile=375
```

### Preset persistence
Presets are saved and loaded via **localStorage** — no backend required.

- Storage key: `"grid-presets"`
- Stored format: `{ name: string; config: GridConfig }[]`
- Hardcoded `SAMPLE_CONFIGS` in `page.tsx` serve as factory defaults
- Factory defaults are **never written to localStorage** — always injected at runtime, can't be deleted
- User presets: saved with a name, loaded from dropdown, deletable
- UI: "Save Preset" button in header → name prompt → writes to localStorage; dropdown shows factory + user presets in separate groups; trash icon deletes user presets only

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
- **Run `pnpm verify` before committing.** If it fails, fix the errors first.
- **Never create a new component for a visual variation** — that is exactly what this architecture is designed to avoid. If a new visual need arises, add a `variant` prop or a new content type instead.
- **Commit each logical unit separately.** One concern per commit.
- **Do not add features beyond what was asked.** Keep solutions minimal and focused.
- **Do not create files unless absolutely necessary.** Prefer editing existing files.
