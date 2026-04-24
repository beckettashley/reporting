"use client"

import React, { useState } from "react"
import {
  Search, ChevronDown, ChevronRight, SlidersHorizontal,
  LayoutDashboard, Package, ShoppingCart, FlaskConical, Megaphone, Lightbulb, Tag, BookOpen,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { merchant } from "@/lib/data"
import { V2Header } from "@/components/dashboard/v2-header"
import { V2Sidebar } from "@/components/dashboard/v2-sidebar"

// ─── Sidebar nav ───────────────────────────────────────────────────────────

const sidebarNavItems = [
  { key: "summary", label: "Summary", icon: LayoutDashboard, href: "/" },
  { key: "experiments", label: "Experiments", icon: FlaskConical, href: "/" },
  { key: "ads", label: "Ads", icon: Megaphone, href: "/" },
  { key: "products", label: "Products", icon: Package, href: "/" },
]

// ─── Types ─────────────────────────────────────────────────────────────────

interface VariantRow {
  name: string
  isPrior?: boolean
  sessions?: number
  spend?: number
  revenue?: number
  epc?: number
  cpa?: number
  aov?: number
  cvr?: number
  orders?: number
  upsells?: number
  dEpc?: string
  dCpa?: string
  dAov?: string
  dCvr?: string
  dOrders?: string
  dUpsells?: string
  variantUrl: string
}

interface ExperimentRow {
  id: string
  name: string
  product: string
  adName: string
  adUrl: string
  campaign: string
  adSet?: string
  startDate: string
  endDate: string | null
  sessions: number
  spend: number
  cvr?: number
  aov?: number
  cpa?: number
  dCvr?: string
  dAov?: string
  dCpa?: string
  status: "Active" | "Complete" | "Pending"
  // Detail fields
  sentimentBrief: string
  sentimentBullets: string[]
  changesBrief: string
  changesBullets: string[]
  insightsBrief: string
  insightsBullets: string[]
  variants: VariantRow[]
  cvrChartData: { day: string; variant: number; baseline: number }[]
}

// ─── Mock data ─────────────────────────────────────────────────────────────

function generateCvrChart(variantStart: number, variantEnd: number, baseline: number): { day: string; variant: number; baseline: number }[] {
  const data: { day: string; variant: number; baseline: number }[] = []
  for (let i = 1; i <= 14; i++) {
    const progress = i / 14
    const variantBase = variantStart + (variantEnd - variantStart) * progress
    data.push({
      day: `Apr ${i}`,
      variant: +(variantBase + (Math.random() - 0.5) * 0.3).toFixed(2),
      baseline: +(baseline + (Math.random() - 0.5) * 0.15).toFixed(2),
    })
  }
  return data
}

const EXPERIMENTS: ExperimentRow[] = [
  {
    id: "exp_1",
    name: "Educational presell approach",
    product: "Acme Sleep Drops",
    adName: "Sleep Drops - Problem Aware 01",
    adUrl: "https://business.facebook.com/adsmanager/manage/ads",
    campaign: "{Campaign Name}",
    adSet: "{Audience Name}",
    startDate: "Apr 1",
    endDate: null,
    sessions: 2140,
    spend: 1240,
    status: "Active",
    sentimentBrief: "Problem-aware ad targeting audiences who already recognize sleep quality issues.",
    sentimentBullets: [
      "Calm, night-time imagery with founder's personal narrative",
      "Emotional beats: frustration with existing solutions, hope for a natural alternative",
      "Primary pain points: restless sleep, groggy mornings, OTC dependency",
    ],
    changesBrief: "Velocity generated an educational narrative presell page for this ad's traffic.",
    changesBullets: [
      "Page walks visitors through key ingredient science and sleep cycle interaction",
      "Layout leads with credibility before presenting the offer",
      "Conventional alternatives addressed as contrast to build differentiation",
    ],
    insightsBrief: "Data still accumulating — early signals are positive.",
    insightsBullets: [
      "Educational approach engaging visitors longer (higher scroll depth) vs. existing direct-to-product page",
      "CVR data not yet reliable at current sample size",
      "No negative signals on AOV or bounce rate",
    ],
    variants: [
      { name: "Educational narrative layout", sessions: 2140, spend: 1240, revenue: 3420, epc: 2.41, cpa: 82.00, aov: 128.00, cvr: 4.10, orders: 28, upsells: 7, dEpc: "+$0.23", dCpa: "−$7.00", dAov: "+$5.00", dCvr: "+0.30%", dOrders: "+5", dUpsells: "+2", variantUrl: "https://variants.velocity.app/exp-1/v1" },
    ],
    cvrChartData: generateCvrChart(3.8, 4.1, 3.8),
  },
  {
    id: "exp_2",
    name: "Founder story angle",
    product: "Acme Sleep Drops",
    adName: "Founder Story 02",
    adUrl: "https://business.facebook.com/adsmanager/manage/ads",
    campaign: "{Campaign Name}",
    adSet: "{Audience Name}",
    startDate: "Apr 1",
    endDate: null,
    sessions: 1580,
    spend: 890,
    status: "Active",
    sentimentBrief: "Founder story ad using authenticity and transparency as the primary selling angle.",
    sentimentBullets: [
      "Personal journey from chronic insomnia to product development",
      "Behind-the-scenes lab footage and personal photos",
      "Trust through transparency — founder shares their struggle to create relatability",
    ],
    changesBrief: "Velocity extended the founder narrative from the ad into the presell experience.",
    changesBullets: [
      "Page opens with the founder's story, transitions into product development journey",
      "Offer presented as the natural conclusion of the narrative arc",
      "Tone matches the ad's conversational, authentic feel throughout",
    ],
    insightsBrief: "Data still accumulating — mixed early signals.",
    insightsBullets: [
      "Lower click-through from ad to page vs. problem-aware creative",
      "Visitors who arrive are spending more time on the presell page",
      "Too early to determine CVR impact — need more sessions",
    ],
    variants: [
      { name: "Founder narrative presell", sessions: 1580, spend: 890, revenue: 2280, epc: 2.10, cpa: 95.00, aov: 120.00, cvr: 3.60, orders: 19, upsells: 4, dEpc: "−$0.08", dCpa: "+$6.00", dAov: "−$3.00", dCvr: "−0.20%", dOrders: "+1", dUpsells: "+0", variantUrl: "https://variants.velocity.app/exp-2/v1" },
    ],
    cvrChartData: generateCvrChart(3.5, 3.6, 3.8),
  },
  {
    id: "exp_3",
    name: "Value-framed offer positioning",
    product: "Acme Sleep Drops",
    adName: "Value Proposition 03",
    adUrl: "https://business.facebook.com/adsmanager/manage/ads",
    campaign: "{Campaign Name}",
    adSet: "{Audience Name}",
    startDate: "Apr 1",
    endDate: "Apr 10",
    sessions: 4320,
    spend: 2180,
    cvr: 4.5,
    aov: 131,
    cpa: 85,
    dCvr: "+0.70%",
    dAov: "+$8.00",
    dCpa: "−$4.00",
    status: "Complete",
    sentimentBrief: "Problem-aware ad targeting customers who already struggle with sleep quality.",
    sentimentBullets: [
      "Emotional beats: frustration with existing solutions, hope for a natural alternative",
      "Calm, night-time imagery with founder's personal testimonial for authenticity",
      "Pain points: restless sleep, groggy mornings, OTC sleep aid dependency",
    ],
    changesBrief: "Velocity reframed the offer from urgency-based to value-anchored positioning.",
    changesBullets: [
      "Hero section leads with customer transformation rather than limited-time pricing",
      "Offer section emphasizes cost-per-night value breakdown and subscription savings",
      "Testimonials reorganized to lead with outcome-focused quotes over product-feature praise",
    ],
    insightsBrief: "Value-anchored positioning converted 18% better than urgency framing.",
    insightsBullets: [
      "Audience responds to messaging reinforcing existing awareness over manufactured urgency",
      "Warm retargeting audiences prefer value substantiation over scarcity tactics",
      "Higher AOV — customers more willing to commit to larger bundles with explicit per-unit economics",
    ],
    variants: [
      { name: "Value-anchored framing", sessions: 4320, spend: 2180, revenue: 5890, epc: 2.73, cpa: 85.00, aov: 131.00, cvr: 4.50, orders: 45, upsells: 12, dEpc: "+$0.55", dCpa: "−$4.00", dAov: "+$8.00", dCvr: "+0.70%", dOrders: "+8", dUpsells: "+3", variantUrl: "https://variants.velocity.app/exp-3/v1" },
    ],
    cvrChartData: generateCvrChart(3.9, 4.5, 3.8),
  },
  {
    id: "exp_4",
    name: "Quality-proof layout",
    product: "Acme Sleep Drops",
    adName: "Quality Proof 04",
    adUrl: "https://business.facebook.com/adsmanager/manage/ads",
    campaign: "{Campaign Name}",
    adSet: "{Audience Name}",
    startDate: "Apr 1",
    endDate: "Apr 10",
    sessions: 3960,
    spend: 1870,
    cvr: 3.8,
    aov: 124,
    cpa: 94,
    dCvr: "−0.40%",
    dAov: "−$3.00",
    dCpa: "+$6.00",
    status: "Complete",
    sentimentBrief: "Clinical proof ad using third-party validation and authoritative tone.",
    sentimentBullets: [
      "Lab imagery, ingredient certifications, before/after sleep tracking data",
      "Authoritative tone — rational justification over emotional appeal",
      "Selling angle: quality signals and clinical evidence",
    ],
    changesBrief: "Velocity generated a proof-heavy presell page for retargeting traffic.",
    changesBullets: [
      "Layout features certifications, lab test results, ingredient sourcing details",
      "Clinical study references prioritized over narrative or transformation messaging",
      "Trust signals front-loaded before the offer presentation",
    ],
    insightsBrief: "Quality-proof approach underperformed baseline for this audience.",
    insightsBullets: [
      "Warm retargeting audiences already evaluated the product — additional proof added friction",
      "Proof-heavy layout created cognitive load without adding new persuasive information",
      "Pattern suggests proof elements are more effective for cold audiences than retargeting",
    ],
    variants: [
      { name: "Quality-proof heavy layout", sessions: 3960, spend: 1870, revenue: 4280, epc: 1.92, cpa: 94.00, aov: 124.00, cvr: 3.80, orders: 38, upsells: 8, dEpc: "−$0.26", dCpa: "+$5.00", dAov: "+$1.00", dCvr: "+0.00%", dOrders: "−2", dUpsells: "−1", variantUrl: "https://variants.velocity.app/exp-4/v1" },
    ],
    cvrChartData: generateCvrChart(3.9, 3.8, 3.8),
  },
]

// ─── Status pill ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ExperimentRow["status"], string> = {
  Active: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  Complete: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  Pending: "bg-muted text-muted-foreground",
}

// ─── Delta text ────────────────────────────────────────────────────────────

function DeltaText({ value }: { value?: string }) {
  if (!value) return null
  const isPositive = value.startsWith("+")
  const isNegative = value.startsWith("−") || value.startsWith("-")
  return (
    <p className={cn("text-xs tabular-nums", isPositive ? "text-emerald-600" : isNegative ? "text-rose-500" : "text-muted-foreground")}>
      {value}
    </p>
  )
}

// ─── Group By select ───────────────────────────────────────────────────────

type GroupBy = "none" | "ad" | "product" | "status"
const GROUP_OPTIONS: { key: GroupBy; label: string }[] = [
  { key: "none", label: "None" },
  { key: "ad", label: "Ad" },
  { key: "product", label: "Product" },
  { key: "status", label: "Status" },
]

function GroupBySelect({ value, onChange }: { value: GroupBy; onChange: (v: GroupBy) => void }) {
  const [open, setOpen] = useState(false)
  const selected = GROUP_OPTIONS.find((o) => o.key === value)

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-2 h-11 px-4 rounded-md border text-sm transition-colors bg-background hover:bg-muted",
          open && "ring-2 ring-amber-400"
        )}
      >
        <span className="text-xs text-muted-foreground">Group by:</span>
        <span className="text-sm font-medium">{selected?.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg py-1 z-[9999]">
            {GROUP_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
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
        </>
      )}
    </div>
  )
}

// ─── Experiment detail (inline expansion) ──────────────────────────────────

function ExperimentDetail({ exp }: { exp: ExperimentRow }) {
  return (
    <div className="bg-muted px-6 py-5 space-y-5">
      {/* 1. Ad Analysis */}
      <div className="rounded-xl border bg-background p-5">
        <p className="text-sm font-semibold text-foreground mb-3">Ad Analysis</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <a
              href={exp.adUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              {exp.adName}
            </a>
            <p className="text-xs text-muted-foreground mt-0.5">
              {exp.campaign}{exp.adSet && ` · ${exp.adSet}`}
            </p>
            <Separator className="my-3" />
            <p className="text-sm font-medium text-foreground mb-2">{exp.sentimentBrief}</p>
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              {exp.sentimentBullets.map((b, i) => <li key={i} className="leading-relaxed">{b}</li>)}
            </ul>
          </div>
          <div className="w-40 h-40 rounded-lg border bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
            IMG
          </div>
        </div>
      </div>

      {/* 2. Changes */}
      <div className="rounded-xl border bg-background p-5">
        <p className="text-sm font-semibold text-foreground mb-2">Changes</p>
        <p className="text-sm font-medium text-foreground mb-2">{exp.changesBrief}</p>
        <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
          {exp.changesBullets.map((b, i) => <li key={i} className="leading-relaxed">{b}</li>)}
        </ul>
      </div>

      {/* 3. Insights */}
      <div className="rounded-xl border bg-background p-5">
        <p className="text-sm font-semibold text-foreground mb-2">Insights</p>
        <p className="text-sm font-medium text-foreground mb-2">{exp.insightsBrief}</p>
        <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
          {exp.insightsBullets.map((b, i) => <li key={i} className="leading-relaxed">{b}</li>)}
        </ul>
      </div>

      {/* 4. Performance */}
      <div className="rounded-xl border bg-background p-5 space-y-3">
        <p className="text-sm font-semibold text-foreground">Performance</p>
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ tableLayout: "fixed", width: "100%", minWidth: "max-content" }}>
              <colgroup>
                <col style={{ width: 220 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 80 }} />
              </colgroup>
              <thead>
                <tr className="bg-muted">
                  <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Variant</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Sessions</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Spend</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Revenue</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">EPC</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">CPA</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">AOV</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">CVR</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Orders</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Upsells</th>
                </tr>
              </thead>
              <tbody>
                {exp.variants.map((v, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="px-4 py-3 text-foreground">
                      <a href={v.variantUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                        {v.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{v.sessions?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{v.spend != null ? `$${v.spend.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{v.revenue != null ? `$${v.revenue.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                      {v.epc != null ? `$${v.epc.toFixed(2)}` : "—"}
                      <DeltaText value={v.dEpc} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                      {v.cpa != null ? `$${v.cpa.toFixed(2)}` : "—"}
                      <DeltaText value={v.dCpa} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                      {v.aov != null ? `$${v.aov.toFixed(2)}` : "—"}
                      <DeltaText value={v.dAov} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                      {v.cvr != null ? `${v.cvr.toFixed(2)}%` : "—"}
                      <DeltaText value={v.dCvr} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {v.orders ?? "—"}
                      <DeltaText value={v.dOrders} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {v.upsells ?? "—"}
                      <DeltaText value={v.dUpsells} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Conversion Rate chart */}
      <div className="rounded-xl border bg-background p-5">
        <p className="text-sm font-semibold text-foreground mb-4">Conversion Rate</p>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={exp.cvrChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={["auto", "auto"]} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                formatter={(value: number, name: string) => [`${value}%`, name === "variant" ? "Variant CVR" : "Merchant baseline"]}
                labelStyle={{ fontWeight: 600 }}
              />
              <Legend
                formatter={(value: string) => value === "variant" ? "Variant CVR" : "Merchant baseline (Meta historical)"}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Line type="monotone" dataKey="variant" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ReportingV2() {
  const [search, setSearch] = useState("")
  const [groupBy, setGroupBy] = useState<GroupBy>("none")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = EXPERIMENTS.filter((e) => {
    if (!search) return true
    const q = search.toLowerCase()
    return e.name.toLowerCase().includes(q) || e.product.toLowerCase().includes(q) || e.adName.toLowerCase().includes(q) || e.campaign.toLowerCase().includes(q)
  })

  const grouped = React.useMemo(() => {
    if (groupBy === "none") return [{ key: "all", label: "", items: filtered }]
    const map = new Map<string, ExperimentRow[]>()
    for (const e of filtered) {
      const key = groupBy === "ad" ? e.adName : groupBy === "product" ? e.product : e.status
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, label: key, items }))
  }, [filtered, groupBy])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <V2Sidebar activeKey="experiments-v2" />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <V2Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-6 py-6 space-y-4">
            <h2 className="text-lg font-semibold">Experiments</h2>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search ads, experiments, platforms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-11 text-sm" />
              </div>
              <GroupBySelect value={groupBy} onChange={setGroupBy} />
              <Button variant="outline" className="h-11 gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Table */}
            <Card className="py-0 gap-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ tableLayout: "fixed", width: "100%", minWidth: "max-content" }}>
                  <colgroup>
                    <col style={{ width: 280 }} />
                    <col style={{ width: 220 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 100 }} />
                    <col style={{ width: 100 }} />
                    <col style={{ width: 100 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 100 }} />
                    <col style={{ width: 40 }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Experiment</th>
                      <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Ad</th>
                      <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Duration</th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">Sessions</th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">Spend</th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">CVR</th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">AOV</th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">CPA</th>
                      <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Status</th>
                      <th className="px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">No experiments match your search.</td></tr>
                    ) : (
                      grouped.map((group) => (
                        <React.Fragment key={group.key}>
                          {group.label && (
                            <tr className="bg-muted/40">
                              <td colSpan={10} className="px-4 py-2">
                                <span className="text-sm font-semibold text-foreground">{group.label}</span>
                                <span className="text-xs text-muted-foreground ml-2">{group.items.length}</span>
                              </td>
                            </tr>
                          )}
                          {group.items.map((exp) => {
                            const isExpanded = expandedId === exp.id
                            const isActive = exp.status === "Active"
                            return (
                              <React.Fragment key={exp.id}>
                                <tr
                                  className={cn(
                                    "border-b cursor-pointer transition-colors",
                                    isExpanded ? "bg-muted/50 border-l-2 border-l-amber-400" : "hover:bg-muted/30 border-l-2 border-l-transparent"
                                  )}
                                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-lg border bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">IMG</div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground leading-snug truncate">{exp.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{exp.product}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <a
                                      href={exp.adUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-sm text-blue-600 hover:underline dark:text-blue-400 truncate block"
                                    >
                                      {exp.adName}
                                    </a>
                                    <p className="text-xs text-muted-foreground truncate">{exp.campaign}</p>
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <p className="text-foreground">{exp.startDate}</p>
                                    <p className="text-xs text-muted-foreground">{exp.endDate ?? "Ongoing"}</p>
                                  </td>
                                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{exp.sessions.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-right tabular-nums text-foreground">${exp.spend.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-right tabular-nums">
                                    {isActive ? (
                                      <span className="text-muted-foreground">—</span>
                                    ) : (
                                      <div>
                                        <p className="font-medium text-foreground">{exp.cvr?.toFixed(2)}%</p>
                                        <DeltaText value={exp.dCvr} />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right tabular-nums">
                                    {isActive ? (
                                      <span className="text-muted-foreground">—</span>
                                    ) : (
                                      <div>
                                        <p className="font-medium text-foreground">${exp.aov?.toFixed(2)}</p>
                                        <DeltaText value={exp.dAov} />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right tabular-nums">
                                    {isActive ? (
                                      <span className="text-muted-foreground">—</span>
                                    ) : (
                                      <div>
                                        <p className="font-medium text-foreground">${exp.cpa?.toFixed(2)}</p>
                                        <DeltaText value={exp.dCpa} />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={cn("inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap", STATUS_STYLES[exp.status])}>
                                      {exp.status}
                                    </span>
                                  </td>
                                  <td className="px-2 py-3 text-center">
                                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="border-b">
                                    <td colSpan={10} className="p-0">
                                      <ExperimentDetail exp={exp} />
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
