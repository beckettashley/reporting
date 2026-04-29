import { domains, metrics, type Domain, type Metric } from './data';
import { CARD_W, CARD_H, CARD_GAP, SECTION_PAD, SECTION_HEADER_H } from './components/nodes';

/* Section column count is a function of metric count — keeps each box's
   shape close to its PDF counterpart. */
function colsForCount(n: number): number {
  if (n <= 1) return 1;
  if (n <= 4) return 2;
  if (n <= 9) return 3;
  return 4;
}

/* Hand-placed (x, y) per section to mirror the source PDF's spatial
   arrangement. Coordinates are in React Flow's coordinate space.
   Adjust here to nudge any section. */
const sectionPositions: Record<string, { x: number; y: number }> = {
  // --- Top region: Logistics + Returns stacked left of the wide Finance spine ---
  d_logistics: { x: 0,    y: 0 },
  d_returns:   { x: 0,    y: 284 },
  d_finance:   { x: 648,  y: 0 },

  // --- Tier 2: customer-facing operations ---
  d_cs:        { x: 0,    y: 496 },
  d_loyalty:   { x: 448,  y: 496 },
  d_orders:    { x: 896,  y: 496 },
  d_prod:      { x: 1344, y: 496 },
  d_offline:   { x: 2192, y: 496 },

  // --- Tier 3: lifecycle + checkout + alt sales channels ---
  d_crm:          { x: 0,    y: 780 },
  d_checkout:     { x: 648,  y: 780 },
  d_marketplace:  { x: 1296, y: 780 },
  d_subscription: { x: 1744, y: 780 },

  // --- Tier 4: Referral (hangs under CRM area) ---
  d_referral:  { x: 0,    y: 1064 },

  // --- Tier 5: marketing programs + Conversions + Livestream + Amazon ---
  d_affiliate:  { x: 0,    y: 1276 },
  d_influence:  { x: 648,  y: 1276 },
  d_content:    { x: 1096, y: 1276 },
  d_conv:       { x: 1544, y: 1276 },
  d_livestream: { x: 2192, y: 1276 },
  d_amazon_ads: { x: 2840, y: 1276 },

  // --- Bottom tier: organic + paid channel reporting ---
  d_social:        { x: 0,    y: 1560 },
  d_seo:           { x: 448,  y: 1560 },
  d_email:         { x: 1096, y: 1560 },
  d_meta_ads:      { x: 1744, y: 1560 },
  d_google_ads:    { x: 2392, y: 1560 },
  d_tiktok_ads:    { x: 3040, y: 1560 },
  d_pinterest_ads: { x: 3688, y: 1560 },
  d_youtube_ads:   { x: 4336, y: 1560 },

  // --- Velocity-specific tier (NEW) — placed below the channel ads tier ---
  d_revshare:      { x: 0,    y: 1844 },  // 19 metrics, 4c × 5r = 816w × 396h
  d_funnel:        { x: 848,  y: 1844 },  // 7 metrics, 3c × 3r = 616w × 252h
  d_upsell:        { x: 1496, y: 1844 },  // 18 metrics, 4c × 5r = 816w × 396h
  d_offers:        { x: 2344, y: 1844 },  // 6 metrics, 3c × 2r = 616w × 180h
  d_experiment:    { x: 2992, y: 1844 },  // 9 metrics, 3c × 3r = 616w × 252h
};

export type SectionLayout = {
  id: string;
  domain: Domain;
  x: number;
  y: number;
  width: number;
  height: number;
  metrics: { metric: Metric; x: number; y: number }[];
};

export function computeLayout(): SectionLayout[] {
  const sections: SectionLayout[] = [];

  for (const domain of domains) {
    const placement = sectionPositions[domain.id];
    if (!placement) continue;

    const sectionMetrics = metrics.filter((m) => m.parent === domain.id);
    const N = sectionMetrics.length;
    if (N === 0) continue;

    const cols = colsForCount(N);
    const rows = Math.ceil(N / cols);
    const innerW = cols * CARD_W + (cols - 1) * CARD_GAP;
    const innerH = rows * CARD_H + (rows - 1) * CARD_GAP;
    const sectionW = innerW + 2 * SECTION_PAD;
    const sectionH = SECTION_HEADER_H + innerH + SECTION_PAD;

    const positionedMetrics = sectionMetrics.map((m, i) => {
      const col = i % cols;
      const r = Math.floor(i / cols);
      return {
        metric: m,
        x: SECTION_PAD + col * (CARD_W + CARD_GAP),
        y: SECTION_HEADER_H + r * (CARD_H + CARD_GAP),
      };
    });

    sections.push({
      id: domain.id,
      domain,
      x: placement.x,
      y: placement.y,
      width: sectionW,
      height: sectionH,
      metrics: positionedMetrics,
    });
  }

  return sections;
}
