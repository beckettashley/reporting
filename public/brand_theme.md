# Brand Theme — Upstream Contract

> **Last updated:** 2026-04-23
> **Status:** Contract shape received. Consumed by `generateBucket()` as a runtime input.
> **Sibling contract:** `brand_guidelines.md` (editorial / voice / claims)

Upstream contract for the brand's **visual identity** — colors, typography, spacing, components, images, and the inferred design personality. Produced by a scraping pipeline that reads the brand's website CSS and page structure, with LLM-assisted inference for logo selection and button classification.

---

## What This Contract Carries

Purely visual identity. Not voice. Not positioning. Not claims. Anything editorial belongs to `brand_guidelines.md`.

The shape is consumed by:
- **S14 assemblePage** — CTA buttons, logos, favicon, color palette render into page chrome and offer-block styling
- **S8 compileSectionContext** — sections with image_hint slots receive the theme palette so downstream image generation stays on-brand
- **Section registry entries** with `brand_theme_binding` — named slots read named theme components

Not consumed by:
- S9 section candidate generation (visual palette does not influence slot-fill text)
- Scent planting (visuals aren't scent)

---

## Production Pipeline (upstream, already built)

```
Brand URL
  │
  ▼
Step 0: fetch + parse HTML, CSS, computed stylesheets       [DET]
Step 1: extract color palette                               [DET]
        (primary/secondary/accent/background/text/link from computed styles)
Step 2: extract fonts + font stacks                         [DET]
Step 3: extract spacing + border radius conventions         [DET]
Step 4: detect candidate logo(s) + candidate button(s)      [DET]
Step 5: classify primary logo / primary button              [LLM]
        → __llm_logo_reasoning, __llm_button_reasoning
Step 6: infer personality (tone, energy, target audience)    [LLM]
        advisory — seeds brand_guidelines.voice via ingestion
Step 7: compose confidence per dimension                    [DET]
```

Tier discipline — deterministic scrape for everything computable, LLM only where judgment is required (logo choice, button role assignment, personality). Every LLM call's reasoning is preserved in a sibling `__llm_*_reasoning` block.

---

## Data Model

```ts
type BrandTheme = {
  // Identity
  colorScheme: 'light' | 'dark'                       // top-level mode

  // Color palette
  colors: {
    primary:      string                              // hex, e.g. "#FF8182"
    secondary:    string
    accent:       string
    background:   string
    textPrimary:  string
    link:         string
  }

  // Typography
  fonts: Array<{
    family: string                                    // e.g. "Poppins"
    role:   'body' | 'heading' | 'display' | 'mono'
  }>

  typography: {
    fontFamilies: {
      primary:  string                                // primary site font
      heading:  string
    }
    fontStacks: {                                     // ordered fallback list per role
      heading:   string[]
      body:      string[]
      paragraph: string[]
    }
    fontSizes: {                                      // CSS length units, e.g. "16px"
      h1:   string
      h2:   string
      body: string
    }
  }

  // Spacing + shape
  spacing: {
    baseUnit:     number                              // pixels — site's base spacing unit
    borderRadius: string                              // default radius, e.g. "8px"
  }

  // Components (extensible — each component has styling)
  components: {
    buttonPrimary:   ComponentStyle
    buttonSecondary: ComponentStyle
    // future: input, card, badge, countdown_timer, scarcity_band
  }

  // Image assets
  images: {
    logo:     string | null                           // absolute URL to primary logo asset
    favicon:  string | null
    ogImage:  string | null
    logoHref: string                                  // where the logo links on rendered pages
                                                      // (typically "/" or the brand's root URL;
                                                      //  "#" means not yet determined — renderer should default to "/")
  }

  // Inferred personality (advisory; authoritative voice lives in brand_guidelines.voice)
  personality: {
    tone:            string                           // e.g. "modern", "warm", "authoritative"
    energy:          'low' | 'medium' | 'high'
    targetAudience:  string                           // short prose description
    _advisory:       true                             // reminder: brand_guidelines.voice overrides
  }

  // Design-system metadata (optional)
  designSystem: {
    framework:        'custom' | 'tailwind' | 'bootstrap' | 'material' | 'chakra' | 'unknown'
    componentLibrary: string                          // name or empty string
  }

  // LLM audit trail — preserved verbatim for every LLM call
  __llm_logo_reasoning: {
    selectedIndex: number
    reasoning:     string
    confidence:    number                             // 0..1
    source:        'llm' | 'heuristic'                // 'heuristic' if LLM unavailable / failed
  } | null

  __llm_button_reasoning: {
    primary: {
      index:     number
      text:      string                               // visible label on the selected button
      reasoning: string
    }
    secondary: {
      index:     number
      text:      string
      reasoning: string
    } | null
    confidence: number
  } | null

  __llm_metadata: {
    logoSelection: {
      llmCalled:     boolean
      llmSucceeded:  boolean
      finalSource:   'llm' | 'heuristic' | 'default'
      rawLogoSelection?: unknown
    }
    buttonClassification: {
      llmCalled:     boolean
      llmSucceeded:  boolean
    }
    personalityInference?: {
      llmCalled:     boolean
      llmSucceeded:  boolean
    }
  }

  // Confidence per dimension
  confidence: {
    colors:   number
    buttons:  number
    fonts?:   number
    logo?:    number
    overall:  number
  }

  // Provenance
  provenance: {
    scraper_version:  string                          // e.g. "brand-theme.v1.0"
    scraped_at:       string                          // ISO8601
    source_url:       string                          // brand root URL or specific page scraped
    page_inventory:   Array<{ url: string, role: string }> // e.g. role: "home", "product", "about"
  }
}

type ComponentStyle = {
  background:   string                                // hex or CSS color value
  textColor:    string
  borderRadius: string                                // short form (may equal all corners)
  borderRadiusCorners: {                              // long form for asymmetric corners
    topLeft:     string
    topRight:    string
    bottomRight: string
    bottomLeft:  string
  }
  shadow:       string                                // CSS shadow value or "none"
}
```

---

## Field Tiers

| Tier | What it carries | Authority when in conflict |
|---|---|---|
| **Scrape-deterministic** | colors, fonts, typography, spacing, components (raw CSS), images (raw URLs), designSystem | Authoritative — computed from stylesheets |
| **LLM-inferred** | logo selection (from candidates), primary/secondary button assignment, personality | Advisory — audit trail preserved in `__llm_*_reasoning` |
| **Reasoned/computed** | confidence scores, colorScheme classification | Derived from above |

The `personality` block is explicitly *advisory*. It seeds `brand_guidelines.voice` via ingestion but does not override the human-reviewed voice profile. When both `brand_guidelines.voice` and `brand_theme.personality` are present, the pipeline reads voice from brand_guidelines.

---

## Field Rules

### Colors

All color values are hex strings in `#RRGGBB` format (6-digit). Pipeline does not attempt color-space conversion or accessibility scoring; downstream rendering is responsible for contrast checks.

### Typography

- `fontFamilies.primary` is the site's dominant font; most body text uses it.
- `fontStacks` always include a generic fallback (`sans-serif`, `serif`, `monospace`) as the last element.
- `fontSizes` carry CSS length strings (typically `px` or `rem`). Pipeline does not normalize units.

### Spacing

- `baseUnit` is in **pixels** by convention (usually 4 or 8).
- `borderRadius` is a CSS length string. When a site uses distinct corner radii, the per-component `borderRadiusCorners` takes precedence over the component's short-form `borderRadius`.

### Components

- Every entry in `components` conforms to `ComponentStyle`.
- Component set is extensible — future scrapers may produce `card`, `input`, `badge`, `countdown_timer` entries. Unknown components are opaquely passed through; consumers render from the specific components they know.

### Images

- `logo`, `favicon`, `ogImage` are absolute URLs (or `null` if not detected).
- `logoHref` is the destination the logo links to on rendered pages. Values:
  - Absolute URL (e.g. `"https://example.com/"`) — honored as-is
  - Relative path (e.g. `"/"`) — resolved against the rendered page's origin
  - `"#"` — placeholder; renderer defaults to `"/"`

### LLM audit blocks

- `__llm_*_reasoning` blocks are `null` when the LLM was not called (pipeline fell back to heuristics).
- When present, every field is preserved verbatim from the LLM's structured output.
- Downstream can gate on `__llm_metadata.*.llmSucceeded` to distinguish LLM-confirmed selections from heuristic fallbacks.

### Confidence

- Per-dimension scores in `[0, 1]`. Higher is more confident.
- `overall` is a composite; pipeline computes it, but consumers can re-weight per dimension.
- Suggested gating: `colors < 0.7` or `overall < 0.6` → fall back to neutral palette in renderer with a warning.

---

## Consumption Bindings

Generation-pipeline sections consume `brand_theme` via `brand_theme_binding` fields in the section registry. Named bindings:

| Section kind | Slot | Binding |
|---|---|---|
| `offer_block` | `cta` styling | `components.buttonPrimary` |
| `pdp_hero` | `cta` styling | `components.buttonPrimary` |
| `nav_bar` | `brand_logo` | `images.logo` + `images.logoHref` |
| `urgency_band` | color palette | `colors.primary`, `colors.background` |
| `guarantee_band` | badge accents | `colors.accent` |
| `feature_chips` | chip background | `colors.background`, `colors.secondary` |
| any section with `image_hint_contract` | palette hints | `colors.*` propagated to image-gen prompt |

Section registry entries carry `brand_theme_binding` declarations so the renderer knows which theme fields feed which slots. Adding a new binding is a section_registry version bump, not a theme contract change.

---

## Versioning

- Every `BrandTheme` payload carries `provenance.scraper_version` (semver-like, e.g. `"brand-theme.v1.0"`).
- Pipeline cache keys include `scraper_version`. Re-scraping the same URL with a newer scraper produces a new cache entry.
- `scraped_at` is absolute; re-scrape TTL is a consumer-side decision (not part of the contract).

---

## Mapping to `brand_voice/<merchant>/` Registry

The `personality` block is ingested (advisory) into the merchant's `brand_voice` registry entry as seed values for:

| brand_theme.personality | brand_voice entry (seed, advisory) |
|---|---|
| `tone` | `voice_profile.register` hint (narrator/peer/authority/expert) |
| `energy` | `voice_profile.energy` |
| `targetAudience` | `story_archetype_hints[]` entry (advisory) |

Ingestion flags these fields as `advisory_from_brand_theme` in provenance. Human review either accepts them as-is or overrides. The live `brand_voice` entry is authoritative at generation time; the ingestion-time seeding is a first-pass convenience, not an authority claim.

---

## Sample Payload

See `tests/fixtures/advertorial-fluffco.fixture.json` §`brand_theme` for a realistic FluffCo-shape payload. Key characteristics of the sample:

- Light mode, single-font (`Poppins`), 8px border radius
- Primary button `#434780` (accent color) with white text
- Secondary button near-white with square corners (`borderRadius: 0px`)
- Logo URL present, `ogImage` null (not scraped), `logoHref: "#"` (renderer defaults to `/`)
- LLM classification succeeded for both logo and buttons; reasoning preserved in `__llm_*_reasoning`
- Overall confidence 0.925

---

## Open Questions

- **Component extensibility.** The scraper currently emits `buttonPrimary` + `buttonSecondary`. What other components does the upstream pipeline plan to produce (inputs, cards, countdown timers)? The contract is structurally open; concrete consumer bindings wait on upstream output.
- **ogImage fallback.** When `images.ogImage` is null, should the generation pipeline auto-compose one (hero image + logo overlay) or leave it for downstream image gen? Currently the pipeline treats it as a stub.
- **`logoHref` normalization.** Scraper outputs `"#"` when href wasn't extracted. The contract permits this as a placeholder; renderer defaults to `"/"`. Worth confirming this is the right upstream convention.
- **Per-variant theming.** Thompson+MC bandit may eventually test CTA color variants or button-shape variants. Those would inject overrides into `brand_theme.components.*` per variant. Not MVP; noted for future.

---

## Related Contracts

- `brand_guidelines.md` — editorial sibling (voice, claims, positioning, narrator personas, vertical declaration)
- `ad_pipeline.md` — `FunnelGenerationContext` (ad-derived context)
- `offer_generation.md` — `content_contract` (pricing / CTA text / savings)
- `content_generation_spec.md` — consuming pipeline

---

## Changelog

| Date | Version | Change |
|---|---|---|
| 2026-04-23 | v0 | Contract shape received from upstream scraper. FluffCo sample payload validates structure. |
