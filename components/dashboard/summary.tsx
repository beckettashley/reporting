"use client"

import { useState } from "react"
import { Sparkles, BookOpen, X, ArrowRight, Zap, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RateKpiCard } from "@/components/dashboard/kpi-card"
import {
  rateKpis, insights, learningLog, experiments, portfolioSummary,
} from "@/lib/data"
import type { LearningLogEntry } from "@/lib/data"
import { cn } from "@/lib/utils"

// ─── Rate KPI Row ───────────────────────────────────────────────────────────

function formatRate(value: number, format: string) {
  if (format === "currency") return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `${value.toFixed(2)}%`
}

function RateKPIRow() {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
      {rateKpis.map((kpi) => (
        <RateKpiCard
          key={kpi.key}
          metricKey={kpi.key}
          label={kpi.label}
          value={formatRate(kpi.value, kpi.format)}
          baseline={formatRate(kpi.baseline, kpi.format)}
        />
      ))}
      {/* Revenue card with visitor context */}
      <Card className="py-4">
        <CardContent className="px-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">Revenue</p>
              <p className="text-2xl font-bold mt-1 truncate">
                ${portfolioSummary.revenue.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            from <span className="font-medium text-foreground">{portfolioSummary.visitors.toLocaleString()}</span> visitors
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── System Status ──────────────────────────────────────────────────────────

function SystemStatus() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/30">
      <Zap className="h-3.5 w-3.5 shrink-0" />
      <span>
        {portfolioSummary.activeFunnels} active funnels across {portfolioSummary.adGroups} ad groups ·{" "}
        {portfolioSummary.retiredThisPeriod} retired · {portfolioSummary.newThisPeriod} new this period
      </span>
    </div>
  )
}


// ─── Insights ───────────────────────────────────────────────────────────────

function InsightsCard() {
  return (
    <Card className="border-l-4 border-l-amber-400 bg-amber-50/40 dark:bg-amber-950/20 py-5">
      <CardContent className="px-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          <h3 className="text-sm font-semibold">What&apos;s Working</h3>
        </div>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed text-foreground/80"
              dangerouslySetInnerHTML={{ __html: insight }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Learning Log (persistent right panel) ──────────────────────────────────

const categoryColors: Record<string, string> = {
  Products: "bg-amber-100 text-amber-700",
  Upsells: "bg-violet-100 text-violet-700",
  Content: "bg-emerald-100 text-emerald-700",
  Offers: "bg-sky-100 text-sky-700",
}

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

function LearningLogPanel({ onViewAll }: { onViewAll?: () => void }) {
  const [selected, setSelected] = useState<LearningLogEntry | null>(null)

  const toggle = (entry: LearningLogEntry) => {
    setSelected(selected === entry ? null : entry)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <h3 className="text-sm font-semibold">Insights</h3>
        </div>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </div>

      {learningLog.map((entry, i) => (
        <div key={i}>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md py-3.5",
              selected === entry && "ring-2 ring-amber-400"
            )}
            onClick={() => toggle(entry)}
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
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-emerald-600">{entry.impact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {selected === entry && (
            <div className="mt-2">
              <LearningLogDetail entry={entry} onClose={() => setSelected(null)} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Summary (main export) ──────────────────────────────────────────────────

export function Summary({
  periodLabel,
  onProductClick,
  onViewAllLog,
}: {
  periodLabel: string
  onProductClick: (productId: string) => void
  onViewAllLog: () => void
}) {
  // Suppress unused warnings — these props remain for API compatibility
  void periodLabel
  void onProductClick

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-0.5">Summary</h2>
        <p className="text-sm text-muted-foreground">Performance overview</p>
      </div>

      {/* Rate KPIs + Revenue (with visitor context) */}
      <RateKPIRow />

      {/* System status */}
      <SystemStatus />

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left column (~65-70%) — insights */}
        <div className="flex-[7] min-w-0 space-y-6">
          <InsightsCard />
        </div>

        {/* Right column (~30-35%) — Learning Log */}
        <div className="flex-[3] min-w-0 space-y-6">
          <LearningLogPanel onViewAll={onViewAllLog} />
        </div>
      </div>
    </div>
  )
}
