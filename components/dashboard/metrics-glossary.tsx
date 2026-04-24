"use client"

import { useState, useRef, useEffect } from "react"
import { X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { rateKpis, adBaselines, portfolioSummary } from "@/lib/data"

// ─── Glossary data ─────────────────────────────────────────────────────────

interface MetricEntry {
  name: string
  shortName?: string
  anchor: string
  category: string
  currentValue: string
  baseline?: string
  definition: string
  calculation?: string
  whyItMatters: string
  whatItDoesntTellYou: string
}

const cvrKpi = rateKpis.find((k) => k.key === "cvr")!
const aovKpi = rateKpis.find((k) => k.key === "aov")!
const rpvKpi = rateKpis.find((k) => k.key === "rpv")!

const CATEGORIES = [
  "Economics metrics",
  "Efficiency metrics",
  "Volume metrics",
  "Experimentation metrics",
  "Engagement metrics",
] as const

const METRICS: MetricEntry[] = [
  // ─── Economics ────────────────────────────────────────────────────────────
  {
    name: "Average Order Value",
    shortName: "AOV",
    anchor: "aov",
    category: "Economics metrics",
    currentValue: `$${aovKpi.value.toFixed(2)}`,
    baseline: `$${aovKpi.baseline.toFixed(2)}`,
    definition:
      "The average total value of orders processed through this ad's traffic. Includes product price, upsells, and bundle adjustments; excludes taxes and shipping.",
    calculation: "AOV = total revenue / number of orders",
    whyItMatters:
      "AOV tells you how much each customer spends. A higher AOV means you can tolerate a higher [[cpa]] while staying profitable. Velocity optimizes AOV through offer design, bundles, and post-purchase upsells — this is a metric the system actively influences.",
    whatItDoesntTellYou:
      "AOV alone doesn't tell you whether the ad is profitable. You need [[cpa]] and contribution margin to complete the picture. A high AOV from a high-cost-of-goods product might be less profitable than a lower AOV on a high-margin one.",
  },
  {
    name: "Cost Per Acquisition",
    shortName: "CPA",
    anchor: "cpa",
    category: "Economics metrics",
    currentValue: "$135.31",
    baseline: `$${adBaselines.cpa.toFixed(2)}`,
    definition:
      "The observed cost per customer for this ad, calculated from actual spend and actual orders produced, including all variants currently in testing.",
    calculation:
      "CPA = ad spend directed at this ad / unique customers produced by this ad's traffic",
    whyItMatters:
      "CPA is the bottom-line ad efficiency metric — how much you paid to acquire each customer. Media buyers use CPA to judge whether an ad is profitable relative to the offer's margin.",
    whatItDoesntTellYou:
      "Observed CPA during experimentation is polluted by variants that haven't won yet. For a cleaner read, see [[true-cpa]]. CPA also doesn't reflect offer economics on its own — pair with [[aov]] and contribution margin to judge whether the CPA is healthy.",
  },
  {
    name: "Cost per Customer",
    anchor: "cost-per-customer",
    category: "Economics metrics",
    currentValue: "$135.31",
    baseline: `$${adBaselines.cpa.toFixed(2)}`,
    definition:
      "The cost of acquiring each customer through Velocity. A scoped version of CAC that only includes traffic sent to Velocity funnels.",
    calculation:
      "Cost per Customer = ad spend directed to Velocity / orders processed through Velocity's checkout",
    whyItMatters:
      "This is the cost side of unit economics for the Velocity experience specifically. Unlike blended CAC across the whole account, this metric is auditable from both sides — the merchant knows their ad spend, Velocity knows the orders.",
    whatItDoesntTellYou:
      "Observed Cost per Customer during experimentation can be inflated by variants being tested. For the cleaner version, see [[true-cpa]]. Cost per Customer alone also doesn't tell you if the CAC is healthy — pair with [[aov]] and contribution margin.",
  },
  {
    name: "True Cost Per Acquisition",
    shortName: "True CPA",
    anchor: "true-cpa",
    category: "Economics metrics",
    currentValue: "$101.62",
    baseline: `$${adBaselines.cpa.toFixed(2)}`,
    definition:
      "The projected cost per acquisition for this ad if traffic were routed to the current winning variant. Separates the ad's actual performance from the temporary cost of Velocity's experimentation.",
    calculation:
      "Of all variants for this ad with sufficient data, True CPA = the CPA of the best-performing variant. Variants in learning or new state do not contribute. Variants the system has identified as underperformers do not contribute.",
    whyItMatters:
      "During experimentation, observed [[cpa]] is inflated because some traffic goes to variants being tested. True CPA answers: \"What would this ad's CPA be if we finished experimenting and committed to the winner?\" Use True CPA over observed CPA to decide whether to scale or pause an ad.",
    whatItDoesntTellYou:
      "True CPA is a projection, not a guarantee. Its reliability depends on data volume and the margin between the winner and next-best variant. A [[confidence-indicator]] accompanies every True CPA estimate to communicate reliability.",
  },
  // ─── Efficiency ──────────────────────────────────────────────────────────
  {
    name: "Conversion Rate",
    shortName: "CVR",
    anchor: "cvr",
    category: "Efficiency metrics",
    currentValue: `${cvrKpi.value.toFixed(2)}%`,
    baseline: `${cvrKpi.baseline.toFixed(2)}%`,
    definition:
      "The percentage of visitors from this ad that complete a purchase.",
    calculation: "CVR = orders / visitors, expressed as a percentage",
    whyItMatters:
      "CVR tells you how effective the funnel is at converting traffic into customers. Velocity optimizes CVR through landing page, presell, and checkout design.",
    whatItDoesntTellYou:
      "CVR in aggregate across different offers or audiences is misleading. A low CVR from a high-intent audience might produce better economics than a high CVR from a low-intent audience. For a unified efficiency read, use [[rpv]], which combines CVR and [[aov]].",
  },
  {
    name: "Earnings Per Click",
    shortName: "EPC",
    anchor: "epc",
    category: "Efficiency metrics",
    currentValue: `$${rpvKpi.value.toFixed(2)}`,
    baseline: `$${rpvKpi.baseline.toFixed(2)}`,
    definition:
      "The revenue produced per click on this ad. A normalized view of ad efficiency that combines conversion and order value into one number.",
    calculation: "EPC = total revenue from this ad / total clicks on this ad",
    whyItMatters:
      "EPC is a single efficiency metric that captures whether the ad's traffic produces value. Two ads with different click volumes can be compared directly. Higher EPC means the traffic converts well and spends well.",
    whatItDoesntTellYou:
      "EPC doesn't include ad spend. Pair with [[cpc]] to judge profitability. If EPC is $5 and CPC is $3, you're profitable per click.",
  },
  {
    name: "Rank",
    anchor: "rank",
    category: "Efficiency metrics",
    currentValue: "Avg 68",
    definition:
      "A percentile score showing how this ad performs relative to the merchant's other ads, combining multiple performance metrics into a single signal. Expressed as 0–100.",
    calculation:
      "Rank is a composite score derived from weighted performance metrics ([[cvr]], [[rpv]], [[roas]]), benchmarked against all Established and Optimizing ads in the merchant's account. Ads in New or Learning [[phase]] are excluded.",
    whyItMatters:
      "Rank gives a scannable single-number view of ad performance. It lets merchants quickly identify their best and worst ads without cross-referencing multiple metric columns.",
    whatItDoesntTellYou:
      "Rank is relative, not absolute. An ad at 50th percentile in a high-performing account might outperform an ad at 90th in a weak account. Rank also doesn't tell you which dimension is driving the score.",
  },
  {
    name: "Return on Ad Spend",
    shortName: "ROAS",
    anchor: "roas",
    category: "Efficiency metrics",
    currentValue: `${(portfolioSummary.revenue / 19600).toFixed(2)}x`,
    baseline: `${adBaselines.roas.toFixed(2)}x`,
    definition:
      "Revenue produced per dollar of ad spend. A top-level efficiency metric.",
    calculation: "ROAS = revenue / spend, expressed as a multiplier (e.g., 2.5x)",
    whyItMatters:
      "ROAS is the simplest measure of ad profitability. Above 1.0x means the ads produce more revenue than they cost. Most merchants have a target ROAS based on their margins.",
    whatItDoesntTellYou:
      "ROAS doesn't account for cost of goods or operating expenses. A 2x ROAS might be unprofitable for a product with 60% cost of goods. ROAS also doesn't isolate what Velocity controls — it's influenced by both ad costs and funnel performance.",
  },
  {
    name: "Revenue Per Visitor",
    shortName: "RPV",
    anchor: "rpv",
    category: "Efficiency metrics",
    currentValue: `$${rpvKpi.value.toFixed(2)}`,
    baseline: `$${rpvKpi.baseline.toFixed(2)}`,
    definition:
      "The average revenue produced per visitor who reaches Velocity's funnel.",
    calculation: "RPV = total revenue from this traffic / total visitors",
    whyItMatters:
      "RPV is a unified efficiency metric that combines [[cvr]] and [[aov]]. If RPV is climbing, Velocity's funnel is converting visitors into more value per head — whether CVR improved, AOV improved, or both.",
    whatItDoesntTellYou:
      "RPV doesn't include spend, so it can't tell you if the ad is profitable. Pair with [[cpc]] to determine profitability per click.",
  },
  // ─── Volume ──────────────────────────────────────────────────────────────
  {
    name: "Clicks",
    anchor: "clicks",
    category: "Volume metrics",
    currentValue: `${portfolioSummary.visitors.toLocaleString()}`,
    definition:
      "The number of clicks on this ad during the current period, as reported by Meta.",
    calculation: "Direct pull from Meta ad platform.",
    whyItMatters:
      "Clicks are the top of Velocity's funnel — the visitors sent to Velocity's experiment links. Click volume determines how much data Velocity can use to run experiments effectively.",
    whatItDoesntTellYou:
      "Click volume alone doesn't tell you anything about quality. High clicks with low conversions could indicate an audience mismatch between ad and offer.",
  },
  {
    name: "Cost Per Click",
    shortName: "CPC",
    anchor: "cpc",
    category: "Volume metrics",
    currentValue: "$6.20",
    definition:
      "The average cost the merchant pays per click on this ad.",
    calculation: "CPC = spend / clicks",
    whyItMatters:
      "CPC tells you the cost of traffic. Lower CPC means more clicks per dollar. CPC is a merchant-owned metric — driven by audience targeting, creative quality, and Meta's auction dynamics. Pair CPC with [[epc]] to judge per-click profitability.",
    whatItDoesntTellYou:
      "CPC alone doesn't tell you if clicks are converting. A low CPC on low-quality traffic can produce worse economics than a high CPC on high-quality traffic.",
  },
  {
    name: "Orders",
    anchor: "orders",
    category: "Volume metrics",
    currentValue: "298",
    definition:
      "The total number of customer orders processed through Velocity's checkout from this ad's traffic during the current period.",
    calculation: "Count of unique orders from this ad's traffic.",
    whyItMatters:
      "Orders is the fact of conversion. It's the numerator for [[cvr]] and the denominator for [[cpa]] and [[aov]].",
    whatItDoesntTellYou:
      "Order count without context doesn't tell you efficiency. Pair with visitors (for [[cvr]]) or spend (for [[cpa]]) to make it meaningful.",
  },
  {
    name: "Revenue",
    anchor: "revenue",
    category: "Volume metrics",
    currentValue: `$${portfolioSummary.revenue.toLocaleString()}`,
    definition:
      "Total revenue processed through Matter's checkout from this ad's traffic. A factual total, not an attribution claim.",
    calculation: "Revenue = sum of all order values from this ad's traffic",
    whyItMatters:
      "Revenue is the outcome. It tells you the total value Velocity's funnel has produced from this ad's visitors.",
    whatItDoesntTellYou:
      "Revenue alone doesn't tell you whether the system is working. High revenue could come from high traffic volume rather than improved rates. To judge Velocity's impact, use rate metrics ([[cvr]], [[aov]], [[rpv]]) and compare to baseline.",
  },
  {
    name: "Spend",
    anchor: "spend",
    category: "Volume metrics",
    currentValue: "$19,600",
    definition:
      "Total ad spend on ads directed to Velocity for the current period.",
    calculation:
      "Spend is pulled directly from Meta and reflects what the merchant paid for ads pointing to Velocity experiment links.",
    whyItMatters:
      "Spend is the merchant's input — what they paid to send traffic to Velocity. It's the denominator for [[cpa]], [[cpc]], and [[roas]].",
    whatItDoesntTellYou:
      "Spend alone doesn't tell you anything about performance. Pair with clicks (for [[cpc]]), orders (for [[cpa]]), or revenue (for [[roas]]) to make it meaningful.",
  },
  // ─── Experimentation ─────────────────────────────────────────────────────
  {
    name: "Confidence Indicator",
    anchor: "confidence-indicator",
    category: "Experimentation metrics",
    currentValue: "High",
    definition:
      "A reliability signal attached to [[true-cpa]] estimates. Tells merchants how much to trust the projection.",
    calculation:
      "Derived from three factors: data volume on the winning variant, margin between winner and next-best variant, and duration of the winner's lead. Maps to three levels: High, Medium, Low.",
    whyItMatters:
      "[[true-cpa]] is a projection, and projections vary in reliability. The confidence indicator prevents merchants from over-trusting early estimates that might shift as more data comes in.",
    whatItDoesntTellYou:
      "Confidence is about the projection, not about the ad's quality. Low confidence on a high [[true-cpa]] estimate doesn't mean the ad is bad — it means the system hasn't settled on a clear winner yet.",
  },
  {
    name: "Phase",
    anchor: "phase",
    category: "Experimentation metrics",
    currentValue: "—",
    definition:
      "A lifecycle indicator showing how mature Velocity's experimentation is for this ad's traffic: New, Learning, Optimizing, or Established.",
    whyItMatters:
      "Phase tells merchants which ads they can trust the data on. A low-[[rank]] ad in Learning phase isn't necessarily underperforming — it hasn't accumulated enough data to judge. Phase prevents premature scaling or killing decisions.",
    whatItDoesntTellYou:
      "Phase tells you about data reliability, not performance quality. An Established ad can be a winner or a loser; the Phase tag just means the performance read is trustworthy.",
  },
  // ─── Engagement ──────────────────────────────────────────────────────────
  {
    name: "Upsell Take Rate",
    anchor: "upsell-take-rate",
    category: "Engagement metrics",
    currentValue: `${adBaselines.upsellTakeRate.toFixed(2)}%`,
    definition:
      "The percentage of customers who accept a post-purchase upsell offer.",
    calculation:
      "Upsell Take Rate = customers who accepted at least one upsell / total customers, expressed as a percentage",
    whyItMatters:
      "Upsell take rate drives [[aov]]. If the rate is high, the upsell offer resonates with the audience and boosts per-customer revenue. Velocity tests upsell offers as part of variant experimentation.",
    whatItDoesntTellYou:
      "Take rate alone doesn't tell you the revenue impact. Pair with upsell price to calculate the [[aov]] lift. A 50% take rate on a $10 upsell produces less revenue than a 20% take rate on a $50 upsell.",
  },
]

// ─── Cross-reference rendering ─────────────────────────────────────────────

function renderWithLinks(
  text: string,
  onNavigate: (anchor: string) => void
): React.ReactNode {
  // Replace [[anchor]] with clickable links
  const parts = text.split(/(\[\[[^\]]+\]\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[\[([^\]]+)\]\]$/)
    if (match) {
      const anchor = match[1]
      const metric = METRICS.find((m) => m.anchor === anchor)
      const label = metric?.shortName || metric?.name || anchor
      return (
        <button
          key={i}
          onClick={() => onNavigate(anchor)}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {label}
        </button>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// ─── Glossary sidebar ──────────────────────────────────────────────────────

export function MetricsGlossary({
  onClose,
  initialAnchor,
}: {
  onClose: () => void
  initialAnchor?: string | null
}) {
  const [search, setSearch] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToAnchor = (anchor: string) => {
    const el = scrollRef.current?.querySelector(`[data-anchor="${anchor}"]`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  useEffect(() => {
    if (initialAnchor) {
      // Small delay to let the DOM render
      setTimeout(() => scrollToAnchor(initialAnchor), 100)
    }
  }, [initialAnchor])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const q = search.toLowerCase()
  const filtered = q
    ? METRICS.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.shortName && m.shortName.toLowerCase().includes(q)) ||
          m.anchor.includes(q)
      )
    : METRICS

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    metrics: filtered.filter((m) => m.category === cat),
  })).filter((g) => g.metrics.length > 0)

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[9999] w-[960px] max-w-[95vw] bg-background border-l shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b shrink-0">
          <h2 className="text-base font-semibold">Metrics Glossary</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {grouped.map((group) => (
            <div key={group.category}>
              {/* Sticky category header */}
              <div className="sticky top-0 z-10 bg-muted px-6 py-2 border-b">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                  {group.category}
                </p>
              </div>

              {/* Metric entries */}
              {group.metrics.map((metric) => (
                <div
                  key={metric.anchor}
                  data-anchor={metric.anchor}
                  className="px-6 py-6 border-b scroll-mt-10"
                >
                  {/* Name + short name */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {metric.name}
                    </h3>
                    {metric.shortName && metric.shortName !== metric.name && (
                      <span className="text-sm text-muted-foreground">
                        ({metric.shortName})
                      </span>
                    )}
                  </div>

                  {/* Current value + baseline */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold tabular-nums text-foreground">
                      {metric.currentValue}
                    </span>
                    {metric.baseline && (
                      <span className="text-sm text-muted-foreground">
                        Baseline: {metric.baseline}
                      </span>
                    )}
                  </div>

                  {/* Sections */}
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Definition</p>
                      <p className="text-foreground leading-relaxed">
                        {renderWithLinks(metric.definition, scrollToAnchor)}
                      </p>
                    </div>

                    {metric.calculation && (
                      <div>
                        <p className="font-semibold text-foreground mb-1">Calculation</p>
                        <p className="text-foreground leading-relaxed font-mono text-xs bg-muted rounded-lg px-3 py-2">
                          {renderWithLinks(metric.calculation, scrollToAnchor)}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-foreground mb-1">Why it matters</p>
                      <p className="text-foreground leading-relaxed">
                        {renderWithLinks(metric.whyItMatters, scrollToAnchor)}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-foreground mb-1">What it doesn&apos;t tell you</p>
                      <p className="text-foreground leading-relaxed">
                        {renderWithLinks(metric.whatItDoesntTellYou, scrollToAnchor)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Tooltip summary lookup ────────────────────────────────────────────────

// Map from column key / metric key → anchor + short summary for tooltips
const TOOLTIP_MAP: Record<string, { anchor: string; summary: string }> = {}
for (const m of METRICS) {
  const keys = [m.anchor, m.shortName?.toLowerCase(), m.name.toLowerCase()].filter(Boolean) as string[]
  const summary = m.definition.replace(/\[\[[^\]]+\]\]/g, (match) => {
    const anchor = match.slice(2, -2)
    const ref = METRICS.find((r) => r.anchor === anchor)
    return ref?.shortName || ref?.name || anchor
  })
  for (const k of keys) {
    TOOLTIP_MAP[k] = { anchor: m.anchor, summary }
  }
}

// Common aliases
TOOLTIP_MAP["upsellTakeRate"] = TOOLTIP_MAP["upsell-take-rate"]
TOOLTIP_MAP["trueCpa"] = TOOLTIP_MAP["true-cpa"]
TOOLTIP_MAP["cost-per-customer"] = TOOLTIP_MAP["cpa"]

export function getTooltipData(key: string): { anchor: string; summary: string; name: string } | null {
  const lower = key.toLowerCase().replace(/\s+/g, "-")
  const entry = TOOLTIP_MAP[key] || TOOLTIP_MAP[lower]
  if (!entry) return null
  const metric = METRICS.find((m) => m.anchor === entry.anchor)
  return { anchor: entry.anchor, summary: entry.summary, name: metric?.shortName || metric?.name || key }
}
