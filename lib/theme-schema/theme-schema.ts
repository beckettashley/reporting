// ADAPTED from github.com/beckettashley/component-demo/schema/theme-schema.ts
// as of commit cb43d51 (A2 cleanup, ee6095c..cb43d51 on main). Local additions
// (still pending parallel canonical PRs):
//   (1) ctaBorderHover semantic role (cta family)
//   (2) midStopHexDark field on GradientPrimitive (dark-surface counterpart
//       to midStopHex, mirrors the role/roleDark pattern used elsewhere)
// Canonical sync history:
//   - 1b73a46 (2026-05-19) — initial vendor
//   - cb43d51 (A2 cleanup) — TypographyMap trimmed from 13 roles to 10
//     (h5, h6, condensed removed; title/h1–h4/body/ui/accordionQuestion/
//     meta/muted remain)
// Sync rule: when schema changes in component-demo OR locally, update both
// sides BEFORE updating UI consumers.

/**
 * Theme schema for headless CMS theme data — engineering handoff package.
 *
 * Describes a brand's theme: color tokens, typography roles, brand
 * assets, baseFontSize. Standalone — no runtime dependencies, no imports
 * from component-template.
 *
 * SCOPE
 *   In:  PageStyle and supporting types (color primitives + semantic
 *        role mappings + pairing definitions + gradient definitions +
 *        typography role definitions + brand assets + baseFontSize).
 *   Out: Section / Grid / Cell / Content / Banner / OfferCard / etc.
 *        Compositional content shape is template-specific and not
 *        portable across rendering architectures. See
 *        docs/theming-architecture-investigation.md Part 12 for the
 *        production sales-page data-shape comparison.
 *
 * FORMAT
 *   Color values are CSS hex strings (e.g., "#1A1A1A"), matching
 *   production stg.mttr.ca convention. Engineering may convert to HSL
 *   channels or OKLCH at emission time; see
 *   docs/theme-integration-guide.md for trade-offs.
 *
 * VARIANT PATTERN
 *   Engineering's renderer emits a `:root { ... }` CSS block for the
 *   default (light) surface plus a `[data-surface="dark"] { ... }`
 *   block that overrides semantic role active defaults. Sections with
 *   a dark-surface bg primitive render with `<section data-surface="dark">`.
 *
 * APPLICATION
 *   - Server-render the :root + [data-surface="dark"] CSS blocks from
 *     this PageStyle.
 *   - Extend Tailwind config to expose semantic roles as utilities
 *     (bg-primary, text-text-primary, font-h1, etc.).
 *   - Components consume tokens via Tailwind utilities for token-bound
 *     styles. Runtime-dynamic per-instance values from content data
 *     stay as inline style={{}}.
 *
 *   See docs/theme-integration-guide.md for emission patterns,
 *   Tailwind config snippets, and component author conventions.
 */

// ─────────────────────────────────────────────────────────────────────
// Color system
// ─────────────────────────────────────────────────────────────────────

/**
 * Brand-defined primitives: a flat map of brand-specific color names
 * to CSS hex values.
 *
 * Brands choose the names. Conventions:
 *   - camelCase identifier (e.g., `javvyPurple`, `solsticeBurntOrange`)
 *   - brand-prefixed for brand-specific colors (`javvyPurple`) or
 *     universal for shared tokens (`ink`, `paper`, `rule`, `alert`,
 *     `success`, `graphite`).
 *
 * Status primitives (`alert`, `success`, etc.) are universal: they
 * should NOT be brand-tinted. Status communication stays consistent
 * across brand themes.
 */
export type ColorPrimitives = Record<string, string>;

/**
 * Semantic role names. Closed v2 vocabulary.
 *
 * Roles describe semantic intent (foreground, background, brand-accent,
 * primary action). Primitives describe brand identity. Roles map to
 * primitives via SemanticMap.
 *
 * Naming conventions (shadcn-aligned):
 *   - Surface tokens carry the bare name (`background`, `muted`, `primary`).
 *   - Text/icon-on-surface tokens carry the `-Foreground` suffix
 *     (`foreground`, `mutedForeground`, `primaryForeground`).
 *   - Text-only roles that don't sit on a paired surface keep
 *     descriptive names: `textBrand`, `link`, `textAlert`.
 *
 * Role notes:
 *   - `foreground` is the default body text color. Paired with
 *     `background`.
 *   - `muted` is neutral muted surface (shadcn-style — hover states,
 *     disabled UI). Paired with `mutedForeground`. NOT brand-tinted
 *     section wash — see `brandSubtle` for that.
 *   - `brandSubtle` is brand-tinted subtle section wash (extension).
 *     The same primitive typically also serves as `gradients.subtle.tint`
 *     (single brand choice for coordinated values — see design
 *     principles). Paired with `brandSubtleForeground`.
 *   - `warning` is warning-state surface (extension — shadcn doesn't
 *     ship status surfaces beyond destructive). Paired with
 *     `warningForeground`.
 *   - `primary` is the brand-color SURFACE role (cardHeader bands,
 *     accent surfaces, brand-colored badges/captions). NOT the CTA
 *     action color — see `cta` for that. Paired with `primaryForeground`.
 *   - `cta` is the action-button background color (extension). Distinct
 *     from `primary` because brands may use a different color for
 *     actions than for brand-surface expression (Javvy: yellow CTA vs
 *     purple brand surface; Solstice: amber CTA vs burnt-orange brand
 *     surface). Paired with `ctaForeground`. `ctaBorder` / `ctaHover`
 *     refine the action treatment.
 *   - `textBrand` is brand-tinted text in body content (extension —
 *     accents, inline brand emphasis). May share a primitive with
 *     `primary` today but kept distinct because the intent register
 *     differs (text-on-body vs surface).
 *   - `link` is link text. May share a primitive with `textBrand` on
 *     light surfaces but diverges on dark surfaces (link flips to a
 *     readable foreground; brand-text stays brand-tinted).
 *   - `textAlert` is urgency/emphasis text (extension — countdown
 *     timers, "for a limited time only" text). Distinct from shadcn's
 *     `destructive` which is for destructive-action UI.
 *   - `ring` is focus rings/outlines (shadcn-canonical addition).
 */
export type SemanticRoleName =
  // Base pair (shadcn-canonical)
  | 'background'
  | 'foreground'
  // Surface + foreground pairs (shadcn-canonical)
  | 'muted'
  | 'mutedForeground'
  | 'primary'
  | 'primaryForeground'
  // Brand-tinted surface pair (extension — shadcn lacks this concept)
  | 'brandSubtle'
  | 'brandSubtleForeground'
  // Warning surface pair (extension — shadcn lacks status surfaces beyond destructive)
  | 'warning'
  | 'warningForeground'
  // Text-only roles (extensions — shadcn delegates these to consumer choice)
  | 'textBrand'
  | 'link'
  | 'textAlert'
  // Borders + focus (shadcn-canonical)
  | 'border'
  | 'ring'
  // CTA family (extension — brand reality: action ≠ brand-surface)
  | 'cta'
  | 'ctaForeground'
  | 'ctaBorder'
  | 'ctaHover'
  | 'ctaBorderHover';

/**
 * Map from semantic role name to a primitive name.
 *
 * The primitive must exist in ColorPrimitives. References to missing
 * primitives should be validated at emission time (see Schema validation
 * notes in docs/theme-integration-guide.md).
 */
export type SemanticMap = Partial<Record<SemanticRoleName, string>>;

/**
 * Pair definitions: for each primitive that could serve as a section
 * background, declare which surface (`light` or `dark`) text inside
 * renders against.
 *
 * Used during rendering to derive the `data-surface="dark"` attribute
 * on sections whose bg primitive has `onSurface: "dark"`. The CSS
 * cascade then applies the dark-surface variant of every semantic role
 * to that section's descendants.
 *
 * Author-explicit data — not runtime luminance inference.
 */
export type PairingMap = Record<string, { onSurface: 'light' | 'dark' }>;

/**
 * Gradient primitive: a tint primitive reference plus the intended
 * surface.
 *
 * The gradient SHAPE (vertical, paper endpoints at 0% and 100%, tint
 * plateau from 25% to 75%) is renderer-contract — engineering's
 * renderer paints this fixed shape. The schema only carries the brand-
 * tunable tint reference. See docs/theme-design-principles.md for the
 * empirical calibration of the 25/75 plateau.
 */
export interface GradientPrimitive {
  /**
   * Surface the gradient is intended for. Determines the endpoint
   * color (paper for `light`, brand-dark anchor for `dark`).
   *
   * The TINT (mid-plateau color) is implicit: the gradient consumes the
   * `surfaceBrandSubtle` semantic role at this same surface. One brand
   * decision (the brand-subtle wash primitive) serves both the solid
   * `surfaceBrandSubtle` consumer AND the gradient plateau — per
   * principle P12 (coordinated values across coordinated decisions).
   */
  surface: 'light' | 'dark';
  /**
   * Optional pre-computed mid-stop hex (curation-time derivation
   * output). Concrete CSS hex value (e.g., "#EFECF9"), not a primitive
   * name reference. Theme Curation derives this as:
   *   midStopHex = srgb-mix(surfaceBrandSubtle 70%, surface-endpoint)
   * Where surface-endpoint is paper for `surface: 'light'` and the
   * brand-dark anchor for `surface: 'dark'`. Storing as concrete hex
   * (not as a separately-named primitive) keeps the schema honest:
   * derived values aren't part of the brand's primitive vocabulary;
   * they're outputs of curation. Renderer consumes the hex directly —
   * no primitive lookup, no color-mix at paint time, clean import into
   * design-tool plugins.
   *
   * When omitted, the renderer paints the `surfaceBrandSubtle` value
   * at 100% across the 25/75 plateau — the brand's saturated band
   * (original v1 default before curation-time derivation).
   */
  midStopHex?: string;
  /**
   * LOCAL EXTENSION (not in canonical schema yet). Dark-surface counterpart
   * to midStopHex. Same derivation rule applied to dark primitives:
   *   midStopHexDark = srgb-mix(brandSubtleDark 70%, backgroundDark 30%)
   * Mirrors the role/roleDark naming pattern used elsewhere in the schema.
   * Parallel component-demo PR pending.
   */
  midStopHexDark?: string;
}

/**
 * Closed v1 gradient role vocabulary. Future versions may extend.
 */
export type GradientRoleName = 'subtle';

export type GradientMap = Partial<Record<GradientRoleName, GradientPrimitive>>;

/**
 * Complete color token system.
 */
export interface ColorTokens {
  /** Brand-named primitive colors. */
  primitives: ColorPrimitives;
  /**
   * Semantic role mappings, per surface.
   *
   * `light` is required: it's the default active mapping at `:root`.
   * `dark` is optional: if omitted, dark surfaces fall back to light
   * mappings. When present, it provides the active values inside
   * `[data-surface="dark"]` blocks.
   */
  semantic: {
    light: SemanticMap;
    dark?: SemanticMap;
  };
  /**
   * Pair definitions — see PairingMap.
   *
   * Engineering's renderer reads this to decide which sections get
   * `data-surface="dark"`.
   */
  pairs?: PairingMap;
  /**
   * Named gradients. See GradientPrimitive.
   */
  gradients?: GradientMap;
}

// ─────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────

/**
 * Per-role text styling.
 *
 * Each property is independently optional. Missing properties fall
 * through to engineering's brand-neutral defaults (e.g., system-ui for
 * family, the role's calc'd rem multiplier for size).
 *
 * SIZES NOT IN THIS INTERFACE: per-role sizes are template-fixed via
 * rem multipliers off baseFontSize. Brands scale the whole ladder by
 * setting `baseFontSize`; they do not override per-role sizes.
 *
 * COLOR IS A SEMANTIC ROLE: `color` is a SemanticRoleName reference,
 * NOT a hex value. Hex values live only in ColorPrimitives. The
 * renderer emits `color: var(--{role}-name)` and the color resolves
 * through the cascade.
 */
export interface TextRoleStyle {
  /** CSS font-family value, e.g., `'"Libre Baskerville", serif'`. */
  family?: string;
  /** Numeric font weight (100-900). */
  weight?: number;
  /** Semantic role reference (NOT a hex value). */
  color?: SemanticRoleName;
  /** Unitless ratio (e.g., 1.4) or `'normal'`. */
  lineHeight?: number | string;
  /** CSS letter-spacing, e.g., `'-0.025em'` or `'0.5px'`. */
  letterSpacing?: string;
  // NOTE: text-align is intentionally NOT a brand decision. Alignment is a
  // layout property (same brand's h1 can be centered in a hero, left-aligned
  // in an article body) driven by cell/section content authoring, not theme.
  // CSS text-align inherits naturally, so cell.style.textAlign cascades.
}

/**
 * Muted role — sparse, only color is overridable.
 *
 * Family / weight / size inherit from `body` so muted text reads as
 * body text in a softer hue. This is deliberate: muted is a hue
 * register, not a separate typographic register.
 */
export interface MutedRoleStyle {
  color?: SemanticRoleName;
}

/**
 * Typography role map. Closed v1 vocabulary.
 *
 * Roles:
 *   - `title`        Page-level display heading (above-the-fold)
 *   - `h1`           Section primary heading (editorial register)
 *   - `h2`           Section secondary heading
 *   - `h3`           Subsection heading
 *   - `h4`           Card/icon-label heading (compact)
 *   - `body`         Long-form prose
 *   - `ui`           Interactive labels (CTA button text, etc.)
 *   - `accordionQuestion`  Accordion question heading — semantic
 *                          register distinct from H4 (accordion
 *                          questions read differently from card
 *                          headings, even at the same size)
 *   - `meta`         Fine-print prose register — footer attribution,
 *                    disclaimers, captions. Mixed-case, distinct from
 *                    text-label (uppercase UI register) and body
 *                    (paragraph reading)
 *   - `muted`        Color-only role for de-emphasized text
 *
 * Brands populate the roles they use. Unset roles render with
 * engineering's brand-neutral fallback values.
 */
export interface TypographyMap {
  title?: TextRoleStyle;
  h1?: TextRoleStyle;
  h2?: TextRoleStyle;
  h3?: TextRoleStyle;
  h4?: TextRoleStyle;
  body?: TextRoleStyle;
  ui?: TextRoleStyle;
  accordionQuestion?: TextRoleStyle;
  meta?: TextRoleStyle;
  muted?: MutedRoleStyle;
}

// ─────────────────────────────────────────────────────────────────────
// Brand assets
// ─────────────────────────────────────────────────────────────────────

/**
 * Brand identity assets — surface-aware variants.
 *
 * `logo.light` is the asset designed for placement on light surfaces
 * (typically with dark foreground). `logo.dark` is designed for dark
 * surfaces (light foreground).
 *
 * Engineering's renderer selects the surface-appropriate variant per
 * section. Fallback chain: requested-variant → other-variant →
 * placeholder (renderer's responsibility).
 */
export interface BrandAssets {
  logo?: {
    /** URL of the asset for placement on LIGHT surfaces. */
    light?: string;
    /** URL of the asset for placement on DARK surfaces. */
    dark?: string;
  };
}

// ─────────────────────────────────────────────────────────────────────
// PageStyle (top-level)
// ─────────────────────────────────────────────────────────────────────

/**
 * Complete theme data for a single brand.
 *
 * This is the top-level schema export object. Every theme produced by
 * a Theme UI / theme generator / hand-author should conform to
 * PageStyle.
 *
 * Engineering consumes PageStyle to emit:
 *   1. A server-rendered `<style>:root{...}</style>` block with CSS
 *      variables for all primitives (`--c-{primName}`), semantic role
 *      active defaults (`--text-primary`, `--primary`, etc.),
 *      typography role properties (`--font-h1-family`, etc.), base
 *      font size, and gradient shape strings.
 *   2. A `[data-surface="dark"] { ... }` block at `:root` scope that
 *      overrides semantic role active defaults for dark-surface
 *      sections.
 *   3. Tailwind config extensions that expose tokens as utilities.
 *
 * Component authors consume tokens via Tailwind utilities
 * (`bg-primary`, `text-text-primary`, `font-h1`, etc.). Runtime-
 * dynamic per-instance values from content data stay as inline
 * `style={{}}`.
 */
export interface PageStyle {
  /**
   * Base font size in pixels. Default 16.
   *
   * Drives all role-size multipliers (h1, h2, body, etc.) via rem-
   * based calc(). Brands scale the entire typography ladder by
   * changing this single value.
   */
  baseFontSize?: number;

  /**
   * Color token system.
   */
  colors?: ColorTokens;

  /**
   * Typography roles.
   */
  typography?: TypographyMap;

  /**
   * Brand identity assets.
   */
  brandAssets?: BrandAssets;
}
