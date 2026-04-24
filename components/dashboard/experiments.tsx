"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Copy, Check, X, Sparkles, Zap, BookOpen, ArrowRight, Minus } from "lucide-react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Card, CardContent } from "@/components/ui/card"
import { experiments, learningLog } from "@/lib/data"
import type { Experiment, ExperimentAd, FunnelStep, LearningLogEntry } from "@/lib/data"
import { cn } from "@/lib/utils"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="p-1 rounded hover:bg-muted transition-colors"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  )
}

function FunnelStepRow({
  step,
  data,
  color,
  skipped,
  prevPct,
}: {
  step: string
  data: { count: number; pct: number } | null
  color: string
  skipped?: boolean
  prevPct?: number
}) {
  if (skipped) {
    return (
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm text-muted-foreground/40 italic">{step}</span>
          <span className="text-xs text-muted-foreground/40 italic">skipped</span>
        </div>
        <div className="h-4 rounded border border-dashed border-muted-foreground/20" />
      </div>
    )
  }
  if (!data) return null
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm text-muted-foreground">{step}</span>
        <span className="text-sm font-medium tabular-nums">
          {data.count.toLocaleString()} <span className="text-muted-foreground">({data.pct.toFixed(2)}%)</span>
        </span>
      </div>
      <div className="relative h-4 bg-muted/30 rounded overflow-hidden">
        {prevPct !== undefined && prevPct > data.pct && (
          <div
            className={cn("absolute inset-y-0 left-0 rounded opacity-15", color)}
            style={{ width: `${prevPct}%` }}
          />
        )}
        <div className={cn("relative h-full rounded", color)} style={{ width: `${data.pct}%`, minWidth: "3px" }} />
      </div>
    </div>
  )
}

function MiniFunnel({ steps }: { steps: FunnelStep[] }) {
  const wpSessions = steps.find((s) => s.withPresell)?.withPresell?.count || 0
  const wopSessions = steps.find((s) => s.withoutPresell)?.withoutPresell?.count || 0

  return (
    <div className="flex gap-6">
      {/* With presell */}
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <h5 className="text-sm font-semibold">With presell</h5>
          <p className="text-xs text-muted-foreground mt-0.5">{wpSessions.toLocaleString()} sessions</p>
        </div>
        <div className="space-y-1.5">
          {steps.map((s, idx) => {
            const prevStep = steps.slice(0, idx).reverse().find((p) => p.withPresell)
            return (
              <FunnelStepRow key={s.step} step={s.step} data={s.withPresell} color="bg-amber-400" prevPct={prevStep?.withPresell?.pct} />
            )
          })}
        </div>
      </div>

      <div className="w-px bg-border shrink-0" />

      {/* Without presell */}
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <h5 className="text-sm font-semibold">Without presell</h5>
          <p className="text-xs text-muted-foreground mt-0.5">{wopSessions.toLocaleString()} sessions</p>
        </div>
        <div className="space-y-1.5">
          {steps.map((s, idx) => {
            const prevStep = steps.slice(0, idx).reverse().find((p) => p.withoutPresell)
            return (
              <FunnelStepRow
                key={s.step}
                step={s.step}
                data={s.withoutPresell}
                color="bg-sky-400"
                skipped={s.withoutPresell === null}
                prevPct={prevStep?.withoutPresell?.pct}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

function ExperimentDetailInline({ exp, onClose }: { exp: Experiment; onClose: () => void }) {
  const [expandedAd, setExpandedAd] = useState<number | null>(null)

  return (
    <div className="border-l-4 border-l-amber-400 bg-background px-6 py-5 space-y-6">

      {/* 1. Experiment header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-semibold">{exp.heroProduct} Experiment</h3>
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            exp.status === "Running" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
          )}>
            {exp.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Started {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          <span className="flex items-center gap-1">
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{exp.link}</code>
            <CopyButton text={exp.link} />
          </span>
        </div>
      </div>

      {/* 2. System status bar */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/30">
        <Zap className="h-3.5 w-3.5 shrink-0" />
        <span>
          {exp.activeVariants} variants active · Winner outperforming baseline by {exp.winnerLift}% · Last rotation: {exp.lastRotation} · {exp.journeyTypes} journey types
        </span>
      </div>

      {/* 3. Experiment KPIs — rates lead, revenue contextualized */}
      <div className="grid grid-cols-4 gap-2" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {[
          { key: "cvr", label: "CVR", value: `${exp.cvr.toFixed(2)}%`, change: 6.4 },
          { key: "aov", label: "AOV", value: `$${exp.aov.toFixed(2)}`, change: -1.8 },
          { key: "rpv", label: "RPV", value: `$${(exp.revenue / exp.sessions).toFixed(2)}`, change: exp.trend },
        ].map((m) => (
          <KpiCard key={m.key} metricKey={m.key} label={m.label} value={m.value} change={m.change} size="sm" />
        ))}
        <Card className="py-3.5">
          <CardContent className="px-4">
            <p className="text-sm text-muted-foreground truncate">Revenue</p>
            <p className="text-lg font-bold mt-0.5 truncate">${exp.revenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1.5">from {exp.sessions.toLocaleString()} visitors</p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Ads driving traffic */}
      <Card className="py-0 overflow-hidden">
        <div className="px-5 py-3 border-b">
          <h4 className="text-sm font-semibold">Ads Driving Traffic</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-xs">Ad</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">Spend</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">Clicks</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">CPC</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">CVR</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">RPV</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">Orders</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">Revenue</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-2.5 text-xs">ROAS</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-2.5 text-xs">Trend</th>
              </tr>
            </thead>
            <tbody>
              {exp.ads.map((ad, i) => (
                <React.Fragment key={i}>
                  <tr
                    className="border-b hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setExpandedAd(expandedAd === i ? null : i)}
                  >
                    <td className="px-4 py-3">
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
                            className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {ad.creative}
                          </a>
                          <div className="flex items-center gap-1.5 mt-1">
                            {ad.endedAt ? (
                              <>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground">Ended</span>
                                <span className="text-xs text-muted-foreground">{ad.launched} – {ad.endedAt}</span>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                                <span className="text-xs text-muted-foreground">Since {ad.launched}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">${ad.spend.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{ad.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${ad.cpc.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {ad.cvr.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">${ad.epc.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{ad.orders}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${ad.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {ad.roas.toFixed(2)}x
                    </td>
                    <td className="px-4 py-3 text-center">
                      <TrendIcon trend={ad.trend} />
                    </td>
                  </tr>
                  {expandedAd === i && (
                    <tr className="border-b">
                      <td colSpan={10} className="p-0">
                        <div className="px-5 py-4 bg-muted/10 border-l-4 border-l-amber-300 space-y-4">
                          {/* Ad metadata */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground mb-2">Ad Setup</p>
                            <div className="grid grid-cols-5 gap-x-6 gap-y-2 text-xs">
                              <div>
                                <p className="text-muted-foreground mb-0.5">Budget</p>
                                <p className="text-foreground">{ad.metadata.budget}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-0.5">Geo</p>
                                <p className="text-foreground">{ad.metadata.geo.join(", ")}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-0.5">Audience</p>
                                <p className="text-foreground">{ad.metadata.audience}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-0.5">Placements</p>
                                <p className="text-foreground">{ad.metadata.placements.join(", ")}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-0.5">Objective</p>
                                <p className="text-foreground">{ad.metadata.objective}</p>
                              </div>
                            </div>
                          </div>
                          {/* Learnings */}
                          <div className="pt-3 border-t border-muted-foreground/10">
                            <div className="flex items-center gap-2 mb-3">
                              <BookOpen className="h-3.5 w-3.5 text-foreground" />
                              <h5 className="text-xs font-semibold text-foreground">Learnings</h5>
                            </div>
                            <div className="space-y-3">
                              {ad.learnings.map((learning, li) => (
                                <div key={li} className="flex gap-3">
                                  <span className="text-xs text-muted-foreground shrink-0 w-14 pt-0.5">{learning.date}</span>
                                  <p className="text-sm leading-relaxed text-foreground flex-1">{learning.insight}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              {(() => {
                const totalSpend = exp.ads.reduce((s, a) => s + a.spend, 0)
                const totalClicks = exp.ads.reduce((s, a) => s + a.clicks, 0)
                const totalOrders = exp.ads.reduce((s, a) => s + a.orders, 0)
                const totalRevenue = exp.ads.reduce((s, a) => s + a.revenue, 0)
                const wAvgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
                const wAvgCvr = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0
                const wAvgEpc = totalClicks > 0 ? totalRevenue / totalClicks : 0
                const totalRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0
                return (
                  <tr className="bg-muted/50 font-semibold text-sm">
                    <td className="px-4 py-3">Summary</td>
                    <td className="px-4 py-3 text-right tabular-nums">${totalSpend.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalClicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${wAvgCpc.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{wAvgCvr.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right tabular-nums">${wAvgEpc.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalOrders}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${totalRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalRoas.toFixed(2)}x</td>
                    <td className="px-4 py-3" />
                  </tr>
                )
              })()}
            </tfoot>
          </table>
        </div>
      </Card>

      {/* 5. What's Working */}
      <Card className="border-l-4 border-l-amber-400 bg-amber-50/40 dark:bg-amber-950/20 py-5">
        <CardContent className="px-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <h4 className="text-sm font-semibold">What&apos;s Working</h4>
          </div>
          <div className="space-y-3">
            {exp.insights.map((insight, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/80" dangerouslySetInnerHTML={{ __html: insight }} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Insights for Experiments ───────────────────────────────────────────

const categoryColors: Record<string, string> = {
  Products: "bg-amber-100 text-amber-700",
  Upsells: "bg-violet-100 text-violet-700",
  Content: "bg-emerald-100 text-emerald-700",
  Offers: "bg-sky-100 text-sky-700",
}

function ExperimentScopedLog({ heroProduct }: { heroProduct: string }) {
  const [selectedEntry, setSelectedEntry] = useState<LearningLogEntry | null>(null)
  const entries = learningLog.filter((e) => e.experiments.includes(heroProduct))

  if (entries.length === 0) return null

  return (
    <>
      <div className="mt-5 space-y-2">
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
              onClick={() => setSelectedEntry(selectedEntry === entry ? null : entry)}
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
              <Card className="mt-2 border-l-4 border-l-amber-400 py-5">
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
    </>
  )
}

// ─── Experiments (main export) ──────────────────────────────────────────────

export function Experiments({ initialExperiment }: { initialExperiment?: string | null }) {
  const [selected, setSelected] = useState<Experiment | null>(null)

  // Auto-open an experiment when navigated from another page (e.g. Ads sidebar)
  useEffect(() => {
    if (initialExperiment) {
      const match = experiments.find((e) => e.heroProduct === initialExperiment)
      if (match) setSelected(match)
    }
  }, [initialExperiment])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-0.5">Experiments</h2>
        <p className="text-sm text-muted-foreground">Performance by experiment link</p>
      </div>

      <Card className="py-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-3 text-xs">Experiment</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 text-xs">Status</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 text-xs">Duration</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 text-xs">CVR</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 text-xs">AOV</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 text-xs">RPV</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 text-xs">Sessions</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 text-xs">Orders</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 text-xs">Upsells</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 text-xs">Revenue</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3 text-xs">Trend</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 text-xs">Link</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp) => (
                <React.Fragment key={exp.id}>
                  <tr
                    className={cn(
                      "border-b cursor-pointer transition-colors hover:bg-muted/30",
                      selected?.id === exp.id && "bg-amber-50/50 dark:bg-amber-950/20"
                    )}
                    onClick={() => setSelected(selected?.id === exp.id ? null : exp)}
                  >
                    <td className="px-4 py-3 font-medium">{exp.heroProduct}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" – "}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "Present"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{exp.cvr.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">${exp.aov.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">${(exp.revenue / exp.sessions).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{exp.sessions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{exp.orders}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{exp.upsells}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${exp.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center gap-0.5 justify-end text-emerald-600 text-xs font-medium">
                        <TrendingUp className="h-3 w-3" />
                        +{exp.trend.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{exp.link}</code>
                        <CopyButton text={exp.link} />
                      </span>
                    </td>
                  </tr>
                  {selected?.id === exp.id && (
                    <tr className="border-b">
                      <td colSpan={11} className="p-0">
                        <ExperimentDetailInline exp={exp} onClose={() => setSelected(null)} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              {(() => {
                const totalSessions = experiments.reduce((s, e) => s + e.sessions, 0)
                const totalOrders = experiments.reduce((s, e) => s + e.orders, 0)
                const totalUpsells = experiments.reduce((s, e) => s + e.upsells, 0)
                const totalRevenue = experiments.reduce((s, e) => s + e.revenue, 0)
                const avgCvr = totalSessions > 0 ? (totalOrders / totalSessions * 100) : 0
                const avgAov = totalOrders > 0 ? (totalRevenue / totalOrders) : 0
                const avgRpv = totalSessions > 0 ? (totalRevenue / totalSessions) : 0
                return (
                  <tr className="bg-muted/50 font-semibold text-sm">
                    <td className="px-4 py-3">Summary</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right tabular-nums">{avgCvr.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right tabular-nums">${avgAov.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${avgRpv.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalSessions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalOrders.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{totalUpsells.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${totalRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3" />
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
