"use client"

import { useState } from "react"
import { subDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Orders } from "@/components/dashboard/orders"
import { AskVelocitySearchBar } from "@/components/dashboard/agent-chat"

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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(TODAY, 30),
    to: TODAY,
  })

  return (
    <div className="p-6 space-y-4">
      {/* Header bar */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-6 -mx-6 -mt-6">
        <div className="flex items-center gap-2">
          <DateRangePicker range={dateRange} onChange={setDateRange} />
        </div>
        <div className="flex-1 mx-4 flex items-center">
          <AskVelocitySearchBar />
        </div>
      </header>

      <Orders dateRange={dateRange} />
    </div>
  )
}
