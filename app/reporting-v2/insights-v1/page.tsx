"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { Search, ChevronDown, ChevronRight, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { V2Header } from "@/components/dashboard/v2-header"
import { V2Sidebar } from "@/components/dashboard/v2-sidebar"

// ─── Types ─────────────────────────────────────────────────────────────────

interface InsightRow {
  id: string
  adName: string
  adUrl: string
  product: string
  campaign: string
  adSet: string
  destinationLink: string
  sentimentBrief: string
  sentimentBullets: string[]
  insight: string
  date: string
  observationHeadline: string
  observationBullets: string[]
}

// ─── Mock data ─────────────────────────────────────────────────────────────

const INSIGHTS: InsightRow[] = [
  {
    id: "ins_1",
    adName: "Sleep Drops – Problem Aware 01",
    adUrl: "https://business.facebook.com/adsmanager/manage/ads",
    product: "Acme Sleep Drops",
    campaign: "{Campaign Name}",
    adSet: "{Ad Set Name}",
    destinationLink: "https://brand.com/exp-123/abc",
    sentimentBrief: "Problem-aware ad targeting audiences who already recognize sleep quality issues.",
    sentimentBullets: [
      "Calm, night-time imagery with founder's personal narrative",
      "Emotional beats: frustration with existing solutions, hope for a natural alternative",
      "Primary pain points: restless sleep, groggy mornings, OTC dependency",
    ],
    insight: "Educational presell lifts conversion 2.3x on problem-aware traffic",
    date: "2026-04-12T14:22:00",
    observationHeadline: "Problem-aware traffic converts better on educational presell than direct-to-product.",
    observationBullets: [
      "This audience already knows their problem; they want substantiation before they buy",
      "Conversion rose from 2.5% to 5.8% across 2,140 sessions over the past three weeks",
      "Velocity generated the educational presell and has routed growing share of traffic to it as the pattern held",
      "Worth applying to your other cold-prospecting creative",
    ],
  },
  {
    id: "ins_2",
    adName: "Sleep Drops – Value Prop 03",
    adUrl: "https://business.facebook.com/adsmanager/manage/ads",
    product: "Acme Sleep Drops",
    campaign: "{Campaign Name}",
    adSet: "{Ad Set Name}",
    destinationLink: "https://brand.com/exp-123/abc",
    sentimentBrief: "Value-proposition ad emphasizing per-unit economics for customers already familiar with the brand.",
    sentimentBullets: [
      "Clean product-focused imagery with benefit overlay",
      "Emotional beats: outcome visualization, savings-anxiety relief",
      "Primary pain points: purchase hesitation on price, dosage uncertainty",
    ],
    insight: "Bundle offers beat single-unit for value-framed retargeting audiences",
    date: "2026-04-12T09:45:00",
    observationHeadline: "The 3-pack bundle converts 2.3x better than single-unit on this ad\u2019s traffic.",
    observationBullets: [
      "Value-framed retargeting audiences commit to larger purchases when per-unit economics are explicit",
      "Over 4,320 sessions in April, conversion held at 5.8% on the bundle versus 2.5% on single-unit",
      "Velocity has increased the bundle\u2019s share of traffic as the pattern sustained",
      "This audience responds to value substantiation over urgency; worth applying to your other retargeting creative",
    ],
  },
  {
    id: "ins_3",
    adName: "Focus Caps – Founder Story 02",
    adUrl: "https://business.facebook.com/adsmanager/manage/ads",
    product: "Acme Focus Caps",
    campaign: "{Campaign Name}",
    adSet: "{Ad Set Name}",
    destinationLink: "https://brand.com/exp-123/efg",
    sentimentBrief: "Founder-story ad framing cognitive performance benefits through personal transformation.",
    sentimentBullets: [
      "Direct-to-camera founder testimonial with branded product placement",
      "Emotional beats: credibility, authenticity, personal transformation",
      "Primary pain points: midday energy crash, focus fragmentation, caffeine dependency",
    ],
    insight: "Founder-story ads pair better with founder-voiced presell pages",
    date: "2026-04-21T16:08:00",
    observationHeadline: "Traffic responds well when the presell continues the founder voice from the ad.",
    observationBullets: [
      "The scent holds from click to purchase when tone and authenticity carry through",
      "Conversion rose from 2.1% to 2.6% across 890 sessions in the past week",
      "Sample is still accumulating, but consistent with other founder-story ads in your account",
      "When the ad\u2019s personality sets the frame, the presell works best finishing the thought in the same voice",
    ],
  },
]

// Derived filter options
const CAMPAIGN_OPTIONS = [...new Set(INSIGHTS.map((i) => i.campaign))].sort()
const ADSET_OPTIONS = [...new Set(INSIGHTS.map((i) => i.adSet))].sort()
const AD_OPTIONS = [...new Set(INSIGHTS.map((i) => i.adName))].sort()
const PRODUCT_OPTIONS = [...new Set(INSIGHTS.map((i) => i.product))].sort()
const DESTINATION_OPTIONS = [...new Set(INSIGHTS.map((i) => i.destinationLink))].sort()

// ─── Filter row (same pattern as orders) ───────────────────────────────────

function FilterRow({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [filterText, setFilterText] = useState("")
  const sorted = [...options].sort((a, b) => a.localeCompare(b))
  const filtered = filterText ? sorted.filter((o) => o.toLowerCase().includes(filterText.toLowerCase())) : sorted
  const toggle = (opt: string) => {
    const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]
    onChange(sorted.every((o) => next.includes(o)) ? [] : next)
  }
  const displayValue = selected.length === 0 ? "All" : selected.length <= 2 ? selected.join(", ") : `${selected.length} selected`

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      <button type="button" onClick={() => { setOpen(!open); setFilterText("") }}
        className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors", open ? "border-amber-400 ring-1 ring-amber-400" : "hover:border-foreground/20")}>
        <span className={cn("truncate", selected.length === 0 && "text-muted-foreground")}>{displayValue}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 border rounded-lg bg-background shadow-sm overflow-hidden">
          <div className="px-2 pt-2 pb-1">
            <input type="text" placeholder={`Search ${label.toLowerCase()}...`} value={filterText} onChange={(e) => setFilterText(e.target.value)}
              className="w-full text-sm px-2.5 py-1.5 rounded-md border bg-background outline-none focus:ring-1 focus:ring-amber-400" autoFocus />
          </div>
          <div className="py-1 max-h-48 overflow-y-auto">
            {filtered.length > 0 && (
              <label className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50">
                <input type="checkbox" checked={filtered.every((o) => selected.includes(o)) && selected.length === filtered.length}
                  onChange={() => {
                    const allSelected = filtered.every((o) => selected.includes(o))
                    if (allSelected) { onChange(selected.filter((s) => !filtered.includes(s))) }
                    else { const next = [...new Set([...selected, ...filtered])]; onChange(sorted.every((o) => next.includes(o)) ? [] : next) }
                  }}
                  className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500 shrink-0" />
                <span className="text-sm font-medium">Select all</span>
              </label>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No matches</p>
            ) : filtered.map((opt) => (
              <label key={opt} className="flex items-start gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
                  className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Group by (categorized like orders) ────────────────────────────────────

type InsightGroupBy = "none" | "product" | "campaign" | "adset" | "ad" | "destination"

interface GroupByCategory { label: string; options: { key: InsightGroupBy; label: string }[] }
const GROUP_BY_CATEGORIES: GroupByCategory[] = [
  { label: "Content", options: [{ key: "product", label: "Product" }] },
  { label: "Attribution", options: [
    { key: "campaign", label: "Campaign" },
    { key: "adset", label: "Ad Set" },
    { key: "ad", label: "Ad" },
    { key: "destination", label: "Destination Link" },
  ]},
]
const ALL_GROUP_OPTIONS = GROUP_BY_CATEGORIES.flatMap((c) => c.options)

function GroupBySelect({ value, onChange }: { value: InsightGroupBy; onChange: (v: InsightGroupBy) => void }) {
  const [open, setOpen] = useState(false)
  const selected = ALL_GROUP_OPTIONS.find((o) => o.key === value)
  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => setOpen(!open)} className={cn("inline-flex items-center gap-2 h-11 px-4 rounded-md border text-sm transition-colors bg-background hover:bg-muted", open && "ring-2 ring-amber-400")}>
        <span className="text-xs text-muted-foreground">Group by:</span>
        <span className="text-sm font-medium">{selected?.label ?? "None"}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-background border rounded-lg shadow-lg py-1 z-[9999]">
            <button type="button" onClick={() => { onChange("none"); setOpen(false) }}
              className={cn("w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors", value === "none" && "bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400")}>
              None
            </button>
            {GROUP_BY_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="border-t border-border/50 mt-1" />
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{cat.label}</p>
                {cat.options.map((opt) => (
                  <button key={opt.key} type="button" onClick={() => { onChange(opt.key); setOpen(false) }}
                    className={cn("w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors", value === opt.key && "bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400")}>
                    {opt.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Insight detail ────────────────────────────────────────────────────────

function InsightDetail({ ins }: { ins: InsightRow }) {
  return (
    <div className="bg-muted px-6 py-5 space-y-5">
      <div className="rounded-xl border bg-background p-5">
        <p className="text-sm font-semibold text-foreground mb-3">Ad Analysis</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <a href={ins.adUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
              {ins.adName}
            </a>
            <p className="text-xs text-muted-foreground mt-0.5">{ins.campaign} · {ins.adSet}</p>
            <Separator className="my-3" />
            <p className="text-sm font-medium text-foreground mb-2">{ins.sentimentBrief}</p>
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              {ins.sentimentBullets.map((b, i) => <li key={i} className="leading-relaxed">{b}</li>)}
            </ul>
          </div>
          <div className="w-40 h-40 rounded-lg border bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">IMG</div>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-5">
        <p className="text-sm font-semibold text-foreground mb-3">Observations</p>
        <p className="text-sm font-semibold text-foreground mb-3">{ins.observationHeadline}</p>
        <ul className="text-sm text-foreground space-y-2 list-disc list-inside">
          {ins.observationBullets.map((b, i) => <li key={i} className="leading-relaxed">{b}</li>)}
        </ul>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [search, setSearch] = useState("")
  const [groupBy, setGroupBy] = useState<InsightGroupBy>("none")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // Filter state
  const [campaignFilters, setCampaignFilters] = useState<string[]>([])
  const [adSetFilters, setAdSetFilters] = useState<string[]>([])
  const [adFilters, setAdFilters] = useState<string[]>([])
  const [productFilters, setProductFilters] = useState<string[]>([])
  const [destinationFilters, setDestinationFilters] = useState<string[]>([])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const clearAllFilters = () => { setCampaignFilters([]); setAdSetFilters([]); setAdFilters([]); setProductFilters([]); setDestinationFilters([]) }

  const activeFilters = [
    ...productFilters.map((f) => ({ key: `product:${f}`, label: `Product: ${f}`, clear: () => setProductFilters((p) => p.filter((x) => x !== f)) })),
    ...campaignFilters.map((f) => ({ key: `campaign:${f}`, label: `Campaign: ${f}`, clear: () => setCampaignFilters((p) => p.filter((x) => x !== f)) })),
    ...adSetFilters.map((f) => ({ key: `adset:${f}`, label: `Ad Set: ${f}`, clear: () => setAdSetFilters((p) => p.filter((x) => x !== f)) })),
    ...adFilters.map((f) => ({ key: `ad:${f}`, label: `Ad: ${f}`, clear: () => setAdFilters((p) => p.filter((x) => x !== f)) })),
    ...destinationFilters.map((f) => ({ key: `dest:${f}`, label: `Destination: ${f}`, clear: () => setDestinationFilters((p) => p.filter((x) => x !== f)) })),
  ]

  const filtered = useMemo(() => {
    let result = INSIGHTS as InsightRow[]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((ins) =>
        ins.adName.toLowerCase().includes(q) || ins.insight.toLowerCase().includes(q) ||
        ins.product.toLowerCase().includes(q) || ins.campaign.toLowerCase().includes(q) || ins.adSet.toLowerCase().includes(q)
      )
    }
    if (campaignFilters.length > 0) result = result.filter((i) => campaignFilters.includes(i.campaign))
    if (adSetFilters.length > 0) result = result.filter((i) => adSetFilters.includes(i.adSet))
    if (adFilters.length > 0) result = result.filter((i) => adFilters.includes(i.adName))
    if (productFilters.length > 0) result = result.filter((i) => productFilters.includes(i.product))
    if (destinationFilters.length > 0) result = result.filter((i) => destinationFilters.includes(i.destinationLink))
    return result
  }, [search, campaignFilters, adSetFilters, adFilters, productFilters, destinationFilters])

  const grouped = useMemo(() => {
    if (groupBy === "none") return [{ key: "all", label: "", items: filtered }]
    const map = new Map<string, InsightRow[]>()
    for (const ins of filtered) {
      let key: string
      switch (groupBy) {
        case "product": key = ins.product; break
        case "campaign": key = ins.campaign; break
        case "adset": key = ins.adSet; break
        case "ad": key = ins.adName; break
        case "destination": key = ins.destinationLink; break
        default: key = "all"
      }
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ins)
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, label: key, items }))
  }, [filtered, groupBy])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <V2Sidebar activeKey="insights-v1" />
      <div className="flex-1 flex flex-col min-w-0">
        <V2Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-6 py-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Insights</h2>
              <p className="text-sm text-muted-foreground">What Velocity has learned from your ads</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search insights, ads, campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-11 text-sm" />
              </div>
              <GroupBySelect value={groupBy} onChange={setGroupBy} />
              <div className="relative shrink-0" ref={filterRef}>
                <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="h-11 gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilters.length}</span>
                  )}
                </Button>
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-[22rem] bg-background border rounded-xl shadow-xl p-4 space-y-4" style={{ zIndex: 9999 }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Filters</p>
                      {activeFilters.length > 0 && (
                        <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
                      )}
                    </div>
                    <FilterRow label="Product" options={PRODUCT_OPTIONS} selected={productFilters} onChange={setProductFilters} />
                    <div className="border-t border-border/50" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Attribution</p>
                    <FilterRow label="Campaign" options={CAMPAIGN_OPTIONS} selected={campaignFilters} onChange={setCampaignFilters} />
                    <FilterRow label="Ad Set" options={ADSET_OPTIONS} selected={adSetFilters} onChange={setAdSetFilters} />
                    <FilterRow label="Ad" options={AD_OPTIONS} selected={adFilters} onChange={setAdFilters} />
                    <FilterRow label="Destination Link" options={DESTINATION_OPTIONS} selected={destinationFilters} onChange={setDestinationFilters} />
                  </div>
                )}
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
                <button onClick={clearAllFilters} className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-1">Clear all</button>
              </div>
            )}

            {/* Table */}
            <Card className="py-0 gap-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ tableLayout: "fixed", width: "100%", minWidth: "max-content" }}>
                  <colgroup>
                    <col style={{ width: 320 }} />
                    <col style={{ width: 140 }} />
                    <col />
                    <col style={{ width: 140 }} />
                    <col style={{ width: 40 }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Ad</th>
                      <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Product</th>
                      <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Insight</th>
                      <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Date</th>
                      <th className="px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No insights match your search.</td></tr>
                    ) : (
                      grouped.map((group) => (
                        <React.Fragment key={group.key}>
                          {group.label && (
                            <tr className="bg-muted/40">
                              <td colSpan={5} className="px-4 py-2">
                                <span className="text-sm font-semibold text-foreground">{group.label}</span>
                                <span className="text-xs text-muted-foreground ml-2">{group.items.length}</span>
                              </td>
                            </tr>
                          )}
                          {group.items.map((ins) => {
                            const isExpanded = expandedId === ins.id
                            return (
                              <React.Fragment key={ins.id}>
                                <tr
                                  className={cn(
                                    "border-b cursor-pointer transition-colors",
                                    isExpanded ? "bg-muted/50 border-l-2 border-l-amber-400" : "hover:bg-muted/30 border-l-2 border-l-transparent"
                                  )}
                                  onClick={() => setExpandedId(isExpanded ? null : ins.id)}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-lg border bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">IMG</div>
                                      <div className="min-w-0">
                                        <a href={ins.adUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                          className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400 truncate block">
                                          {ins.adName}
                                        </a>
                                        <p className="text-xs text-muted-foreground truncate">{ins.campaign} · {ins.adSet}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={cn(
                                      "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full",
                                      ins.product === "Acme Sleep Drops" ? "bg-violet-100 text-violet-700" :
                                      ins.product === "Acme Focus Caps" ? "bg-sky-100 text-sky-700" :
                                      ins.product === "Acme Calm Tea" ? "bg-emerald-100 text-emerald-700" :
                                      "bg-muted text-muted-foreground"
                                    )}>
                                      {ins.product}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="text-sm text-foreground truncate">{ins.insight}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-sm text-foreground">
                                      {new Date(ins.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {new Date(ins.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} PDT
                                    </p>
                                  </td>
                                  <td className="px-2 py-3 text-center">
                                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="border-b">
                                    <td colSpan={5} className="p-0">
                                      <InsightDetail ins={ins} />
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
