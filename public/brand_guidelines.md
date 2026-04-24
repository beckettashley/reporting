# Brand Guidelines — Upstream Contract

> **Last updated:** 2026-04-23
> **Status:** Contract drafted. Upstream producer (scraping + human overlay pipeline) pending implementation.
> **Sibling contract:** `brand_theme.md` (visual identity)

Upstream contract for the brand's **editorial identity** — positioning, voice, claims, social proof, narrator personas, and vertical compliance declaration. Produced by a pipeline that scrapes the brand's website, applies LLM-assisted inference with evidence spans for judgment fields, and accepts a human-reviewed overlay for content that cannot be scraped.

---

## What This Contract Carries

Everything editorial that informs how copy is generated for a brand:
- **Identity** — name, domain, product names, legal links
- **Positioning** — what the brand sells, to whom, why it wins
- **Voice** — how the brand sounds on the page
- **Claims** — what the brand can truthfully assert (verified) and what it must never assert (banned)
- **Social proof** — what testimonials, press, and ratings exist
- **Narrator personas** — the characters used in advertorials (when the brand has established narrators)
- **Vertical declaration** — the category label that drives compliance rule selection

Not in this contract:
- Visual identity — colors, fonts, logos, buttons → `brand_theme.md`
- Compliance rules themselves — live in `registries/compliance_rules.json`, selected by `vertical_declaration.vertical`
- A/B test history, internal KPIs, conversion data — out of scope

The shape is consumed by:
- **S3 resolveBucketStrategy** — feasible tone pool filtered by brand voice; vertical declaration routes compliance rules
- **S4 buildVariantProfileSet** — narrator persona pool feeds the `narrator_persona` axis
- **S5 selectSkeleton** — narrator persona influences advertorial skeleton compatibility
- **S8 compileSectionContext** — every section's context slice includes voice profile, lexicon, tone examples, licensed claims
- **S12 validatePage** — forbidden-phrase validation uses `claims.banned`

---

## Field Tiers

Three tiers, distinguished by how each field is produced and which authority wins in conflicts.

### Tier A — Scrape baseline (deterministic)

Extracted directly from public pages via HTML/structured-data parsing. No LLM judgment required.

- `identity.*`
- `legal_links[]`
- `social_links[]`
- `social_proof.press_mentions[]` (scraped from "As seen in" bands, schema.org `org.sameAs`, etc.)
- `social_proof.rating_aggregates[]` (schema.org `AggregateRating`)
- `social_proof.testimonials_available.count` (if a review widget exposes a count)

### Tier B — LLM-inferred from scrape (with evidence)

Requires LLM judgment applied to scraped content. Every non-trivial field carries an `evidence` entry with source URL + verbatim quote span.

- `positioning.*`
- `voice.*` (advisory — see authority rules below)
- `claims.verified[]` (extracted from product pages, about pages, FAQs; each with source + span)
- `vertical_declaration.vertical` (inferred from category signals on site)
- `stated_target_icp.*` (brand's self-described audience, from About / positioning copy)
- `competitors_mentioned[]` (only if site names competitors)

### Tier C — Human overlay (cannot be scraped)

Content that has no public source and must come from human review or out-of-band knowledge.

- `claims.banned[]` — phrases / stats forbidden by legal, regulatory, or brand policy
- `voice.signature_voice_examples[]` — reviewer-approved per-section samples (authoritative; overrides Tier B voice inference)
- `narrator_persona_pool[]` — advertorial narrator characters (consistent across campaigns; authored by team)
- `vertical_declaration.jurisdictions[]` — explicit jurisdictions the brand operates in
- `vertical_declaration.known_regulator_correspondence` — any regulator warnings or findings on record

### Authority rules (when tiers conflict)

1. **Voice:** Tier C (human-reviewed voice examples) > Tier B (scrape-inferred voice) > `brand_theme.personality` (advisory seed only).
2. **Claims:** Tier C `banned` is a hard filter applied AFTER Tier B `verified` extraction. A claim on the scraped site that also appears in `banned` is treated as banned.
3. **ICP:** Brand's stated ICP (Tier B, from positioning copy) is *framing signal* for voice/tone decisions. The ad pipeline's `FunnelGenerationContext.persona` describes the *realized* audience from ad targeting, and is authoritative for pipeline gating (awareness level, sophistication). When they conflict, both are retained; generation uses ad-side persona for gating and brand-side ICP for voice shaping.

---

## Data Model

```ts
type BrandGuidelines = {
  // -------------------- Tier A — scrape baseline --------------------

  identity: {
    name:          string                              // "FluffCo"
    product_name:  string                              // "FluffCo Luxury Hotel Pillow"
    domain:        string                              // "fluffco.example.com"
    legal_links:   Array<{ label: string, url: string }>
    social_links:  Array<{ platform: string, url: string }>
  }

  // -------------------- Tier B — LLM-inferred with evidence --------------------

  positioning: {
    one_line_positioning: string                       // "Hotel-grade pillows at home-friendly prices."
    evidence:    Array<EvidenceSpan>
    confidence:  number                                // 0..1
  }

  stated_target_icp: {                                 // brand's framing intent (option b)
    audience_description:           string             // prose, scraped from About/positioning pages
    inferred_sophistication_stage:  1|2|3|4|5 | null   // per Schwartz
    inferred_awareness_level:       1|2|3|4|5 | null   // per Schwartz
    notes:                          string
    evidence:                       Array<EvidenceSpan>
    confidence:                     number
    // NOTE: FunnelGenerationContext.persona is authoritative for pipeline gating.
    //       This field is advisory, for voice / tone shaping.
  } | null

  voice: {
    voice_profile: {
      formality:  'casual' | 'conversational' | 'professional' | 'formal'
      energy:     'low' | 'medium' | 'high'
      pronouns:   'first_person' | 'second_person' | 'third_person_editorial'
      register:   'peer' | 'authority' | 'narrator' | 'expert'
    }
    voice_adjectives:   string[]                       // 3–5 adjectives
    sentence_patterns:  string[]                       // recurring rhythms observed
    signature_phrases:  string[]                       // phrases the brand uses repeatedly
    brand_nouns:        string[]                       // proprietary names, invented terms
    signature_voice_examples: Array<{                  // Tier C overlay — authoritative when present
      section_kind_id:   string
      approved_example:  string                        // short sample prose
      source:            'human_authored' | 'from_brand_doc' | 'scraped_approved'
    }>
    advisory:    boolean                               // true if scrape-only; false after human review
    evidence:    Array<EvidenceSpan>
    confidence:  number
  }

  claims: {
    verified: Array<{                                  // Tier B — scraped with evidence
      claim:       string
      type:        'product' | 'performance' | 'authority' | 'regulatory' | 'customer_count' | 'rating'
      source_url:  string
      quote_span:  string                              // verbatim passage grounding the claim
    }>
    banned: string[]                                   // Tier C — human overlay; regex patterns allowed
  }

  social_proof: {
    press_mentions: Array<{
      outlet:      string
      mention:     string
      source_url:  string                              // page where the mention appears on the brand's site
    }>
    testimonials_available: {
      count:       number | null
      types:       Array<'text' | 'video' | 'photo' | 'verified_review'>
      source_urls: string[]
    }
    rating_aggregates: Array<{
      platform:      string                            // "Trustpilot", "Google", "Shopify", etc.
      rating:        number                            // e.g. 4.8
      review_count:  number
      source_url:    string
    }>
  }

  competitors_mentioned: Array<{
    name:            string
    differentiator:  string | null                     // one-line diff as stated on the brand's own site
    source_url:      string
    quote_span:      string
  }>

  // -------------------- Tier C — human overlay / authored --------------------

  narrator_persona_pool: Array<{
    id:               string                           // snake_case, stable
    display_name:     string                           // "Janet, hotel manager"
    name:             string                           // "Janet"
    occupation:       string
    years_experience: number | null
    setting:          string                           // "5-star hotel"
    voice_snippets:   string[]                         // 2–4 illustrative sentences
    source:           'human_authored' | 'from_brand_doc' | 'ingested'
  }>

  vertical_declaration: {
    vertical:                         VerticalEnum
    jurisdictions:                    string[]         // Tier C overlay — e.g. ["US", "CA"]
    known_regulator_correspondence:   string | null    // Tier C overlay
    evidence:                         Array<EvidenceSpan>
    confidence:                       number
  }

  // -------------------- Governance --------------------

  provenance: {
    // Scrape layer
    scraper_version:   string                          // e.g. "brand-guidelines-scraper.v1.0"
    scraped_at:        string                          // ISO8601
    page_inventory:    Array<{                         // which URLs were scraped
      url:   string
      role:  'home' | 'about' | 'product' | 'reviews' | 'press' | 'faq' | 'legal' | 'blog' | 'other'
    }>

    // LLM inference layer (for Tier B fields)
    llm_inference_version:    string | null
    llm_inference_called_at:  string | null

    // Human overlay layer (for Tier C fields)
    human_overlay_version:     string | null
    human_overlay_reviewed_by: string | null
    human_overlay_reviewed_at: string | null
    human_overlay_changes:     string[]                // summary of what the reviewer added/edited
  }

  confidence: {
    identity:      number
    positioning:   number
    voice:         number
    claims:        number
    social_proof:  number
    vertical:      number
    overall:       number
  }
}

type EvidenceSpan = {
  field_path:  string                                  // dot path into the BrandGuidelines payload
  source_url:  string
  quote_span:  string                                  // verbatim passage from scraped content
}

type VerticalEnum =
  | 'supplement'
  | 'food_beverage'
  | 'beauty_cosmetics'
  | 'apparel'
  | 'home_goods'
  | 'electronics'
  | 'fitness_equipment'
  | 'health_wellness'
  | 'saas_software'
  | 'financial_services'
  | 'education'
  | 'other'
```

---

## Field Rules

### Identity

- `domain` is the canonical root (no scheme, no trailing slash). Scraper normalizes.
- `legal_links` captures footer links that meet specific role heuristics (Privacy, Terms, Returns, Shipping, Accessibility, Do Not Sell). Link labels preserved verbatim.
- `social_links` captures outbound social-profile URLs. Platform is inferred from URL host.

### Positioning

- `one_line_positioning` MUST be a single sentence ≤ 160 chars. LLM is instructed to compose from hero + about copy, with evidence spans citing specific passages.
- If the site doesn't support a confident one-liner inference (low information), field is present with `confidence` below a threshold and the reviewer is prompted to overlay a human-authored version.

### Stated Target ICP (option b)

- `audience_description` is the **brand's self-description** of who they serve — prose drawn from positioning copy. NOT the same as `FunnelGenerationContext.persona`, which is the ad-targeting-derived realized audience.
- `inferred_sophistication_stage` and `inferred_awareness_level` are advisory. Authoritative values for pipeline gating come from `FunnelGenerationContext.persona`.
- When both this field and `FunnelGenerationContext.persona` exist, the generation pipeline uses persona for gating and stated_target_icp for voice shaping (e.g., the brand targets problem-aware readers, but the ad is reaching product-aware readers — voice stays brand-shaped, skeleton reflects realized awareness).

### Voice

- `voice_profile.{formality, energy, pronouns, register}` enums per the BrandVoiceEntry schema in `registries/README.md`.
- `voice_adjectives[]` 3–5 short adjectives — "authoritative, warm, candid" not "a very friendly and professional tone that feels like talking to a trusted advisor."
- `signature_voice_examples[]` is the **authoritative** sub-field — reviewer-approved per-section samples. When present, pipeline treats the associated field values as locked and uses the sample as a few-shot reference in S8.
- `advisory: true` signals the voice profile is scrape-only. The pipeline can use it, but generation quality is lower than when Tier C voice examples exist.

### Claims

- `claims.verified[]` contains only claims with a source URL and verbatim quote span. Claims without evidence are not admitted.
- `claims.banned[]` supports both literal strings and regex patterns (`/pattern/flags` syntax). S12 validator uses these against every generated candidate before the variant is eligible.
- If a claim appears both in `verified` (scraped) and `banned` (overlay), **banned wins** — the scraped claim is forbidden regardless.

### Narrator persona pool

- Optional. Most brands don't have consistent narrator personas. When present, populates the `narrator_persona` axis of the variant profile space for advertorial generation.
- Each persona is a concrete character — name, occupation, setting — NOT an abstract archetype. Voice snippets anchor tone across the narrator's sections.
- Source tracking: `human_authored` means team-written from scratch; `from_brand_doc` means lifted from a brand-provided document; `ingested` means extracted from scraped content and reviewer-approved.

### Vertical declaration

- `vertical` is a single enum. Drives compliance rule selection in `registries/compliance_rules.json`.
- `jurisdictions[]` narrows rule bundles (e.g., `"US"` + `"CA"` selects US FTC rules and Canadian Consumer Packaging rules).
- `known_regulator_correspondence` is optional free-text. When present, compliance rules are applied more strictly.

---

## Evidence Discipline

Every Tier B field with a `confidence` score MUST carry at least one `EvidenceSpan` in its `evidence[]` array. Fields without evidence are treated as Tier C (human overlay) and must be explicitly authored, not inferred.

Evidence spans look like:

```json
{
  "field_path": "positioning.one_line_positioning",
  "source_url": "https://fluffco.example.com/about",
  "quote_span": "We bring hotel-grade comfort home — the same pillows 5-star resorts use, at a fraction of their retail price."
}
```

Review tooling surfaces these spans alongside each field so a reviewer can verify the inference grounds in specific text.

---

## Versioning

- Every payload carries `provenance.scraper_version`, `provenance.llm_inference_version`, `provenance.human_overlay_version` — three independently versioned layers.
- Pipeline cache keys include all three. A re-scrape, a re-inference, or an overlay edit each produce a new cache entry.
- `human_overlay_version` bumps automatically on every reviewer commit. Overlay changes are not silent.

---

## Mapping to `brand_voice/<merchant>/` Registry

The `brand_voice` registry entry is the **persisted form** of this contract's voice + narrator sub-trees, reviewed and cached per merchant. Mapping:

| BrandGuidelines field | brand_voice entry field |
|---|---|
| `voice.voice_profile` | `voice_profile` |
| `voice.signature_voice_examples[]` | `tone_examples[]` |
| `voice.sentence_patterns[]` | `signature_rhythms[]` |
| `voice.signature_phrases[]` + `voice.brand_nouns[]` | `lexicon.preferred_terms[]`, `lexicon.brand_nouns[]` |
| `claims.banned[]` | `lexicon.forbidden_terms[]` (union) |
| `narrator_persona_pool[]` | `narrator_persona_pool[]` |
| `stated_target_icp.*` | `story_archetype_hints[]` seeds |

When a generation invocation arrives with a fresh `brand_guidelines` payload AND a cached `brand_voice/<merchant>` entry exists:
- Tier C fields (human-reviewed) from the cached entry override Tier B fields from the fresh payload
- Tier A fields merge (never conflict by construction)
- Freshly-scraped `claims.verified[]` with later `scraped_at` timestamps replace older cached claims

A `brand_voice/<merchant>` fallback chain exists for merchants without any per-merchant entry:
1. Try `brand_voice/<merchant_id>/` entry
2. Fall back to generic `brand_voice/_default.yaml`
3. Runtime BrandGuidelines input (when provided) always layered on top

---

## Fallback When Contract Is Absent

Not every merchant will have a fully-populated `BrandGuidelines` payload at the start. Minimum-viable input:

```ts
type BrandGuidelinesMinimal = {
  identity: { name, product_name, domain }
  vertical_declaration: { vertical, jurisdictions: [], known_regulator_correspondence: null, evidence: [], confidence: 0.5 }
  provenance: { scraper_version: 'none', scraped_at, page_inventory: [], ... }
  confidence: { overall: 0.3, ... }
}
```

With just identity + vertical, the pipeline can still produce pages using:
- Generic `brand_voice/_default.yaml` for voice
- Empty narrator persona pool (advertorial generation declines or uses `brand_voice/_default.yaml.narrator_persona_pool`)
- No banned-claim filtering
- Compliance rules selected by vertical only

Quality degrades gracefully; the pipeline doesn't halt on missing brand input.

---

## Open Questions

- **Scraping pipeline owner.** `brand_guidelines` and `brand_theme` will both need an upstream producer. Is this a separate project to stand up, or a component of an existing service? Affects versioning coordination.
- **Review UI.** Tier C overlay editing is currently file-based (edit YAML in `registries/brand_voice/<merchant>/`). A reviewer UI is Milestone 8+ work.
- **Multi-brand merchants.** A merchant with multiple sub-brands may need multiple `brand_guidelines` payloads, one per sub-brand. Currently one-merchant-one-brand is assumed. Revisit if it becomes a real case.
- **Competitor enrichment.** `competitors_mentioned[]` only captures what the site names. External competitor lists (what the market says) would come from a separate research source; out of scope for this contract.
- **Automated detection of `advisory: false`.** When Tier C overlay is added to voice, the pipeline should flip `advisory: false` automatically. Worth specifying the state-transition rule explicitly in the scraper pipeline.

---

## Related Contracts

- `brand_theme.md` — visual sibling (colors, typography, components, logos)
- `ad_pipeline.md` — `FunnelGenerationContext.persona` is the realized audience (authoritative for pipeline gating)
- `offer_generation.md` — `content_contract` (pricing / CTA / savings; consumed by offer_block)
- `registries/compliance_rules.json` — rules selected by `vertical_declaration.vertical`
- `registries/brand_voice/<merchant>/` — persisted, reviewed form of voice + narrator pool
- `content_generation_spec.md` — consuming pipeline

---

## Changelog

| Date | Version | Change |
|---|---|---|
| 2026-04-23 | v0 | Initial contract drafted. Tier split (A scrape / B LLM-inferred / C human overlay) established. ICP kept as brand's framing intent (option b) alongside FunnelGenerationContext.persona. Visual identity split out to `brand_theme.md`. |
