"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FlaskConical,
  Package,
  Settings,
  BarChart3,
  ChevronDown,
  Zap,
  Menu,
  X,
  Palette,
  CheckSquare,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "@/lib/onboarding-context"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number | "dynamic"
  children?: { label: string; href: string }[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "To Do",
    href: "/todo",
    icon: <CheckSquare className="w-4 h-4" />,
    badge: "dynamic",
  },
  {
    label: "Brand",
    href: "/brand",
    icon: <Palette className="w-4 h-4" />,
    children: [
      { label: "Assets", href: "/brand" },
      { label: "Theme", href: "/brand/theme" },
    ],
  },
  {
    label: "Experiments",
    href: "/experiments",
    icon: <FlaskConical className="w-4 h-4" />,
  },
  {
    label: "Products",
    href: "/products",
    icon: <Package className="w-4 h-4" />,
  },
  {
    label: "Reporting",
    href: "/reporting",
    icon: <BarChart3 className="w-4 h-4" />,
    children: [
      { label: "Orders", href: "/reporting" },
      { label: "Insights", href: "/reporting/insights" },
      { label: "Offers", href: "/reporting/offers" },
      { label: "---" , href: "" },
      { label: "Offers (Old)", href: "/reporting-v2/offers-old" },
      { label: "Insights (Old)", href: "/reporting-v2/insights-v1" },
      { label: "Experiments (Old)", href: "/reporting-v2" },
      { label: "Summary (Old)", href: "/reporting/summary" },
      { label: "Ads (Old)", href: "#" },
      { label: "Products (Old)", href: "#" },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="w-4 h-4" />,
    children: [
      { label: "General", href: "/settings" },
      { label: "Payment", href: "/settings/payment" },
      { label: "Stores", href: "/settings/stores" },
      { label: "Subdomain", href: "/settings/subdomain" },
      { label: "Pixels", href: "/settings/pixels" },
    ],
  },
  {
    label: "Team",
    href: "/team",
    icon: <Users className="w-4 h-4" />,
  },
]


const TOTAL_WIZARD_STEPS = 6

export default function PortalSidebar() {
  const pathname = usePathname()
  const { getStepStatus } = useOnboarding()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["Brand", "Settings", "Reporting"])
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  const incompleteStepsCount = useMemo(() => {
    let incomplete = 0
    for (let step = 1; step <= TOTAL_WIZARD_STEPS; step++) {
      if (getStepStatus(step) !== "complete") incomplete++
    }
    return incomplete
  }, [getStepStatus])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center">
          <Zap className="w-4 h-4 text-background" />
        </div>
        <span className="font-semibold text-sidebar-foreground">Velocity</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.has(item.label)

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.label)}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                      aria-expanded={isExpanded}
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                    {isExpanded && (
                      <ul className="ml-7 mt-1 flex flex-col gap-1 border-l border-sidebar-border pl-3">
                        {item.children!.map((child) => {
                          if (child.label === "---") {
                            return (
                              <li key="divider" className="pt-2 pb-1">
                                <p className="px-3 text-[9px] font-semibold uppercase tracking-wide text-sidebar-foreground/25">Ignore — Reference only</p>
                              </li>
                            )
                          }
                          const childActive = pathname === child.href
                          const isOld = child.label.includes("(Old)")
                          return (
                            <li key={child.href + child.label}>
                              <Link
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  "block px-3 py-1.5 rounded-md text-sm transition-colors",
                                  childActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : isOld
                                      ? "text-sidebar-foreground/30 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/50"
                                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                )}
                              >
                                {child.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (item.badge === "dynamic" ? incompleteStepsCount > 0 : true) && (
                      <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                        {item.badge === "dynamic" ? incompleteStepsCount : item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50">Velocity Merchant Portal</p>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-background" />
          </div>
          <span className="font-semibold text-sidebar-foreground text-sm">Velocity</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMobileOpen(!mobileOpen)} className="text-sidebar-foreground">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn("lg:hidden fixed top-12 left-0 bottom-0 z-40 w-64 bg-sidebar flex flex-col transform transition-transform duration-200", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex-col z-30">
        <SidebarContent />
      </aside>
    </>
  )
}
