"use client"

import {
  Eye, ShoppingCart, Gift, DollarSign, BarChart3, Percent, UserPlus,
  TrendingUp, TrendingDown, type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const kpiIconMap: Record<string, { icon: LucideIcon; color: string }> = {
  sessions: { icon: Eye, color: "#FF3971" },
  orders: { icon: ShoppingCart, color: "#FF8800" },
  upsells: { icon: Gift, color: "#FFC207" },
  revenue: { icon: DollarSign, color: "#29EFCA" },
  aov: { icon: BarChart3, color: "#1BDBED" },
  cvr: { icon: Percent, color: "#824EF7" },
  rpv: { icon: BarChart3, color: "#29EFCA" },
  epc: { icon: DollarSign, color: "#29EFCA" },
  visitors: { icon: Eye, color: "#FF3971" },
  cpa: { icon: UserPlus, color: "#E44D7A" },
  trueCpa: { icon: UserPlus, color: "#824EF7" },
  spend: { icon: DollarSign, color: "#FF8800" },
  roas: { icon: TrendingUp, color: "#29EFCA" },
}

export function formatKpiValue(value: number, format: string) {
  if (format === "currency") return `$${value.toLocaleString()}`
  if (format === "percent") return `${value.toFixed(2)}%`
  return value.toLocaleString()
}

export function RateKpiCard({
  metricKey,
  label,
  value,
  baseline,
}: {
  metricKey: string
  label: string
  value: string
  baseline?: string
}) {
  const config = kpiIconMap[metricKey]
  const Icon = config?.icon || Eye
  const color = config?.color || "#888"

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">{label}</p>
            <p className="text-2xl font-bold mt-1 truncate">{value}</p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        {baseline && (
          <div className="flex items-center gap-1 mt-2 text-sm font-medium text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
            <span className="shrink-0">from {baseline}</span>
            <span className="text-muted-foreground font-normal text-xs truncate">baseline</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function KpiCard({
  metricKey,
  label,
  value,
  change,
  size = "default",
}: {
  metricKey: string
  label: string
  value: string
  change?: number
  size?: "default" | "sm"
}) {
  const config = kpiIconMap[metricKey]
  const Icon = config?.icon || Eye
  const color = config?.color || "#888"
  const isSmall = size === "sm"

  return (
    <Card className={isSmall ? "py-3.5" : "py-4"}>
      <CardContent className={isSmall ? "px-4" : "px-4"}>
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className={cn("text-muted-foreground truncate", isSmall ? "text-sm" : "text-sm")}>{label}</p>
            <p className={cn("font-bold mt-0.5 truncate", isSmall ? "text-lg" : "text-2xl mt-1")}>{value}</p>
          </div>
          <div
            className={cn(
              "rounded-full flex items-center justify-center shrink-0",
              isSmall ? "w-8 h-8" : "w-10 h-10"
            )}
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className={isSmall ? "h-4 w-4" : "h-5 w-5"} style={{ color }} />
          </div>
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 font-medium",
            isSmall ? "text-xs mt-1.5" : "text-sm mt-2",
            change >= 0 ? "text-emerald-600" : "text-rose-500"
          )}>
            {change >= 0 ? (
              <TrendingUp className={isSmall ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
            ) : (
              <TrendingDown className={isSmall ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
            )}
            <span className="shrink-0">{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
