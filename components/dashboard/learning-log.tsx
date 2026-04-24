"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { BookOpen, X, ArrowRight, Search, ChevronDown, SlidersHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { learningLog } from "@/lib/data"
import type { LearningLogEntry } from "@/lib/data"
import { cn } from "@/lib/utils"

const categoryColors: Record<string, string> = {
  Products: "bg-amber-100 text-amber-700",
  Upsells: "bg-violet-100 text-violet-700",
  Content: "bg-emerald-100 text-emerald-700",
  Offers: "bg-sky-100 text-sky-700",
}

const categories = ["All", "Products", "Upsells", "Content", "Offers"] as const

function LearningLogDetail({ entry, onClose }: { entry: LearningLogEntry; onClose: () => void }) {
  return (
    <Card className="border-l-4 border-l-amber-400 py-5">
      <CardContent className="px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Insight Detail</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{entry.date}</span>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              categoryColors[entry.category] || "bg-muted text-muted-foreground"
            )}>
              {entry.category}
            </span>
          </div>

          <p className="text-sm leading-relaxed">{entry.insight}</p>

          <div className="p-4 rounded-lg bg-muted/40">
            <p className="text-sm font-semibold mb-3">{entry.metric.label}</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Before</p>
                <p className="text-lg font-bold">{entry.metric.before}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">After</p>
                <p className="text-lg font-bold text-emerald-600">{entry.metric.after}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">What changed</p>
            <p className="text-sm leading-relaxed text-foreground/80">{entry.action}</p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Affected experiments</p>
            <div className="flex flex-wrap gap-1.5">
              {entry.experiments.map((exp) => (
                <span key={exp} className="text-sm px-2.5 py-1 rounded-md bg-muted font-medium">
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Group By for insights ─────────────────────────────────────────────────

type InsightGroupBy = "none" | "category" | "experiment"
const INSIGHT_GROUP_OPTIONS: { key: InsightGroupBy; label: string }[] = [
  { key: "none", label: "None" },
  { key: "category", label: "Category" },
  { key: "experiment", label: "Experiment" },
]

function InsightGroupBySelect({ value, onChange }: { value: InsightGroupBy; onChange: (v: InsightGroupBy) => void }) {
  const [open, setOpen] = useState(false)
  const selected = INSIGHT_GROUP_OPTIONS.find((o) => o.key === value)
  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => setOpen(!open)} className={cn("inline-flex items-center gap-2 h-11 px-4 rounded-md border text-sm transition-colors bg-background hover:bg-muted", open && "ring-2 ring-amber-400")}>
        <span className="text-xs text-muted-foreground">Group by:</span>
        <span className="text-sm font-medium">{selected?.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg py-1 z-[9999]">
            {INSIGHT_GROUP_OPTIONS.map((opt) => (
              <button key={opt.key} type="button" onClick={() => { onChange(opt.key); setOpen(false) }}
                className={cn("w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors", value === opt.key && "bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400")}>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const CATEGORY_OPTIONS = [...categories].filter((c) => c !== "All")
const EXPERIMENT_OPTIONS = [...new Set(learningLog.flatMap((e) => e.experiments))].sort()

export function LearningLogFullPage() {
  const [selected, setSelected] = useState<LearningLogEntry | null>(null)
  const [search, setSearch] = useState("")
  const [groupBy, setGroupBy] = useState<InsightGroupBy>("none")
  const [categoryFilters, setCategoryFilters] = useState<string[]>([])
  const [experimentFilters, setExperimentFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = useMemo(() => {
    let result = learningLog as LearningLogEntry[]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.insight.toLowerCase().includes(q) || e.experiments.some((x) => x.toLowerCase().includes(q)))
    }
    if (categoryFilters.length > 0) result = result.filter((e) => categoryFilters.includes(e.category))
    if (experimentFilters.length > 0) result = result.filter((e) => e.experiments.some((x) => experimentFilters.includes(x)))
    return result
  }, [search, categoryFilters, experimentFilters])

  const grouped = useMemo(() => {
    if (groupBy === "none") return [{ key: "all", label: "", items: filtered }]
    const map = new Map<string, LearningLogEntry[]>()
    for (const e of filtered) {
      if (groupBy === "category") {
        if (!map.has(e.category)) map.set(e.category, [])
        map.get(e.category)!.push(e)
      } else {
        for (const exp of e.experiments) {
          if (!map.has(exp)) map.set(exp, [])
          map.get(exp)!.push(e)
        }
      }
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, label: key, items }))
  }, [filtered, groupBy])

  const clearAllFilters = () => { setCategoryFilters([]); setExperimentFilters([]) }
  const activeFilters = [
    ...categoryFilters.map((f) => ({ key: `cat:${f}`, label: `Category: ${f}`, clear: () => setCategoryFilters((p) => p.filter((x) => x !== f)) })),
    ...experimentFilters.map((f) => ({ key: `exp:${f}`, label: `Experiment: ${f}`, clear: () => setExperimentFilters((p) => p.filter((x) => x !== f)) })),
  ]

  const toggle = (entry: LearningLogEntry) => {
    setSelected(selected === entry ? null : entry)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Insights</h2>
      </div>

      {/* Search + Group by + Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search insights, categories, experiments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-11 text-sm" />
        </div>
        <InsightGroupBySelect value={groupBy} onChange={setGroupBy} />
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
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Category</p>
                <div className="space-y-1">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <label key={cat} className="flex items-center gap-2.5 px-1 py-1 cursor-pointer">
                      <input type="checkbox" checked={categoryFilters.includes(cat)} onChange={() => setCategoryFilters((p) => p.includes(cat) ? p.filter((x) => x !== cat) : [...p, cat])} className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500" />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Experiment</p>
                <div className="space-y-1">
                  {EXPERIMENT_OPTIONS.map((exp) => (
                    <label key={exp} className="flex items-center gap-2.5 px-1 py-1 cursor-pointer">
                      <input type="checkbox" checked={experimentFilters.includes(exp)} onChange={() => setExperimentFilters((p) => p.includes(exp) ? p.filter((x) => x !== exp) : [...p, exp])} className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500" />
                      <span className="text-sm">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>
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
          <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "120px" }} />
              <col style={{ width: "110px" }} />
              <col />
              <col style={{ width: "160px" }} />
              <col style={{ width: "110px" }} />
            </colgroup>
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left font-medium text-foreground px-5 py-3 text-xs">Date</th>
                <th className="text-left font-medium text-foreground px-5 py-3 text-xs">Category</th>
                <th className="text-left font-medium text-foreground px-5 py-3 text-xs">Insight</th>
                <th className="text-left font-medium text-foreground px-5 py-3 text-xs">Impact</th>
                <th className="text-center font-medium text-foreground px-5 py-3 text-xs">Funnel Variant</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No insights match your search.</td></tr>
              ) : (
                grouped.map((group) => (
                  <React.Fragment key={group.key}>
                    {group.label && (
                      <tr className="bg-muted/40">
                        <td colSpan={5} className="px-5 py-2">
                          <span className="text-sm font-semibold text-foreground">{group.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">{group.items.length}</span>
                        </td>
                      </tr>
                    )}
                    {group.items.map((entry, i) => {
                      const isExpanded = selected === entry
                      return (
                        <React.Fragment key={`${group.key}-${i}`}>
                          <tr
                            className={cn(
                              "border-b cursor-pointer transition-colors",
                              isExpanded ? "bg-muted/50" : "hover:bg-muted/30"
                            )}
                            onClick={() => toggle(entry)}
                          >
                            <td className="px-5 py-3">
                              <span className="text-sm text-foreground">{entry.date}</span>
                              <p className="text-xs text-muted-foreground mt-0.5">12:00 AM PDT</p>
                            </td>
                            <td className="px-5 py-3">
                              <span className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                categoryColors[entry.category] || "bg-muted text-muted-foreground"
                              )}>
                                {entry.category}
                              </span>
                            </td>
                            <td className="px-5 py-3 font-medium">{entry.title}</td>
                            <td className="px-5 py-3 font-semibold text-emerald-600 whitespace-nowrap">{entry.impact}</td>
                            <td className="px-5 py-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => { e.stopPropagation(); window.open("https://variants.velocity.app", "_blank", "noopener,noreferrer") }}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="border-b">
                              <td colSpan={5} className="p-0">
                                <div className="bg-muted px-6 py-5 space-y-4">
                                  <div className="rounded-xl border bg-background p-5 space-y-5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                                      <span className={cn(
                                        "text-xs font-medium px-2 py-0.5 rounded-full",
                                        categoryColors[entry.category] || "bg-muted text-muted-foreground"
                                      )}>
                                        {entry.category}
                                      </span>
                                    </div>

                                    <p className="text-sm leading-relaxed text-foreground">{entry.insight}</p>

                                    <div className="p-4 rounded-lg bg-muted/40">
                                      <p className="text-sm font-semibold mb-3">{entry.metric.label}</p>
                                      <div className="flex items-center gap-4">
                                        <div className="text-center">
                                          <p className="text-xs text-muted-foreground mb-1">Before</p>
                                          <p className="text-lg font-bold">{entry.metric.before}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div className="text-center">
                                          <p className="text-xs text-muted-foreground mb-1">After</p>
                                          <p className="text-lg font-bold text-emerald-600">{entry.metric.after}</p>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-sm font-semibold mb-2">What changed</p>
                                      <p className="text-sm leading-relaxed text-foreground">{entry.action}</p>
                                    </div>

                                    <div>
                                      <p className="text-sm font-semibold mb-2">Affected experiments</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {entry.experiments.map((exp) => (
                                          <span key={exp} className="text-sm px-2.5 py-1 rounded-md bg-muted font-medium">
                                            {exp}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
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
  )
}
