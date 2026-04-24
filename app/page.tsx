"use client"

import { useState, useRef, useCallback } from "react"
import { addDays, subDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FlaskConical,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarIcon,
  Lightbulb,
  Tag,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { merchant } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Summary } from "@/components/dashboard/summary"
import { Products } from "@/components/dashboard/products"
import { Orders } from "@/components/dashboard/orders"
import { AskVelocitySearchBar } from "@/components/dashboard/agent-chat"
import { LearningLogFullPage } from "@/components/dashboard/learning-log"
import { Ads } from "@/components/dashboard/ads"

type View = "summary" | "experiments" | "ads" | "products" | "orders" | "learning-log"

interface NavState {
  view: View
  productId: string | null
  experimentName: string | null
}

const navItems: { key: View; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "summary", label: "Summary", icon: LayoutDashboard },
  { key: "ads", label: "Ads", icon: Megaphone },
  { key: "products", label: "Products", icon: Package },
]

// ─── Date Range Picker ──────────────────────────────────────────────────────

const TODAY = new Date()

const presets = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: 365 },
]

function DateRangePicker({
  range,
  onChange,
}: {
  range: DateRange
  onChange: (r: DateRange) => void
}) {
  const [open, setOpen] = useState(false)

  const label =
    range.from && range.to
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : "Select dates"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-9 px-3 text-sm font-normal"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
        <div className="flex">
          {/* Presets */}
          <div className="border-r p-3 space-y-1 w-40">
            {presets.map((p) => (
              <button
                key={p.days}
                onClick={() => {
                  onChange({ from: subDays(TODAY, p.days), to: TODAY })
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(r) => {
                if (r) onChange(r)
                if (r?.from && r?.to) setOpen(false)
              }}
              numberOfMonths={2}
              defaultMonth={subDays(TODAY, 30)}
              disabled={{ after: TODAY }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Navigation history hook ────────────────────────────────────────────────

function useNavHistory(initial: NavState) {
  const historyRef = useRef<NavState[]>([initial])
  const cursorRef = useRef(0)
  const [, forceRender] = useState(0)

  const current = historyRef.current[cursorRef.current]
  const canGoBack = cursorRef.current > 0
  const canGoForward = cursorRef.current < historyRef.current.length - 1

  const navigate = useCallback((state: NavState) => {
    const c = cursorRef.current
    historyRef.current = [...historyRef.current.slice(0, c + 1), state]
    cursorRef.current = c + 1
    forceRender((n) => n + 1)
  }, [])

  const goBack = useCallback(() => {
    if (cursorRef.current > 0) {
      cursorRef.current -= 1
      forceRender((n) => n + 1)
    }
  }, [])

  const goForward = useCallback(() => {
    if (cursorRef.current < historyRef.current.length - 1) {
      cursorRef.current += 1
      forceRender((n) => n + 1)
    }
  }, [])

  return { current, navigate, goBack, goForward, canGoBack, canGoForward }
}

// ─── Period label helper ────────────────────────────────────────────────────

function getPeriodLabel(range: DateRange): string {
  if (!range.from || !range.to) return "Selected period"
  const days = Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 1) return "Yesterday"
  if (days === 7) return "Last 7 days"
  if (days === 14) return "Last 14 days"
  if (days === 30) return "Last 30 days"
  if (days === 90) return "Last 90 days"
  if (days >= 365) return "All time"
  return `Last ${days} days`
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function Home() {
  const {
    current,
    navigate,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  } = useNavHistory({ view: "orders", productId: null, experimentName: null })

  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(TODAY, 30),
    to: TODAY,
  })

  const view = current.view
  const selectedProductId = current.productId
  const selectedExperimentName = current.experimentName

  const handleProductClick = (productId: string) => {
    navigate({ view: "products", productId, experimentName: null })
  }

  const handleNavClick = (key: View) => {
    navigate({ view: key, productId: key === "products" ? selectedProductId : null, experimentName: null })
  }

  const handleProductSelect = (id: string | null) => {
    navigate({ view: "products", productId: id, experimentName: null })
  }

  const handleNavigateToExperiment = (name: string) => {
    navigate({ view: "experiments", productId: null, experimentName: name })
  }

  const periodLabel = getPeriodLabel(dateRange)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[200px] border-r bg-card flex flex-col shrink-0">
        <div className="px-5 py-5 border-b">
          <h1 className="text-lg font-bold tracking-tight">Velocity</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{merchant.name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {/* v2 pages */}
          <button
            onClick={() => handleNavClick("orders" as View)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              view === "orders"
                ? "bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            Orders
          </button>
          <a
            href="/reporting-v2/insights"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            Insights
          </a>
          <a
            href="/reporting-v2/offers"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Tag className="h-4 w-4 shrink-0" />
            Offers
          </a>
          {/* Reference pages below divider */}
          <div className="mt-3 pt-3 border-t border-border/50 space-y-0.5">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/50">Ignore — Reference only</p>
            <a
              href="/reporting-v2/insights-v1"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Insights (Old)
            </a>
            <a
              href="/reporting-v2"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors"
            >
              <Lightbulb className="h-4 w-4 shrink-0" />
              Experiments (Old)
            </a>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  view === item.key
                    ? "bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400"
                    : "text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label} (Old)
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            {/* Back / Forward */}
            <div className="flex items-center gap-0.5 mr-2">
              <button
                onClick={goBack}
                disabled={!canGoBack}
                className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goForward}
                disabled={!canGoForward}
                className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <DateRangePicker range={dateRange} onChange={setDateRange} />
          </div>
          <div className="flex-1 mx-4 flex items-center">
            <AskVelocitySearchBar />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-6 py-6">
            {view === "summary" && (
              <Summary
                periodLabel={periodLabel}
                onProductClick={handleProductClick}
                onViewAllLog={() => navigate({ view: "learning-log", productId: null, experimentName: null })}
              />
            )}
            {view === "learning-log" && <LearningLogFullPage />}
{view === "ads" && (
              <Ads onNavigateToExperiment={handleNavigateToExperiment} />
            )}
            {view === "products" && (
              <Products
                selectedProductId={selectedProductId}
                onSelectedChange={handleProductSelect}
                periodLabel={periodLabel}
              />
            )}
            {view === "orders" && <Orders dateRange={dateRange} />}
          </div>
        </main>
      </div>
    </div>
  )
}
