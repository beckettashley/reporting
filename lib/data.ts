// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProductTag {
  label: string
  color: string
  textColor: string
}

export interface Product {
  id: string
  name: string
  price: number
  unitsSold: number
  revenue: number
  aov: number
  bestBundle: string
  conversionRate: number
  trend: number
  insight: string
  tags: ProductTag[]
  combos: { name: string; price: number; orders: number; revenue: number }[]
}

export interface KPI {
  key: string
  label: string
  value: number
  change: number
  format: "currency" | "number" | "percent"
}

export interface RateKpi {
  key: string
  label: string
  value: number
  baseline: number
  format: "currency" | "percent"
}

export interface PortfolioSummary {
  visitors: number
  revenue: number
  additionalRevenueFromVelocity: number
  activeFunnels: number
  adGroups: number
  retiredThisPeriod: number
  newThisPeriod: number
}

export interface FunnelStep {
  step: string
  withPresell: { count: number; pct: number } | null
  withoutPresell: { count: number; pct: number } | null
}

export interface OrderItem {
  product: string
  variant?: string
  sku?: string
  compareAtPrice?: number
  transactionId: string
  timestamp: string
  quantity: number
  price: number
  status: "Completed" | "Refunded"
}

export interface Order {
  id: string
  shopifyId: string
  orderNumber: string
  date: string
  customer: {
    name: string
    email: string
    address: string
    city?: string
    postal?: string
    country?: string
    phone?: string
    totalOrders?: number
  }
  items: OrderItem[]
  subtotal: number
  taxes: number
  refunds: number
  total: number
  paymentMethod: string
  paymentProvider: "Stripe" | "PayPal"
  velocityOrderId: string
  attribution: {
    campaignName: string
    campaignId: string
    adSetName: string
    adSetId: string
    adName: string
    adId: string
    adUrl: string
    utmSource: string
    utmMedium: string
    utmTerm: string
    variantName: string
    variantId: string
    variantUrl: string
  }
}

export interface Earnings {
  grossRevenue: number
  refunds: number
  platformFee: number
  processingFees: number
  netProfit: number
}

export interface AdLearning {
  date: string
  category: "Products" | "Upsells" | "Content" | "Offers"
  title: string
  insight: string
}

export interface AdMetadata {
  budget: string
  budgetType: "daily" | "lifetime"
  geo: string[]
  audience: string
  placements: string[]
  objective: string
}

export interface ExperimentAd {
  creative: string
  platform: string
  campaignType: string
  angleCategory: "UGC" | "Education" | "Brand Story" | "Retargeting"
  format: "IMG" | "VID"
  spend: number
  clicks: number
  cpc: number
  cvr: number
  orders: number
  revenue: number
  epc: number
  roas: number
  aov: number
  upsellTakeRate: number
  trend: "up" | "down" | "stable"
  rank: number  // 0-100 percentile score
  rankTrend: "up" | "down" | "flat"
  phase: "Established" | "Optimizing" | "Learning" | "New"
  launched: string  // "Mar 12" style
  endedAt?: string // "Apr 5" style — present only if the ad stopped running
  daysToReliable?: number  // only for Learning/New phase
  variantUrl: string
  metadata: AdMetadata
  learnings: AdLearning[]
}

export interface ExternalFactor {
  date: string
  type: "campaign" | "budget" | "audience" | "cost"
  message: string
}

export interface Experiment {
  id: string
  heroProduct: string
  status: "Running" | "Ended"
  link: string
  startDate: string
  endDate: string | null
  activeVariants: number
  journeyTypes: number
  sessions: number
  orders: number
  upsells: number
  cvr: number
  revenue: number
  aov: number
  epc: number
  trend: number
  winnerLift: number
  lastRotation: string
  insights: string[]
  ads: ExperimentAd[]
  journeyFunnel: FunnelStep[]
}

export interface LearningLogEntry {
  date: string
  category: "Products" | "Upsells" | "Content" | "Offers"
  title: string
  insight: string
  impact: string
  metric: { label: string; before: string; after: string }
  action: string
  experiments: string[]
}

export interface AgentQA {
  triggers: string[]
  response: string
}

export interface AgentMessage {
  role: "system" | "user" | "agent"
  content: string
}

export type DatePreset = "7d" | "14d" | "30d" | "90d" | "custom"

export const datePresets: { key: DatePreset; label: string; periodLabel: string }[] = [
  { key: "7d", label: "Last 7 days", periodLabel: "vs prior 7 days" },
  { key: "14d", label: "Last 14 days", periodLabel: "vs prior 14 days" },
  { key: "30d", label: "Last 30 days", periodLabel: "vs prior 30 days" },
  { key: "90d", label: "Last 90 days", periodLabel: "vs prior 90 days" },
  { key: "custom", label: "Custom range", periodLabel: "vs prior period" },
]

export function getDateRangeLabel(preset: DatePreset): string {
  const end = new Date("2026-04-15")
  const days = preset === "7d" ? 7 : preset === "14d" ? 14 : preset === "90d" ? 90 : 30
  const start = new Date(end)
  start.setDate(end.getDate() - days)
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `${fmt(start)} – ${fmt(end)}`
}

// ─── Merchant ───────────────────────────────────────────────────────────────

export const merchant = {
  name: "Glow Botanics",
}

// ─── Products ───────────────────────────────────────────────────────────────

export const products: Product[] = [
  {
    id: "prod_1",
    name: "GlowSerum Pro",
    price: 39.0,
    unitsSold: 412,
    revenue: 16068,
    aov: 52.3,
    bestBundle: "Sells best as: GlowSerum Pro + Daily Moisturizer bundle at $67",
    conversionRate: 5.8,
    trend: 14.2,
    tags: [
      { label: "Best Seller", color: "#FF8800", textColor: "#9A4D00" },
      { label: "Top Revenue", color: "#29EFCA", textColor: "#0D6B55" },
    ],
    insight: "GlowSerum Pro converts 2.3x higher when bundled vs. sold alone. The $67 bundle price point is optimal — higher prices saw conversion drop, lower prices didn't increase volume enough to offset.",
    combos: [
      { name: "GlowSerum Pro + Daily Moisturizer", price: 67, orders: 142, revenue: 9514 },
      { name: "GlowSerum Pro (single)", price: 39, orders: 98, revenue: 3822 },
      { name: "GlowSerum Pro + Recovery Kit", price: 79, orders: 44, revenue: 3476 },
    ],
  },
  {
    id: "prod_2",
    name: "Daily Moisturizer",
    price: 30.0,
    unitsSold: 298,
    revenue: 8940,
    aov: 48.1,
    bestBundle: "Sells best as: GlowSerum Pro + Daily Moisturizer bundle at $67",
    conversionRate: 4.1,
    trend: 8.7,
    tags: [
      { label: "Bundle Star", color: "#824EF7", textColor: "#4A1FA0" },
    ],
    insight: "Daily Moisturizer rarely sells alone — 78% of units are sold as part of the GlowSerum bundle. Strong supporting product.",
    combos: [
      { name: "GlowSerum Pro + Daily Moisturizer", price: 67, orders: 142, revenue: 9514 },
      { name: "Daily Moisturizer (single)", price: 30, orders: 65, revenue: 1950 },
    ],
  },
  {
    id: "prod_3",
    name: "Recovery Kit",
    price: 50.0,
    unitsSold: 187,
    revenue: 9350,
    aov: 62.4,
    bestBundle: "Sells best as: Recovery Kit + Vitamin C Drops bundle at $75",
    conversionRate: 3.9,
    trend: 22.1,
    tags: [
      { label: "Trending", color: "#FF3971", textColor: "#A11240" },
      { label: "Top AOV", color: "#1BDBED", textColor: "#0A7A8A" },
    ],
    insight: "Recovery Kit buyers have a 2.1x higher 30-day repeat purchase rate. This product drives long-term customer value even when initial conversion is lower.",
    combos: [
      { name: "Recovery Kit + Vitamin C Drops", price: 75, orders: 67, revenue: 5025 },
      { name: "Recovery Kit (single)", price: 50, orders: 52, revenue: 2600 },
      { name: "Recovery Kit + GlowSerum Pro", price: 79, orders: 44, revenue: 3476 },
    ],
  },
  {
    id: "prod_4",
    name: "Travel Size Kit",
    price: 10.0,
    unitsSold: 156,
    revenue: 1560,
    aov: 38.2,
    bestBundle: "Most popular as a checkout add-on ($10, 28% take rate)",
    conversionRate: 7.2,
    trend: 5.3,
    tags: [
      { label: "Top Add-On", color: "#FFC207", textColor: "#8A6800" },
    ],
    insight: "Travel Size Kit works best as a checkout add-on, not a hero product. The 28% take rate at $10 is strong — testing at $12 and $15 to find the ceiling.",
    combos: [
      { name: "Checkout add-on", price: 10, orders: 156, revenue: 1560 },
    ],
  },
  {
    id: "prod_5",
    name: "Vitamin C Drops",
    price: 40.0,
    unitsSold: 134,
    revenue: 5360,
    aov: 58.9,
    bestBundle: "Sells best as: Recovery Kit + Vitamin C Drops bundle at $75",
    conversionRate: 3.4,
    trend: -3.1,
    tags: [
      { label: "High LTV", color: "#29EFCA", textColor: "#0D6B55" },
    ],
    insight: "Vitamin C Drops conversion dipped 3.1% this period. The drop correlates with a shift in traffic quality from TikTok — monitoring.",
    combos: [
      { name: "Recovery Kit + Vitamin C Drops", price: 75, orders: 67, revenue: 5025 },
      { name: "Vitamin C Drops (single)", price: 40, orders: 34, revenue: 1360 },
    ],
  },
  {
    id: "prod_6",
    name: "Hydra Mist Toner",
    price: 28.0,
    unitsSold: 118,
    revenue: 3304,
    aov: 44.6,
    bestBundle: "Sells best as: Hydra Mist Toner + GlowSerum Pro bundle at $58",
    conversionRate: 3.8,
    trend: 9.4,
    tags: [
      { label: "New", color: "#824EF7", textColor: "#4A1FA0" },
    ],
    insight: "Hydra Mist Toner launched 3 weeks ago and is already the 6th best-selling product. Bundles with GlowSerum Pro are outperforming standalone by 1.8x.",
    combos: [
      { name: "Hydra Mist Toner + GlowSerum Pro", price: 58, orders: 72, revenue: 4176 },
      { name: "Hydra Mist Toner (single)", price: 28, orders: 46, revenue: 1288 },
    ],
  },
  {
    id: "prod_7",
    name: "Night Repair Cream",
    price: 55.0,
    unitsSold: 96,
    revenue: 5280,
    aov: 68.2,
    bestBundle: "Sells best as: Night Repair Cream + GlowSerum Pro bundle at $82",
    conversionRate: 2.9,
    trend: 4.7,
    tags: [
      { label: "Premium", color: "#FF3971", textColor: "#A11240" },
    ],
    insight: "Night Repair Cream has the second-highest AOV at $68.20. Customers who buy this product have a 34% higher average cart value.",
    combos: [
      { name: "Night Repair Cream + GlowSerum Pro", price: 82, orders: 54, revenue: 4428 },
      { name: "Night Repair Cream (single)", price: 55, orders: 42, revenue: 2310 },
    ],
  },
  {
    id: "prod_8",
    name: "Exfoliating Scrub",
    price: 22.0,
    unitsSold: 89,
    revenue: 1958,
    aov: 36.4,
    bestBundle: "Most popular as a checkout add-on ($22, 19% take rate)",
    conversionRate: 4.5,
    trend: -1.2,
    tags: [
      { label: "Add-On", color: "#FFC207", textColor: "#8A6800" },
    ],
    insight: "Exfoliating Scrub performs best as a checkout add-on. Take rate dipped slightly this period — testing a lower $18 price point.",
    combos: [
      { name: "Checkout add-on", price: 22, orders: 89, revenue: 1958 },
    ],
  },
  {
    id: "prod_9",
    name: "Collagen Boost Mask",
    price: 35.0,
    unitsSold: 74,
    revenue: 2590,
    aov: 52.8,
    bestBundle: "Sells best as: Collagen Boost Mask + Night Repair Cream bundle at $78",
    conversionRate: 3.1,
    trend: 18.3,
    tags: [
      { label: "Trending", color: "#FF3971", textColor: "#A11240" },
      { label: "New", color: "#824EF7", textColor: "#4A1FA0" },
    ],
    insight: "Collagen Boost Mask is trending up 18.3% — the fastest growth of any product this period. Presell pages with ingredient science angles drive most of the volume.",
    combos: [
      { name: "Collagen Boost Mask + Night Repair Cream", price: 78, orders: 42, revenue: 3276 },
      { name: "Collagen Boost Mask (single)", price: 35, orders: 32, revenue: 1120 },
    ],
  },
  {
    id: "prod_10",
    name: "SPF 50 Day Shield",
    price: 32.0,
    unitsSold: 67,
    revenue: 2144,
    aov: 46.1,
    bestBundle: "Sells best as: SPF 50 Day Shield + Daily Moisturizer bundle at $52",
    conversionRate: 2.7,
    trend: 1.9,
    tags: [],
    insight: "SPF 50 Day Shield has steady but modest performance. Bundles with Daily Moisturizer show 1.4x better conversion than standalone.",
    combos: [
      { name: "SPF 50 Day Shield + Daily Moisturizer", price: 52, orders: 38, revenue: 1976 },
      { name: "SPF 50 Day Shield (single)", price: 32, orders: 29, revenue: 928 },
    ],
  },
]

// ─── KPIs ───────────────────────────────────────────────────────────────────

export const kpis: KPI[] = [
  { key: "sessions", label: "Sessions", value: 2000, change: 5.1, format: "number" },
  { key: "orders", label: "Orders", value: 298, change: 12.4, format: "number" },
  { key: "upsells", label: "Upsells", value: 105, change: 3.7, format: "number" },
  { key: "revenue", label: "Revenue", value: 48320, change: 8.3, format: "currency" },
  { key: "aov", label: "AOV", value: 41.61, change: -2.1, format: "currency" },
  { key: "cvr", label: "Conversion Rate", value: 4.21, change: 1.8, format: "percent" },
]

// ─── Rate-focused KPIs (hero metrics with pre-Velocity baselines) ───────────

export const rateKpis: RateKpi[] = [
  { key: "cvr", label: "CVR", value: 4.21, baseline: 2.80, format: "percent" },
  { key: "aov", label: "AOV", value: 127.00, baseline: 89.00, format: "currency" },
  { key: "rpv", label: "RPV", value: 5.34, baseline: 2.49, format: "currency" },
]

// Pre-Velocity baselines used for per-ad delta comparisons
export const adBaselines = {
  cvr: 2.80,               // percent
  rpv: 2.49,               // dollars per visitor (clicks)
  roas: 0.80,              // dollars out per dollar in
  aov: 89.00,              // dollars
  epc: 2.49,               // dollars per click (same as rpv baseline)
  upsellTakeRate: 22.00,   // percent
  cpa: 147.71,             // cost per acquisition (pre-Velocity)
}

export const portfolioSummary: PortfolioSummary = {
  visitors: 12400,
  revenue: 66216,
  additionalRevenueFromVelocity: 35340, // (5.34 - 2.49) × 12400 = $35,340
  activeFunnels: 24,
  adGroups: 7,
  retiredThisPeriod: 4,
  newThisPeriod: 8,
}

// ─── Funnel (segmented by journey type) ─────────────────────────────────────

export const funnel: FunnelStep[] = [
  { step: "Presell", withPresell: { count: 1000, pct: 100 }, withoutPresell: null },
  { step: "Sales Page", withPresell: { count: 800, pct: 80 }, withoutPresell: { count: 1000, pct: 100 } },
  { step: "Checkout", withPresell: { count: 400, pct: 40 }, withoutPresell: { count: 520, pct: 52 } },
  { step: "Order", withPresell: { count: 138, pct: 13.8 }, withoutPresell: { count: 160, pct: 16 } },
  { step: "Upsell Taken", withPresell: { count: 48, pct: 4.8 }, withoutPresell: { count: 57, pct: 5.7 } },
]

// ─── Experiments ────────────────────────────────────────────────────────────

export const experiments: Experiment[] = [
  {
    id: "exp_1",
    heroProduct: "GlowSerum Pro",
    status: "Running",
    link: "exp-123/abc",
    startDate: "2026-03-17",
    endDate: null,
    activeVariants: 12,
    journeyTypes: 2,
    sessions: 3940,
    orders: 178,
    upsells: 62,
    cvr: 4.52,
    revenue: 7618,
    aov: 42.80,
    epc: 1.93,
    trend: 12,
    winnerLift: 23,
    lastRotation: "2 days ago",
    insights: [
      'Traffic from the ingredient story carousel converts at 5.83% CVR with $48.20 AOV. This ad\'s traffic routes primarily through presell-first funnels where the education angle in the ad matches the presell content — the <strong>$67 GlowSerum + Moisturizer bundle</strong> is the dominant offer for this traffic.',
      'Traffic from the before/after UGC reel converts at 4.84% CVR without a presell step. UGC credibility carries users directly to the sales page — this path produces lower AOV ($44.10) but strong volume at 30 orders.',
      'Traffic from the founder story long form converts at 2.56% CVR across all variant types. The brand story angle in the ad does not align with any of the current funnel content — low congruency between ad and destination.',
    ],
    ads: [
      {
        creative: "Ingredient story — carousel", platform: "Facebook", campaignType: "Prospecting", angleCategory: "Education", format: "IMG",
        spend: 3200, clicks: 480, cpc: 6.67, cvr: 5.83, orders: 28, revenue: 5320, epc: 2.12, roas: 1.66, aov: 190.00, upsellTakeRate: 38.20, trend: "up",
        rank: 78, rankTrend: "up", phase: "Established", launched: "Mar 12",
        variantUrl: "https://variants.velocity.app/exp-123/abc/v-ingredient-education",
        metadata: {
          budget: "$120/day",
          budgetType: "daily",
          geo: ["United States", "Canada"],
          audience: "Prospecting — Lookalike 1% (Purchasers)",
          placements: ["Facebook Feed", "Instagram Feed"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 12", category: "Content", title: "Education presells lift CVR 2.3x", insight: "This ad's traffic converts 2.3x higher through education-led presell pages vs. testimonial presells. The education angle in the ad aligns with what visitors expect to see on the landing page." },
          { date: "Apr 8", category: "Offers", title: "Bundle beats single for this audience", insight: "Visitors from this ad accept the $67 bundle at 38.20% take rate vs. 22.00% for the $39 single. Higher-intent audience responds to value framing." },
          { date: "Apr 3", category: "Upsells", title: "Recovery Kit upsell wins here", insight: "Upsell take rate for this ad's traffic is 38.20%, the highest across all ads. Recovery Kit as the first upsell outperforms Vitamin C Drops for this audience." },
        ],
      },
      {
        creative: "Before/after UGC — reel", platform: "Instagram", campaignType: "Prospecting", angleCategory: "UGC", format: "VID",
        spend: 4100, clicks: 620, cpc: 6.61, cvr: 4.84, orders: 30, revenue: 4890, epc: 1.82, roas: 1.19, aov: 163.00, upsellTakeRate: 41.50, trend: "up",
        rank: 62, rankTrend: "up", phase: "Optimizing", launched: "Mar 14",
        variantUrl: "https://variants.velocity.app/exp-123/abc/v-ugc-transformation",
        metadata: {
          budget: "$150/day",
          budgetType: "daily",
          geo: ["United States"],
          audience: "Prospecting — Interest: Skincare, Beauty",
          placements: ["Instagram Reels", "Facebook Reels"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 11", category: "Content", title: "UGC traffic skips presell cleanly", insight: "Traffic from this ad converts at 4.84% CVR without a presell step. UGC credibility carries visitors directly to the sales page." },
          { date: "Apr 6", category: "Offers", title: "Bundle AOV above experiment avg", insight: "AOV of $52.30 on this ad's traffic — $4.20 higher than the experiment average. Bundle acceptance is strong after seeing transformation content." },
          { date: "Mar 29", category: "Upsells", title: "Highest upsell take rate in experiment", insight: "Upsell take rate of 41.50% — the highest across all GlowSerum Pro ads. Recovery Kit as the first upsell resonates with this audience." },
        ],
      },
      {
        creative: "Problem/solution — static", platform: "Facebook", campaignType: "Retargeting", angleCategory: "Retargeting", format: "IMG",
        spend: 2800, clicks: 510, cpc: 5.49, cvr: 5.10, orders: 26, revenue: 4160, epc: 1.63, roas: 1.49, aov: 160.00, upsellTakeRate: 28.00, trend: "stable",
        rank: 54, rankTrend: "flat", phase: "Established", launched: "Mar 18",
        variantUrl: "https://variants.velocity.app/exp-123/abc/v-retargeting-direct",
        metadata: {
          budget: "$100/day",
          budgetType: "daily",
          geo: ["United States", "Canada", "United Kingdom"],
          audience: "Retargeting — Website Visitors (30 days)",
          placements: ["Facebook Feed", "Facebook Right Column"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 9", category: "Content", title: "Retargeting delivers lowest CPC", insight: "Retargeting traffic converts at 5.10% CVR with lowest CPC ($5.49) across all GlowSerum Pro ads. Warm audience efficiency." },
          { date: "Apr 2", category: "Content", title: "Direct-to-sales wins for warm audience", insight: "Direct-to-sales path (no presell) outperforms presell paths for this audience by 1.6x CVR. Warm visitors don't need additional education." },
        ],
      },
      {
        creative: "Founder story — long form", platform: "Facebook", campaignType: "Prospecting", angleCategory: "Brand Story", format: "VID",
        spend: 3500, clicks: 390, cpc: 8.97, cvr: 2.56, orders: 10, revenue: 1480, epc: 0.94, roas: 0.42, aov: 148.00, upsellTakeRate: 18.40, trend: "down",
        rank: 12, rankTrend: "down", phase: "Learning", launched: "Mar 12", endedAt: "Apr 11", daysToReliable: 4,
        variantUrl: "https://variants.velocity.app/exp-123/abc/v-brand-story",
        metadata: {
          budget: "$3,500 lifetime",
          budgetType: "lifetime",
          geo: ["United States"],
          audience: "Prospecting — Broad (18-54 F)",
          placements: ["Facebook Feed"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 10", category: "Content", title: "Brand story lacks purchase intent", insight: "This ad's traffic shows low engagement through all funnel types. Brand story angle does not translate into purchase intent for cold prospecting audiences." },
          { date: "Apr 5", category: "Content", title: "Exploring alternative variants", insight: "Testing alternative funnel approaches for this ad's traffic. No variant has exceeded 3.10% CVR." },
          { date: "Mar 30", category: "Content", title: "High CPC compounds low CVR", insight: "CPC for this ad ($8.97) is 34% above the experiment average ($6.67). Higher cost paired with lower conversion yields 0.42x ROAS." },
        ],
      },
      {
        creative: "Hero product spotlight — carousel", platform: "Facebook", campaignType: "Prospecting", angleCategory: "Education", format: "IMG",
        spend: 2800, clicks: 420, cpc: 6.67, cvr: 4.76, orders: 20, revenue: 3900, epc: 9.29, roas: 1.39, aov: 195.00, upsellTakeRate: 32.50, trend: "up",
        rank: 65, rankTrend: "up", phase: "Established", launched: "Mar 18",
        variantUrl: "https://variants.velocity.app/exp-123/abc/v-hero-spotlight",
        metadata: {
          budget: "$90/day",
          budgetType: "daily",
          geo: ["United States", "Canada"],
          audience: "Prospecting — Lookalike 3% (Website Visitors)",
          placements: ["Facebook Feed", "Instagram Feed"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 13", category: "Content", title: "Product-focused imagery lifts CVR", insight: "CVR of 4.76% on this ad — 0.24pp above the prospecting benchmark. Product-centered imagery outperforms lifestyle shots for cold traffic." },
          { date: "Apr 6", category: "Offers", title: "Bundle acceptance holds on carousel format", insight: "Upsell take rate of 32.50% matches carousel benchmark. Second and third carousel cards reinforce bundle framing before the click." },
          { date: "Mar 30", category: "Content", title: "CPC in line with experiment average", insight: "CPC of $6.67 matches the GlowSerum Pro experiment average. Carousel format holds cost without compressing CVR." },
        ],
      },
      {
        creative: "Customer testimonials — compilation", platform: "Instagram", campaignType: "Retargeting", angleCategory: "UGC", format: "VID",
        spend: 2500, clicks: 360, cpc: 6.94, cvr: 6.11, orders: 22, revenue: 4730, epc: 13.14, roas: 1.89, aov: 215.00, upsellTakeRate: 44.00, trend: "stable",
        rank: 80, rankTrend: "flat", phase: "Established", launched: "Mar 20",
        variantUrl: "https://variants.velocity.app/exp-123/abc/v-testimonial-compilation",
        metadata: {
          budget: "$80/day",
          budgetType: "daily",
          geo: ["United States"],
          audience: "Retargeting — Engagers 90d",
          placements: ["Instagram Stories", "Instagram Reels"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 12", category: "Content", title: "Warm audience converts at 6.11%", insight: "Retargeting traffic through this ad converts at 6.11% CVR — 1.59pp above prospecting ads in this experiment. 90-day engagers already familiar with the brand." },
          { date: "Apr 5", category: "Upsells", title: "Highest upsell take in GlowSerum Pro", insight: "Upsell take rate of 44.00% is the highest across GlowSerum Pro ads. Warm audience accepts the Recovery Kit upsell without friction." },
          { date: "Mar 28", category: "Offers", title: "AOV above experiment average", insight: "AOV of $215.00 — $25.00 above the experiment average. Testimonial social proof drives bundle selection over single product." },
        ],
      },
      {
        creative: "Feature explainer — reel", platform: "Facebook", campaignType: "Lookalike", angleCategory: "Education", format: "VID",
        spend: 1600, clicks: 260, cpc: 6.15, cvr: 5.38, orders: 14, revenue: 2310, epc: 8.88, roas: 1.44, aov: 165.00, upsellTakeRate: 29.50, trend: "up",
        rank: 70, rankTrend: "up", phase: "Optimizing", launched: "Mar 25",
        variantUrl: "https://variants.velocity.app/exp-123/abc/v-feature-reel",
        metadata: {
          budget: "$85/day",
          budgetType: "daily",
          geo: ["United States", "Canada", "United Kingdom"],
          audience: "Lookalike 4% Purchasers",
          placements: ["Facebook Reels", "Instagram Reels"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 11", category: "Content", title: "Education angle wins on lookalike", insight: "CVR of 5.38% on 4% purchaser lookalike — 0.86pp above the prospecting average. Education framing matches purchase-intent signal from seed audience." },
          { date: "Apr 2", category: "Content", title: "Reel format scales across regions", insight: "Traffic split across US/CA/UK holds CVR within 0.4pp across all three regions. Education angle translates without geo-specific creative." },
        ],
      },
      {
        creative: "Quick demo — 15s cut", platform: "TikTok", campaignType: "Prospecting", angleCategory: "Education", format: "VID",
        spend: 550, clicks: 180, cpc: 3.06, cvr: 2.78, orders: 5, revenue: 740, epc: 4.11, roas: 1.35, aov: 148.00, upsellTakeRate: 18.00, trend: "up",
        rank: 35, rankTrend: "up", phase: "Learning", launched: "Apr 9", daysToReliable: 6,
        variantUrl: "https://variants.velocity.app/exp-123/abc/v-tiktok-demo",
        metadata: {
          budget: "$60/day",
          budgetType: "daily",
          geo: ["United States"],
          audience: "Prospecting — Skincare/Beauty Interest 18-34",
          placements: ["TikTok Feed"],
          objective: "Conversions",
        },
        learnings: [
          { date: "Apr 14", category: "Content", title: "Cheapest CPC across GlowSerum Pro", insight: "CPC of $3.06 on TikTok — 54% below the experiment average. Early data shows cheaper acquisition offsets the lower CVR." },
          { date: "Apr 12", category: "Content", title: "15s cut-down holds watch rate", insight: "CVR of 2.78% building across 180 clicks. Short-form cut retains purchase intent through the jump to the landing page." },
        ],
      },
      {
        creative: "Flash sale 48hr", platform: "Facebook", campaignType: "Retargeting", angleCategory: "Retargeting", format: "IMG",
        spend: 180, clicks: 35, cpc: 5.14, cvr: 2.86, orders: 1, revenue: 125, epc: 3.57, roas: 0.69, aov: 125.00, upsellTakeRate: 0.00, trend: "stable",
        rank: 15, rankTrend: "flat", phase: "New", launched: "Apr 14", daysToReliable: 13,
        variantUrl: "https://variants.velocity.app/exp-123/abc/v-flash-sale-48hr",
        metadata: {
          budget: "$300 lifetime",
          budgetType: "lifetime",
          geo: ["United States"],
          audience: "Retargeting — Cart Abandoners 14d",
          placements: ["Facebook Feed"],
          objective: "Sales",
        },
        learnings: [],
      },
    ],
    journeyFunnel: [
      { step: "Presell", withPresell: { count: 1970, pct: 100 }, withoutPresell: null },
      { step: "Sales Page", withPresell: { count: 1576, pct: 80 }, withoutPresell: { count: 1970, pct: 100 } },
      { step: "Checkout", withPresell: { count: 788, pct: 40 }, withoutPresell: { count: 985, pct: 50 } },
      { step: "Order", withPresell: { count: 86, pct: 4.4 }, withoutPresell: { count: 92, pct: 4.7 } },
      { step: "Upsell Taken", withPresell: { count: 30, pct: 1.5 }, withoutPresell: { count: 32, pct: 1.6 } },
    ],
  },
  {
    id: "exp_2",
    heroProduct: "Recovery Kit",
    status: "Running",
    link: "exp-123/efg",
    startDate: "2026-03-17",
    endDate: null,
    activeVariants: 8,
    journeyTypes: 2,
    sessions: 3125,
    orders: 120,
    upsells: 43,
    cvr: 3.84,
    revenue: 6252,
    aov: 52.10,
    epc: 2.00,
    trend: 6,
    winnerLift: 15,
    lastRotation: "4 days ago",
    insights: [
      'Traffic from the before/after transformation ad converts at 4.52% CVR with $62.40 AOV. This ad\'s traffic performs best through presell-first funnels using the transformation angle — the <strong>$75 Recovery Kit + Vitamin C Drops bundle</strong> is the top offer for this traffic.',
      'Traffic from the TikTok skin routine converts at 3.12% CVR with $42.80 AOV. TikTok\'s younger audience converts on the lower-priced single product rather than the bundle — different price sensitivity than Meta traffic.',
      'Retargeting traffic (clinical results static) converts at 5.86% CVR through direct-to-sales funnels. Warm audiences skip the presell with no conversion penalty — lowest CPC ($4.83) and highest ROAS (2.14x) across all Recovery Kit ads.',
    ],
    ads: [
      {
        creative: "Before/after transformation", platform: "Facebook", campaignType: "Prospecting", angleCategory: "UGC", format: "VID",
        spend: 2800, clicks: 420, cpc: 6.67, cvr: 4.52, orders: 19, revenue: 5096, epc: 2.42, roas: 1.82, aov: 268.21, upsellTakeRate: 34.80, trend: "up",
        rank: 92, rankTrend: "up", phase: "Established", launched: "Mar 12",
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-transformation-bundle",
        metadata: {
          budget: "$100/day",
          budgetType: "daily",
          geo: ["United States", "Canada"],
          audience: "Prospecting — Lookalike 2% (Website Purchasers)",
          placements: ["Facebook Feed", "Instagram Feed", "Instagram Stories"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 12", category: "Content", title: "Transformation presell matches ad", insight: "Traffic from this ad converts at 5.10% CVR through transformation presells. Visual proof in ad matches expectations set by the presell." },
          { date: "Apr 7", category: "Offers", title: "Highest AOV across Recovery Kit ads", insight: "AOV of $62.40 on this ad's traffic is the highest across Recovery Kit ads. Bundle acceptance driven by before/after social proof." },
          { date: "Mar 31", category: "Upsells", title: "GlowSerum upsell resonates", insight: "Upsell take rate of 34.80% with GlowSerum Pro as the first upsell. Skincare routine expansion resonates with this audience." },
        ],
      },
      {
        creative: "TikTok skin routine", platform: "TikTok", campaignType: "Prospecting", angleCategory: "Education", format: "VID",
        spend: 1800, clicks: 468, cpc: 3.85, cvr: 3.12, orders: 15, revenue: 2340, epc: 1.30, roas: 1.30, aov: 156.00, upsellTakeRate: 22.10, trend: "up",
        rank: 38, rankTrend: "up", phase: "Learning", launched: "Apr 1", daysToReliable: 6,
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-tiktok-single",
        metadata: {
          budget: "$65/day",
          budgetType: "daily",
          geo: ["United States"],
          audience: "Prospecting — Interest: Skincare Routine, Gen Z",
          placements: ["TikTok Feed"],
          objective: "Conversions",
        },
        learnings: [
          { date: "Apr 11", category: "Offers", title: "Single product wins on TikTok", insight: "TikTok audience converts on the $50 Recovery Kit single at 3.45% CVR. Lower price point resonates vs. the $75 bundle." },
          { date: "Apr 4", category: "Content", title: "TikTok offers cheaper acquisition", insight: "CPC of $3.85 is 42% lower than Meta for Recovery Kit. Cheaper traffic offsets lower CVR." },
          { date: "Mar 28", category: "Upsells", title: "Upsell take holds above benchmark", insight: "Upsell take rate of 22.10% for TikTok traffic — lower than Meta but still above the 18.00% benchmark for new audiences." },
        ],
      },
      {
        creative: "Clinical results — static", platform: "Facebook", campaignType: "Retargeting", angleCategory: "Retargeting", format: "IMG",
        spend: 1400, clicks: 290, cpc: 4.83, cvr: 5.86, orders: 17, revenue: 2992, epc: 2.14, roas: 2.14, aov: 176.00, upsellTakeRate: 40.20, trend: "stable",
        rank: 85, rankTrend: "flat", phase: "Optimizing", launched: "Mar 15",
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-retargeting-clinical",
        metadata: {
          budget: "$50/day",
          budgetType: "daily",
          geo: ["United States", "Canada", "Australia"],
          audience: "Retargeting — Engagers (60 days)",
          placements: ["Facebook Feed", "Instagram Feed"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 8", category: "Content", title: "Direct-to-sales delivers warm CVR", insight: "Retargeting traffic converts at 5.86% CVR through direct-to-sales. Warm audience skips the presell with no penalty." },
          { date: "Apr 1", category: "Content", title: "Highest ROAS across experiment", insight: "ROAS of 2.14x — highest across all Recovery Kit ads. Retargeting efficiency compounds with clinical proof messaging." },
          { date: "Mar 25", category: "Upsells", title: "Highest upsell take rate for experiment", insight: "Upsell take rate of 40.20% is the highest across all Recovery Kit ads. Retargeting visitors are already bought in on the category." },
        ],
      },
      {
        creative: "Dermatologist testimonial — reel", platform: "Instagram", campaignType: "Prospecting", angleCategory: "Education", format: "VID",
        spend: 180, clicks: 32, cpc: 5.63, cvr: 3.13, orders: 1, revenue: 152, epc: 4.75, roas: 0.84, aov: 152.00, upsellTakeRate: 0.00, trend: "stable",
        rank: 25, rankTrend: "flat", phase: "New", launched: "Apr 14", daysToReliable: 11,
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-dermatologist",
        metadata: {
          budget: "$60/day",
          budgetType: "daily",
          geo: ["United States"],
          audience: "Prospecting — Interest: Dermatology, Skincare",
          placements: ["Instagram Reels", "Facebook Reels"],
          objective: "Sales",
        },
        learnings: [],
      },
      {
        creative: "Morning routine — 60s", platform: "Instagram", campaignType: "Prospecting", angleCategory: "UGC", format: "VID",
        spend: 3300, clicks: 510, cpc: 6.47, cvr: 5.10, orders: 26, revenue: 5850, epc: 11.47, roas: 1.77, aov: 225.00, upsellTakeRate: 42.50, trend: "up",
        rank: 88, rankTrend: "up", phase: "Established", launched: "Mar 14",
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-morning-routine",
        metadata: {
          budget: "$120/day",
          budgetType: "daily",
          geo: ["United States", "Canada", "Australia"],
          audience: "Prospecting — Lookalike 2% Engagers",
          placements: ["Instagram Reels", "Facebook Feed"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 13", category: "Content", title: "Morning routine angle drives bundle take", insight: "Bundle take rate of 68.00% on this ad's traffic — 12pp above Recovery Kit average. Morning routine framing ties Recovery Kit and Vitamin C Drops into a single use case." },
          { date: "Apr 7", category: "Upsells", title: "Upsell take rate at 42.50%", insight: "Upsell take rate of 42.50% — the highest across Recovery Kit ads. Routine-expansion framing in the creative primes visitors for the GlowSerum Pro upsell." },
          { date: "Mar 29", category: "Offers", title: "AOV leads experiment at $225", insight: "AOV of $225.00 on this ad — $30.00 above experiment average. Lookalike 2% audience accepts the $75 bundle over the $50 single at 3.4x the rate." },
        ],
      },
      {
        creative: "Problem awareness — carousel", platform: "Facebook", campaignType: "Prospecting", angleCategory: "Education", format: "IMG",
        spend: 2100, clicks: 330, cpc: 6.36, cvr: 4.55, orders: 15, revenue: 2700, epc: 8.18, roas: 1.29, aov: 180.00, upsellTakeRate: 28.50, trend: "stable",
        rank: 58, rankTrend: "flat", phase: "Established", launched: "Mar 17",
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-problem-awareness",
        metadata: {
          budget: "$75/day",
          budgetType: "daily",
          geo: ["United States"],
          audience: "Prospecting — Interest: Anti-aging",
          placements: ["Facebook Feed"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 11", category: "Content", title: "Problem-awareness traction on carousel", insight: "CVR of 4.55% on cold anti-aging interest — 0.71pp above prospecting average. Problem-first framing in card 1 carries across the carousel." },
          { date: "Apr 1", category: "Offers", title: "Single-product offer slightly favored", insight: "Single-product take rate of 38.00% on this ad — 6pp above experiment average. Problem-awareness audience buys the entry-level SKU before bundling." },
        ],
      },
      {
        creative: "Broad lookalike expansion", platform: "Facebook", campaignType: "Lookalike", angleCategory: "Education", format: "IMG",
        spend: 2400, clicks: 380, cpc: 6.32, cvr: 4.47, orders: 17, revenue: 3230, epc: 8.50, roas: 1.35, aov: 190.00, upsellTakeRate: 31.20, trend: "up",
        rank: 50, rankTrend: "up", phase: "Established", launched: "Mar 22",
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-broad-lookalike",
        metadata: {
          budget: "$80/day",
          budgetType: "daily",
          geo: ["United States", "Canada", "United Kingdom", "Australia"],
          audience: "Lookalike 5% broad",
          placements: ["Facebook Feed", "Instagram Feed"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 12", category: "Content", title: "Broad reach holds CVR at scale", insight: "CVR of 4.47% across 4-country reach — within 0.3pp of the 1% lookalike. Broader seed audience scales without CVR decay." },
          { date: "Apr 4", category: "Content", title: "CPC flat across broadened audience", insight: "CPC of $6.32 on 5% lookalike — within $0.15 of the 2% lookalike CPC. Expansion does not inflate cost." },
        ],
      },
      {
        creative: "Email list retargeting", platform: "Facebook", campaignType: "Retargeting", angleCategory: "Retargeting", format: "IMG",
        spend: 1200, clicks: 240, cpc: 5.00, cvr: 5.42, orders: 13, revenue: 2405, epc: 10.02, roas: 2.00, aov: 185.00, upsellTakeRate: 38.50, trend: "up",
        rank: 75, rankTrend: "up", phase: "Optimizing", launched: "Mar 24",
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-email-retargeting",
        metadata: {
          budget: "$50/day",
          budgetType: "daily",
          geo: ["United States", "Canada"],
          audience: "Retargeting — Email Subscribers (30d)",
          placements: ["Facebook Feed", "Facebook Right Column"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 10", category: "Content", title: "ROAS of 2.00x on email list", insight: "ROAS of 2.00x on this ad — second-highest across Recovery Kit. Email subscribers already exposed to the product through owned channels, reducing creative lift needed." },
          { date: "Apr 3", category: "Upsells", title: "Upsell take at 38.50% on warm traffic", insight: "Upsell take rate of 38.50% on email-subscriber retargeting — 2.70pp above retargeting benchmark. List members accept the GlowSerum Pro upsell at higher rates than cold visitors." },
        ],
      },
      {
        creative: "Ingredient spotlight — v2", platform: "Instagram", campaignType: "Prospecting", angleCategory: "Education", format: "IMG",
        spend: 1800, clicks: 300, cpc: 6.00, cvr: 4.67, orders: 14, revenue: 2380, epc: 7.93, roas: 1.32, aov: 170.00, upsellTakeRate: 26.80, trend: "stable",
        rank: 68, rankTrend: "flat", phase: "Optimizing", launched: "Mar 26",
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-ingredient-spotlight-v2",
        metadata: {
          budget: "$90/day",
          budgetType: "daily",
          geo: ["United States"],
          audience: "Prospecting — Interest: Clean Beauty",
          placements: ["Instagram Feed", "Instagram Stories"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 9", category: "Content", title: "Clean beauty interest holds CVR", insight: "CVR of 4.67% on clean beauty interest audience — 0.83pp above experiment average. Ingredient-first creative matches audience intent." },
          { date: "Apr 2", category: "Offers", title: "Bundle take rate at 48.00%", insight: "Bundle take rate of 48.00% on this ad's traffic. Ingredient education primes visitors to add Vitamin C Drops at the $75 bundle price." },
        ],
      },
      {
        creative: "UGC reel — version 2", platform: "Instagram", campaignType: "Prospecting", angleCategory: "UGC", format: "VID",
        spend: 700, clicks: 200, cpc: 3.50, cvr: 3.50, orders: 7, revenue: 1085, epc: 5.43, roas: 1.55, aov: 155.00, upsellTakeRate: 22.50, trend: "up",
        rank: 42, rankTrend: "up", phase: "Learning", launched: "Apr 10", daysToReliable: 8,
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-ugc-reel-v2",
        metadata: {
          budget: "$100/day",
          budgetType: "daily",
          geo: ["United States", "Canada"],
          audience: "Prospecting — Lookalike 1% Purchasers",
          placements: ["Instagram Reels"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 14", category: "Content", title: "UGC v2 tracks above v1 on early data", insight: "CVR of 3.50% on 200 clicks — 0.38pp above the original UGC reel at the same click volume. Second cut-down holds attention through the product reveal." },
        ],
      },
      {
        creative: "Comparison static", platform: "Facebook", campaignType: "Prospecting", angleCategory: "Education", format: "IMG",
        spend: 820, clicks: 220, cpc: 3.73, cvr: 1.82, orders: 4, revenue: 560, epc: 2.55, roas: 0.68, aov: 140.00, upsellTakeRate: 15.00, trend: "stable",
        rank: 28, rankTrend: "flat", phase: "Learning", launched: "Apr 7", endedAt: "Apr 14", daysToReliable: 5,
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-comparison-static",
        metadata: {
          budget: "$85/day",
          budgetType: "daily",
          geo: ["United States"],
          audience: "Prospecting — Broad Women 25-54",
          placements: ["Facebook Feed"],
          objective: "Sales",
        },
        learnings: [
          { date: "Apr 13", category: "Content", title: "CVR lags broad prospecting benchmark", insight: "CVR of 1.82% — 1.98pp below the Recovery Kit prospecting average. Comparison framing does not match cold audience intent signal." },
          { date: "Apr 10", category: "Content", title: "CPC holds low on broad audience", insight: "CPC of $3.73 on broad Women 25-54 — 44% below experiment average. Cheap clicks do not offset the CVR gap at current spend." },
        ],
      },
      {
        creative: "Dermatologist explanation", platform: "Instagram", campaignType: "Prospecting", angleCategory: "Education", format: "VID",
        spend: 85, clicks: 12, cpc: 7.08, cvr: 0.00, orders: 0, revenue: 0, epc: 0.00, roas: 0.00, aov: 0.00, upsellTakeRate: 0.00, trend: "stable",
        rank: 5, rankTrend: "flat", phase: "New", launched: "Apr 15", daysToReliable: 14,
        variantUrl: "https://variants.velocity.app/exp-123/efg/v-dermatologist-explanation",
        metadata: {
          budget: "$80/day",
          budgetType: "daily",
          geo: ["United States"],
          audience: "Prospecting — Interest: Skincare Professionals",
          placements: ["Instagram Reels"],
          objective: "Sales",
        },
        learnings: [],
      },
    ],
    journeyFunnel: [
      { step: "Presell", withPresell: { count: 1563, pct: 100 }, withoutPresell: null },
      { step: "Sales Page", withPresell: { count: 1203, pct: 77 }, withoutPresell: { count: 1562, pct: 100 } },
      { step: "Checkout", withPresell: { count: 703, pct: 45 }, withoutPresell: { count: 984, pct: 63 } },
      { step: "Order", withPresell: { count: 55, pct: 3.5 }, withoutPresell: { count: 65, pct: 4.2 } },
      { step: "Upsell Taken", withPresell: { count: 20, pct: 1.3 }, withoutPresell: { count: 23, pct: 1.5 } },
    ],
  },
]

// ─── External factors (ad account changes detected by the system) ──────────

export const externalFactors: ExternalFactor[] = [
  {
    date: "Apr 13",
    type: "campaign",
    message: "New campaign detected. 'Spring Sale Retargeting' started sending traffic to exp-123/abc. Performance data accumulating.",
  },
  {
    date: "Apr 11",
    type: "budget",
    message: "Traffic volume from 'Founder story long form' dropped 40% vs. prior week. Budget change detected.",
  },
  {
    date: "Apr 9",
    type: "audience",
    message: "Audience mix shift. TikTok traffic increased from 12% to 28% of total sessions. TikTok traffic converts at 3.12% vs. 4.84% for Meta. This is affecting blended CVR.",
  },
  {
    date: "Apr 7",
    type: "cost",
    message: "CPM spike detected across Meta prospecting ads. CPC increased 34%. Traffic volume held but cost per click is higher.",
  },
]

// ─── Learning Log ───────────────────────────────────────────────────────────

export const learningLog: LearningLogEntry[] = [
  {
    date: "Apr 12",
    category: "Products",
    title: "Bundle beats single by 2.3x",
    insight: "GlowSerum Pro + Daily Moisturizer bundle ($67) now outperforms single-product offers by 2.3x on conversion rate. Bundle is currently weighted at 70% of traffic.",
    impact: "CVR ×2.3",
    metric: { label: "Bundle vs. single CVR", before: "2.5%", after: "5.8%" },
    action: "Increased bundle offer weight to 70% of traffic across all GlowSerum variants. Single-product offers reduced to 30% for baseline comparison.",
    experiments: ["GlowSerum Pro"],
  },
  {
    date: "Apr 8",
    category: "Upsells",
    title: "Upsell reorder lifts take rate",
    insight: "Reordering the upsell flow to show Recovery Kit first (before Vitamin C Drops) increased cumulative upsell take rate from 29% to 34.9%.",
    impact: "Take rate +5.9pp",
    metric: { label: "Upsell take rate", before: "29.0%", after: "34.9%" },
    action: "Reordered upsell flow to show Recovery Kit before Vitamin C Drops across all active variants.",
    experiments: ["GlowSerum Pro", "Recovery Kit"],
  },
  {
    date: "Apr 3",
    category: "Content",
    title: "Education presells win by 18%",
    insight: "Presell pages using ingredient education angle convert 18% higher than testimonial-based presells. Education angles now account for 80% of new variant generation.",
    impact: "CVR +18%",
    metric: { label: "Presell-to-sale CVR", before: "3.4%", after: "4.0%" },
    action: "Shifted presell generation strategy to prioritize ingredient education angles. Testimonial presells reduced to 20% of new variants.",
    experiments: ["GlowSerum Pro"],
  },
  {
    date: "Mar 28",
    category: "Offers",
    title: "$67 price point holds CVR",
    insight: "Testing $67 price point for the GlowSerum + Moisturizer bundle (was $59). Conversion held steady while AOV increased $8 per order. Keeping new price.",
    impact: "AOV +$8",
    metric: { label: "Bundle AOV", before: "$59.00", after: "$67.00" },
    action: "Moved all GlowSerum + Moisturizer bundle variants from $59 to $67 price point after 5-day hold-out test showed no conversion drop.",
    experiments: ["GlowSerum Pro"],
  },
  {
    date: "Mar 22",
    category: "Products",
    title: "Recovery Kit drives repeat buys",
    insight: "Customers who purchase Recovery Kit have 2.1x higher 30-day repeat purchase rate. Recovery Kit buyers account for 34% of repeat orders.",
    impact: "LTV ×2.1",
    metric: { label: "30-day repeat rate", before: "8%", after: "17%" },
    action: "Flagged Recovery Kit for hero product promotion. Increased Recovery Kit bundle offer weight in the Recovery Kit experiment.",
    experiments: ["Recovery Kit"],
  },
  {
    date: "Mar 17",
    category: "Content",
    title: "Baseline established: 3.2% CVR",
    insight: "Initial funnel variants launched. Baseline CVR: 3.2%. 12 variants active across 2 journey types.",
    impact: "Baseline 3.2%",
    metric: { label: "Overall CVR", before: "—", after: "3.2%" },
    action: "Launched 12 initial funnel variants: 6 with presell pages, 6 direct-to-sales. Split evenly across ingredient education and testimonial angles.",
    experiments: ["GlowSerum Pro", "Recovery Kit"],
  },
]

// ─── Orders ─────────────────────────────────────────────────────────────────

export const orders: Order[] = [
  {
    id: "ord_1",
    shopifyId: "184320",
    orderNumber: "#1001",
    date: "2026-03-18T14:34:00",
    customer: { name: "Sarah Chen", email: "sarah.chen@email.com", address: "142 Oak Ave", city: "Portland, OR", postal: "97201", country: "United States", phone: "(503) 555-0142", totalOrders: 3 },
    items: [
      { product: "GlowSerum Pro", variant: "30ml", sku: "GS-PRO-30", compareAtPrice: 49.00, transactionId: "84320", timestamp: "2026-03-18T14:34:00", quantity: 1, price: 39.0, status: "Completed" },
      { product: "Daily Moisturizer", variant: "50ml", sku: "DM-50", compareAtPrice: 35.00, transactionId: "84321", timestamp: "2026-03-18T14:34:00", quantity: 1, price: 28.0, status: "Completed" },
    ],
    subtotal: 67.0,
    taxes: 5.63,
    refunds: 0,
    total: 72.63,
    paymentMethod: "Visa •••• 4242",
    paymentProvider: "Stripe",
    velocityOrderId: "18432",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1201",
      adSetName: "{Ad Set Name}", adSetId: "adset_3301",
      adName: "Ingredient story — carousel", adId: "ad_84320", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "facebook", utmMedium: "paid", utmTerm: "ingredient_education",
      variantName: "Education presell v1", variantId: "var_gs01", variantUrl: "https://variants.velocity.app/exp-123/abc/v-ingredient-education",
    },
  },
  {
    id: "ord_2",
    shopifyId: "184321",
    orderNumber: "#1002",
    date: "2026-03-19T09:12:00",
    customer: { name: "James Wilson", email: "jwilson@gmail.com", address: "88 Pine St", city: "Austin, TX", postal: "78701", country: "United States", phone: "(512) 555-0188", totalOrders: 1 },
    items: [{ product: "GlowSerum Pro", variant: "30ml", sku: "GS-PRO-30", compareAtPrice: 49.00, transactionId: "84322", timestamp: "2026-03-19T09:12:00", quantity: 1, price: 39.0, status: "Completed" }],
    subtotal: 39.0,
    taxes: 3.22,
    refunds: 0,
    total: 42.22,
    paymentMethod: "Mastercard •••• 8819",
    paymentProvider: "Stripe",
    velocityOrderId: "18433",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1201",
      adSetName: "{Ad Set Name}", adSetId: "adset_3302",
      adName: "Before/after UGC — reel", adId: "ad_84322", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "instagram", utmMedium: "paid", utmTerm: "ugc_transformation",
      variantName: "Direct-to-sales v1", variantId: "var_gs02", variantUrl: "https://variants.velocity.app/exp-123/abc/v-ugc-transformation",
    },
  },
  {
    id: "ord_3",
    shopifyId: "184322",
    orderNumber: "#1003",
    date: "2026-03-21T16:45:00",
    customer: { name: "Emily Rodriguez", email: "emily.r@outlook.com", address: "305 Maple Dr", city: "Denver, CO", postal: "80202", country: "United States", phone: "(720) 555-0305", totalOrders: 5 },
    items: [
      { product: "Recovery Kit", variant: "Full Size", sku: "RK-FULL", compareAtPrice: 65.00, transactionId: "84323", timestamp: "2026-03-21T16:45:00", quantity: 1, price: 50.0, status: "Completed" },
      { product: "Vitamin C Drops", variant: "15ml", sku: "VC-15", transactionId: "84324", timestamp: "2026-03-21T16:45:00", quantity: 1, price: 40.0, status: "Completed" },
      { product: "Travel Size Kit", sku: "TSK-01", transactionId: "84325", timestamp: "2026-03-21T16:46:00", quantity: 1, price: 10.0, status: "Completed" },
    ],
    subtotal: 100.0,
    taxes: 7.5,
    refunds: 0,
    total: 107.5,
    paymentMethod: "Visa •••• 1156",
    paymentProvider: "Stripe",
    velocityOrderId: "18434",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1202",
      adSetName: "{Ad Set Name}", adSetId: "adset_3303",
      adName: "Before/after transformation", adId: "ad_84323", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "facebook", utmMedium: "paid", utmTerm: "before_after",
      variantName: "Education presell v2", variantId: "var_rk01", variantUrl: "https://variants.velocity.app/exp-123/efg/v-transformation-bundle",
    },
  },
  {
    id: "ord_4",
    shopifyId: "184323",
    orderNumber: "#1004",
    date: "2026-03-23T11:22:00",
    customer: { name: "Michael Park", email: "mpark@yahoo.com", address: "17 Elm St", city: "Seattle, WA", postal: "98101", country: "United States", phone: "(206) 555-0017", totalOrders: 2 },
    items: [
      { product: "GlowSerum Pro", variant: "30ml", sku: "GS-PRO-30", compareAtPrice: 49.00, transactionId: "84326", timestamp: "2026-03-23T11:22:00", quantity: 1, price: 39.0, status: "Completed" },
      { product: "Daily Moisturizer", variant: "50ml", sku: "DM-50", transactionId: "84327", timestamp: "2026-03-23T11:22:00", quantity: 1, price: 28.0, status: "Completed" },
      { product: "Travel Size Kit", sku: "TSK-01", transactionId: "84328", timestamp: "2026-03-23T11:23:00", quantity: 1, price: 10.0, status: "Completed" },
    ],
    subtotal: 77.0,
    taxes: 6.16,
    refunds: 0,
    total: 83.16,
    paymentMethod: "PayPal",
    paymentProvider: "PayPal",
    velocityOrderId: "18435",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1201",
      adSetName: "{Ad Set Name}", adSetId: "adset_3301",
      adName: "Hero product spotlight — carousel", adId: "ad_84326", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "facebook", utmMedium: "paid", utmTerm: "hero_spotlight",
      variantName: "Education presell v1", variantId: "var_gs01", variantUrl: "https://variants.velocity.app/exp-123/abc/v-hero-spotlight",
    },
  },
  {
    id: "ord_5",
    shopifyId: "184324",
    orderNumber: "#1005",
    date: "2026-03-25T08:51:00",
    customer: { name: "Lisa Thompson", email: "lisa.t@email.com", address: "2201 Grand Blvd", city: "Kansas City, MO", postal: "64108", country: "United States", phone: "(816) 555-2201", totalOrders: 1 },
    items: [
      { product: "Daily Moisturizer", variant: "50ml", sku: "DM-50", compareAtPrice: 35.00, transactionId: "84329", timestamp: "2026-03-25T08:51:00", quantity: 1, price: 30.0, status: "Completed" },
      { product: "Travel Size Kit", sku: "TSK-01", transactionId: "84330", timestamp: "2026-03-25T08:51:00", quantity: 1, price: 10.0, status: "Completed" },
    ],
    subtotal: 40.0,
    taxes: 3.3,
    refunds: 0,
    total: 43.3,
    paymentMethod: "Visa •••• 7734",
    paymentProvider: "Stripe",
    velocityOrderId: "18436",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1201",
      adSetName: "{Ad Set Name}", adSetId: "adset_3304",
      adName: "Feature explainer — reel", adId: "ad_84329", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "facebook", utmMedium: "paid", utmTerm: "feature_explainer",
      variantName: "Education presell v3", variantId: "var_gs03", variantUrl: "https://variants.velocity.app/exp-123/abc/v-feature-reel",
    },
  },
  {
    id: "ord_6",
    shopifyId: "184325",
    orderNumber: "#1006",
    date: "2026-03-28T19:08:00",
    customer: { name: "David Okafor", email: "d.okafor@gmail.com", address: "560 Broad St", city: "Newark, NJ", postal: "07102", country: "United States", phone: "(973) 555-0560", totalOrders: 4 },
    items: [
      { product: "Recovery Kit", variant: "Full Size", sku: "RK-FULL", compareAtPrice: 65.00, transactionId: "84331", timestamp: "2026-03-28T19:08:00", quantity: 1, price: 50.0, status: "Completed" },
      { product: "Vitamin C Drops", variant: "15ml", sku: "VC-15", compareAtPrice: 48.00, transactionId: "84332", timestamp: "2026-03-28T19:08:00", quantity: 1, price: 40.0, status: "Refunded" },
      { product: "GlowSerum Pro", variant: "30ml", sku: "GS-PRO-30", compareAtPrice: 49.00, transactionId: "84333", timestamp: "2026-03-28T19:09:00", quantity: 1, price: 39.0, status: "Completed" },
    ],
    subtotal: 129.0,
    taxes: 9.03,
    refunds: 14.0,
    total: 124.03,
    paymentMethod: "Mastercard •••• 3301",
    paymentProvider: "Stripe",
    velocityOrderId: "18437",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1202",
      adSetName: "{Ad Set Name}", adSetId: "adset_3305",
      adName: "Clinical results — static", adId: "ad_84331", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "facebook", utmMedium: "paid", utmTerm: "clinical_results",
      variantName: "Direct-to-sales v1", variantId: "var_rk02", variantUrl: "https://variants.velocity.app/exp-123/efg/v-retargeting-clinical",
    },
  },
  {
    id: "ord_7",
    shopifyId: "184326",
    orderNumber: "#1007",
    date: "2026-04-01T13:17:00",
    customer: { name: "Amanda Foster", email: "afoster@email.com", address: "83 Birch Ln", city: "Nashville, TN", postal: "37201", country: "United States", phone: "(615) 555-0083", totalOrders: 2 },
    items: [
      { product: "GlowSerum Pro", variant: "30ml", sku: "GS-PRO-30", compareAtPrice: 49.00, transactionId: "84334", timestamp: "2026-04-01T13:17:00", quantity: 1, price: 39.0, status: "Completed" },
      { product: "Daily Moisturizer", variant: "50ml", sku: "DM-50", compareAtPrice: 35.00, transactionId: "84335", timestamp: "2026-04-01T13:17:00", quantity: 1, price: 28.0, status: "Completed" },
    ],
    subtotal: 67.0,
    taxes: 5.63,
    refunds: 0,
    total: 72.63,
    paymentMethod: "PayPal",
    paymentProvider: "PayPal",
    velocityOrderId: "18438",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1201",
      adSetName: "{Ad Set Name}", adSetId: "adset_3306",
      adName: "Problem/solution — static", adId: "ad_84334", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "facebook", utmMedium: "paid", utmTerm: "problem_solution",
      variantName: "Direct-to-sales v2", variantId: "var_gs04", variantUrl: "https://variants.velocity.app/exp-123/abc/v-retargeting-direct",
    },
  },
  {
    id: "ord_8",
    shopifyId: "184327",
    orderNumber: "#1008",
    date: "2026-04-04T10:03:00",
    customer: { name: "Ryan Nakamura", email: "ryan.n@outlook.com", address: "411 2nd Ave", city: "San Francisco, CA", postal: "94107", country: "United States", phone: "(415) 555-0411", totalOrders: 1 },
    items: [
      { product: "Recovery Kit", variant: "Full Size", sku: "RK-FULL", compareAtPrice: 65.00, transactionId: "84336", timestamp: "2026-04-04T10:03:00", quantity: 1, price: 50.0, status: "Completed" },
      { product: "Travel Size Kit", sku: "TSK-01", transactionId: "84337", timestamp: "2026-04-04T10:04:00", quantity: 1, price: 10.0, status: "Completed" },
    ],
    subtotal: 60.0,
    taxes: 5.18,
    refunds: 0,
    total: 65.18,
    paymentMethod: "Visa •••• 6891",
    paymentProvider: "Stripe",
    velocityOrderId: "18439",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1202",
      adSetName: "{Ad Set Name}", adSetId: "adset_3307",
      adName: "Morning routine — 60s", adId: "ad_84336", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "instagram", utmMedium: "paid", utmTerm: "morning_routine",
      variantName: "Education presell v4", variantId: "var_rk03", variantUrl: "https://variants.velocity.app/exp-123/efg/v-routine",
    },
  },
  {
    id: "ord_9",
    shopifyId: "184328",
    orderNumber: "#1009",
    date: "2026-04-08T15:42:00",
    customer: { name: "Priya Sharma", email: "priya.s@gmail.com", address: "29 Lake Shore Dr", city: "Chicago, IL", postal: "60601", country: "United States", phone: "(312) 555-0029", totalOrders: 1 },
    items: [{ product: "GlowSerum Pro", variant: "30ml", sku: "GS-PRO-30", compareAtPrice: 49.00, transactionId: "84338", timestamp: "2026-04-08T15:42:00", quantity: 1, price: 39.0, status: "Refunded" }],
    subtotal: 39.0,
    taxes: 3.81,
    refunds: 39.0,
    total: 3.81,
    paymentMethod: "Visa •••• 5501",
    paymentProvider: "Stripe",
    velocityOrderId: "18440",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1201",
      adSetName: "{Ad Set Name}", adSetId: "adset_3308",
      adName: "Customer testimonials — compilation", adId: "ad_84338", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "instagram", utmMedium: "paid", utmTerm: "testimonials",
      variantName: "Testimonial presell v1", variantId: "var_gs05", variantUrl: "https://variants.velocity.app/exp-123/abc/v-testimonial-compilation",
    },
  },
  {
    id: "ord_10",
    shopifyId: "184329",
    orderNumber: "#1010",
    date: "2026-04-12T20:19:00",
    customer: { name: "Chris Martinez", email: "cmartinez@email.com", address: "750 SW 3rd Ave", city: "Miami, FL", postal: "33130", country: "United States", phone: "(305) 555-0750", totalOrders: 7 },
    items: [
      { product: "GlowSerum Pro", variant: "30ml", sku: "GS-PRO-30", compareAtPrice: 49.00, transactionId: "84339", timestamp: "2026-04-12T20:19:00", quantity: 1, price: 39.0, status: "Completed" },
      { product: "Daily Moisturizer", variant: "50ml", sku: "DM-50", compareAtPrice: 35.00, transactionId: "84340", timestamp: "2026-04-12T20:19:00", quantity: 1, price: 28.0, status: "Completed" },
      { product: "Travel Size Kit", sku: "TSK-01", transactionId: "84341", timestamp: "2026-04-12T20:20:00", quantity: 1, price: 10.0, status: "Completed" },
    ],
    subtotal: 77.0,
    taxes: 5.39,
    refunds: 0,
    total: 82.39,
    paymentMethod: "PayPal",
    paymentProvider: "PayPal",
    velocityOrderId: "18441",
    attribution: {
      campaignName: "{Campaign Name}", campaignId: "camp_1201",
      adSetName: "{Ad Set Name}", adSetId: "adset_3301",
      adName: "Ingredient story — carousel", adId: "ad_84320", adUrl: "https://business.facebook.com/adsmanager/manage/ads",
      utmSource: "facebook", utmMedium: "paid", utmTerm: "ingredient_education",
      variantName: "Education presell v1", variantId: "var_gs01", variantUrl: "https://variants.velocity.app/exp-123/abc/v-ingredient-education",
    },
  },
  // ─── Generated orders (50 more for pagination demo) ──────────────────────
  ...(() => {
    const names = ["Olivia Kim", "Noah Davis", "Sophia Patel", "Liam Garcia", "Emma Johnson", "Mason Lee", "Ava Thompson", "Lucas Brown", "Mia Williams", "Ethan Taylor", "Isabella Moore", "Aiden Jackson", "Charlotte White", "Logan Harris", "Amelia Martin", "Elijah Clark", "Harper Lewis", "James Robinson", "Evelyn Walker", "Benjamin Hall", "Abigail Allen", "Alexander Young", "Emily King", "Daniel Wright", "Ella Hill", "Henry Scott", "Grace Adams", "Sebastian Baker", "Chloe Nelson", "Jack Carter", "Zoey Mitchell", "Owen Perez", "Lily Roberts", "Caleb Turner", "Hannah Phillips", "Ryan Campbell", "Aria Parker", "Nathan Evans", "Layla Edwards", "Samuel Collins", "Riley Stewart", "Leo Morris", "Nora Reed", "Isaiah Cook", "Scarlett Morgan", "Gabriel Bell", "Penelope Murphy", "David Bailey", "Victoria Rivera", "Matthew Cox"]
    const emails = names.map((n) => n.toLowerCase().replace(" ", ".") + "@email.com")
    const products = [
      { name: "GlowSerum Pro", variant: "30ml", sku: "GS-PRO-30", price: 39 },
      { name: "Daily Moisturizer", variant: "50ml", sku: "DM-50", price: 28 },
      { name: "Recovery Kit", variant: "Full Size", sku: "RK-FULL", price: 50 },
      { name: "Vitamin C Drops", variant: "15ml", sku: "VC-15", price: 40 },
      { name: "Travel Size Kit", sku: "TSK-01", price: 10 },
    ]
    const ads = [
      { name: "Ingredient story — carousel", id: "ad_84320", term: "ingredient_education" },
      { name: "Before/after UGC — reel", id: "ad_84322", term: "ugc_transformation" },
      { name: "Hero product spotlight — carousel", id: "ad_84326", term: "hero_spotlight" },
      { name: "Clinical results — static", id: "ad_84331", term: "clinical_results" },
      { name: "Feature explainer — reel", id: "ad_84329", term: "feature_explainer" },
    ]
    const providers: ("Stripe" | "PayPal")[] = ["Stripe", "Stripe", "Stripe", "PayPal", "PayPal"]
    const cards = ["Visa •••• 4242", "Mastercard •••• 8819", "Visa •••• 1156", "PayPal", "PayPal"]
    const sources: ("facebook" | "instagram")[] = ["facebook", "facebook", "instagram", "facebook", "instagram"]

    return Array.from({ length: 50 }, (_, i) => {
      const idx = i
      const seed = (idx * 7 + 13) % 50
      const day = 16 + (idx % 28)
      const month = day > 31 ? 4 : 3
      const dayOfMonth = day > 31 ? day - 31 : day
      const hour = 8 + (seed % 12)
      const min = (seed * 3) % 60
      const dateStr = `2026-0${month}-${String(dayOfMonth).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`
      const numItems = 1 + (seed % 3)
      const itemIndices = Array.from({ length: numItems }, (_, j) => (seed + j) % products.length)
      const items: OrderItem[] = itemIndices.map((pi, j) => {
        const p = products[pi]
        const qty = pi === 4 ? 1 : 1 + (seed % 2)
        return {
          product: p.name, variant: p.variant, sku: p.sku, transactionId: `9${String(1000 + idx * 3 + j)}`,
          timestamp: dateStr, quantity: qty, price: p.price, status: "Completed" as const,
        }
      })
      const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
      const taxes = +(subtotal * 0.08).toFixed(2)
      const hasRefund = seed % 10 === 0
      const refunds = hasRefund ? items[0].price : 0
      const total = +(subtotal + taxes - refunds).toFixed(2)
      const provIdx = idx % 5
      const adIdx = idx % 5
      const ad = ads[adIdx]
      const srcIdx = idx % 5
      return {
        id: `ord_gen_${idx + 1}`,
        shopifyId: String(185000 + idx),
        orderNumber: `#${2001 + idx}`,
        date: dateStr,
        customer: {
          name: names[idx], email: emails[idx],
          address: `${100 + idx} Main St`, city: "Portland, OR", postal: "97201",
          country: "United States", phone: `(503) 555-${String(1000 + idx).slice(-4)}`,
          totalOrders: 1 + (seed % 5),
        },
        items,
        subtotal, taxes, refunds, total,
        paymentMethod: cards[provIdx],
        paymentProvider: providers[provIdx],
        velocityOrderId: String(19000 + idx),
        attribution: {
          campaignName: "{Campaign Name}", campaignId: `camp_${1200 + (idx % 3)}`,
          adSetName: "{Ad Set Name}", adSetId: `adset_${3300 + (idx % 5)}`,
          adName: ad.name, adId: ad.id,
          adUrl: "https://business.facebook.com/adsmanager/manage/ads",
          utmSource: sources[srcIdx], utmMedium: "paid", utmTerm: ad.term,
          variantName: `Variant ${(idx % 4) + 1}`, variantId: `var_gen_${idx + 1}`,
          variantUrl: `https://brand.com/exp-123/${["abc", "efg", "hij", "klm", "nop"][idx % 5]}`,
        },
      }
    })
  })(),
]

// ─── Earnings ───────────────────────────────────────────────────────────────

export const earnings: Earnings = {
  grossRevenue: 48320.0,
  refunds: 892.0,
  platformFee: 2371.4,
  processingFees: 1401.28,
  netProfit: 43655.32,
}

// ─── AI Insights ────────────────────────────────────────────────────────────

export const insights: string[] = [
  'Your funnels convert <strong>4.21% of visitors</strong> at <strong>$127 AOV</strong>, up from 2.80% at $89 when you started. At your current traffic levels, that rate improvement accounts for an estimated <strong>$35,340 in additional monthly revenue</strong> compared to your pre-Velocity baseline.',
  'RPV improved from $2.49 to $5.34 (+114%). The lift comes primarily from AOV improvement ($89 → $127) driven by bundle offer performance — bundles convert at 5.80% CVR vs. 2.50% for single-product offers.',
  'Funnels with a presell page convert 18% higher end-to-end than those without. The top-performing presell angle is <strong>ingredient education</strong>, which accounts for 80% of current variant generation.',
  'Upsell take rate of <strong>34.90%</strong> (up from 22.00% baseline) adds $12.10 to AOV on upsell-accepting orders. The Recovery Kit first upsell produces 40% higher second-upsell acceptance than alternative sequences.',
]

// ─── Agent Q&A ──────────────────────────────────────────────────────────────

export const agentWelcome =
  "Hi! I can answer any questions about your Velocity performance. Try asking about your best-selling products, upsell performance, or revenue trends."

export const agentQA: AgentQA[] = [
  {
    triggers: ["best-selling product combinations", "best selling", "product combinations", "top combos"],
    response: `Your top 3 product combinations by revenue:

**1. GlowSerum Pro + Daily Moisturizer** ($67 bundle) — 142 orders, $9,514 revenue. This is your strongest combo — customers who buy this bundle have a 23% higher lifetime value.

**2. GlowSerum Pro (single)** ($39) — 98 orders, $3,822 revenue. Solid standalone performer but converts 2.3x lower than the bundle above.

**3. Recovery Kit + Vitamin C Drops** ($75 bundle) — 67 orders, $5,025 revenue. This combination has the highest AOV of any bundle at $75.

Your upsell flow is also performing well — 34.9% of customers who complete checkout accept at least one upsell. The Travel Size Kit at $10 is your most-accepted upsell at 28% take rate.`,
  },
  {
    triggers: ["upsells performing", "upsell", "upsells"],
    response: `Your upsell performance is strong and improving:

**Overall take rate: 34.9%** (up 3.7% this period). Here's the breakdown:

**First upsell — Recovery Kit ($50):** 22% take rate. This was moved to the first position on Apr 8, up from 18% in the prior position.

**Second upsell — Vitamin C Drops ($40):** 14.2% take rate among customers who saw it (those who accepted or declined the first upsell).

**Checkout add-on — Travel Size Kit ($10):** 28% take rate. This fires on the checkout page itself, independent of the post-purchase upsell flow.

The key insight: showing **Recovery Kit first** (before Vitamin C Drops) increased the cumulative upsell take rate from 29% to 34.9%. Customers who accept the Recovery Kit are 40% more likely to also accept the Vitamin C Drops as a second upsell.`,
  },
  {
    triggers: ["refund rate", "refund", "refunds"],
    response: `Your refund rate this period: **1.85%** ($892 in refunds on $48,320 gross revenue).

This is **below the DTC industry average of 3-5%**, which is a strong signal about product-market fit and customer satisfaction.

**Pattern analysis:**
- 3 of 298 orders were refunded (1.0% by order count)
- Refunds are concentrated in single-product orders — bundle buyers have a near-zero refund rate
- No refund requests on orders containing the Recovery Kit

The low refund rate suggests your funnel is setting accurate expectations. The presell pages in particular seem to be pre-qualifying buyers effectively.`,
  },
  {
    triggers: ["traffic sources", "traffic", "sources convert"],
    response: `Traffic source performance for the last 30 days:

**Meta (Facebook/Instagram):** 1,100 sessions → 4.8% CVR → $22,400 revenue
Best performing source overall. The ingredient education presell works especially well with Meta traffic.

**Google (Search + Shopping):** 520 sessions → 4.1% CVR → $12,800 revenue
Lower volume but consistent conversion. These are high-intent buyers — they convert well without a presell page.

**TikTok:** 380 sessions → 2.9% CVR → $8,120 revenue
Lowest CVR but growing volume (+34% sessions this period). TikTok traffic responds best to the before/after transformation presell angle.

Meta has the highest return per dollar spent. TikTok traffic quality is improving — CVR increased 0.4pp this period as the system learns which angles work for that audience.`,
  },
  {
    triggers: ["changed this week", "week vs last", "what changed"],
    response: `Here's what changed this week compared to last:

**Revenue:** $12,840 → $13,210 **(+2.9%)**
**Orders:** 78 → 84 **(+7.7%)**
**AOV:** $42.10 → $40.90 **(-2.9%)** — slight dip driven by more single-product orders from TikTok traffic
**CVR:** 4.08% → 4.34% **(+6.4%)**

**Key drivers:**
- The GlowSerum + Moisturizer bundle accounted for 62% of this week's revenue (up from 55% last week)
- Upsell take rate held steady at 34.9%
- TikTok sessions increased 18% but at lower AOV, which is dragging the average down

**Net assessment:** Strong week. Revenue and orders up, CVR improving. The AOV dip is a traffic mix issue, not a pricing problem — your bundle buyers are spending more than ever.`,
  },
  {
    triggers: ["average customer spend", "spend range", "order distribution"],
    response: `Your customer spend distribution for the last 30 days:

**62% of orders** fall between **$35–$55** — these are mostly single-product purchases and the lower-priced bundles.

**28% of orders** are in the **$55–$80 range** — primarily the GlowSerum + Moisturizer bundle ($67) and Recovery Kit combos.

**10% of orders** are **$80+** — these are multi-product orders with upsells. This segment has 3.2x higher lifetime value.

Your AOV is $41.61, but the **median order is $39** (a single GlowSerum Pro). The bundles at $67+ are where the real margin lives — they convert at a higher rate AND have better retention.

**Opportunity:** If you can shift 10% of single-product buyers to the $67 bundle, that's roughly +$2,800/month in revenue with no additional traffic.`,
  },
  {
    triggers: ["upsell flow", "best upsell flow", "upsell sequence", "upsell path"],
    response: `Your upsell flows, ranked by cumulative take rate:

**Flow 1 (current winner):**
Recovery Kit ($50) → Vitamin C Drops ($40)
- First upsell take rate: 22%
- Second upsell take rate: 14.2%
- **Cumulative take rate: 34.9%**
- Average upsell revenue per order: $18.40

**Flow 2 (previous):**
Vitamin C Drops ($40) → Recovery Kit ($50)
- First upsell take rate: 19%
- Second upsell take rate: 11%
- Cumulative take rate: 29%
- Average upsell revenue per order: $14.20

The system tested both orderings and found that showing **Recovery Kit first** works better because it has higher perceived value at $50, making the $40 Vitamin C Drops feel like an easy add-on.

The **Travel Size Kit** ($10 checkout add-on) performs independently at 28% take rate and is additive to both flows.`,
  },
]

export const suggestedQuestions = [
  "How are my upsells performing?",
  "What's my refund rate?",
  "Which traffic sources convert best?",
  "What changed this week vs. last?",
  "What's the average customer spend range?",
  "What upsell flow is working best?",
]

// Pre-seeded conversation for the demo
export const agentConversation: AgentMessage[] = [
  {
    role: "user",
    content: "What are my best-selling product combinations?",
  },
  {
    role: "agent",
    content: agentQA[0].response,
  },
]
