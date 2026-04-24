# Reporting Dashboard Constitution

## Core Principles

### I. Dashboard Architecture
**Data-driven reporting with clear audience separation.** The reporting system serves two audiences: internal teams and merchants. Internal views show aggregate platform performance across all merchants. Merchant views show individual funnel performance and experiment results. Views must be clearly scoped and never leak cross-merchant data.

**Rationale:** Clear audience separation prevents data leaks and ensures each user sees only what is relevant to their role.

### II. UI/UX Standards
**All design decisions are governed by `.claude/knowledge/uiux-principles.md`.** This document contains 19 principles grounded in Nielsen's Usability Heuristics, Don Norman's *The Design of Everyday Things*, Laws of UX, and WCAG 2.2 AA standards.

**Non-negotiables:**
- Empty, loading, and error states designed for every component
- Keyboard navigation and ARIA compliance (WCAG 2.2 AA minimum)
- 4.5:1 contrast ratio for body text
- Visual hierarchy established through size, weight, and spacing — not color alone
- Consistency in interaction patterns across all surfaces

### III. Code Quality
**TypeScript strict mode is mandatory.** All production code must pass `pnpm verify` before commit.

**Required practices:**
- No `any` types without explicit justification comment
- Parallel data fetching for independent operations
- Server Components by default; `'use client'` only when necessary
- All async operations have defined error handling
- Environment variables for all secrets — never hardcoded

### IV. Scope Control
**Build the minimum viable implementation.** Every task has an explicit boundary. When that boundary is reached, stop and present results.

**Rules:**
- Restate the requirement before implementing
- Flag scope expansion before proceeding
- One concern per implementation pass
- When finished, stop — do not infer next steps

## Technical Stack Constraints

**Framework:** Next.js 15+ (App Router only)
**Language:** TypeScript with strict mode
**Styling:** Tailwind CSS v4 (use `cn()` from `@/lib/utils` for conditional classes)
**Deployment:** Vercel (auto-deploy from `main` branch)
**Package Manager:** pnpm exclusively

**File Conventions:**
- All production code in `.tsx` files
- Server Components by default
- shadcn/ui design token conventions
- Icons from lucide-react exclusively

## Governance

**Authority hierarchy:** This constitution > CLAUDE.md > feature specs.

**Version**: 1.0.0 | **Ratified**: 2026-04-15
