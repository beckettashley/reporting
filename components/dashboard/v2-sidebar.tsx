"use client"

import {
  LayoutDashboard, Package, ShoppingCart, Megaphone, Lightbulb, Tag, BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { merchant } from "@/lib/data"

const navItems = [
  { key: "orders", label: "Orders", icon: ShoppingCart, href: "/" },
  { key: "insights-v2", label: "Insights", icon: BookOpen, href: "/reporting-v2/insights" },
  { key: "offers-v2", label: "Offers", icon: Tag, href: "/reporting-v2/offers" },
]

const referenceItems = [
  { key: "offers-old", label: "Offers (Old)", icon: Tag, href: "/reporting-v2/offers-old" },
  { key: "insights-v1", label: "Insights (Old)", icon: BookOpen, href: "/reporting-v2/insights-v1" },
  { key: "experiments-v2", label: "Experiments (Old)", icon: Lightbulb, href: "/reporting-v2" },
  { key: "summary", label: "Summary (Old)", icon: LayoutDashboard, href: "/" },
  { key: "ads", label: "Ads (Old)", icon: Megaphone, href: "/" },
  { key: "products", label: "Products (Old)", icon: Package, href: "/" },
]

export function V2Sidebar({ activeKey }: { activeKey?: string }) {
  return (
    <aside className="w-[200px] border-r bg-card flex flex-col shrink-0">
      <div className="px-5 py-5 border-b">
        <h1 className="text-lg font-bold tracking-tight">Velocity</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{merchant.name}</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeKey === item.key
          return isActive ? (
            <span
              key={item.key}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </span>
          ) : (
            <a
              key={item.key}
              href={item.href}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </a>
          )
        })}
        <div className="mt-3 pt-3 border-t border-border/50 space-y-0.5">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/50">Ignore — Reference only</p>
          {referenceItems.map((item) => {
            const isActive = activeKey === item.key
            return isActive ? (
              <span
                key={item.key}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
            ) : (
              <a
                key={item.key}
                href={item.href}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </a>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
