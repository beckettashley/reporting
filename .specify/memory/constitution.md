# Component Demo Constitution

## Core Principles

### I. Component Architecture
**Grid-based composition with no nesting.** The grid is a flat, single-dimensional list of cells. Width percentages determine visual columns—no row model exists. Content types (textBox, image, video, ctaButton, etc.) are the sole extension point for new capabilities. New visual variations MUST be achieved through component props, variants, or new content types—never by creating new top-level React components.

**Rationale:** This architecture prevents component proliferation and ensures the CMS can represent virtually any page section with a handful of primitive types. Adding a new component for every visual variation defeats the purpose of a flexible layout engine.

### II. Type-Prefixed Props
**All content-type-specific props MUST use the type name as a prefix.** Examples: `videoUrl`, `videoAutoplay`, `ctaText`, `ctaUrl`, `articleAuthor`, `productComparisonItems`. Never use unprefixed props like `url`, `text`, or `items` on content blocks.

**Rationale:** Type prefixes prevent prop name collisions when multiple content types coexist in the same cell. The flat content model requires explicit namespacing to avoid ambiguity in the data structure.

### III. UI/UX Standards
**All design decisions are governed by `.claude/knowledge/uiux-principles.md`.** This document contains 19 principles grounded in Nielsen's Usability Heuristics, Don Norman's *The Design of Everyday Things*, Laws of UX, and WCAG 2.2 AA standards. Every component, layout, and interaction pattern must be defensible against these principles.

**Non-negotiables:**
- Empty, loading, and error states designed for every component
- Keyboard navigation and ARIA compliance (WCAG 2.2 AA minimum)
- 4.5:1 contrast ratio for body text
- Visual hierarchy established through size, weight, and spacing—not color alone
- Consistency in interaction patterns across all surfaces

**Rationale:** Design quality is not subjective. These principles represent established best practices from industry-leading design systems (Linear, Stripe, Vercel, GOV.UK). Adherence ensures usability and accessibility by default.

### IV. Code Quality
**TypeScript strict mode is mandatory.** All production code must pass `pnpm verify` (tsc --noEmit --skipLibCheck) before commit. The Vercel React Best Practices document is the canonical reference for all React/Next.js code decisions.

**Required practices:**
- No `any` types without explicit justification comment
- Parallel data fetching for independent operations (eliminate waterfalls)
- Server Components by default; `'use client'` only when necessary
- All async operations have defined error handling
- Environment variables for all secrets—never hardcoded
- `next/image`, `next/link`, `next/font` exclusively—never raw HTML equivalents

**Rationale:** TypeScript errors do not block Vercel builds (`ignoreBuildErrors: true` in next.config.mjs), making `pnpm verify` the only quality gate. Manual enforcement is the only defense against type drift.

### V. Scope Control
**Build the minimum viable implementation.** Every task has an explicit boundary. When that boundary is reached, stop and present results. Do not refactor adjacent code, add features beyond the request, or continue to the next logical step without explicit user confirmation.

**Rules:**
- Restate the requirement before implementing
- Flag scope expansion before proceeding
- One concern per implementation pass
- When finished, stop—do not infer next steps

**Rationale:** Scope creep is the primary source of wasted effort. Agents must respect task boundaries to avoid reimplementing work after misunderstanding the requirement.

## Technical Stack Constraints

**Framework:** Next.js 15+ (App Router only)
**Language:** TypeScript with strict mode
**Styling:** Tailwind CSS v4 (use `cn()` from `@/lib/utils` for conditional classes)
**Database:** Neon Postgres via `@neondatabase/serverless`
**Deployment:** Vercel (auto-deploy from `main` branch)
**Package Manager:** pnpm exclusively (pnpm-lock.yaml is source of truth)

**File Conventions:**
- All production code in `.tsx` files
- Server Components by default (no `'use client'` unless required)
- shadcn/ui design token conventions (`bg-card`, `border-border`, `text-muted-foreground`)
- Icons from lucide-react exclusively

## Development Workflow

**Feature Development:**
- Small changes (<3 files, no data model changes): Standard agent pre-execution loop
- New features (content types, major UI, data model changes): Formal spec-kit workflow (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`)
- Major refactors: `/speckit-plan` to document current vs. target state

**Quality Gates:**
- Run `/speckit-checklist` before implementing major features (domains: `ux`, `api`, `security`, `performance`)
- Run `/speckit-analyze` before major features to validate cross-artifact consistency
- Run `pnpm verify` before every commit (enforced manually—not in git hooks)

**Agent Authorities:**
- **Senior Engineer:** Code architecture, data fetching, performance, TypeScript, deployment
- **Product Designer:** Layout, visual hierarchy, UX flow, accessibility, interaction patterns
- **Debugger:** Root cause analysis, regression investigation, error resolution

## Governance

**Authority hierarchy:** This constitution > CLAUDE.md > feature specs for principle enforcement. When conflicts arise, constitutional principles are non-negotiable within the scope of implementation. If a principle itself needs revision, that requires explicit constitutional amendment outside normal feature work.

**Compliance verification:**
- All agents MUST verify constitutional compliance before major changes
- `/speckit-analyze` automatically checks for principle violations
- Pre-commit verification via `pnpm verify` is mandatory (not automated, manually enforced)

**Amendment process:**
- Principle changes require version bump (MAJOR for breaking changes, MINOR for additions, PATCH for clarifications)
- All amendments documented in constitution with rationale
- Dependent templates (.specify/templates/*.md) updated to reflect changes

**Runtime guidance:**
- CLAUDE.md provides project context (stack, structure, commands, current state)
- `.claude/knowledge/` contains domain-specific references (best practices, product principles, UX principles)
- `.claude/global-agent-*.md` files define agent roles and authorities

**Version**: 1.0.0 | **Ratified**: 2026-04-06 | **Last Amended**: 2026-04-06
