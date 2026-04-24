"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, SlidersHorizontal, Info } from "lucide-react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { DateRange } from "react-day-picker"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { orders } from "@/lib/data"
import type { Order } from "@/lib/data"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

type SortKey = "shopifyId" | "date" | "customer" | "payment" | "total"
type SortDir = "asc" | "desc"

function shopifyUrl(shopifyId: string) {
  return `https://admin.shopify.com/store/glow-botanics/orders/${shopifyId}`
}

function formatDateTime(date: string) {
  const d = new Date(date)
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    full: `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`,
  }
}

function OrderDetailInline({ order, onFilterByCustomer }: { order: Order; onFilterByCustomer: (name: string) => void }) {
  const orderGross = order.subtotal
  const orderRefunds = order.refunds
  const matterShare = +(((orderGross - orderRefunds) * 0.15 + orderGross * 0.029 + 0.3).toFixed(2))
  const netProfit = +(orderGross - orderRefunds - matterShare).toFixed(2)
  const hasRefund = order.refunds > 0
  const orderStatus = hasRefund ? "Partially Refunded" : "Completed"
  const totalPaid = order.subtotal + order.taxes
  const dt = formatDateTime(order.date)

  return (
    <div className="border-l-4 border-l-amber-400 bg-muted px-6 py-5">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <a
            href={shopifyUrl(order.shopifyId)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-lg font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            {order.shopifyId}
          </a>
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            hasRefund ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
          )}>
            {orderStatus}
          </span>
          <span className="text-sm text-muted-foreground">{dt.full}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Velocity Order: {order.velocityOrderId}</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)" }}>
        {/* Left column — Products + Summary */}
        <div className="space-y-5">
          {/* Products */}
          <div className="rounded-xl border bg-background">
            <div className="px-5 py-3 border-b">
              <h4 className="text-sm font-semibold">Products</h4>
            </div>
            <div className="divide-y divide-border/50">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-14 h-14 rounded-lg border bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                    IMG
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.product}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Product ID: {"{product id}"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.variant && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {item.variant}
                        </span>
                      )}
                      {item.sku && (
                        <span className="text-xs text-muted-foreground">{item.sku}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-sm tabular-nums">
                    <div className="text-right">
                      <p className="font-medium text-foreground">${item.price.toFixed(2)}</p>
                    </div>
                    <span className="text-muted-foreground">
                      <span className="text-xs">X</span> {item.quantity}
                    </span>
                    <p className="font-medium text-foreground w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border bg-background">
            <div className="px-5 py-3 border-b">
              <h4 className="text-sm font-semibold">Summary</h4>
            </div>
            <div className="px-5 py-3 text-sm space-y-0">
              <div className="flex justify-between py-2">
                <span className="text-foreground">Subtotal</span>
                <span className="tabular-nums text-foreground">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-foreground">Taxes</span>
                <span className="tabular-nums text-foreground">${order.taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t font-semibold">
                <span className="text-foreground">Total Paid</span>
                <span className="tabular-nums text-foreground">${totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-foreground">Refunds</span>
                <span className="tabular-nums text-foreground">{orderRefunds > 0 ? `-$${orderRefunds.toFixed(2)}` : "$0.00"}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-foreground inline-flex items-center gap-1.5">Platform Fees<span className="relative group"><Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" /><span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-3 py-2 rounded-lg border bg-background shadow-md text-xs text-foreground w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">Matter&apos;s platform fees for this order.</span></span></span>
                <span className="tabular-nums text-foreground">-${matterShare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t font-semibold text-emerald-600">
                <span>Gross Profit</span>
                <span className="tabular-nums">${netProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Attribution */}
          <div className="rounded-xl border bg-background">
            <div className="px-5 py-3 border-b">
              <h4 className="text-sm font-semibold">Attribution</h4>
            </div>
            <div className="px-5 py-3 text-sm space-y-0">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Campaign</span>
                <span className="text-foreground text-right">{"{campaign.name}"} ({"{campaign.id}"})</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-muted-foreground">Ad Set</span>
                <span className="text-foreground text-right">{"{adset.name}"} ({"{adset.id}"})</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-muted-foreground">Ad</span>
                <a
                  href="https://business.facebook.com/adsmanager/manage/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:underline dark:text-blue-400 text-right"
                >
                  {"{ad.name}"} ({"{ad.id}"})
                </a>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-muted-foreground">Source</span>
                <span className="text-foreground">{"{utm_source}"}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-muted-foreground">Medium</span>
                <span className="text-foreground">{"{utm_medium}"}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-muted-foreground">Term</span>
                <span className="text-foreground">{"{utm_term}"}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-muted-foreground">Destination URL</span>
                <a
                  href="https://velocity.app/r/exp-123/abc"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:underline dark:text-blue-400 text-right"
                >
                  {"{destination_url}"}
                </a>
              </div>
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="text-muted-foreground">Funnel Variant</span>
                <a
                  href="https://variants.velocity.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:underline dark:text-blue-400 text-right"
                >
                  {"{funnel_variant_name}"} ({"{funnel_variant_id}"})
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Customer + Shipping */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="rounded-xl border bg-background">
            <div className="px-5 py-3 border-b">
              <h4 className="text-sm font-semibold">Customer</h4>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">{order.customer.name}</p>
                {order.customer.totalOrders && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onFilterByCustomer(order.customer.name) }}
                    className="text-blue-600 hover:underline dark:text-blue-400 text-xs mt-0.5"
                  >
                    {order.customer.totalOrders} Orders
                  </button>
                )}
              </div>
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs font-semibold text-foreground mb-1.5">Contact Information</p>
                <a
                  href={`mailto:${order.customer.email}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {order.customer.email}
                </a>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border bg-background">
            <div className="px-5 py-3 border-b">
              <h4 className="text-sm font-semibold">Shipping Address</h4>
            </div>
            <div className="px-5 py-4 text-sm text-foreground space-y-0.5">
              <p>{order.customer.address}</p>
              {order.customer.city && <p>{order.customer.city}</p>}
              {order.customer.postal && <p>{order.customer.postal}</p>}
              {order.customer.country && <p>{order.customer.country}</p>}
              {order.customer.phone && <p>{order.customer.phone}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sort header helper ─────────────────────────────────────────────────────

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
        "font-medium text-foreground px-4 py-3 text-xs cursor-pointer select-none hover:text-foreground/80 transition-colors",
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

// ─── Full-text search across all fields ─────────────────────────────────────

function matchesSearch(order: Order, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const searchableFields = [
    order.shopifyId,
    order.velocityOrderId,
    order.orderNumber,
    order.date,
    order.customer.name,
    order.customer.email,
    order.customer.address,
    order.paymentMethod,
    order.paymentProvider,
    order.total.toFixed(2),
    order.subtotal.toFixed(2),
    ...order.items.map((i) => i.product),
    ...order.items.map((i) => i.price.toFixed(2)),
  ]
  return searchableFields.some((field) => field.toLowerCase().includes(q))
}

// ─── Sort comparator ────────────────────────────────────────────────────────

function sortOrders(a: Order, b: Order, key: SortKey, dir: SortDir): number {
  let cmp = 0
  switch (key) {
    case "shopifyId":
      cmp = a.shopifyId.localeCompare(b.shopifyId)
      break
    case "date":
      cmp = a.date.localeCompare(b.date)
      break
    case "customer":
      cmp = a.customer.name.localeCompare(b.customer.name)
      break
    case "payment":
      cmp = a.paymentProvider.localeCompare(b.paymentProvider)
      break
    case "total":
      cmp = a.total - b.total
      break
  }
  return dir === "asc" ? cmp : -cmp
}

// ─── Multi-select Filter Dropdown ────────────────────────────────────────────

function FilterRow({
  label,
  options,
  selected,
  onChange,
  showProductId,
  subtitles,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  showProductId?: boolean
  subtitles?: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const [filterText, setFilterText] = useState("")

  const sorted = [...options].sort((a, b) => a.localeCompare(b))
  const allSelected = selected.length >= sorted.length && sorted.every((o) => selected.includes(o))

  const toggle = (opt: string) => {
    onChange(selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt])
  }

  const filtered = filterText
    ? sorted.filter((o) => {
        const q = filterText.toLowerCase()
        if (o.toLowerCase().includes(q)) return true
        if (subtitles && subtitles[o]?.toLowerCase().includes(q)) return true
        return false
      })
    : sorted

  const displayValue = selected.length === 0 || allSelected
    ? "All"
    : selected.length <= 2
      ? selected.join(", ")
      : `${selected.length} selected`

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      <button
        type="button"
        onClick={() => { setOpen(!open); setFilterText("") }}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors",
          open ? "border-amber-400 ring-1 ring-amber-400" : "hover:border-foreground/20"
        )}
      >
        <span className={cn("truncate", selected.length === 0 && "text-muted-foreground")}>{displayValue}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 border rounded-lg bg-background shadow-sm overflow-hidden">
          <div className="px-2 pt-2 pb-1">
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full text-sm px-2.5 py-1.5 rounded-md border bg-background outline-none focus:ring-1 focus:ring-amber-400"
              autoFocus
            />
          </div>
          <div className="py-1 max-h-48 overflow-y-auto">
            {filtered.length > 0 && (
              <label className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50">
                <input
                  type="checkbox"
                  checked={filtered.every((o) => selected.includes(o))}
                  onChange={() => {
                    if (filtered.every((o) => selected.includes(o))) {
                      onChange(selected.filter((s) => !filtered.includes(s)))
                    } else {
                      onChange([...new Set([...selected, ...filtered])])
                    }
                  }}
                  className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500 shrink-0"
                />
                <span className="text-sm font-medium">Select all</span>
              </label>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No matches</p>
            ) : (
              filtered.map((opt) => (
                <label
                  key={opt}
                  className="flex items-start gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => toggle(opt)}
                    className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="text-sm">{opt}</span>
                    {subtitles && subtitles[opt] && (
                      <p className="text-xs text-muted-foreground">{subtitles[opt]}</p>
                    )}
                    {showProductId && (
                      <p className="text-xs text-muted-foreground">Product ID: {"{product id}"}</p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Orders (main export) ───────────────────────────────────────────────────

const CUSTOMER_OPTIONS = [...new Set(orders.map((o) => o.customer.name))].sort()
const CUSTOMER_EMAILS: Record<string, string> = Object.fromEntries(orders.map((o) => [o.customer.name, o.customer.email]))
const PRODUCT_OPTIONS = [...new Set(orders.flatMap((o) => o.items.map((i) => i.product)))].sort()
const AD_OPTIONS = [...new Set(orders.map((o) => o.attribution.adName))].sort()
const AD_SUBTITLES: Record<string, string> = Object.fromEntries(
  orders.map((o) => [o.attribution.adName, o.attribution.adId])
)
const CAMPAIGN_OPTIONS = [...new Set(orders.map((o) => o.attribution.campaignName))].sort()
const CAMPAIGN_SUBTITLES: Record<string, string> = Object.fromEntries(
  orders.map((o) => [o.attribution.campaignName, o.attribution.campaignId])
)
const ADSET_OPTIONS = [...new Set(orders.map((o) => o.attribution.adSetName))].sort()
const ADSET_SUBTITLES: Record<string, string> = Object.fromEntries(
  orders.map((o) => [o.attribution.adSetName, o.attribution.adSetId])
)
const SOURCE_OPTIONS = [...new Set(orders.map((o) => o.attribution.utmSource))].sort()
const MEDIUM_OPTIONS = [...new Set(orders.map((o) => o.attribution.utmMedium))].sort()
const TERM_OPTIONS = [...new Set(orders.map((o) => o.attribution.utmTerm))].sort()

// ─── Group By ──────────────────────────────────────────────────────────────

type OrderGroupBy = "none" | "campaign" | "adset" | "ad" | "source" | "medium" | "term" | "destination" | "status" | "payment" | "product" | "customer"

interface GroupByOption {
  key: OrderGroupBy
  label: string
}

interface GroupByCategory {
  label: string
  options: GroupByOption[]
}

const GROUP_BY_CATEGORIES: GroupByCategory[] = [
  {
    label: "Order Details",
    options: [
      { key: "customer", label: "Customer" },
      { key: "payment", label: "Payment Processor" },
      { key: "product", label: "Product" },
      { key: "status", label: "Status" },
    ],
  },
  {
    label: "Attribution",
    options: [
      { key: "campaign", label: "Campaign" },
      { key: "adset", label: "Ad Set" },
      { key: "ad", label: "Ad" },
      { key: "source", label: "Source" },
      { key: "medium", label: "Medium" },
      { key: "term", label: "Term" },
      { key: "destination", label: "Destination URL" },
    ],
  },
]

const ALL_GROUP_OPTIONS = GROUP_BY_CATEGORIES.flatMap((c) => c.options)

function OrderGroupBySelect({ value, onChange }: { value: OrderGroupBy; onChange: (v: OrderGroupBy) => void }) {
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
          <div className="absolute right-0 top-full mt-2 w-64 bg-background border rounded-lg shadow-lg py-1 z-[9999]">
            <button type="button" onClick={() => { onChange("none"); setOpen(false) }}
              className={cn("w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors", value === "none" && "bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400")}>
              None
            </button>
            {GROUP_BY_CATEGORIES.map((cat, ci) => (
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

// ─── Synthetic daily order volume ──────────────────────────────────────────

interface DayData {
  day: string
  orders: number
  revenue: number
  stripe: number
  paypal: number
  stripeRevenue: number
  paypalRevenue: number
}

function generateOrdersByDay(start: Date, end: Date): DayData[] {
  const data: DayData[] = []
  const d = new Date(start)
  let dayIndex = 0
  while (d <= end) {
    const dow = d.getDay()
    let base = 10
    if (dow === 0 || dow === 6) base = 7
    if (dayIndex >= 14 && dayIndex <= 18) base += 5
    base += Math.floor(dayIndex / 10)
    const seed = (d.getDate() * 7 + d.getMonth() * 31 + dayIndex * 13) % 100
    const variance = (seed / 100 - 0.5) * 6
    const count = Math.max(3, Math.round(base + variance))
    const avgValue = 62 + (seed % 30)
    const revenue = Math.round(count * avgValue)
    // ~65% Stripe, ~35% PayPal with daily variance
    const stripePct = 0.60 + ((seed % 20) / 100)
    const stripe = Math.round(count * stripePct)
    const paypal = count - stripe
    const stripeRevenue = Math.round(revenue * stripePct)
    const paypalRevenue = revenue - stripeRevenue
    data.push({
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      orders: count,
      revenue,
      stripe,
      paypal,
      stripeRevenue,
      paypalRevenue,
    })
    d.setDate(d.getDate() + 1)
    dayIndex++
  }
  return data
}

export function Orders({ dateRange, compact, maxRows }: { dateRange?: DateRange; compact?: boolean; maxRows?: number }) {
  const [selected, setSelected] = useState<Order | null>(null)
  const [search, setSearch] = useState("")
  const [groupBy, setGroupBy] = useState<OrderGroupBy>("none")

  const ordersByDay = useMemo(() => {
    const start = dateRange?.from ?? new Date("2026-03-16")
    const end = dateRange?.to ?? new Date("2026-04-15")
    return generateOrdersByDay(start, end)
  }, [dateRange])
  const [paymentFilters, setPaymentFilters] = useState<string[]>([])
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [customerFilters, setCustomerFilters] = useState<string[]>([])
  const [productFilters, setProductFilters] = useState<string[]>([])
  const [adFilters, setAdFilters] = useState<string[]>([])
  const [campaignFilters, setCampaignFilters] = useState<string[]>([])
  const [adSetFilters, setAdSetFilters] = useState<string[]>([])
  const [sourceFilters, setSourceFilters] = useState<string[]>([])
  const [mediumFilters, setMediumFilters] = useState<string[]>([])
  const [termFilters, setTermFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(0)
  const pageSize = PAGE_SIZE

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
    setPage(0)
  }

  // processed = chart/card-level filters (date range, status, payment, product)
  const processed = useMemo(() => {
    let result = [...orders]

    // Filter by date range
    if (dateRange?.from || dateRange?.to) {
      const start = dateRange.from ? new Date(new Date(dateRange.from).setHours(0, 0, 0, 0)) : null
      const end = dateRange.to ? new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)) : null
      result = result.filter((o) => {
        const d = new Date(o.date)
        if (start && d < start) return false
        if (end && d > end) return false
        return true
      })
    }

    result = result.filter((o) => matchesSearch(o, search))

    if (paymentFilters.length > 0) {
      result = result.filter((o) => paymentFilters.includes(o.paymentProvider))
    }
    if (statusFilters.length > 0) {
      result = result.filter((o) => {
        const isRefunded = o.refunds > 0
        return (
          (statusFilters.includes("Refunded") && isRefunded) ||
          (statusFilters.includes("Completed") && !isRefunded)
        )
      })
    }
    if (productFilters.length > 0) {
      result = result.filter((o) => o.items.some((i) => productFilters.includes(i.product)))
    }
    if (adFilters.length > 0) {
      result = result.filter((o) => adFilters.includes(o.attribution.adName))
    }
    if (campaignFilters.length > 0) {
      result = result.filter((o) => campaignFilters.includes(o.attribution.campaignName))
    }
    if (adSetFilters.length > 0) {
      result = result.filter((o) => adSetFilters.includes(o.attribution.adSetName))
    }
    if (sourceFilters.length > 0) {
      result = result.filter((o) => sourceFilters.includes(o.attribution.utmSource))
    }
    if (mediumFilters.length > 0) {
      result = result.filter((o) => mediumFilters.includes(o.attribution.utmMedium))
    }
    if (termFilters.length > 0) {
      result = result.filter((o) => termFilters.includes(o.attribution.utmTerm))
    }
    if (customerFilters.length > 0) {
      result = result.filter((o) => customerFilters.includes(o.customer.name))
    }

    return result
  }, [dateRange, search, paymentFilters, statusFilters, productFilters, adFilters, campaignFilters, adSetFilters, sourceFilters, mediumFilters, termFilters, customerFilters])

  const tableFiltered = processed

  // Group key extractor
  function groupKeyOf(o: Order): string {
    switch (groupBy) {
      case "campaign": return o.attribution.campaignName
      case "adset": return o.attribution.adSetName
      case "ad": return o.attribution.adName
      case "source": return o.attribution.utmSource
      case "medium": return o.attribution.utmMedium
      case "term": return o.attribution.utmTerm
      case "destination": return o.attribution.variantUrl
      case "customer": return o.customer.name
      case "status": return o.refunds > 0 ? "Refunded" : "Completed"
      case "payment": return o.paymentProvider
      case "product": return o.items.map((i) => i.product).join(", ")
      default: return ""
    }
  }

  // Sort: when group-by is active, primary sort by group key, secondary by column sort.
  // When no group-by, just sort by column.
  const sorted = useMemo(() => {
    const result = [...tableFiltered]
    if (groupBy === "none") {
      result.sort((a, b) => sortOrders(a, b, sortKey, sortDir))
    } else {
      result.sort((a, b) => {
        const ga = groupKeyOf(a)
        const gb = groupKeyOf(b)
        const groupCmp = ga.localeCompare(gb)
        if (groupCmp !== 0) return groupCmp
        return sortOrders(a, b, sortKey, sortDir)
      })
    }
    return result
  }, [tableFiltered, groupBy, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const paged = maxRows ? sorted.slice(0, maxRows) : sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  // Build grouped view from the paged slice. Insert group headers when the
  // group key changes between consecutive rows (including the first row if
  // its group differs from the last row on the previous page).
  const grouped = useMemo(() => {
    if (groupBy === "none") return [{ key: "all", label: "", count: 0, revenue: 0, items: paged }]

    // Count totals per group across ALL sorted data (not just this page) for header display
    const totalsByGroup = new Map<string, { count: number; revenue: number }>()
    for (const o of sorted) {
      const k = groupKeyOf(o)
      const existing = totalsByGroup.get(k) ?? { count: 0, revenue: 0 }
      existing.count++
      existing.revenue += o.total
      totalsByGroup.set(k, existing)
    }

    // Determine what was the last group key on the previous page
    const prevPageLastIdx = safePage * pageSize - 1
    const prevGroupKey = prevPageLastIdx >= 0 ? groupKeyOf(sorted[prevPageLastIdx]) : null

    const groups: { key: string; label: string; count: number; revenue: number; items: Order[] }[] = []
    let currentKey: string | null = prevGroupKey

    for (const o of paged) {
      const k = groupKeyOf(o)
      if (k !== currentKey) {
        const totals = totalsByGroup.get(k) ?? { count: 0, revenue: 0 }
        groups.push({ key: k, label: k, count: totals.count, revenue: totals.revenue, items: [] })
        currentKey = k
      }
      groups[groups.length - 1].items.push(o)
    }
    return groups
  }, [paged, sorted, groupBy, safePage, pageSize])

  const clearAllFilters = () => { setPaymentFilters([]); setStatusFilters([]); setCustomerFilters([]); setProductFilters([]); setAdFilters([]); setCampaignFilters([]); setAdSetFilters([]); setSourceFilters([]); setMediumFilters([]); setTermFilters([]); setPage(0) }

  // Suppress pills when all options are selected (= no filter)
  const isAllSelected = (sel: string[], opts: string[]) => sel.length > 0 && sel.length >= opts.length && opts.every((o) => sel.includes(o))

  const activeFilters = [
    ...(isAllSelected(campaignFilters, CAMPAIGN_OPTIONS) ? [] : campaignFilters.map((f) => ({ key: `campaign:${f}`, label: `Campaign: ${f}`, clear: () => setCampaignFilters((prev) => prev.filter((p) => p !== f)) }))),
    ...(isAllSelected(adSetFilters, ADSET_OPTIONS) ? [] : adSetFilters.map((f) => ({ key: `adset:${f}`, label: `Ad Set: ${f}`, clear: () => setAdSetFilters((prev) => prev.filter((p) => p !== f)) }))),
    ...(isAllSelected(adFilters, AD_OPTIONS) ? [] : adFilters.map((f) => ({ key: `ad:${f}`, label: `Ad: ${f}`, clear: () => setAdFilters((prev) => prev.filter((p) => p !== f)) }))),
    ...(isAllSelected(sourceFilters, SOURCE_OPTIONS) ? [] : sourceFilters.map((f) => ({ key: `source:${f}`, label: `Source: ${f}`, clear: () => setSourceFilters((prev) => prev.filter((p) => p !== f)) }))),
    ...(isAllSelected(mediumFilters, MEDIUM_OPTIONS) ? [] : mediumFilters.map((f) => ({ key: `medium:${f}`, label: `Medium: ${f}`, clear: () => setMediumFilters((prev) => prev.filter((p) => p !== f)) }))),
    ...(isAllSelected(termFilters, TERM_OPTIONS) ? [] : termFilters.map((f) => ({ key: `term:${f}`, label: `Term: ${f}`, clear: () => setTermFilters((prev) => prev.filter((p) => p !== f)) }))),
    ...(isAllSelected(statusFilters, ["Completed", "Refunded", "Partially Refunded", "Draft", "Failed"]) ? [] : statusFilters.map((f) => ({ key: `status:${f}`, label: `Status: ${f}`, clear: () => setStatusFilters((prev) => prev.filter((p) => p !== f)) }))),
    ...(isAllSelected(paymentFilters, ["Stripe", "PayPal"]) ? [] : paymentFilters.map((f) => ({ key: `payment:${f}`, label: `Processor: ${f}`, clear: () => setPaymentFilters((prev) => prev.filter((p) => p !== f)) }))),
    ...(isAllSelected(productFilters, PRODUCT_OPTIONS) ? [] : productFilters.map((f) => ({ key: `product:${f}`, label: `Product: ${f}`, clear: () => setProductFilters((prev) => prev.filter((p) => p !== f)) }))),
    ...(isAllSelected(customerFilters, CUSTOMER_OPTIONS) ? [] : customerFilters.map((f) => ({ key: `customer:${f}`, label: `Customer: ${f}`, clear: () => setCustomerFilters((prev) => prev.filter((p) => p !== f)) }))),
  ]

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
          {(() => {
            const totalRevenue = processed.reduce((s, o) => s + o.total, 0)
            return (
              <div className="grid grid-cols-3 gap-2" style={{ width: 420 }}>
                <div className="rounded-xl border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">Orders</p>
                  <p className="text-xl font-bold tabular-nums">{processed.length.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <p className="text-xl font-bold tabular-nums">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-xl border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">AOV</p>
                  <p className="text-xl font-bold tabular-nums">${processed.length > 0 ? (totalRevenue / processed.length).toFixed(2) : "0.00"}</p>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Chart */}
      {!compact && (() => {
        const showStripe = paymentFilters.length === 0 || paymentFilters.includes("Stripe")
        const showPayPal = paymentFilters.length === 0 || paymentFilters.includes("PayPal")
        const showBoth = showStripe && showPayPal

        // Scale chart proportionally when product/customer/status filters reduce the dataset
        const scale = orders.length > 0 ? processed.length / orders.length : 1

        const chartData = ordersByDay.map((d) => ({
          ...d,
          orders: Math.round(d.orders * scale),
          stripe: Math.round(d.stripe * scale),
          paypal: Math.round(d.paypal * scale),
          revenue: Math.round(d.revenue * scale),
          stripeRevenue: Math.round(d.stripeRevenue * scale),
          paypalRevenue: Math.round(d.paypalRevenue * scale),
          filteredOrders: Math.round((showBoth ? d.orders : showStripe ? d.stripe : d.paypal) * scale),
        }))

        const legendPayload = showBoth
          ? [{ value: "Stripe", type: "square" as const, color: "#5167FC" }, { value: "PayPal", type: "square" as const, color: "#222D65" }]
          : showStripe
            ? [{ value: "Stripe", type: "square" as const, color: "#5167FC" }]
            : [{ value: "PayPal", type: "square" as const, color: "#222D65" }]

        return (
      <Card className="py-0 gap-0 overflow-hidden">
        <div className="px-2 py-2" style={{ height: 252 }}>
          <ResponsiveContainer>
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={Math.max(0, Math.floor(ordersByDay.length / 8) - 1)} tickLine={false} />
              <YAxis yAxisId="revenue" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={32} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <YAxis yAxisId="orders" orientation="right" hide />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as DayData & { filteredOrders: number }
                  return (
                    <div className="bg-background border rounded-lg shadow-lg px-3 py-2.5 text-xs space-y-2">
                      <p className="font-semibold">{label}</p>
                      <div>
                        <p className="font-medium">Orders: {showBoth ? d.orders : d.filteredOrders}</p>
                        {showBoth && <p className="pl-3 text-muted-foreground">Stripe: {d.stripe}</p>}
                        {showBoth && <p className="pl-3 text-muted-foreground">PayPal: {d.paypal}</p>}
                      </div>
                      <div>
                        <p className="font-medium">Revenue: ${showBoth ? d.revenue.toLocaleString() : showStripe ? d.stripeRevenue.toLocaleString() : d.paypalRevenue.toLocaleString()}</p>
                        {showBoth && <p className="pl-3 text-muted-foreground">Stripe: ${d.stripeRevenue.toLocaleString()}</p>}
                        {showBoth && <p className="pl-3 text-muted-foreground">PayPal: ${d.paypalRevenue.toLocaleString()}</p>}
                      </div>
                    </div>
                  )
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconSize={10}
                wrapperStyle={{ fontSize: 11, paddingBottom: 4 }}
                payload={legendPayload}
              />
              {showStripe && <Bar yAxisId="revenue" dataKey="stripeRevenue" stackId="revenue" fill="#5167FC" radius={showPayPal ? [0, 0, 0, 0] : [2, 2, 0, 0]} />}
              {showPayPal && <Bar yAxisId="revenue" dataKey="paypalRevenue" stackId="revenue" fill="#222D65" radius={[2, 2, 0, 0]} />}
              <Line yAxisId="orders" type="monotone" dataKey="filteredOrders" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2.5, fill: "#f59e0b", strokeWidth: 0 }} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
        )
      })()}

      {/* Search + Group by + Filter */}
      {!compact && <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, customers, products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="pl-11 h-11 text-sm"
          />
        </div>
        <OrderGroupBySelect value={groupBy} onChange={setGroupBy} />
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

          {/* Filter modal — floats below button */}
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-[22rem] bg-background border rounded-xl shadow-xl p-4 space-y-4" style={{ zIndex: 9999 }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Filters</p>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterRow
                label="Status"
                options={["Completed", "Refunded", "Partially Refunded", "Draft", "Failed"]}
                selected={statusFilters}
                onChange={(v) => { setStatusFilters(v); setPage(0) }}
              />
              <FilterRow
                label="Payment Processor"
                options={["Stripe", "PayPal"]}
                selected={paymentFilters}
                onChange={(v) => { setPaymentFilters(v); setPage(0) }}
              />
              <FilterRow
                label="Product"
                options={PRODUCT_OPTIONS}
                selected={productFilters}
                onChange={(v) => { setProductFilters(v); setPage(0) }}
                showProductId
              />
              <FilterRow
                label="Customer"
                options={CUSTOMER_OPTIONS}
                selected={customerFilters}
                onChange={(v) => { setCustomerFilters(v); setPage(0) }}
                subtitles={CUSTOMER_EMAILS}
              />
              <div className="border-t border-border/50" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Attribution</p>
              <FilterRow label="Campaign" options={CAMPAIGN_OPTIONS} selected={campaignFilters} onChange={(v) => { setCampaignFilters(v); setPage(0) }} subtitles={CAMPAIGN_SUBTITLES} />
              <FilterRow label="Ad Set" options={ADSET_OPTIONS} selected={adSetFilters} onChange={(v) => { setAdSetFilters(v); setPage(0) }} subtitles={ADSET_SUBTITLES} />
              <FilterRow label="Ad" options={AD_OPTIONS} selected={adFilters} onChange={(v) => { setAdFilters(v); setPage(0) }} subtitles={AD_SUBTITLES} />
              <FilterRow label="Source" options={SOURCE_OPTIONS} selected={sourceFilters} onChange={(v) => { setSourceFilters(v); setPage(0) }} />
              <FilterRow label="Medium" options={MEDIUM_OPTIONS} selected={mediumFilters} onChange={(v) => { setMediumFilters(v); setPage(0) }} />
              <FilterRow label="Term" options={TERM_OPTIONS} selected={termFilters} onChange={(v) => { setTermFilters(v); setPage(0) }} />
            </div>
          )}
        </div>
      </div>}

      {/* Active filter pills */}
      {!compact && activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={f.clear}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {f.label}
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <Card className="py-0">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Status</th>
                <SortHeader label="Order" sortKey="shopifyId" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Date" sortKey="date" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Customer" sortKey="customer" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Payment" sortKey="payment" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <th className="text-right font-medium text-foreground px-4 py-3 text-xs">Items</th>
                <SortHeader label="Total" sortKey="total" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                    No orders match your search.
                  </td>
                </tr>
              ) : (
                grouped.map((group) => (
                  <React.Fragment key={group.key}>
                    {group.label && (
                      <tr className="bg-muted/40">
                        <td colSpan={6} className="px-4 py-2">
                          <span className="text-sm font-semibold text-foreground">{group.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">{group.count} {group.count === 1 ? "order" : "orders"}</span>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums text-xs font-semibold text-muted-foreground">${group.revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                    {group.items.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr
                          className={cn(
                            "border-b cursor-pointer transition-colors hover:bg-muted/30",
                            selected?.id === order.id && "bg-amber-50/50 dark:bg-amber-950/20"
                          )}
                          onClick={() => setSelected(selected?.id === order.id ? null : order)}
                        >
                          <td className="px-4 py-3">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              order.refunds > 0
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            )}>
                              {order.refunds > 0 ? "Refunded" : "Completed"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={shopifyUrl(order.shopifyId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {order.shopifyId}
                            </a>
                            <p className="text-xs text-muted-foreground mt-0.5">{order.velocityOrderId}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm">
                              {new Date(order.date).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric"
                              })}
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(order.date).toLocaleTimeString("en-US", {
                                hour: "numeric", minute: "2-digit", hour12: true
                              })} PDT
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-foreground">{order.customer.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{order.customer.email}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{order.paymentProvider}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-foreground">{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums">
                            ${order.total.toFixed(2)}
                          </td>
                        </tr>
                        {selected?.id === order.id && (
                          <tr className="border-b">
                            <td colSpan={7} className="p-0">
                              <OrderDetailInline
                                order={order}
                                onFilterByCustomer={(name) => {
                                  setCustomerFilters([name])
                                  setSelected(null)
                                  setPage(0)
                                }}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
            {groupBy === "none" && !compact && (
              <tfoot>
                <tr className="bg-muted/50 font-semibold text-sm">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right tabular-nums">
                    ${tableFiltered.reduce((s, o) => s + o.total, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {!compact && <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">
            Page {safePage + 1} of {totalPages} ({tableFiltered.length} orders)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>}
      </Card>
    </div>
  )
}
