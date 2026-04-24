# Deferred Improvements Backlog

Track features, components, and ideas that have been removed, paused, or
intentionally deferred. Each entry records what was removed, why, where the
original code lives (so we can recover it), and which phase it belongs to.

When resuming an entry, move it to **Status: In progress** with a short note,
then delete the entry once it ships (or archive under "Shipped" if worth
keeping the context).

---

## Phases

- **Phase 1** — Core reporting primitives (KPIs, per-ad performance, learnings)
- **Phase 2** — Insight/alert layer (system-detected changes, anomaly detection)
- **Phase 3** — Cross-merchant internal views, benchmarking
- **Phase 4** — Automation hooks (agent actions, suggested experiments)

Phase is a rough signal of sequence, not a commitment.

---

## Deferred entries

### External factor alerts / "System-detected changes" panel
- **Phase:** 2
- **Removed from:** `components/dashboard/ads.tsx` — 2026-04-16
- **Original location:** component was named `ExternalFactorsPanel`, rendered above the filter/search row on the Ads page. Alert cards keyed off `externalFactors` in `lib/data.ts`.
- **What it did:** surfaced timestamped callouts for campaign-level changes (budget shifts, audience edits, campaign launches, cost spikes). Four color-coded types: `campaign` / `budget` / `audience` / `cost`, each with a matching icon + left-border accent.
- **Why deferred:** the "system-detected" framing promises more than the current data supports — these alerts are hand-authored today and without a real detection backend we'd be shipping theater. Revisit once there's an actual change-detection job producing real events.
- **Recovery path:** `git log -- components/dashboard/ads.tsx` around 2026-04-16 for the `ExternalFactorsPanel` component, `factorConfig` constant, and the `<ExternalFactorsPanel />` call site. The `externalFactors` array + `ExternalFactor` type are still exported from `lib/data.ts` — intentionally kept as scaffolding for the recovery.
- **When we pick this up:** expand the types beyond four, source events from the detection pipeline, consider whether alerts belong on Ads, Experiments, or a dedicated Insights feed.
