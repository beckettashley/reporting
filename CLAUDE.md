# Project: Reporting Prototype — Headless Ecommerce CMS

## What this is
A Next.js prototype for a reporting dashboard serving two audiences:
1. **Internal team** — visibility into how the autonomous funnel-variant creation and experimentation engine is performing across all merchants
2. **Merchants (clients)** — self-serve reporting on their funnel performance, variant experiments, and conversion metrics

The platform autonomously creates and experiments with funnel variants on behalf of merchants. This reporting layer surfaces the results, insights, and performance data from that experimentation.

---

## Stack
- **Framework:** Next.js 15+ (App Router, React 19)
- **Language:** TypeScript — `.tsx` for all production code
- **Styling:** Tailwind CSS v4 — use `cn()` from `@/lib/utils` for conditional classes
- **Design tokens:** shadcn/ui conventions (`bg-card`, `border-border`, `text-muted-foreground`, etc.)
- **Charts:** Recharts (already installed)
- **Icons:** lucide-react
- **Package manager:** pnpm (pnpm-lock.yaml present — always use `pnpm`, never `npm`)
- **Hosting:** Vercel (auto-deploy from GitHub `main`)

---

## Project structure
```
app/
  layout.tsx              # Root layout
  page.tsx                # Landing / dashboard page
  globals.css             # Tailwind + design tokens
components/
  ui/                     # shadcn/ui primitives (Button, Card, Table, Chart, etc.)
  theme-provider.tsx      # Dark/light mode provider
hooks/
  use-mobile.ts           # Mobile detection hook
  use-toast.ts            # Toast notification hook
lib/
  utils.ts                # cn() helper
```

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
- **Tailwind is the styling pattern** — not inline styles. Use design tokens for UI chrome.
- **cn() for conditional classes** — always use `cn()` from `@/lib/utils`, never string concatenation.
- **Lucide for all icons** — do not import from other icon libraries.
- **Server Components by default** — only add `'use client'` when hooks/interactivity are needed.
- **Recharts for data visualization** — already installed, use for all charts and graphs.

---

## Current state

### Built and working
- Next.js app scaffold with Tailwind CSS v4 and shadcn/ui components
- Full shadcn/ui component library (cards, tables, charts, tabs, dialogs, etc.)
- Theme provider (dark/light mode support)
- Recharts charting library installed

### Not yet built
- Reporting dashboard UI
- Internal vs merchant reporting views
- Data models for experiments, funnels, variants, and metrics
- API routes for reporting data
- Database integration

---

## Agent rules
- **Run `pnpm verify` before committing.** If it fails, fix the errors first.
- **Commit each logical unit separately.** One concern per commit.
- **Do not add features beyond what was asked.** Keep solutions minimal and focused.
- **Do not create files unless absolutely necessary.** Prefer editing existing files.

---

## Feature Development Workflow

### When to Use Spec-Kit
Use the formal spec-kit workflow for:
- **New dashboard views** (internal reporting, merchant reporting, experiment details)
- **Data model design** (experiments, funnels, variants, metrics schemas)
- **Major UI additions** (new pages, complex interactive components)
- **Features touching >3 files** or requiring new TypeScript types

### When to Use Standard Agent Workflow
Use the standard pre-execution loop for:
- **Bug fixes** (rendering issues, interaction bugs, type errors)
- **Style tweaks** (color, spacing, layout adjustments)
- **Single-file changes** (component refactors, utility additions)

### Spec-Kit Commands
- **`/speckit-specify`** — Create feature spec with quality validation
- **`/speckit-clarify`** — Resolve ambiguities in spec
- **`/speckit-plan`** — Generate implementation plan
- **`/speckit-tasks`** — Break down into dependency-ordered tasks
- **`/speckit-checklist [domain]`** — Generate quality gates (`ux`, `api`, `security`, `performance`)
- **`/speckit-implement`** — Execute tasks with progress tracking

**Workflow:** `/speckit-specify` → `/speckit-clarify` (if needed) → `/speckit-plan` → `/speckit-tasks` → `/speckit-checklist` → `/speckit-implement`

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
| Code, types, data models, API routes | senior-engineer |
| Dashboard UI, layout, chart design | senior-engineer + product-designer |
| New reporting view end-to-end | senior-engineer + product-designer |
| Bug, broken rendering, data issues | debugger + senior-engineer |
| UI bug | debugger + senior-engineer + product-designer |

### Pre-execution loop
Before writing any code, the invoked agents must:
1. Restate the requirement in one sentence
2. Identify files to create or modify
3. Flag any conflicts with conventions
4. State the approach and confirm before proceeding

### Session shortcuts
Say once at session start — applies for the entire session:
- `eng mode` — senior-engineer agent for all tasks
- `design mode` — product-designer agent for all tasks
- `full mode` — senior-engineer + product-designer for all tasks
- `debug mode` — debugger + senior-engineer for all tasks

Default when no mode is set: senior-engineer applies to all tasks.

### Standing rule
Do not cite these documents in responses unless asked. Apply them — don't perform them.
