# Kickoff Prompt — Paste into the new claude-code session

> **▲ v2 CORRECTION (2026-06-03):** This kickoff and any "v1 contract" it points
> to are historical. Canonical is now **v2** (shipped 2026-05-19), vendored
> in-repo at `lib/theme-schema/` (component-demo `2fbc394` + local additions).
> Current state: **`docs/THEME-STATUS.md`**.

> _This kickoff has already run; it is retained only as a record of how the
> theme-generation prototype was bootstrapped._

---

Copy everything between the `---` lines below and paste it as your first message in the prototype repo.

---

I'm prototyping a **theme generation app**: an LLM-driven workflow that scrapes a brand's online presence and produces a brand theme matching a known schema. The goal is to validate the procedures and checklists I'm using — does the agent reliably produce a theme I'd actually accept?

The theme schema is fixed (it's defined by an existing merchant portal that consumes themes). Your job is to read the schema, then help me design and iterate on the generation procedures.

## Read first

In `theme-handoff/`:

1. `README.md` — what's in this folder, how to use it
2. `theme-schema.md` — **the contract.** Every field, every default, every validation rule the generated theme must satisfy. Read end-to-end before doing anything else.
3. `theme-preview-snippet.md` — a self-contained HTML/CSS preview tile for visualizing a generated theme. Drop generated values into its CSS variables to see the result.
4. `theme-tokens.html` — open in a browser if you need a deeper token reference.

## What the prototype is testing

Three things, in order:

1. **Scraping** — given a brand's website / Shopify / social presence, can the agent extract enough material to make defensible theme decisions? (Logo, brand colors, type voice, tone.)
2. **Defining** — given the scraped material, can the agent make decisions that fill the schema? (Specifically: pick fonts that match voice, pick semantic colors, set base size, etc.)
3. **Validating** — does the output pass the validation checklist in `theme-schema.md` *and* does it look right when rendered through `theme-preview-snippet.md`?

The output format is the JSON object in `theme-schema.md` → "Output Schema" section. The agent doesn't need to write code that *applies* the theme — it just produces the JSON, and the (separate) portal consumes it.

## What I want from this session

In rough priority:

1. Read the schema and tell me anything that's unclear, contradictory, or missing.
2. Help me design the **scraping procedure** — what sources to pull from (Meta ads / Shopify / About page / footer / social), what signals to extract from each (logo URLs, color samples, font references, voice tone).
3. Help me design the **defining procedure** — given scraped material, the decision tree for filling each schema field. Especially: how to handle conflicting signals (e.g. brand uses three different fonts in different contexts — pick which one for which role).
4. Help me design the **validation checklist** — beyond what's already in `theme-schema.md`, what would you flag in a brand's specific case? (e.g. "the brand's primary blue fails contrast against pure white background — adjust or escalate.")
5. Build a small test harness so I can run the procedure end-to-end on a sample brand and see the resulting theme JSON + rendered preview.

## What I do NOT want

- Don't build a production-quality runtime. This is a prototype to validate procedures.
- Don't propose changes to the schema — it's fixed by the consuming portal.
- Don't add fields the portal doesn't consume (don't invent border-radius decisions, motion specs, etc. — those are template-level, see schema doc's "What's NOT in the Theme" section).
- Don't auto-merge ambiguous signals silently. When the scraping returns conflicting evidence, I want the agent to surface the conflict and either resolve it explicitly or escalate.

## Constraints worth flagging

- **Font availability**: the consuming portal loads from Google Fonts. If a brand uses a custom commercial font (e.g. a paid foundry font), the schema's `font` value should be `"Custom"` and the file would be uploaded separately by the merchant. The agent should detect this and not silently pick a Google substitute that doesn't match.
- **Auto-contrast**: button text colors get auto-derived at runtime from button background luminance. The agent populating `buttonPrimaryText` / `buttonSecondaryText` is mostly a no-op for visual correctness; what matters is the button background.
- **Semantic colors are semantic**: `negative` should read as red, `positive` as green, `starRating` as amber. Don't reassign these to brand-arbitrary hues even if the brand's palette would suggest otherwise. They have semantic meaning that overrides aesthetic preference.

---

That's the kickoff. Read `theme-handoff/README.md` first, then `theme-schema.md`, then come back with questions before designing procedures.
