# Product Principles
### Decision Reference for AI Agents Building Internal Tools

This document defines the product standards that govern what gets built, how scope is determined, and what makes an internal tool good. It is written for AI agents. Apply these principles when making product decisions without being prompted.

---

## What Makes a Good Internal Tool

An internal tool succeeds when it makes a specific repeated task faster, more reliable, or less error-prone for the person using it. It fails when it is incomplete, fragile, or requires explanation to use.

The bar is not aesthetic. The bar is: does it work reliably, and does it get out of the way?

Apply the following in order of priority:

1. **It works correctly** — data is accurate, actions do what they say, errors are recoverable
2. **It is fast to use** — common tasks require minimum clicks and zero navigation archaeology
3. **It handles failure gracefully** — empty states, errors, and loading states are designed, not absent
4. **It is consistent** — same patterns, same labels, same behaviors across every surface
5. **It looks appropriate** — clean, legible, not distracting

---

## Scope Rules

### Build the smallest thing that works
For any feature, identify the minimum implementation that delivers the stated value. Do not add functionality beyond the stated requirement without asking.

Before implementing, ask: what is the one thing this feature must do? Build that. Nothing else.

### What "done" means
A feature is done when:
- It works correctly for the primary use case
- It handles empty, loading, and error states
- It does not break existing functionality
- It is deployed and accessible

A feature is not done because the code is written. It is done when it works in production.

### Scope creep rule
If implementing a requirement reveals adjacent work that is not in scope, stop and surface it:
> "To build X, I also need to address Y. That is not in the current scope. Should I include it or flag it for later?"

Do not silently expand scope. Do not silently defer work without documenting it.

### Stopping criteria
Every task has an explicit end point. When that point is reached, stop and present what was done.

- When the user says "do X," the task is done when X is done — not when X plus everything adjacent to X is done
- When finished, present the result and wait. Do not automatically continue to the next logical step.
- If the task is taking longer or revealing more complexity than expected, stop and report status: *"Here's where I am. This is more involved than expected because [reason]. Should I continue or adjust scope?"*
- If the user sets an explicit stopping point ("do only X, then stop"), respect it exactly — do not do X+1 even if it seems obviously needed

---

## Data and Schema Decisions

### Never infer schema
Do not assume the shape of a database table, API response, or data structure. Ask before designing around data you have not confirmed.

### Data model changes are irreversible
Treat any schema migration as a high-stakes decision. Before proposing a schema change:
- State what the change is
- State what data will be affected
- Confirm before executing

### Single source of truth
Every piece of data should have one authoritative source. Do not sync the same data across multiple tables or stores unless there is an explicit, justified reason.

---

## User Experience Rules for Internal Tools

### Every screen has one job
Define the primary action before designing or building any screen. If a screen has two equally important primary actions, it should be two screens.

### Empty states are features
Every list, table, dashboard, or data view must have a designed empty state. An empty state is not a blank screen — it tells the user why there is no data and what to do next.

### Errors must be actionable
An error message that does not tell the user what to do next is not an error message — it is noise. Every error must include:
- What happened
- Whether it is recoverable
- What the user should do

### Confirmation before destruction
Any action that deletes, archives, or permanently modifies data requires explicit confirmation. The confirmation must state the consequence, not just ask "are you sure?"

---

## Decision Authority

When product decisions arise during implementation, resolve them in this order:

1. **Check this document** — is there a principle that resolves it?
2. **Check the feature spec** — does the stated requirement answer it?
3. **Ask the user** — if neither resolves it, stop and ask. Do not guess on product decisions.

Product decisions that always require user input:
- Authentication and authorization approach
- Data retention or deletion behavior
- External integrations not already in the spec
- Any change to existing data structures

---

## What to Never Build Without Being Asked

- User roles or permissions systems beyond what is specified
- Analytics or tracking beyond what is specified
- Email or notification systems beyond what is specified
- Multi-tenancy if the spec is single-user
- Mobile optimization if the spec is desktop-only

Build what is asked. Surface additions as suggestions, not implementations.

---

*These principles apply to every product decision regardless of task type. When in doubt, build less and ask.*
