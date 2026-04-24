"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import {
  TrendingUp, TrendingDown, BookOpen, ArrowRight,
  Search, ChevronUp, ChevronDown, SlidersHorizontal, X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { products, learningLog } from "@/lib/data"
import type { Product, LearningLogEntry } from "@/lib/data"
import { cn } from "@/lib/utils"

// ─── Shared colors ──────────────────────────────────────────────────────────

const productColors = [
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-cyan-100 text-cyan-700",
]

const categoryColors: Record<string, string> = {
  Products: "bg-amber-100 text-amber-700",
  Upsells: "bg-violet-100 text-violet-700",
  Content: "bg-emerald-100 text-emerald-700",
  Offers: "bg-sky-100 text-sky-700",
}

// ─── Product Scoped Insights ────────────────────────────────────────────────

function getProductLogEntries(productName: string): LearningLogEntry[] {
  return learningLog.filter(
    (e) => e.experiments.some((exp) => productName.includes(exp) || exp.includes(productName))
      || e.insight.toLowerCase().includes(productName.toLowerCase())
  )
}

function ProductScopedLog({ productName }: { productName: string }) {
  const [selectedEntry, setSelectedEntry] = useState<LearningLogEntry | null>(null)
  const entries = getProductLogEntries(productName)

  if (entries.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        <h4 className="text-sm font-semibold">Insights</h4>
      </div>
      {entries.map((entry, i) => (
        <div key={i}>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md py-3.5",
              selectedEntry === entry && "ring-2 ring-amber-400"
            )}
            onClick={(e) => { e.stopPropagation(); setSelectedEntry(selectedEntry === entry ? null : entry) }}
          >
            <CardContent className="px-5">
              <div className="flex items-center gap-4">
                <span className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full shrink-0",
                  categoryColors[entry.category] || "bg-muted text-muted-foreground"
                )}>
                  {entry.category}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{entry.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.date}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600 shrink-0">{entry.impact}</span>
              </div>
            </CardContent>
          </Card>
          {selectedEntry === entry && (
            <Card className="mt-2 border-l-4 border-l-amber-400 py-5" onClick={(e) => e.stopPropagation()}>
              <CardContent className="px-5 space-y-5">
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
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Sort / Search / Filter helpers ─────────────────────────────────────────

type SortKey = "name" | "revenue" | "unitsSold" | "aov" | "cvr" | "trend"
type SortDir = "asc" | "desc"

function matchesSearch(product: Product, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    product.name.toLowerCase().includes(q) ||
    product.bestBundle.toLowerCase().includes(q) ||
    product.tags.some((t) => t.label.toLowerCase().includes(q)) ||
    product.price.toString().includes(q) ||
    product.revenue.toString().includes(q)
  )
}

function sortProducts(a: Product, b: Product, key: SortKey, dir: SortDir): number {
  let cmp = 0
  switch (key) {
    case "name": cmp = a.name.localeCompare(b.name); break
    case "revenue": cmp = a.revenue - b.revenue; break
    case "unitsSold": cmp = a.unitsSold - b.unitsSold; break
    case "aov": cmp = a.aov - b.aov; break
    case "cvr": cmp = a.conversionRate - b.conversionRate; break
    case "trend": cmp = a.trend - b.trend; break
  }
  return dir === "asc" ? cmp : -cmp
}

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  align = "left",
}: {
  label: string
  sortKey: SortKey
  currentSort: SortKey
  currentDir: SortDir
  onSort: (key: SortKey) => void
  align?: "left" | "right"
}) {
  const active = currentSort === sortKey
  return (
    <th
      className={cn(
        "font-medium text-muted-foreground px-4 py-3 text-xs cursor-pointer select-none hover:text-foreground transition-colors",
        align === "right" ? "text-right" : "text-left"
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className={cn("inline-flex items-center gap-1", align === "right" && "justify-end")}>
        {label}
        {active && (
          currentDir === "asc"
            ? <ChevronUp className="h-3 w-3" />
            : <ChevronDown className="h-3 w-3" />
        )}
      </span>
    </th>
  )
}

// ─── Filter row (multi-select dropdown) ─────────────────────────────────────

const TAG_OPTIONS = [...new Set(products.flatMap((p) => p.tags.map((t) => t.label)))]

function FilterRow({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)

  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    )
  }

  const displayValue = selected.length === 0
    ? "All"
    : selected.join(", ")

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
            <label
              key={opt}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Products (main export) ─────────────────────────────────────────────────

export function Products({
  selectedProductId,
  onSelectedChange,
  periodLabel,
}: {
  selectedProductId: string | null
  onSelectedChange: (id: string | null) => void
  periodLabel: string
}) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("revenue")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [tagFilters, setTagFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const processed = useMemo(() => {
    let result = products.filter((p) => matchesSearch(p, search))
    if (tagFilters.length > 0) {
      result = result.filter((p) => p.tags.some((t) => tagFilters.includes(t.label)))
    }
    result = [...result].sort((a, b) => sortProducts(a, b, sortKey, sortDir))
    return result
  }, [search, tagFilters, sortKey, sortDir])

  const selected = selectedProductId ? products.find((p) => p.id === selectedProductId) || null : null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-0.5">Products</h2>
        <p className="text-sm text-muted-foreground">Performance by product</p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, tags, bundles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 text-sm"
          />
        </div>
        <div className="relative shrink-0" ref={filterRef}>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {tagFilters.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {tagFilters.length}
              </span>
            )}
          </Button>
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-[22rem] bg-background border rounded-xl shadow-xl p-4 space-y-4" style={{ zIndex: 9999 }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Filters</p>
                {tagFilters.length > 0 && (
                  <button
                    onClick={() => setTagFilters([])}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterRow
                label="Tags"
                options={TAG_OPTIONS}
                selected={tagFilters}
                onChange={setTagFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Active filter pills */}
      {tagFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {tagFilters.map((f) => (
            <button
              key={f}
              onClick={() => setTagFilters((prev) => prev.filter((t) => t !== f))}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {f}
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
          <button
            onClick={() => setTagFilters([])}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <Card className="py-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-3 text-xs w-16" />
                <SortHeader label="Product" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Revenue" sortKey="revenue" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Units" sortKey="unitsSold" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="AOV" sortKey="aov" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="CVR" sortKey="cvr" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Trend" sortKey="trend" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
              </tr>
            </thead>
            <tbody>
              {processed.map((product) => {
                const i = products.indexOf(product)
                const isOpen = selected?.id === product.id
                return (
                  <React.Fragment key={product.id}>
                    <tr
                      className={cn(
                        "border-b cursor-pointer transition-colors hover:bg-muted/30",
                        isOpen && "bg-amber-50/50 dark:bg-amber-950/20"
                      )}
                      onClick={() => onSelectedChange(isOpen ? null : product.id)}
                    >
                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <svg className="w-5 h-5 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                        </div>
                      </td>
                      {/* Name + tags */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{product.name}</p>
                          {product.tags.map((tag) => (
                            <span
                              key={tag.label}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ backgroundColor: `${tag.color}20`, color: tag.textColor }}
                            >
                              {tag.label}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{product.bestBundle}</p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">${product.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{product.unitsSold.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums">${product.aov.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{product.conversionRate.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-sm font-semibold justify-end",
                          product.trend >= 0 ? "text-emerald-600" : "text-rose-500"
                        )}>
                          {product.trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          {product.trend >= 0 ? "+" : ""}{product.trend.toFixed(2)}%
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">{periodLabel}</p>
                      </td>
                    </tr>
                    {/* Expanded detail */}
                    {isOpen && (
                      <tr className="border-b">
                        <td colSpan={7} className="p-0">
                          <div className="border-l-4 border-l-amber-400 bg-background px-6 py-5">
                            <div className="space-y-5">
                              <div className="grid grid-cols-4 gap-2" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                                {[
                                  { key: "revenue", label: "Revenue", value: `$${product.revenue.toLocaleString()}`, change: product.trend },
                                  { key: "orders", label: "Units Sold", value: product.unitsSold.toString(), change: product.trend + 2.1 },
                                  { key: "aov", label: "AOV", value: `$${product.aov.toFixed(2)}`, change: -1.4 },
                                  { key: "cvr", label: "Conversion Rate", value: `${product.conversionRate.toFixed(2)}%`, change: 3.2 },
                                ].map((m) => (
                                  <KpiCard key={m.key} metricKey={m.key} label={m.label} value={m.value} change={m.change} size="sm" />
                                ))}
                              </div>

                              <div>
                                <h4 className="text-sm font-semibold mb-3">Best Combinations</h4>
                                <div className="space-y-2">
                                  {product.combos.map((combo, ci) => (
                                    <Card
                                      key={ci}
                                      className="py-3 cursor-pointer transition-all hover:shadow-md"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const match = products.find(
                                          (p) => p.id !== product.id && combo.name.includes(p.name)
                                        )
                                        if (match) onSelectedChange(match.id)
                                      }}
                                    >
                                      <CardContent className="px-4">
                                        <div className="flex items-center gap-4">
                                          <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                            productColors[ci % productColors.length]
                                          )}>
                                            {ci + 1}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold">{combo.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">${combo.price} bundle</p>
                                          </div>
                                          <div className="text-right shrink-0">
                                            <p className="text-sm font-semibold">${combo.revenue.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{combo.orders} orders</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>

                              <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                                <p className="text-sm leading-relaxed text-foreground/80">{product.insight}</p>
                              </div>

                              <ProductScopedLog productName={product.name} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {processed.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                    No products match your search.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              {(() => {
                const totalRevenue = processed.reduce((s, p) => s + p.revenue, 0)
                const totalUnits = processed.reduce((s, p) => s + p.unitsSold, 0)
                const avgAov = processed.length > 0 ? totalRevenue / totalUnits : 0
                const avgCvr = processed.length > 0 ? processed.reduce((s, p) => s + p.conversionRate, 0) / processed.length : 0
                return (
                  <tr className="bg-muted/50 font-semibold text-sm">
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3">Summary</td>
                    <td className="px-4 py-3 text-right tabular-nums">${totalRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalUnits.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${avgAov.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{avgCvr.toFixed(2)}%</td>
                    <td className="px-4 py-3" />
                  </tr>
                )
              })()}
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
