# Claude Code Best Practices
### Operating Reference for AI Agents

This document defines how AI agents should operate when working with Claude Code and Claude Cowork to build and deploy web applications. It is written for agents, not humans. Follow these rules on every task without being prompted.

---

## CLAUDE.md — Project Context File

Every project must have a `CLAUDE.md` file at the repository root. This is the first file an agent reads at session start. It encodes everything the agent needs to operate without re-explanation.

### What goes in CLAUDE.md
```markdown
# Project: [Name]

## What this is
[One paragraph: what the app does, who it's for, what stage it's at]

## Stack
[Framework, language, database, deployment target, key libraries]

## Project structure
[Key directories and what lives in them — not an exhaustive tree, just enough to navigate]

## Data model
[Core entities and their relationships — or a pointer to the schema file]

## Commands
- `npm run dev` — local development
- `npm run build` — production build
- `npm run verify` — pre-deploy check (build + lint + type check)
[Any other project-specific commands]

## Environment variables
[List every env var, what it's for, and where to set it — never include actual values]

## Conventions
[Coding patterns, naming rules, file organization rules specific to this project]

## Current state
[What is built, what is in progress, what is planned — update this as the project evolves]

## Agent rules
[Any project-specific behavioral rules — e.g., "always run verify before committing", "never modify the seed data without asking"]
```

### Why this matters
Without CLAUDE.md, every session starts from zero. The agent guesses at conventions, re-asks questions that were answered in prior sessions, and makes inconsistent decisions. CLAUDE.md is the single source of truth for project context. Keep it updated as the project evolves.

### Rules
- Every project has one. No exceptions.
- Update it when conventions change, new env vars are added, or the project structure shifts.
- It is not documentation for humans — it is operating context for agents. Be precise, not narrative.

---

## Core Operating Principles

### Understand before implementing
Never write code in response to an ambiguous request. Before any implementation task:
1. Restate the requirement in one sentence
2. Identify which files will be created or modified
3. State the approach and why
4. Wait for confirmation if anything is unclear

### Spec before code

For any feature work, choose the appropriate workflow based on scope:

#### For New Features (>3 files, data model changes, new types)

**Use the formal spec-kit workflow** to create persistent, version-controlled specifications:

1. **`/speckit-specify`** — Create feature spec with quality validation
   - Generates spec.md with requirements, user stories, success criteria
   - Runs quality checklist automatically (completeness, clarity, testability)
   - Resolves critical clarifications (max 3 questions)
   - Output: `.specify/features/[number]-[name]/spec.md`

2. **`/speckit-clarify`** (if ambiguities remain)
   - Interactive clarification (max 5 questions)
   - Updates spec.md with answers incrementally
   - Validates completeness across functional/data/UX/non-functional requirements

3. **`/speckit-plan`** — Generate technical implementation plan
   - Creates plan.md (tech stack, architecture, file structure)
   - Generates data-model.md (entities, relationships, validation rules)
   - Creates contracts/ (API specs, test requirements)
   - Generates research.md (technical decisions, alternatives considered)
   - Updates agent context files

4. **`/speckit-tasks`** — Break down into dependency-ordered tasks
   - Generates tasks.md organized by user story
   - Checklist format with parallel execution markers [P]
   - Shows task dependencies and execution order
   - Identifies MVP scope

5. **`/speckit-checklist [domain]`** — Generate quality gates before implementing
   - `ux` for UI features (hierarchy, states, accessibility)
   - `api` for endpoints/services (error handling, validation, security)
   - `security` for auth/data protection
   - `performance` for optimization work
   - Checklists validate **requirement quality** (completeness, clarity, consistency)

6. **`/speckit-implement`** — Execute tasks with progress tracking
   - Processes tasks.md phase by phase
   - Checks quality gates before starting
   - Tracks completion, marks tasks done
   - Validates against original spec

**Workflow:** `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-checklist` → `/speckit-implement`

#### For Small Changes (<3 files, no data model changes)

**Use the "say it back" rule** for lightweight, in-chat specs:

1. Write a brief spec covering:
   - What the feature does (one paragraph)
   - Data requirements — where data comes from, how often it changes
   - Files to create or modify (complete list)
   - Server vs Client component decisions with reasoning
   - Empty, loading, and error states
   - Any guardrails or constraints

2. Present the spec and explicitly ask: *"Here is my understanding of what we're building. Is this correct?"*

3. Wait for confirmation before writing any code

4. If the user corrects the spec, update it and confirm again

**The "say it back" rule:** Before implementing, restate the requirement in your own words. This catches misunderstandings before they become code. If the user says "build X" and you write back "I understand you want Y" — and Y is wrong — you just saved hours of rework.

Do not skip the spec because the feature "seems simple." Simple features have a way of being complex once you start writing code.

### One task at a time
Do not attempt multiple independent concerns in a single response. If a request involves both a UI change and a schema change, split them and complete one before starting the other.

### Scope control and stopping criteria
Every task has a boundary. Respect it.

**Before starting work, define the stopping point.** If the user says "build X," confirm what X includes and — critically — what it does not include. Then stop when X is done.

**Rules:**
- Do only what was asked. Do not "while I'm here" adjacent work without asking.
- When you finish the stated task, stop and show what you did. Do not continue to the next logical step unless asked.
- If you discover adjacent work that would be valuable, surface it as a suggestion — not an implementation: *"I noticed Y could also benefit from Z. Want me to do that next, or is this task done?"*
- If a task is taking longer than expected or revealing more complexity than scoped, stop and report: *"This is more involved than expected because [reason]. Here's what I've done so far. Should I continue or adjust the approach?"*

**Explicit stopping patterns the user can invoke:**
- "Do only X, then stop and show me" — implement X, present results, wait
- "Draft this but don't commit" — write code, do not run git commands
- "Plan only" — produce a spec, do not write code
- "Fix only this file" — do not touch other files even if they have related issues

**When the agent goes off-rails:** If the agent is over-engineering, refactoring beyond scope, or continuing past the ask — the correct intervention is a scope reset: *"Stop. Show me what you've done. The scope is [X] only."* Agents must respect this immediately and not argue for the additional work.

---

## Session Management

### Context discipline
Load only what is relevant to the current task. Do not reference files, schemas, or prior decisions unless they directly affect the current implementation.

### Handoff continuity
When a task spans multiple sessions, produce a `HANDOFF.md` before closing:
```
## Task
[What was being built]

## Status
[What is complete, what is not]

## Next step
[Exactly what to do next, in one sentence]

## Relevant files
[List only files that the next session needs to load]

## Decisions made
[Any architectural or product decisions that should not be relitigated]
```

### Output to files always
Never give code only in the conversation window. Every file must be written to disk. Every response that produces code must end with a list of files written.

---

## Code Quality Rules

### Never ship without these
- TypeScript strict mode — no `any` without a comment explaining why
- Error handling on every async operation
- Loading and error states for every data-fetching component
- Environment variables for all secrets — never hardcoded
- `next/image`, `next/link`, `next/font` — never raw HTML equivalents

### Always parallelize independent data fetching
```ts
// Wrong — sequential waterfall
const user = await getUser(id)
const settings = await getSettings(id)

// Correct — parallel
const [user, settings] = await Promise.all([getUser(id), getSettings(id)])
```

### Default to Server Components
Use `'use client'` only when the component requires browser APIs, event handlers, or React hooks. Push client boundaries as deep in the tree as possible.

### Minimize client prop serialization
Pass only the fields a Client Component actually uses — not entire objects.

---

## Verification Before Completion

Before marking any task done, verify:
- [ ] `next build` passes with no errors
- [ ] TypeScript strict mode passes with no errors
- [ ] No `console.log` in production code
- [ ] No hardcoded secrets or localhost URLs
- [ ] All new environment variables documented
- [ ] All files written to disk and listed

---

## API Route Changes — Server Restart Required

After any commit that includes changes to files under `src/app/api/`, restart the dev server so the new code is actually running:

```bash
pkill -f "next dev" 2>/dev/null; sleep 2
npm run dev &
```

Report the URL Next.js starts on (it may shift ports if 3000 is still occupied) so the user knows which port to use for curl calls and browser testing. Never assume the old server is running the new code.

---

## Escalation Rules

Stop and ask the user when:
- The data model is unclear — do not infer schema from context
- A request requires a product decision (auth strategy, real-time vs polling, etc.)
- A technical constraint conflicts with the stated requirement
- The task scope is larger than originally stated

Do not silently expand scope. Do not silently make product decisions.

---

*These rules apply to every session regardless of task type. They are not suggestions.*
