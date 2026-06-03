# Theme Handoff

> **▲ v2 CORRECTION (2026-06-03):** The "v1" contract and "Phase 1 / Phase 2"
> language below were interim and are **superseded by v2** (shipped 2026-05-19).
> Canonical lives in-repo at `lib/theme-schema/` (component-demo `2fbc394` +
> local `ctaBorderHover`/`midStopHexDark`). Current state: **`docs/THEME-STATUS.md`**.

---

This folder packages everything the *other* Claude Code instance (prototyping the theme-generation app) needs in order to produce themes that match what the merchant portal already accepts.

It is the read-only schema-and-defaults reference. Nothing in here implies code changes to the source portal — the source portal's `app/brand/theme/page.tsx` is the runtime that consumes themes, and it is staying as-is.

---

## What's in here

| File | What it is | Use it when... |
|---|---|---|
| `theme-schema.md` | **Start here.** Complete schema, defaults, role descriptions, JSON output format, validation checklist. | Always. Single source of truth for what "a theme" is. |
| `theme-preview-snippet.md` | A self-contained 320×880px HTML/CSS snippet that demonstrates every theme token in context. | When you want to see a generated theme rendered visually. Drop the JSON values into the CSS variables at the top of the snippet. |
| `theme-tokens.html` | Open in a browser. Canonical token table with examples and notes for every variable. | When you want a deeper reference on what a specific token does. |
| `KICKOFF_PROMPT.md` | Paste into the new Claude Code session as your first message. | Once. To prime the new agent with full context. |

---

## What's NOT in here

- **The runtime portal code.** The portal that consumes generated themes lives in a separate repo. The generation app being prototyped doesn't need to know how the portal renders — only what shape the portal expects.
- **Brand corpus / scraping logic.** That's the generation app's job to design; this handoff is what the agent must *produce*, not how it must scrape.
- **Workflow / procedures.** Those are the prototype's whole point — define them in the new repo, validate them, iterate.

---

## How a generation agent uses this

1. Read `theme-schema.md` end-to-end — that's the contract.
2. Scrape / analyze the brand (whatever procedure the prototype tests).
3. Produce a JSON object matching the schema in `theme-schema.md` "Output Schema" section.
4. Run the validation checklist (also in `theme-schema.md`).
5. Optionally render the result by dropping the values into `theme-preview-snippet.md` to verify visually.

---

## Notes on what's intentionally out-of-scope for the theme

The schema only covers brand-collected fields. Everything **template-level** is set per page template, not per brand:

- Spacing scale (padding, margins, gaps)
- Border radius
- Shadow definitions
- Motion / animation timing
- Gradient geometry (template controls the shape; brand supplies accent colors)
- Type scale step sizes (template maps heading roles to specific px sizes)
- Component layout (button padding, card structure, section ordering)

A brand that needs to influence those is asking the wrong question — they should be picking a different template, or requesting a new template variant.
