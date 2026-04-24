"use client"

import React, { useState, useMemo, useRef, useEffect, createContext, useContext } from "react"
import {
  Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Minus, SlidersHorizontal, X, Sparkles, BookOpen,
  GripVertical, Plus, Settings, Eye, TrendingUp, TrendingDown,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { experiments, rateKpis, portfolioSummary, adBaselines } from "@/lib/data"
import type { ExperimentAd } from "@/lib/data"
import { cn } from "@/lib/utils"
import { kpiIconMap } from "./kpi-card"
import { MetricsGlossary, getTooltipData } from "./metrics-glossary"

// ─── Glossary context ──────────────────────────────────────────────────────

const GlossaryContext = createContext<(anchor: string) => void>(() => {})

// ─── Flatten all ads with experiment context ────────────────────────────────

interface AdRow extends ExperimentAd {
  experiment: string
}

const allAds: AdRow[] = experiments.flatMap((exp) =>
  exp.ads.map((ad) => ({ ...ad, experiment: exp.heroProduct }))
)

const EXPERIMENT_OPTIONS = [...new Set(allAds.map((a) => a.experiment))]
const PLATFORM_OPTIONS = [...new Set(allAds.map((a) => a.platform))]
const CAMPAIGN_OPTIONS = [...new Set(allAds.map((a) => a.campaignType))]
const STATUS_OPTIONS = ["Active", "Ended"]

const PAGE_SIZE = 10

// ─── Group totals helper ────────────────────────────────────────────────────

function computeGroupTotals(ads: AdRow[]) {
  const spend = ads.reduce((s, a) => s + a.spend, 0)
  const clicks = ads.reduce((s, a) => s + a.clicks, 0)
  const orders = ads.reduce((s, a) => s + a.orders, 0)
  const revenue = ads.reduce((s, a) => s + a.revenue, 0)
  const cvr = clicks > 0 ? (orders / clicks) * 100 : 0
  const rpv = clicks > 0 ? revenue / clicks : 0
  const roas = spend > 0 ? revenue / spend : 0
  return { spend, clicks, orders, revenue, cvr, rpv, roas }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

type SortKey = "creative" | "experiment" | "rank" | "phase" | "spend" | "clicks" | "cpc" | "cvr" | "orders" | "revenue" | "epc" | "roas" | "aov" | "upsellTakeRate" | "cpa" | "trueCpa"
type SortDir = "asc" | "desc"

function cpaOf(ad: AdRow): number {
  return ad.orders > 0 ? ad.spend / ad.orders : Infinity
}

// True CPA: the projected CPA if all traffic went to the current winning variant.
// Strips experimentation drag by applying the winner's conversion efficiency to the ad's spend.
// For Established/Optimizing ads, True CPA is ~12-18% lower than observed CPA (winner outperforms blend).
// For Learning/New ads, True CPA is not yet reliable — return null.
function trueCpaOf(ad: AdRow): number | null {
  if (ad.phase === "New" || ad.phase === "Learning") return null
  const observedCpa = cpaOf(ad)
  if (!isFinite(observedCpa)) return null
  // Simulate: winning variant converts ~15% better than the blended average,
  // scaled by rank (higher-ranked ads have more confident winners → bigger gap)
  const winnerLift = 0.10 + (ad.rank / 100) * 0.10 // 10-20% improvement
  return observedCpa * (1 - winnerLift)
}

function sortAds(a: AdRow, b: AdRow, key: SortKey, dir: SortDir): number {
  let cmp = 0
  switch (key) {
    case "creative": cmp = a.creative.localeCompare(b.creative); break
    case "experiment": cmp = a.experiment.localeCompare(b.experiment); break
    case "rank": cmp = a.rank - b.rank; break
    case "phase": cmp = a.phase.localeCompare(b.phase); break
    case "spend": cmp = a.spend - b.spend; break
    case "clicks": cmp = a.clicks - b.clicks; break
    case "cpc": cmp = a.cpc - b.cpc; break
    case "cvr": cmp = a.cvr - b.cvr; break
    case "orders": cmp = a.orders - b.orders; break
    case "revenue": cmp = a.revenue - b.revenue; break
    case "epc": cmp = a.epc - b.epc; break
    case "roas": cmp = a.roas - b.roas; break
    case "aov": cmp = a.aov - b.aov; break
    case "upsellTakeRate": cmp = a.upsellTakeRate - b.upsellTakeRate; break
    case "cpa": cmp = cpaOf(a) - cpaOf(b); break
    case "trueCpa": cmp = (trueCpaOf(a) ?? Infinity) - (trueCpaOf(b) ?? Infinity); break
  }
  return dir === "asc" ? cmp : -cmp
}

function matchesSearch(ad: AdRow, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    ad.creative.toLowerCase().includes(q) ||
    ad.experiment.toLowerCase().includes(q) ||
    ad.platform.toLowerCase().includes(q) ||
    ad.campaignType.toLowerCase().includes(q)
  )
}

function RankTrendArrow({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <ChevronUp className="h-3.5 w-3.5 text-emerald-500" />
  if (trend === "down") return <ChevronDown className="h-3.5 w-3.5 text-rose-500" />
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

function SortHeader({
  label, sortKey, currentSort, currentDir, onSort, align = "left",
}: {
  label: string; sortKey: SortKey; currentSort: SortKey; currentDir: SortDir
  onSort: (key: SortKey) => void; align?: "left" | "right"
}) {
  const active = currentSort === sortKey
  return (
    <th
      className={cn(
        "font-medium text-muted-foreground px-4 py-2.5 text-xs cursor-pointer select-none hover:text-foreground transition-colors",
        align === "right" && "text-right"
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className={cn("inline-flex items-center gap-1", align === "right" && "justify-end")}>
        {label}
        {active && (currentDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </span>
    </th>
  )
}

// ─── MetricInfo tooltip — small "i" circle with enhanced tooltip ─────────────

function MetricInfo({ definition, metricKey }: { definition: string; metricKey?: string }) {
  const openGlossary = useContext(GlossaryContext)
  const tooltipData = metricKey ? getTooltipData(metricKey) : null

  return (
    <span className="relative inline-flex items-center group/info">
      <span
        className="inline-flex items-center justify-center rounded-full border border-foreground text-foreground text-[9px] font-bold leading-none cursor-help select-none"
        style={{ width: "13px", height: "13px" }}
        aria-label="Metric definition"
      >
        i
      </span>
      <span
        role="tooltip"
        className="invisible group-hover/info:visible opacity-0 group-hover/info:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 w-64 bg-foreground text-background text-xs font-normal normal-case tracking-normal leading-snug px-3 py-2.5 rounded-md shadow-lg pointer-events-auto"
      >
        {tooltipData && (
          <p className="font-semibold mb-1">{tooltipData.name}</p>
        )}
        <p className="leading-relaxed">{tooltipData?.summary || definition}</p>
        {tooltipData && (
          <button
            onClick={(e) => { e.stopPropagation(); openGlossary(tooltipData.anchor) }}
            className="mt-2 text-blue-300 hover:text-blue-200 transition-colors font-medium"
          >
            Learn more →
          </button>
        )}
      </span>
    </span>
  )
}

// ─── Header cell with sticky positioning, fixed width, resize handle ────────

function HeaderCell({
  colKey,
  label,
  align,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  width,
  sticky,
  onResize,
  definition,
  labelIndent,
  edgeClass,
}: {
  colKey: string
  label: string
  align: "left" | "right"
  sortKey: SortKey | null
  currentSort: SortKey
  currentDir: SortDir
  onSort: (key: SortKey) => void
  width: number
  sticky: number | undefined
  onResize: (col: string, e: React.MouseEvent) => void
  definition?: string
  labelIndent?: number
  edgeClass?: string
}) {
  const active = sortKey && currentSort === sortKey
  const stickyStyle: React.CSSProperties = sticky !== undefined
    ? { position: "sticky", left: sticky, zIndex: 20 }
    : {}
  return (
    <th
      style={{ width, minWidth: width, maxWidth: width, ...stickyStyle }}
      className={cn(
        "relative font-medium text-muted-foreground px-4 py-2.5 text-xs bg-muted select-none",
        align === "right" ? "text-right" : "text-left",
        sortKey && "cursor-pointer hover:text-foreground transition-colors",
        edgeClass
      )}
      onClick={sortKey ? () => onSort(sortKey) : undefined}
    >
      <span
        className={cn("inline-flex items-center gap-1.5", align === "right" && "justify-end")}
        style={labelIndent ? { paddingLeft: labelIndent } : undefined}
      >
        {label}
        {definition && (
          <span onClick={(e) => e.stopPropagation()}>
            <MetricInfo definition={definition} metricKey={colKey} />
          </span>
        )}
        {active && (currentDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </span>
      {/* Resize handle */}
      <span
        onMouseDown={(e) => onResize(colKey, e)}
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-amber-400/60 transition-colors"
      />
    </th>
  )
}

// ─── Phase Tag ──────────────────────────────────────────────────────────────

const PHASE_STYLES: Record<AdRow["phase"], string> = {
  Established: "bg-sky-100 text-sky-700",
  Optimizing: "bg-emerald-100 text-emerald-700",
  Learning: "bg-amber-100 text-amber-700",
  New: "bg-muted text-muted-foreground",
}

function PhaseTag({ phase }: { phase: AdRow["phase"] }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", PHASE_STYLES[phase])}>
      {phase}
    </span>
  )
}

// ─── Rank Ring ──────────────────────────────────────────────────────────────

function RankRing({ rank, phase, trend }: { rank: number; phase: AdRow["phase"]; trend: "up" | "down" | "flat" }) {
  const size = 40
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const isMeaningful = phase === "Established" || phase === "Optimizing"

  let ringColor = "#94a3b8" // slate-400 fallback
  if (isMeaningful) {
    if (rank >= 70) ringColor = "#10b981"      // emerald-500
    else if (rank >= 40) ringColor = "#f59e0b" // amber-500
    else ringColor = "#f43f5e"                 // rose-500
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-muted/40"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {isMeaningful && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - rank / 100)}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isMeaningful ? (
          <span className="text-[11px] tabular-nums font-semibold leading-none">{rank}</span>
        ) : (
          <span className="text-xs text-muted-foreground leading-none">—</span>
        )}
      </div>
      {isMeaningful && trend !== "flat" && (
        <div className="absolute -top-0.5 -right-0.5 bg-background rounded-full">
          <RankTrendArrow trend={trend} />
        </div>
      )}
    </div>
  )
}

// ─── Column definitions ─────────────────────────────────────────────────────

type ColumnKey =
  | "experiment"
  | "phase"
  | "rank"
  | "cvr"
  | "rpv"
  | "roas"
  | "spend"
  | "clicks"
  | "orders"
  | "revenue"
  | "budget"
  | "geo"
  | "audience"
  | "placements"
  | "objective"
  | "aov"
  | "epc"
  | "cpc"
  | "cpa"
  | "trueCpa"
  | "upsellTakeRate"

// Fixed column order visible on every tab — Ad is always first (sticky), these follow
const CORE_COLUMNS: ColumnKey[] = ["experiment", "phase", "rank", "cvr", "rpv", "roas"]

const TRAILING_COLUMNS: ColumnKey[] = []

const RESULTS_EXTRA: ColumnKey[] = ["orders", "revenue", "trueCpa", "spend", "clicks"]
const SETUP_EXTRA: ColumnKey[] = ["budget", "geo", "audience", "placements", "objective"]

const ALL_OPTIONAL_COLUMNS: ColumnKey[] = [
  ...RESULTS_EXTRA,
  ...SETUP_EXTRA,
  // Funnel-efficiency metrics — available in custom views only
  "cpc", "cpa", "aov", "epc", "upsellTakeRate",
]

const COLUMN_DEFINITIONS: Partial<Record<ColumnKey, string>> = {
  rank: "Percentile score across all Established and Optimizing ads in your account. Higher = better performer. The arrow shows direction of recent change.",
  phase: "Lifecycle stage of this ad. New: just launched. Learning: actively exploring variants. Optimizing: winner found, fine-tuning. Established: stable winner with high confidence.",
  cvr: "Conversion rate. Orders divided by visitors, expressed as a percentage. Higher means more of the ad's traffic is buying.",
  rpv: "Revenue per visitor. Total revenue divided by clicks/visitors. The single efficiency number that combines CVR and AOV — up = the funnel is using this traffic more efficiently.",
  roas: "Return on ad spend. Revenue divided by spend, expressed as a multiplier. 1.00x means break-even on direct revenue; above 1.00x means the ad generates more revenue than it costs.",
  cpc: "Cost per click. Ad spend divided by clicks. Lower is more efficient acquisition.",
  cpa: "Your ad spend on ads directed to Velocity divided by orders processed through our checkout. Lower means customers are being acquired more efficiently.",
  trueCpa: "True CPA is what this ad's CPA would be if we routed all traffic to the current winning variant. Use this to judge the ad's actual performance, separated from our experimentation.",
  aov: "Average order value. Revenue divided by orders. Reflects what customers from this ad typically spend when they convert.",
  epc: "Earnings per click. Revenue divided by clicks. Ad-channel equivalent of RPV.",
  upsellTakeRate: "Percentage of orders from this ad that accept at least one upsell. Higher = more post-purchase revenue per order.",
  spend: "Ad spend attributed to this creative in the selected date range.",
  clicks: "Total clicks (visitors) sent by this ad to the funnel.",
  orders: "Total orders attributed to visitors from this ad.",
  revenue: "Total revenue attributed to visitors from this ad.",
  experiment: "Which experiment link this ad is sending traffic to.",
  budget: "Current ad-level budget set in your Meta/TikTok account.",
  geo: "Country/region targeting set on this ad.",
  audience: "Audience segment the ad is targeting (prospecting, retargeting, lookalike, etc.).",
  placements: "Where the ad is being shown (Facebook Feed, Instagram Reels, etc.).",
  objective: "Campaign objective set in the ad platform (e.g., Sales, Conversions).",
}

const COLUMN_LABELS: Record<ColumnKey, string> = {
  experiment: "Experiment",
  phase: "Phase",
  rank: "Rank",
  cvr: "CVR",
  rpv: "RPV",
  roas: "ROAS",
  spend: "Spend",
  clicks: "Clicks",
  orders: "Orders",
  revenue: "Revenue",
  budget: "Budget",
  geo: "Geo",
  audience: "Audience",
  placements: "Placements",
  objective: "Objective",
  aov: "AOV",
  epc: "EPC",
  cpc: "CPC",
  cpa: "Cost per Customer",
  trueCpa: "True CPA",
  upsellTakeRate: "Upsell Take Rate",
}

const COLUMN_ALIGN: Record<ColumnKey, "left" | "right"> = {
  experiment: "left",
  phase: "left",
  rank: "left",
  cvr: "right",
  rpv: "right",
  roas: "right",
  spend: "right",
  clicks: "right",
  orders: "right",
  revenue: "right",
  budget: "left",
  geo: "left",
  audience: "left",
  placements: "left",
  objective: "left",
  aov: "right",
  epc: "right",
  cpc: "right",
  cpa: "right",
  trueCpa: "right",
  upsellTakeRate: "right",
}

const COLUMN_SORT_KEY: Record<ColumnKey, SortKey | null> = {
  experiment: "experiment",
  phase: "phase",
  rank: "rank",
  cvr: "cvr",
  rpv: "epc",
  roas: "roas",
  spend: "spend",
  clicks: "clicks",
  orders: "orders",
  revenue: "revenue",
  budget: null,
  geo: null,
  audience: null,
  placements: null,
  objective: null,
  aov: "aov",
  epc: "epc",
  cpc: "cpc",
  cpa: "cpa",
  trueCpa: "trueCpa",
  upsellTakeRate: "upsellTakeRate",
}

// Default widths per column. Used on first render and as fallback when merchant hasn't resized.
// Sized so the Performance tab comfortably fills a ~1500–1700px content area without horizontal scroll,
// and the Ad column gives creative names room to breathe.
const DEFAULT_WIDTHS: Record<string, number> = {
  ad: 380,
  experiment: 170,
  phase: 130,
  rank: 72,
  cvr: 120,
  rpv: 120,
  roas: 120,
  spend: 140,
  clicks: 110,
  orders: 110,
  revenue: 160,
  budget: 130,
  geo: 200,
  audience: 240,
  placements: 220,
  objective: 130,
  aov: 120,
  epc: 120,
  cpc: 110,
  cpa: 160,
  trueCpa: 140,
  upsellTakeRate: 150,
}

// Inline delta vs baseline — small muted text below value, color-coded
// `inverted`: when true, lower values are better (green when diff is negative)
// `phase`: controls confidence signaling.
//   - "New": return null — one order doesn't produce a meaningful comparison
//   - "Learning": render muted gray — directional but not confidence-tested
//   - "Established" / "Optimizing": full green/red
function Delta({
  current,
  baseline,
  kind,
  inverted = false,
  phase,
}: {
  current: number
  baseline: number
  kind: "percent" | "currency" | "multiplier"
  inverted?: boolean
  phase?: AdRow["phase"]
}) {
  if (phase === "New") return null

  const diff = current - baseline
  const higher = diff >= 0
  const isGood = inverted ? !higher : higher
  const sign = higher ? "+" : "-"
  const abs = Math.abs(diff)
  let formatted = ""
  if (kind === "percent") formatted = `${sign}${abs.toFixed(2)}%`
  else if (kind === "multiplier") formatted = `${sign}${abs.toFixed(2)}x`
  else formatted = `${sign}$${abs.toFixed(2)}`

  const toneClass = phase === "Learning"
    ? "text-muted-foreground"
    : isGood ? "text-emerald-600" : "text-rose-500"

  return (
    <div className={cn("text-xs font-medium tabular-nums", toneClass)}>
      {formatted}
    </div>
  )
}

function renderCell(
  ad: AdRow,
  key: ColumnKey,
): React.ReactNode {
  switch (key) {
    case "experiment":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-sm font-medium whitespace-nowrap">
          {ad.experiment}
        </span>
      )
    case "rank":
      return <RankRing rank={ad.rank} phase={ad.phase} trend={ad.rankTrend} />
    case "phase":
      return <PhaseTag phase={ad.phase} />
    case "cvr":
      return (
        <div className="text-right">
          <div className="text-sm tabular-nums font-medium">
            {ad.cvr.toFixed(2)}%
          </div>
          <Delta current={ad.cvr} baseline={adBaselines.cvr} kind="percent" phase={ad.phase} />
        </div>
      )
    case "rpv":
      return (
        <div className="text-right">
          <div className="text-sm tabular-nums font-medium">${ad.epc.toFixed(2)}</div>
          <Delta current={ad.epc} baseline={adBaselines.rpv} kind="currency" phase={ad.phase} />
        </div>
      )
    case "roas":
      return (
        <div className="text-right">
          <div className="text-sm tabular-nums font-medium">{ad.roas.toFixed(2)}x</div>
          <Delta current={ad.roas} baseline={adBaselines.roas} kind="multiplier" phase={ad.phase} />
        </div>
      )
    case "spend":
      return <span className="text-sm tabular-nums">${ad.spend.toLocaleString()}</span>
    case "clicks":
      return <span className="text-sm tabular-nums">{ad.clicks.toLocaleString()}</span>
    case "orders":
      return <span className="text-sm tabular-nums">{ad.orders}</span>
    case "revenue":
      return <span className="text-sm tabular-nums">${ad.revenue.toLocaleString()}</span>
    case "budget":
      return <span className="text-sm break-words">{ad.metadata.budget}</span>
    case "geo":
      return <span className="text-sm break-words">{ad.metadata.geo.join(", ")}</span>
    case "audience":
      return <span className="text-sm break-words">{ad.metadata.audience}</span>
    case "placements":
      return <span className="text-sm break-words">{ad.metadata.placements.join(", ")}</span>
    case "objective":
      return <span className="text-sm break-words">{ad.metadata.objective}</span>
    case "aov":
      return (
        <div className="text-right">
          <div className="text-sm tabular-nums">${ad.aov.toFixed(2)}</div>
          <Delta current={ad.aov} baseline={adBaselines.aov} kind="currency" phase={ad.phase} />
        </div>
      )
    case "epc":
      return (
        <div className="text-right">
          <div className="text-sm tabular-nums">${ad.epc.toFixed(2)}</div>
          <Delta current={ad.epc} baseline={adBaselines.epc} kind="currency" phase={ad.phase} />
        </div>
      )
    case "cpc":
      return <span className="text-sm tabular-nums">${ad.cpc.toFixed(2)}</span>
    case "cpa": {
      const cpa = cpaOf(ad)
      return (
        <div className="text-right">
          <div className="text-sm tabular-nums font-medium">${cpa.toFixed(2)}</div>
          <Delta current={cpa} baseline={adBaselines.cpa} kind="currency" inverted phase={ad.phase} />
        </div>
      )
    }
    case "trueCpa": {
      const tcpa = trueCpaOf(ad)
      if (tcpa === null) {
        return <span className="text-sm text-muted-foreground">—</span>
      }
      return (
        <div className="text-right">
          <div className="text-sm tabular-nums font-medium">${tcpa.toFixed(2)}</div>
          <Delta current={tcpa} baseline={adBaselines.cpa} kind="currency" inverted phase={ad.phase} />
        </div>
      )
    }
    case "upsellTakeRate":
      return (
        <div className="text-right">
          <div className="text-sm tabular-nums">{ad.upsellTakeRate.toFixed(2)}%</div>
          <Delta current={ad.upsellTakeRate} baseline={adBaselines.upsellTakeRate} kind="percent" phase={ad.phase} />
        </div>
      )
  }
}

// ─── View Tabs ──────────────────────────────────────────────────────────────

type DefaultTabKey = "results" | "setup"
type TabId = DefaultTabKey | string  // Custom view IDs start with "custom-"

interface CustomView {
  id: string
  name: string
  columns: ColumnKey[]              // non-core extras, in order
  sortKey?: SortKey
  sortDir?: SortDir
}

const DEFAULT_TABS: { key: DefaultTabKey; label: string; extras: ColumnKey[] }[] = [
  { key: "results", label: "Results", extras: RESULTS_EXTRA },
  { key: "setup", label: "Ad Setup", extras: SETUP_EXTRA },
]

const DEFAULT_TAB_KEYS: DefaultTabKey[] = ["results", "setup"]

const SORTABLE_COLUMN_KEYS: ColumnKey[] = [
  "experiment", "phase", "rank", "cvr", "rpv", "roas",
  "spend", "clicks", "orders", "revenue",
  "aov", "epc", "cpc", "cpa", "trueCpa", "upsellTakeRate",
]

// ─── Column reorder list (drag-to-reorder) ─────────────────────────────────

function ColumnReorderList({
  columns,
  onChange,
}: {
  columns: ColumnKey[]
  onChange: (cols: ColumnKey[]) => void
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleDragStart = (i: number) => (e: React.DragEvent) => {
    setDragIndex(i)
    e.dataTransfer.effectAllowed = "move"
  }
  const handleDragOver = (i: number) => (e: React.DragEvent) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    const next = [...columns]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(i, 0, moved)
    onChange(next)
    setDragIndex(i)
  }
  const handleDragEnd = () => setDragIndex(null)
  const remove = (col: ColumnKey) => onChange(columns.filter((c) => c !== col))

  if (columns.length === 0) {
    return <p className="text-xs text-muted-foreground italic px-2 py-3">No extra columns selected yet.</p>
  }

  return (
    <div className="space-y-0.5">
      {columns.map((col, i) => (
        <div
          key={col}
          draggable
          onDragStart={handleDragStart(i)}
          onDragOver={handleDragOver(i)}
          onDragEnd={handleDragEnd}
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-move hover:bg-muted/50 transition-colors",
            dragIndex === i && "opacity-40 bg-muted"
          )}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm flex-1">{COLUMN_LABELS[col]}</span>
          <button
            onClick={() => remove(col)}
            className="p-0.5 rounded hover:bg-muted transition-colors"
            title="Remove column"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Custom view settings popover ──────────────────────────────────────────

function CustomViewSettings({
  view,
  onUpdate,
  onDelete,
  onClose,
}: {
  view: CustomView
  onUpdate: (patch: Partial<CustomView>) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const available = ALL_OPTIONAL_COLUMNS.filter((c) => !view.columns.includes(c))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:bg-muted transition-colors"
        title="View settings"
      >
        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-80 bg-background border rounded-lg shadow-xl p-4 space-y-4" style={{ zIndex: 9999 }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">View settings</p>
            <button
              onClick={() => { onDelete(); setOpen(false); onClose() }}
              className="text-xs text-rose-500 hover:text-rose-600 transition-colors"
            >
              Delete view
            </button>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Name</p>
            <Input
              value={view.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-muted-foreground">Columns</p>
              <span className="text-[10px] text-muted-foreground">Drag to reorder</span>
            </div>
            <ColumnReorderList
              columns={view.columns}
              onChange={(cols) => onUpdate({ columns: cols })}
            />
            {available.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Add column</p>
                <div className="flex flex-wrap gap-1">
                  {available.map((col) => (
                    <button
                      key={col}
                      onClick={() => onUpdate({ columns: [...view.columns, col] })}
                      className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                    >
                      + {COLUMN_LABELS[col]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Default sort</p>
            <div className="flex items-center gap-2">
              <select
                value={view.sortKey ?? "rank"}
                onChange={(e) => onUpdate({ sortKey: e.target.value as SortKey })}
                className="flex-1 h-8 text-sm border rounded-md px-2 bg-background"
              >
                {SORTABLE_COLUMN_KEYS.map((col) => (
                  <option key={col} value={COLUMN_SORT_KEY[col] ?? "creative"}>
                    {COLUMN_LABELS[col]}
                  </option>
                ))}
              </select>
              <select
                value={view.sortDir ?? "desc"}
                onChange={(e) => onUpdate({ sortDir: e.target.value as SortDir })}
                className="h-8 text-sm border rounded-md px-2 bg-background"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── View Tab Bar ──────────────────────────────────────────────────────────

function ViewTabBar({
  activeTab,
  onTabChange,
  customViews,
  onCustomViewUpdate,
  onCustomViewDelete,
  onCreateView,
}: {
  activeTab: TabId
  onTabChange: (t: TabId) => void
  customViews: CustomView[]
  onCustomViewUpdate: (id: string, patch: Partial<CustomView>) => void
  onCustomViewDelete: (id: string) => void
  onCreateView: () => void
}) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState("")

  const startRename = (view: CustomView) => {
    setRenamingId(view.id)
    setRenameDraft(view.name)
  }

  const commitRename = () => {
    if (renamingId && renameDraft.trim()) {
      onCustomViewUpdate(renamingId, { name: renameDraft.trim() })
    }
    setRenamingId(null)
    setRenameDraft("")
  }

  return (
    <div className="flex items-center gap-0">
      {DEFAULT_TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === tab.key
              ? "border-amber-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}

      {customViews.map((view) => {
        const isActive = activeTab === view.id
        const isRenaming = renamingId === view.id
        return (
          <div
            key={view.id}
            className={cn(
              "group flex items-center gap-1 pl-4 pr-2 py-2.5 border-b-2 -mb-px transition-colors",
              isActive
                ? "border-amber-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {isRenaming ? (
              <input
                autoFocus
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename()
                  if (e.key === "Escape") { setRenamingId(null); setRenameDraft("") }
                }}
                className="text-sm font-medium bg-transparent border-b border-amber-400 outline-none w-32"
              />
            ) : (
              <button
                onClick={() => isActive ? startRename(view) : onTabChange(view.id)}
                onDoubleClick={() => startRename(view)}
                className="text-sm font-medium"
              >
                {view.name}
              </button>
            )}
            {isActive && !isRenaming && (
              <CustomViewSettings
                view={view}
                onUpdate={(patch) => onCustomViewUpdate(view.id, patch)}
                onDelete={() => onCustomViewDelete(view.id)}
                onClose={() => onTabChange("results")}
              />
            )}
            <button
              onClick={() => onCustomViewDelete(view.id)}
              className="p-0.5 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
              title="Delete view"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )
      })}

      <button
        onClick={onCreateView}
        className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent -mb-px"
        title="Add new view"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Group By dropdown ──────────────────────────────────────────────────────

type GroupBy = "none" | "experiment" | "platform" | "audience"

const GROUP_BY_OPTIONS: { key: GroupBy; label: string }[] = [
  { key: "none", label: "None" },
  { key: "experiment", label: "Experiment" },
  { key: "platform", label: "Platform" },
  { key: "audience", label: "Audience type" },
]

function GroupBySelect({ value, onChange }: { value: GroupBy; onChange: (v: GroupBy) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const selected = GROUP_BY_OPTIONS.find((o) => o.key === value)

  return (
    <div ref={ref} className="relative shrink-0">
      <Button variant="outline" onClick={() => setOpen(!open)} className="h-11 gap-2">
        <span className="text-xs text-muted-foreground">Group by:</span>
        <span className="text-sm font-medium">{selected?.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg py-1" style={{ zIndex: 9999 }}>
          {GROUP_BY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false) }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
                value === opt.key && "bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Filter row ─────────────────────────────────────────────────────────────

function FilterRow({
  label, options, selected, onChange,
}: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt])
  }
  const displayValue = selected.length === 0 ? "All" : selected.join(", ")

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors",
          open ? "border-amber-400 ring-1 ring-amber-400" : "hover:border-foreground/20"
        )}
      >
        <span className={selected.length === 0 ? "text-muted-foreground" : ""}>{displayValue}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 border rounded-lg bg-background shadow-sm py-1">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500" />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Learnings sidebar ──────────────────────────────────────────────────────

const LEARNING_CATEGORY_STYLES: Record<string, string> = {
  Products: "bg-amber-100 text-amber-700",
  Upsells: "bg-violet-100 text-violet-700",
  Content: "bg-emerald-100 text-emerald-700",
  Offers: "bg-sky-100 text-sky-700",
}

// ─── Sidebar content helpers ───────────────────────────────────────────────

// Generate plausible system-activity stats from the ad's phase and metrics.
function getSystemActivity(ad: AdRow) {
  const isReliable = ad.phase === "Established" || ad.phase === "Optimizing"
  const tested = isReliable
    ? (ad.phase === "Established" ? 12 + Math.floor(ad.rank / 20) : 8 + Math.floor(ad.rank / 25))
    : (ad.phase === "Learning" ? 4 + Math.floor(ad.clicks / 100) : 2)
  const active = isReliable ? 3 : (ad.phase === "Learning" ? 2 : 1)
  const retired = Math.max(0, tested - active - (isReliable ? 1 : 0))
  return { tested, active, retired, isReliable }
}

// ─── Experiment narrative helpers ──────────────────────────────────────────

const EXPERIMENT_HYPOTHESIS: Record<string, string> = {
  Education: "Education-led presell would outperform testimonial presell for this ad's ingredient-focused audience.",
  UGC: "Direct-to-sales would outperform presell paths for UGC traffic, where creator trust replaces the need for product education.",
  "Brand Story": "Story-led presell aligned with the ad's narrative would outperform generic presell and direct-to-sales paths.",
  Retargeting: "Direct-to-sales would outperform presell paths for warm retargeting traffic already familiar with the product.",
}

const TESTED_LIST: Record<string, string> = {
  Education: "Education presell, testimonial presell, direct-to-sales, urgency-led.",
  UGC: "Presell with social proof, education presell, direct-to-sales, bundle upsell path.",
  "Brand Story": "Education presell, story-led presell, direct-to-sales, quiz funnel.",
  Retargeting: "Education presell, testimonial presell, direct-to-sales, limited-time offer.",
}

const OUTCOME_NARRATIVE: Record<string, (ad: AdRow) => string> = {
  Education: (ad) => {
    const margin = Math.round(10 + ad.rank * 0.3)
    return `Education presell won by ${margin}%. The angle in the ad aligns with what visitors expect to see on the landing page — ingredient credibility messaging outperforms testimonial approaches. This approach produces ${ad.cvr.toFixed(2)}% CVR with $${ad.aov.toFixed(0)} AOV.`
  },
  UGC: (ad) => {
    const margin = Math.round(8 + ad.rank * 0.25)
    return `Direct-to-sales won by ${margin}%. Traffic from this ad already carries trust from the creator — a presell step adds friction without lifting CVR. This approach produces ${ad.cvr.toFixed(2)}% CVR with $${ad.aov.toFixed(0)} AOV.`
  },
  "Brand Story": (ad) => {
    const margin = Math.round(5 + ad.rank * 0.2)
    return `Story-led presell won by ${margin}%. This traffic responds to mission-driven messaging over feature education. The brand narrative in the ad carries through the funnel. This approach produces ${ad.cvr.toFixed(2)}% CVR with $${ad.aov.toFixed(0)} AOV.`
  },
  Retargeting: (ad) => {
    const margin = Math.round(12 + ad.rank * 0.35)
    return `Direct-to-sales won by ${margin}%. Retargeting traffic is already familiar with the product — skipping the presell converts at ${ad.cvr.toFixed(2)}% CVR with the lowest acquisition cost across this experiment.`
  },
}

// Winning variant funnel steps (synthetic per-bucket)
const FUNNEL_STEPS: Record<string, { label: string; pct: number }[]> = {
  Education: [
    { label: "Landing page", pct: 100 },
    { label: "Presell", pct: 67.3 },
    { label: "Checkout", pct: 18.5 },
    { label: "Upsell acceptance", pct: 38.2 },
  ],
  UGC: [
    { label: "Landing page", pct: 100 },
    { label: "Checkout", pct: 22.1 },
    { label: "Upsell acceptance", pct: 29.4 },
  ],
  "Brand Story": [
    { label: "Landing page", pct: 100 },
    { label: "Presell", pct: 58.6 },
    { label: "Checkout", pct: 14.2 },
    { label: "Upsell acceptance", pct: 25.1 },
  ],
  Retargeting: [
    { label: "Landing page", pct: 100 },
    { label: "Checkout", pct: 28.7 },
    { label: "Upsell acceptance", pct: 42.8 },
  ],
}

// ─── Learnings sidebar ──────────────────────────────────────────────────────

function LearningsSidebar({
  ad,
  onClose,
  onNavigateToExperiment,
}: {
  ad: AdRow
  onClose: () => void
  onNavigateToExperiment?: (name: string) => void
}) {
  const similar = allAds.filter(
    (a) => a.angleCategory === ad.angleCategory && a.creative !== ad.creative
  )
  const isAccumulating = ad.phase === "Learning" || ad.phase === "New"
  const activity = getSystemActivity(ad)

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[9999] w-[960px] max-w-[95vw] bg-background border-l shadow-2xl flex flex-col">
        {/* 1. Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
              {ad.format}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <a
                  href="https://business.facebook.com/adsmanager/manage/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Ads Manager"
                  className="text-base font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {ad.creative}
                </a>
                <PhaseTag phase={ad.phase} />
              </div>
              <p className="text-sm text-muted-foreground">
                {onNavigateToExperiment ? (
                  <button
                    onClick={() => { onClose(); onNavigateToExperiment(ad.experiment) }}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {ad.experiment}
                  </button>
                ) : (
                  <span>{ad.experiment}</span>
                )}
                {" · "}{ad.platform} · {ad.campaignType}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0 ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 2. Approaches tested */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">Approaches tested</p>
            <div className="rounded-xl border p-4 text-sm space-y-3">
              <div className="space-y-0">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-foreground">Tested</span>
                  <span className="font-medium tabular-nums text-foreground">{activity.tested}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-t border-border/50">
                  <span className="text-foreground">Active</span>
                  <span className="font-medium tabular-nums text-foreground">{activity.active}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-t border-border/50">
                  <span className="text-foreground">Retired</span>
                  <span className="font-medium tabular-nums text-foreground">{activity.retired}</span>
                </div>
              </div>
              {activity.isReliable ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(ad.variantUrl, "_blank", "noopener,noreferrer")}
                >
                  View Winning Variant
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Winner identifying…
                </Button>
              )}
            </div>
          </div>

          {/* 3. The experiment */}
          {ad.phase === "New" ? (
            <div className="rounded-xl border border-l-4 border-l-amber-400 bg-amber-50/40 dark:bg-amber-950/20 p-5">
              <p className="text-sm font-semibold mb-1 text-foreground">Performance data accumulating</p>
              <p className="text-sm text-foreground leading-relaxed">
                Reliable patterns expected within {ad.daysToReliable ?? 7} days.
                The system is actively testing approaches for this ad&apos;s traffic.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">
                The experiment
              </p>
              <div className="rounded-xl border p-5 space-y-4 text-sm">
                {/* What we expected */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">What we expected</p>
                  <p className="text-foreground leading-relaxed">
                    {EXPERIMENT_HYPOTHESIS[ad.angleCategory] ?? EXPERIMENT_HYPOTHESIS.Education}
                  </p>
                </div>

                {/* What we tested */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">What we tested</p>
                  <p className="text-foreground leading-relaxed">
                    {TESTED_LIST[ad.angleCategory] ?? TESTED_LIST.Education}
                  </p>
                </div>

                {/* What happened */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">What happened</p>
                  {ad.phase === "Learning" ? (
                    <p className="text-foreground leading-relaxed">
                      Performance data accumulating. Reliable patterns expected within {ad.daysToReliable ?? 7} days.
                    </p>
                  ) : (
                    <>
                      <p className="text-foreground leading-relaxed mb-3">
                        {(OUTCOME_NARRATIVE[ad.angleCategory] ?? OUTCOME_NARRATIVE.Education)(ad)}
                      </p>
                      {/* Funnel breakdown */}
                      <div className="space-y-2">
                        {(FUNNEL_STEPS[ad.angleCategory] ?? FUNNEL_STEPS.Education).map((step, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">{step.label}</span>
                              <span className="text-xs tabular-nums font-medium text-foreground">{step.pct}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${step.pct}%`, minWidth: step.pct > 0 ? "4px" : "0" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. Insights */}
          {ad.learnings.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">Insights</p>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Date</th>
                      <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Category</th>
                      <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Insight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ad.learnings.map((learning, li) => (
                      <tr key={li} className="border-t border-border/50">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap align-top">{learning.date}</td>
                        <td className="px-4 py-3 align-top">
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
                            LEARNING_CATEGORY_STYLES[learning.category] || "bg-muted text-muted-foreground"
                          )}>
                            {learning.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          <p className="font-semibold mb-0.5">{learning.title}</p>
                          <p className="leading-relaxed">{learning.insight}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Similar ads */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">
              Similar ads — {"{bucket}"}
            </p>
            {similar.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No other ads currently in this category.</p>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm" style={{ minWidth: "max-content" }}>
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Ad</th>
                      <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Rank</th>
                      <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">CVR</th>
                      <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">RPV</th>
                      <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...similar]
                      .sort((a, b) => {
                        // Active ads (no endedAt) first, then ended ads; within each group, alphabetical
                        const aEnded = a.endedAt ? 1 : 0
                        const bEnded = b.endedAt ? 1 : 0
                        if (aEnded !== bEnded) return aEnded - bEnded
                        return a.creative.localeCompare(b.creative)
                      })
                      .map((other, i) => (
                        <tr key={i} className="border-t border-border/50 hover:bg-muted transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                                {other.format}
                              </div>
                              <div className="min-w-0">
                                <a
                                  href="https://business.facebook.com/adsmanager/manage/ads"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open in Ads Manager"
                                  className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {other.creative}
                                </a>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {other.endedAt ? (
                                    <>
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground">Ended</span>
                                      <span className="text-xs text-muted-foreground">{other.launched} – {other.endedAt}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Active
                                      </span>
                                      <span className="text-xs text-muted-foreground">Since {other.launched}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">
                            {other.phase === "Established" || other.phase === "Optimizing" ? `${other.rank}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">{other.cvr.toFixed(2)}%</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">${other.epc.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">{other.roas.toFixed(2)}x</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── KPI Card — matches Summary page layout with colored icon accent ───────

function KpiStatCard({
  metricKey,
  label,
  value,
  delta,
  tone,
  arrow,
  baselineText,
  badge,
  definition,
}: {
  metricKey: string
  label: string
  value: string
  delta?: string
  tone?: "positive" | "negative"
  arrow?: "up" | "down"
  baselineText?: string
  badge?: { label: string; tone: "high" | "medium" | "low" }
  definition?: string
}) {
  const config = kpiIconMap[metricKey]
  const Icon = config?.icon || Eye
  const color = config?.color || "#888"
  const arrowDir = arrow ?? (tone === "negative" ? "down" : "up")
  const ArrowIcon = arrowDir === "down" ? TrendingDown : TrendingUp

  const badgeStyles = {
    high: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    low: "bg-muted text-muted-foreground",
  }

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-muted-foreground truncate">{label}</p>
              {definition && <MetricInfo definition={definition} metricKey={metricKey} />}
            </div>
            <p className="text-2xl font-bold mt-1 truncate">{value}</p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        {(delta || baselineText) && (
          <div
            className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              tone === "negative" ? "text-rose-500" : "text-emerald-600"
            )}
          >
            {delta && <ArrowIcon className="h-3.5 w-3.5 shrink-0" />}
            {delta && <span className="shrink-0">{delta}</span>}
            {baselineText && (
              <span className="text-muted-foreground font-normal text-xs truncate">
                {baselineText}
              </span>
            )}
          </div>
        )}
        {badge && (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1.5", badgeStyles[badge.tone])}>
            {badge.label}
          </span>
        )}
      </CardContent>
    </Card>
  )
}

function fmtRate(value: number, format: string) {
  if (format === "percent") return `${value.toFixed(2)}%`
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Ads page (main export) ─────────────────────────────────────────────────

export function Ads({ onNavigateToExperiment }: { onNavigateToExperiment?: (name: string) => void }) {
  const [glossaryAnchor, setGlossaryAnchor] = useState<string | null>(null)
  const openGlossary = (anchor: string) => setGlossaryAnchor(anchor)

  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [experimentFilters, setExperimentFilters] = useState<string[]>([])
  const [platformFilters, setPlatformFilters] = useState<string[]>([])
  const [campaignFilters, setCampaignFilters] = useState<string[]>([])
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(0)
  const [sidebarAd, setSidebarAd] = useState<AdRow | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>("results")
  const [customViews, setCustomViews] = useState<CustomView[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = window.localStorage.getItem("ads-custom-views")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem("ads-custom-views", JSON.stringify(customViews))
    } catch {
      // ignore storage errors
    }
  }, [customViews])

  const createView = () => {
    const existingCount = customViews.length
    const id = `custom-${Date.now()}`
    const newView: CustomView = {
      id,
      name: `View ${existingCount + 1}`,
      columns: ["spend", "aov", "cpc"],
      sortKey: "rank",
      sortDir: "desc",
    }
    setCustomViews((prev) => [...prev, newView])
    setActiveTab(id)
  }

  const updateView = (id: string, patch: Partial<CustomView>) => {
    setCustomViews((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  const deleteView = (id: string) => {
    setCustomViews((prev) => prev.filter((v) => v.id !== id))
    if (activeTab === id) setActiveTab("results")
  }
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS)
  const resizingRef = useRef<{ col: string; startX: number; startWidth: number } | null>(null)

  // Column resize handlers
  const startResize = (col: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizingRef.current = {
      col,
      startX: e.clientX,
      startWidth: columnWidths[col] ?? DEFAULT_WIDTHS[col] ?? 120,
    }

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return
      const delta = ev.clientX - resizingRef.current.startX
      const newWidth = Math.max(60, resizingRef.current.startWidth + delta)
      setColumnWidths((prev) => ({ ...prev, [resizingRef.current!.col]: newWidth }))
    }

    const onMouseUp = () => {
      resizingRef.current = null
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    document.body.style.userSelect = "none"
    document.body.style.cursor = "col-resize"
  }

  // Sticky column offsets — first 4 columns (Ad, Experiment, Phase, Rank) are frozen
  const STICKY_COLUMNS = ["ad", "experiment", "phase", "rank"]
  const LAST_STICKY = STICKY_COLUMNS[STICKY_COLUMNS.length - 1]

  // Show a subtle right-edge border on the last frozen column when horizontally scrolled,
  // so the boundary between frozen and scrolled columns is visible.
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [scrolledX, setScrolledX] = useState(false)
  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    const onScroll = () => setScrolledX(el.scrollLeft > 0)
    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])
  // Inset shadow (no layout shift) on the right edge of the last frozen column.
  const scrolledEdgeClass = scrolledX ? "shadow-[inset_-1px_0_0_0_var(--border)]" : ""
  const stickyLeftOffsets: Record<string, number> = useMemo(() => {
    const offsets: Record<string, number> = {}
    let offset = 0
    for (const col of STICKY_COLUMNS) {
      offsets[col] = offset
      offset += columnWidths[col] ?? DEFAULT_WIDTHS[col] ?? 0
    }
    return offsets
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnWidths])
  const [groupBy, setGroupBy] = useState<GroupBy>("none")
  const [establishedOnly, setEstablishedOnly] = useState(true)
  const filterRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const [controlsWidth, setControlsWidth] = useState<number | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Keep the Established/All-ads toggle flush with the Group by + Filters cluster above
  useEffect(() => {
    if (!controlsRef.current) return
    const el = controlsRef.current
    const update = () => setControlsWidth(el.offsetWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
    setPage(0)
  }

  const processed = useMemo(() => {
    let result = allAds.filter((a) => matchesSearch(a, search))
    if (establishedOnly) result = result.filter((a) => a.phase === "Established" || a.phase === "Optimizing")
    if (experimentFilters.length > 0) result = result.filter((a) => experimentFilters.includes(a.experiment))
    if (platformFilters.length > 0) result = result.filter((a) => platformFilters.includes(a.platform))
    if (campaignFilters.length > 0) result = result.filter((a) => campaignFilters.includes(a.campaignType))
    if (statusFilters.length > 0) {
      result = result.filter((a) => {
        const status = a.endedAt ? "Ended" : "Active"
        return statusFilters.includes(status)
      })
    }
    result.sort((a, b) => sortAds(a, b, sortKey, sortDir))
    return result
  }, [search, establishedOnly, experimentFilters, platformFilters, campaignFilters, statusFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paged = processed.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const grouped = useMemo(() => {
    if (groupBy === "none") {
      return [{ key: "all", label: "All", ads: paged, totals: computeGroupTotals(paged) }]
    }
    const groups = new Map<string, AdRow[]>()
    for (const ad of paged) {
      let key: string
      if (groupBy === "experiment") key = ad.experiment
      else if (groupBy === "platform") key = ad.platform
      else key = ad.campaignType
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(ad)
    }
    return Array.from(groups.entries()).map(([key, ads]) => ({
      key,
      label: key,
      ads,
      totals: computeGroupTotals(ads),
    }))
  }, [paged, groupBy])

  const activeColumns: ColumnKey[] = useMemo(() => {
    const defaultTab = DEFAULT_TABS.find((t) => t.key === activeTab)
    if (defaultTab) return [...CORE_COLUMNS, ...defaultTab.extras, ...TRAILING_COLUMNS]
    const custom = customViews.find((v) => v.id === activeTab)
    if (custom) return [...CORE_COLUMNS, ...custom.columns, ...TRAILING_COLUMNS]
    return [...CORE_COLUMNS, ...TRAILING_COLUMNS]
  }, [activeTab, customViews])

  // When switching to a custom view with a default sort, apply it
  useEffect(() => {
    const custom = customViews.find((v) => v.id === activeTab)
    if (custom && custom.sortKey) {
      setSortKey(custom.sortKey)
      setSortDir(custom.sortDir ?? "desc")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const activeFilters = [
    ...experimentFilters.map((f) => ({ key: `exp:${f}`, label: `Experiment: ${f}`, clear: () => setExperimentFilters((p) => p.filter((x) => x !== f)) })),
    ...platformFilters.map((f) => ({ key: `plat:${f}`, label: `Platform: ${f}`, clear: () => setPlatformFilters((p) => p.filter((x) => x !== f)) })),
    ...campaignFilters.map((f) => ({ key: `camp:${f}`, label: `Type: ${f}`, clear: () => setCampaignFilters((p) => p.filter((x) => x !== f)) })),
    ...statusFilters.map((f) => ({ key: `status:${f}`, label: `Status: ${f}`, clear: () => setStatusFilters((p) => p.filter((x) => x !== f)) })),
  ]

  // Experiment-average CVR for color coding (scoped to Established for accuracy)
  const avgCvr = useMemo(() => {
    const reliable = allAds.filter((a) => a.phase === "Established" || a.phase === "Optimizing")
    return reliable.length > 0 ? reliable.reduce((s, a) => s + a.cvr, 0) / reliable.length : 0
  }, [])

  // KPI totals for summary row
  const totalSpend = processed.reduce((s, a) => s + a.spend, 0)
  const totalClicks = processed.reduce((s, a) => s + a.clicks, 0)
  const totalOrders = processed.reduce((s, a) => s + a.orders, 0)
  const totalRevenue = processed.reduce((s, a) => s + a.revenue, 0)
  const totalRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0
  const blendedRoas = establishedOnly
    ? (() => {
        const reliable = allAds.filter((a) => a.phase === "Established" || a.phase === "Optimizing")
        const s = reliable.reduce((x, a) => x + a.spend, 0)
        const r = reliable.reduce((x, a) => x + a.revenue, 0)
        return s > 0 ? r / s : 0
      })()
    : (() => {
        const s = allAds.reduce((x, a) => x + a.spend, 0)
        const r = allAds.reduce((x, a) => x + a.revenue, 0)
        return s > 0 ? r / s : 0
      })()

  const cvrKpi = rateKpis.find((k) => k.key === "cvr")!
  const aovKpi = rateKpis.find((k) => k.key === "aov")!
  const rpvKpi = rateKpis.find((k) => k.key === "rpv")!

  return (
    <GlossaryContext.Provider value={openGlossary}>
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-0.5">Ads</h2>
        <p className="text-sm text-muted-foreground">Ad performance across all experiments</p>
      </div>

      {/* Hero KPIs — Summary-style cards with colored accent icons */}
      {(() => {
        const relPct = (current: number, baseline: number) => {
          if (baseline === 0) return 0
          return ((current - baseline) / baseline) * 100
        }
        const fmtPct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}%`
        const fmtRoasDelta = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}x`
        const fmtCurrencyDelta = (v: number) => `${v >= 0 ? "+" : "-"}$${Math.abs(v).toFixed(2)}`
        const cvrDelta = relPct(cvrKpi.value, cvrKpi.baseline)
        const aovDelta = relPct(aovKpi.value, aovKpi.baseline)
        const rpvDelta = relPct(rpvKpi.value, rpvKpi.baseline)
        const roasBaseline = adBaselines.roas
        const roasDelta = blendedRoas - roasBaseline
        // True CPA — projected CPA at winning-variant efficiency
        const cpaBaseline = adBaselines.cpa
        // Compute portfolio True CPA from reliable ads
        const reliableAds = allAds.filter((a) => a.phase === "Established" || a.phase === "Optimizing")
        const reliableSpend = reliableAds.reduce((s, a) => s + a.spend, 0)
        const reliableOrders = reliableAds.reduce((s, a) => s + a.orders, 0)
        const observedCpa = reliableOrders > 0 ? reliableSpend / reliableOrders : 0
        const avgRank = reliableAds.length > 0 ? reliableAds.reduce((s, a) => s + a.rank, 0) / reliableAds.length : 50
        const winnerLift = 0.10 + (avgRank / 100) * 0.10
        const trueCpaValue = observedCpa * (1 - winnerLift)
        const trueCpaRawDelta = trueCpaValue - cpaBaseline
        const confidenceLabel = avgRank >= 60 ? "High confidence" : avgRank >= 40 ? "Medium confidence" : "Low confidence"
        const confidenceTone: "high" | "medium" | "low" = avgRank >= 60 ? "high" : avgRank >= 40 ? "medium" : "low"
        return (
          <div className="grid grid-cols-6 gap-2" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
            <KpiStatCard
              metricKey="cvr"
              label="CVR"
              value={fmtRate(cvrKpi.value, cvrKpi.format)}
              delta={fmtPct(cvrDelta)}
              tone={cvrDelta >= 0 ? "positive" : "negative"}
              baselineText={`from ${fmtRate(cvrKpi.baseline, cvrKpi.format)} baseline`}
              definition={COLUMN_DEFINITIONS.cvr}
            />
            <KpiStatCard
              metricKey="aov"
              label="AOV"
              value={fmtRate(aovKpi.value, aovKpi.format)}
              delta={fmtPct(aovDelta)}
              tone={aovDelta >= 0 ? "positive" : "negative"}
              baselineText={`from ${fmtRate(aovKpi.baseline, aovKpi.format)} baseline`}
              definition={COLUMN_DEFINITIONS.aov}
            />
            <KpiStatCard
              metricKey="rpv"
              label="RPV"
              value={fmtRate(rpvKpi.value, rpvKpi.format)}
              delta={fmtPct(rpvDelta)}
              tone={rpvDelta >= 0 ? "positive" : "negative"}
              baselineText={`from ${fmtRate(rpvKpi.baseline, rpvKpi.format)} baseline`}
              definition={COLUMN_DEFINITIONS.rpv}
            />
            <KpiStatCard
              metricKey="revenue"
              label="Revenue"
              value={`$${portfolioSummary.revenue.toLocaleString()}`}
              baselineText={`from ${portfolioSummary.visitors.toLocaleString()} visitors`}
            />
            <KpiStatCard
              metricKey="roas"
              label="Blended ROAS"
              value={`${blendedRoas.toFixed(2)}x`}
              delta={fmtRoasDelta(roasDelta)}
              tone={roasDelta >= 0 ? "positive" : "negative"}
              baselineText={`from ${roasBaseline.toFixed(2)}x baseline`}
              definition={COLUMN_DEFINITIONS.roas}
            />
            <KpiStatCard
              metricKey="trueCpa"
              label="True CPA"
              value={`$${trueCpaValue.toFixed(2)}`}
              delta={fmtCurrencyDelta(trueCpaRawDelta)}
              tone={trueCpaRawDelta <= 0 ? "positive" : "negative"}
              arrow={trueCpaRawDelta <= 0 ? "down" : "up"}
              baselineText={`from $${cpaBaseline.toFixed(2)} baseline`}
              badge={{ label: confidenceLabel, tone: confidenceTone }}
              definition={COLUMN_DEFINITIONS.trueCpa}
            />
          </div>
        )
      })()}

      {/* Search + Group by + Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ads, experiments, platforms..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="pl-11 h-11 text-sm"
          />
        </div>
        <div ref={controlsRef} className="flex items-center gap-2 shrink-0">
          <GroupBySelect value={groupBy} onChange={setGroupBy} />
          <div className="relative shrink-0" ref={filterRef}>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </Button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-[22rem] bg-background border rounded-xl shadow-xl p-4 space-y-4" style={{ zIndex: 9999 }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Filters</p>
                  {activeFilters.length > 0 && (
                    <button onClick={() => { setExperimentFilters([]); setPlatformFilters([]); setCampaignFilters([]); setStatusFilters([]) }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
                  )}
                </div>
                <FilterRow label="Status" options={STATUS_OPTIONS} selected={statusFilters} onChange={(v) => { setStatusFilters(v); setPage(0) }} />
                <FilterRow label="Experiment" options={EXPERIMENT_OPTIONS} selected={experimentFilters} onChange={(v) => { setExperimentFilters(v); setPage(0) }} />
                <FilterRow label="Platform" options={PLATFORM_OPTIONS} selected={platformFilters} onChange={(v) => { setPlatformFilters(v); setPage(0) }} />
                <FilterRow label="Campaign Type" options={CAMPAIGN_OPTIONS} selected={campaignFilters} onChange={(v) => { setCampaignFilters(v); setPage(0) }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((f) => (
            <button key={f.key} onClick={f.clear} className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors">
              {f.label}
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
          <button onClick={() => { setExperimentFilters([]); setPlatformFilters([]); setCampaignFilters([]); setStatusFilters([]); setPage(0) }} className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-1">Clear all</button>
        </div>
      )}

      {/* View tabs */}
      <div className="flex items-end justify-between gap-4 border-b">
        <div className="flex-1 min-w-0">
          <ViewTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            customViews={customViews}
            onCustomViewUpdate={updateView}
            onCustomViewDelete={deleteView}
            onCreateView={createView}
          />
        </div>
        <div
          className="flex items-center gap-1 bg-muted rounded-lg p-0.5 mb-1.5 shrink-0"
          style={controlsWidth ? { width: controlsWidth } : undefined}
        >
          <button
            onClick={() => setEstablishedOnly(true)}
            className={cn(
              "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
              establishedOnly ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Established + Optimizing
          </button>
          <button
            onClick={() => setEstablishedOnly(false)}
            className={cn(
              "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
              !establishedOnly ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All ads
          </button>
        </div>
      </div>

      {/* Table */}
      <Card className="py-0 gap-0 overflow-hidden">
        <div ref={tableScrollRef} className="overflow-x-auto">
          <table className="text-sm" style={{ tableLayout: "fixed", borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: "max-content" }}>
            <thead>
              <tr className="border-b bg-muted">
                <HeaderCell
                  colKey="ad"
                  label="Ad"
                  align="left"
                  sortKey="creative"
                  currentSort={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  width={columnWidths.ad}
                  sticky={stickyLeftOffsets.ad}
                  onResize={startResize}
                  labelIndent={52}
                />
                {activeColumns.map((col) => {
                  const sortK = COLUMN_SORT_KEY[col]
                  const align = COLUMN_ALIGN[col]
                  const width = columnWidths[col] ?? DEFAULT_WIDTHS[col]
                  const sticky = STICKY_COLUMNS.includes(col) ? stickyLeftOffsets[col] : undefined
                  return (
                    <HeaderCell
                      key={col}
                      colKey={col}
                      label={COLUMN_LABELS[col]}
                      align={align}
                      sortKey={sortK}
                      currentSort={sortKey}
                      currentDir={sortDir}
                      onSort={handleSort}
                      width={width}
                      sticky={sticky}
                      onResize={startResize}
                      definition={COLUMN_DEFINITIONS[col]}
                      edgeClass={col === LAST_STICKY ? scrolledEdgeClass : ""}
                    />
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {grouped.length === 0 && (
                <tr>
                  <td colSpan={activeColumns.length + 1} className="px-5 py-8 text-center text-muted-foreground">No ads match your search.</td>
                </tr>
              )}
              {grouped.map((group, gi) => (
                <React.Fragment key={group.key}>
                  {groupBy !== "none" && (
                    <tr className="bg-muted/40">
                      <td colSpan={activeColumns.length + 1} className="px-4 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{group.label}</span>
                          <div className="flex items-center gap-5 text-xs">
                            <span><span className="text-muted-foreground">Ads </span><span className="font-semibold">{group.ads.length}</span></span>
                            <span><span className="text-muted-foreground">CVR </span><span className="font-semibold">{group.totals.cvr.toFixed(2)}%</span></span>
                            <span><span className="text-muted-foreground">RPV </span><span className="font-semibold">${group.totals.rpv.toFixed(2)}</span></span>
                            <span><span className="text-muted-foreground">ROAS </span><span className="font-semibold">{group.totals.roas.toFixed(2)}x</span></span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {group.ads.map((ad, i) => (
                    <tr
                      key={`${gi}-${i}`}
                      onClick={() => setSidebarAd(ad)}
                      className="hover:bg-muted transition-colors group cursor-pointer"
                    >
                      <td
                        style={{
                          width: columnWidths.ad,
                          minWidth: columnWidths.ad,
                          maxWidth: columnWidths.ad,
                          position: "sticky",
                          left: stickyLeftOffsets.ad,
                          zIndex: 10,
                        }}
                        className="px-4 py-3 bg-background group-hover:bg-muted transition-colors border-b border-border/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                            {ad.format}
                          </div>
                          <div className="min-w-0">
                            <a
                              href="https://business.facebook.com/adsmanager/manage/ads"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Open in Ads Manager"
                              className="text-sm font-semibold break-words text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {ad.creative}
                            </a>
                            <div className="flex items-center gap-1.5 mt-1">
                              {ad.endedAt ? (
                                <>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground">
                                    Ended
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {ad.launched} – {ad.endedAt}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Active
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Since {ad.launched}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      {activeColumns.map((col) => {
                        const isSticky = STICKY_COLUMNS.includes(col)
                        const width = columnWidths[col] ?? DEFAULT_WIDTHS[col]
                        return (
                          <td
                            key={col}
                            style={{
                              width,
                              minWidth: width,
                              maxWidth: width,
                              ...(isSticky ? {
                                position: "sticky",
                                left: stickyLeftOffsets[col],
                                zIndex: 10,
                              } : {}),
                            }}
                            className={cn(
                              "px-4 py-3 align-middle border-b border-border/60",
                              isSticky && "bg-background group-hover:bg-muted transition-colors",
                              col === LAST_STICKY && scrolledEdgeClass,
                              COLUMN_ALIGN[col] === "right" ? "text-right" : "text-left"
                            )}
                          >
                            {renderCell(ad, col)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted font-semibold text-sm">
                <td
                  style={{
                    width: columnWidths.ad,
                    minWidth: columnWidths.ad,
                    position: "sticky",
                    left: stickyLeftOffsets.ad,
                    zIndex: 10,
                  }}
                  className="px-4 py-3 bg-muted"
                >
                  Summary
                </td>
                {activeColumns.map((col) => {
                  let content: React.ReactNode = null
                  if (col === "experiment") content = `${processed.length} ads`
                  else if (col === "rank") {
                    // Average rank across ads with a meaningful rank (Established + Optimizing only).
                    // New and Learning ads are excluded — their ranks aren't confidence-tested.
                    const reliable = processed.filter((a) => a.phase === "Established" || a.phase === "Optimizing")
                    if (reliable.length > 0) {
                      const avg = Math.round(reliable.reduce((s, a) => s + a.rank, 0) / reliable.length)
                      content = <RankRing rank={avg} phase="Established" trend="flat" />
                    } else {
                      content = <RankRing rank={0} phase="New" trend="flat" />
                    }
                  }
                  else if (col === "cvr") {
                    const v = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0
                    content = <span className="tabular-nums">{v.toFixed(2)}%</span>
                  } else if (col === "rpv") {
                    const v = totalClicks > 0 ? totalRevenue / totalClicks : 0
                    content = <span className="tabular-nums">${v.toFixed(2)}</span>
                  } else if (col === "roas") content = <span className="tabular-nums">{totalRoas.toFixed(2)}x</span>
                  else if (col === "spend") content = <span className="tabular-nums">${totalSpend.toLocaleString()}</span>
                  else if (col === "clicks") content = <span className="tabular-nums">{totalClicks.toLocaleString()}</span>
                  else if (col === "orders") content = <span className="tabular-nums">{totalOrders}</span>
                  else if (col === "revenue") content = <span className="tabular-nums">${totalRevenue.toLocaleString()}</span>
                  else if (col === "cpc") {
                    const v = totalClicks > 0 ? totalSpend / totalClicks : 0
                    content = <span className="tabular-nums">${v.toFixed(2)}</span>
                  } else if (col === "cpa") {
                    const v = totalOrders > 0 ? totalSpend / totalOrders : 0
                    content = <span className="tabular-nums">${v.toFixed(2)}</span>
                  } else if (col === "trueCpa") {
                    // Weighted average True CPA across reliable ads only
                    const reliable = processed.filter((a) => trueCpaOf(a) !== null)
                    const totalReliableSpend = reliable.reduce((s, a) => s + a.spend, 0)
                    const totalReliableOrders = reliable.reduce((s, a) => s + a.orders, 0)
                    if (totalReliableOrders > 0) {
                      // Apply same winner-lift logic to the blended CPA
                      const avgRank = reliable.reduce((s, a) => s + a.rank, 0) / reliable.length
                      const winnerLift = 0.10 + (avgRank / 100) * 0.10
                      const blendedCpa = totalReliableSpend / totalReliableOrders
                      const v = blendedCpa * (1 - winnerLift)
                      content = <span className="tabular-nums">${v.toFixed(2)}</span>
                    }
                  } else if (col === "aov") {
                    const v = totalOrders > 0 ? totalRevenue / totalOrders : 0
                    content = <span className="tabular-nums">${v.toFixed(2)}</span>
                  } else if (col === "epc") {
                    const v = totalClicks > 0 ? totalRevenue / totalClicks : 0
                    content = <span className="tabular-nums">${v.toFixed(2)}</span>
                  } else if (col === "upsellTakeRate") {
                    // Order-weighted: sum(orders × takeRate) / sum(orders)
                    const weighted = processed.reduce((s, a) => s + a.orders * a.upsellTakeRate, 0)
                    const v = totalOrders > 0 ? weighted / totalOrders : 0
                    content = <span className="tabular-nums">{v.toFixed(2)}%</span>
                  }
                  const isSticky = STICKY_COLUMNS.includes(col)
                  const width = columnWidths[col] ?? DEFAULT_WIDTHS[col]
                  return (
                    <td
                      key={col}
                      style={{
                        width,
                        minWidth: width,
                        ...(isSticky ? {
                          position: "sticky",
                          left: stickyLeftOffsets[col],
                          zIndex: 10,
                        } : {}),
                      }}
                      className={cn(
                        "px-4 py-3",
                        isSticky && "bg-muted",
                        col === LAST_STICKY && scrolledEdgeClass,
                        COLUMN_ALIGN[col] === "right" ? "text-right" : "text-left"
                      )}
                    >
                      {content}
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">
            Page {safePage + 1} of {totalPages} ({processed.length} ads)
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Learnings sidebar */}
      {sidebarAd && (
        <LearningsSidebar ad={sidebarAd} onClose={() => setSidebarAd(null)} onNavigateToExperiment={onNavigateToExperiment} />
      )}

      {/* Metrics Glossary sidebar */}
      {glossaryAnchor !== null && (
        <MetricsGlossary
          onClose={() => setGlossaryAnchor(null)}
          initialAnchor={glossaryAnchor}
        />
      )}
    </div>
    </GlossaryContext.Provider>
  )
}
