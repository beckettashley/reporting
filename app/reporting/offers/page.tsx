"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { Search, ChevronDown, ChevronUp, ChevronRight, SlidersHorizontal, X, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// ─── Product Catalog ──────────────────────────────────────────────────────

const PRODUCT_CATALOG: Record<string, { name: string; shopifyPrice: number }> = {
  "glowserum-pro": { name: "GlowSerum Pro", shopifyPrice: 49 },
  "daily-moisturizer": { name: "Daily Moisturizer", shopifyPrice: 28 },
  "down-alt-pillow": { name: "Down Alternative Pillow", shopifyPrice: 130 },
  "sleep-mask": { name: "Sleep Mask", shopifyPrice: 15 },
  "shipping-protection": { name: "Shipping Protection", shopifyPrice: 5 },
  "extended-warranty": { name: "Extended Warranty", shopifyPrice: 11 },
  "recovery-kit": { name: "Recovery Kit", shopifyPrice: 65 },
  "night-cream": { name: "Night Cream", shopifyPrice: 38 },
  "facial-mist": { name: "Facial Mist", shopifyPrice: 22 },
}

// ─── Page Instance Types ──────────────────────────────────────────────────

type PageType = "Sales Page" | "Checkout Page" | "Upsell Page"

interface PageInstanceOffer {
  products: { productId: string; quantity: number }[]
  price: number
  orders: number
  revenue: number
  views: number
  totalOrderRevenue: number
}

interface PageInstance {
  pageType: PageType
  offers: PageInstanceOffer[]
}

// ─── Page Instances (single source of truth) ──────────────────────────────

const PAGE_INSTANCES: PageInstance[] = [
  // ─── GlowSerum Sales Pages (discounts 4-8%) ───────────────
  // High price ladder: ×1@$47 + ×2@$94 + ×3@$141
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 1 }], price: 47, orders: 245, revenue: 11515, views: 7500, totalOrderRevenue: 12667 },
    { products: [{ productId: "glowserum-pro", quantity: 2 }], price: 94, orders: 312, revenue: 29328, views: 7500, totalOrderRevenue: 32847 },
    { products: [{ productId: "glowserum-pro", quantity: 3 }], price: 141, orders: 198, revenue: 27918, views: 7500, totalOrderRevenue: 31547 },
  ]},
  // Low price ladder: ×1@$45 + ×2@$90 + ×3@$135
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 1 }], price: 45, orders: 298, revenue: 13410, views: 8200, totalOrderRevenue: 14617 },
    { products: [{ productId: "glowserum-pro", quantity: 2 }], price: 90, orders: 368, revenue: 33120, views: 8200, totalOrderRevenue: 37094 },
    { products: [{ productId: "glowserum-pro", quantity: 3 }], price: 135, orders: 224, revenue: 30240, views: 8200, totalOrderRevenue: 33264 },
  ]},
  // Bundle variant: ×1@$45 + ×2@$90 + ×3+moisturizer@$166
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 1 }], price: 45, orders: 276, revenue: 12420, views: 7900, totalOrderRevenue: 13662 },
    { products: [{ productId: "glowserum-pro", quantity: 2 }], price: 90, orders: 342, revenue: 30780, views: 7900, totalOrderRevenue: 33858 },
    { products: [{ productId: "glowserum-pro", quantity: 3 }, { productId: "daily-moisturizer", quantity: 1 }], price: 166, orders: 186, revenue: 30876, views: 7900, totalOrderRevenue: 34272 },
  ]},
  // All-bundle variant: ×1@$45 + GS+moisturizer@$75 + ×3+moisturizer@$159
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 1 }], price: 45, orders: 264, revenue: 11880, views: 7600, totalOrderRevenue: 13068 },
    { products: [{ productId: "glowserum-pro", quantity: 1 }, { productId: "daily-moisturizer", quantity: 1 }], price: 75, orders: 312, revenue: 23400, views: 7600, totalOrderRevenue: 25740 },
    { products: [{ productId: "glowserum-pro", quantity: 3 }, { productId: "daily-moisturizer", quantity: 1 }], price: 159, orders: 212, revenue: 33708, views: 7600, totalOrderRevenue: 38427 },
  ]},
  // ─── Pillow Sales Pages (discounts 4-8%) ──────────────────
  // High price ladder: ×1@$125 + ×2@$250 + ×3@$374
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "down-alt-pillow", quantity: 1 }], price: 125, orders: 189, revenue: 23625, views: 6750, totalOrderRevenue: 26696 },
    { products: [{ productId: "down-alt-pillow", quantity: 2 }], price: 250, orders: 312, revenue: 78000, views: 6750, totalOrderRevenue: 85800 },
    { products: [{ productId: "down-alt-pillow", quantity: 3 }], price: 374, orders: 142, revenue: 53108, views: 6750, totalOrderRevenue: 60012 },
  ]},
  // Low price ladder: ×1@$120 + ×2@$239 + ×3@$359
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "down-alt-pillow", quantity: 1 }], price: 120, orders: 234, revenue: 28080, views: 7300, totalOrderRevenue: 30888 },
    { products: [{ productId: "down-alt-pillow", quantity: 2 }], price: 239, orders: 378, revenue: 90342, views: 7300, totalOrderRevenue: 101183 },
    { products: [{ productId: "down-alt-pillow", quantity: 3 }], price: 359, orders: 168, revenue: 60312, views: 7300, totalOrderRevenue: 67549 },
  ]},
  // Bundle variant: ×1@$120 + ×2@$239 + ×3+mask@$385
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "down-alt-pillow", quantity: 1 }], price: 120, orders: 208, revenue: 24960, views: 6900, totalOrderRevenue: 27206 },
    { products: [{ productId: "down-alt-pillow", quantity: 2 }], price: 239, orders: 298, revenue: 71222, views: 6900, totalOrderRevenue: 79056 },
    { products: [{ productId: "down-alt-pillow", quantity: 3 }, { productId: "sleep-mask", quantity: 1 }], price: 385, orders: 124, revenue: 47740, views: 6900, totalOrderRevenue: 53469 },
  ]},
  // Bundle variant, lower price: ×1@$120 + ×2@$239 + ×3+mask@$369
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "down-alt-pillow", quantity: 1 }], price: 120, orders: 218, revenue: 26160, views: 7000, totalOrderRevenue: 28514 },
    { products: [{ productId: "down-alt-pillow", quantity: 2 }], price: 239, orders: 356, revenue: 85084, views: 7000, totalOrderRevenue: 96996 },
    { products: [{ productId: "down-alt-pillow", quantity: 3 }, { productId: "sleep-mask", quantity: 1 }], price: 369, orders: 148, revenue: 54612, views: 7000, totalOrderRevenue: 60073 },
  ]},
  // GS high with bundle 3rd tier: ×1@$47 + ×2@$94 + ×3+moisturizer@$166
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 1 }], price: 47, orders: 232, revenue: 10904, views: 7200, totalOrderRevenue: 11994 },
    { products: [{ productId: "glowserum-pro", quantity: 2 }], price: 94, orders: 298, revenue: 28012, views: 7200, totalOrderRevenue: 31373 },
    { products: [{ productId: "glowserum-pro", quantity: 3 }, { productId: "daily-moisturizer", quantity: 1 }], price: 166, orders: 172, revenue: 28552, views: 7200, totalOrderRevenue: 31693 },
  ]},
  // GS low with all-bundle 3rd tier: ×1@$45 + ×2@$90 + ×3+moisturizer@$159
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 1 }], price: 45, orders: 254, revenue: 11430, views: 7800, totalOrderRevenue: 12573 },
    { products: [{ productId: "glowserum-pro", quantity: 2 }], price: 90, orders: 336, revenue: 30240, views: 7800, totalOrderRevenue: 33264 },
    { products: [{ productId: "glowserum-pro", quantity: 3 }, { productId: "daily-moisturizer", quantity: 1 }], price: 159, orders: 196, revenue: 31164, views: 7800, totalOrderRevenue: 35527 },
  ]},
  // Pillow high with bundle: ×1@$125 + ×2@$250 + ×3+mask@$385
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "down-alt-pillow", quantity: 1 }], price: 125, orders: 176, revenue: 22000, views: 6500, totalOrderRevenue: 24860 },
    { products: [{ productId: "down-alt-pillow", quantity: 2 }], price: 250, orders: 288, revenue: 72000, views: 6500, totalOrderRevenue: 79200 },
    { products: [{ productId: "down-alt-pillow", quantity: 3 }, { productId: "sleep-mask", quantity: 1 }], price: 385, orders: 118, revenue: 45430, views: 6500, totalOrderRevenue: 50877 },
  ]},
  // Pillow low with plain ×3: ×1@$120 + ×2@$239 + ×3@$374
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "down-alt-pillow", quantity: 1 }], price: 120, orders: 222, revenue: 26640, views: 7100, totalOrderRevenue: 29304 },
    { products: [{ productId: "down-alt-pillow", quantity: 2 }], price: 239, orders: 364, revenue: 86996, views: 7100, totalOrderRevenue: 97435 },
    { products: [{ productId: "down-alt-pillow", quantity: 3 }], price: 374, orders: 134, revenue: 50116, views: 7100, totalOrderRevenue: 56631 },
  ]},
  // GS high with GS+moisturizer 2nd tier: ×1@$47 + GS+moisturizer@$75 + ×3@$141
  { pageType: "Sales Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 1 }], price: 47, orders: 218, revenue: 10246, views: 7400, totalOrderRevenue: 11271 },
    { products: [{ productId: "glowserum-pro", quantity: 1 }, { productId: "daily-moisturizer", quantity: 1 }], price: 75, orders: 286, revenue: 21450, views: 7400, totalOrderRevenue: 23595 },
    { products: [{ productId: "glowserum-pro", quantity: 3 }], price: 141, orders: 184, revenue: 25944, views: 7400, totalOrderRevenue: 29317 },
  ]},
  // ─── Checkout Pages (1 offer per page) ─────────────────────
  // totalOrderRevenue reflects full order: sales page purchase + this checkout add-on + small attach
  { pageType: "Checkout Page", offers: [
    { products: [{ productId: "shipping-protection", quantity: 1 }], price: 4.99, orders: 892, revenue: 4451, views: 1389, totalOrderRevenue: 102732 },
  ]},
  { pageType: "Checkout Page", offers: [
    { products: [{ productId: "extended-warranty", quantity: 1 }], price: 9.99, orders: 251, revenue: 2507, views: 1387, totalOrderRevenue: 31167 },
  ]},
  { pageType: "Checkout Page", offers: [
    { products: [{ productId: "sleep-mask", quantity: 1 }], price: 14, orders: 316, revenue: 4424, views: 1386, totalOrderRevenue: 39873 },
  ]},
  // ─── Upsell Pages (1 offer per page) ────────────────────────
  // totalOrderRevenue reflects full order: sales page + checkout attach + this upsell + small attach
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 2 }], price: 91, orders: 186, revenue: 16926, views: 845, totalOrderRevenue: 39800 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "daily-moisturizer", quantity: 1 }], price: 26, orders: 224, revenue: 5824, views: 845, totalOrderRevenue: 32476 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "recovery-kit", quantity: 1 }], price: 61, orders: 142, revenue: 8662, views: 763, totalOrderRevenue: 26693 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "down-alt-pillow", quantity: 2 }], price: 247, orders: 94, revenue: 23218, views: 734, totalOrderRevenue: 34590 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 2 }], price: 94, orders: 142, revenue: 13348, views: 734, totalOrderRevenue: 30953 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "daily-moisturizer", quantity: 1 }], price: 26, orders: 198, revenue: 5148, views: 712, totalOrderRevenue: 28904 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "night-cream", quantity: 1 }], price: 36, orders: 156, revenue: 5616, views: 712, totalOrderRevenue: 24645 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "daily-moisturizer", quantity: 1 }], price: 26, orders: 172, revenue: 4472, views: 680, totalOrderRevenue: 24765 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 2 }], price: 94, orders: 118, revenue: 11092, views: 680, totalOrderRevenue: 25958 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "facial-mist", quantity: 1 }], price: 21, orders: 204, revenue: 4284, views: 680, totalOrderRevenue: 28148 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "glowserum-pro", quantity: 2 }], price: 91, orders: 164, revenue: 14924, views: 790, totalOrderRevenue: 35421 },
  ]},
  { pageType: "Upsell Page", offers: [
    { products: [{ productId: "facial-mist", quantity: 1 }], price: 21, orders: 238, revenue: 4998, views: 790, totalOrderRevenue: 33791 },
  ]},
]

// ─── Signature & Display Helpers ──────────────────────────────────────────

function offerSignature(products: { productId: string; quantity: number }[], price: number, pageType: PageType): string {
  const sorted = [...products]
    .sort((a, b) => a.productId.localeCompare(b.productId))
    .map((p) => `${p.productId}:${p.quantity}`)
    .join("|")
  return `${pageType}|${sorted}|${price}`
}

function offerDisplayName(products: { productId: string; quantity: number }[]): string {
  const sorted = [...products].sort((a, b) => (PRODUCT_CATALOG[b.productId]?.shopifyPrice ?? 0) - (PRODUCT_CATALOG[a.productId]?.shopifyPrice ?? 0))
  return sorted.map((p) => {
    const name = PRODUCT_CATALOG[p.productId]?.name ?? p.productId
    return `${name} × ${p.quantity}`
  }).join(" + ")
}

function productGroupOf(products: { productId: string; quantity: number }[]): string {
  const sorted = [...products].sort((a, b) => (PRODUCT_CATALOG[b.productId]?.shopifyPrice ?? 0) - (PRODUCT_CATALOG[a.productId]?.shopifyPrice ?? 0))
  return PRODUCT_CATALOG[sorted[0]?.productId]?.name ?? "Unknown"
}

function shopifyTotalOf(products: { productId: string; quantity: number }[]): number {
  return products.reduce((s, p) => s + (PRODUCT_CATALOG[p.productId]?.shopifyPrice ?? 0) * p.quantity, 0)
}

function attributionFor(products: { productId: string; quantity: number }[]): { campaign: string; adSet: string; ad: string; destinationLink: string } {
  const primary = products.reduce((best, p) => (PRODUCT_CATALOG[p.productId]?.shopifyPrice ?? 0) > (PRODUCT_CATALOG[best.productId]?.shopifyPrice ?? 0) ? p : best)
  if (primary.productId === "down-alt-pillow" || primary.productId === "sleep-mask") {
    return { campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc" }
  }
  return { campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc" }
}

// ─── Aggregated Offer Type ────────────────────────────────────────────────

interface AggregatedOffer {
  signature: string
  pageType: PageType
  products: { productId: string; quantity: number }[]
  price: number
  orders: number
  revenue: number
  views: number
  aov: number
  takeRate: number
  name: string
  productGroup: string
  campaign: string
  adSet: string
  ad: string
  destinationLink: string
}

// ─── Derive main table from PAGE_INSTANCES ────────────────────────────────

const OFFERS: AggregatedOffer[] = (() => {
  const map = new Map<string, { products: { productId: string; quantity: number }[]; pageType: PageType; price: number; orders: number; revenue: number; views: number; totalOrderRevenue: number }>()

  for (const instance of PAGE_INSTANCES) {
    for (const o of instance.offers) {
      const sig = offerSignature(o.products, o.price, instance.pageType)
      const existing = map.get(sig)
      if (existing) {
        existing.orders += o.orders
        existing.revenue += o.revenue
        existing.views += o.views
        existing.totalOrderRevenue += o.totalOrderRevenue
      } else {
        map.set(sig, {
          products: o.products,
          pageType: instance.pageType,
          price: o.price,
          orders: o.orders,
          revenue: o.revenue,
          views: o.views,
          totalOrderRevenue: o.totalOrderRevenue,
        })
      }
    }
  }

  return [...map.entries()].map(([sig, o]) => {
    const attr = attributionFor(o.products)
    return {
      signature: sig,
      pageType: o.pageType,
      products: o.products,
      price: o.price,
      orders: o.orders,
      revenue: o.revenue,
      views: o.views,
      aov: o.orders > 0 ? o.totalOrderRevenue / o.orders : 0,
      takeRate: o.views > 0 ? (o.orders / o.views) * 100 : 0,
      name: offerDisplayName(o.products),
      productGroup: productGroupOf(o.products),
      ...attr,
    }
  })
})()

// ─── Compare Offer Configurations (sub-grouped by page configuration) ────

interface PageOffersRow {
  signature: string
  pageType: PageType
  products: { productId: string; quantity: number }[]
  name: string
  price: number
  orders: number
  revenue: number
  revenuePerCustomer: number
  aov: number
  distribution: number
  isParent: boolean
}

interface PageOffersSubGroup {
  configurationId: string
  offers: PageOffersRow[]
  totalViews: number
  totalRevenue: number
}

function configurationSignature(instance: PageInstance): string {
  return instance.offers
    .map((o) => offerSignature(o.products, o.price, instance.pageType))
    .sort()
    .join("||")
}

function getPageOffersSubGroups(parent: AggregatedOffer): PageOffersSubGroup[] {
  const parentSig = parent.signature

  const containingInstances = PAGE_INSTANCES.filter(
    (instance) =>
      instance.pageType === parent.pageType &&
      instance.offers.some((o) => offerSignature(o.products, o.price, instance.pageType) === parentSig)
  )

  // Group PageInstances by configuration signature
  const configMap = new Map<string, PageInstance[]>()
  for (const instance of containingInstances) {
    const cfgSig = configurationSignature(instance)
    const bucket = configMap.get(cfgSig) ?? []
    bucket.push(instance)
    configMap.set(cfgSig, bucket)
  }

  // Each distinct configuration becomes one sub-group with aggregated metrics
  const subGroups: PageOffersSubGroup[] = []
  for (const [cfgSig, instances] of configMap.entries()) {
    const offerAgg = new Map<string, { products: { productId: string; quantity: number }[]; price: number; orders: number; revenue: number; totalOrderRevenue: number }>()

    for (const instance of instances) {
      for (const o of instance.offers) {
        const oSig = offerSignature(o.products, o.price, instance.pageType)
        const existing = offerAgg.get(oSig)
        if (existing) {
          existing.orders += o.orders
          existing.revenue += o.revenue
          existing.totalOrderRevenue += o.totalOrderRevenue
        } else {
          offerAgg.set(oSig, { products: o.products, price: o.price, orders: o.orders, revenue: o.revenue, totalOrderRevenue: o.totalOrderRevenue })
        }
      }
    }

    const totalOrders = [...offerAgg.values()].reduce((s, o) => s + o.orders, 0)

    const offers = [...offerAgg.entries()]
      .map(([oSig, o]) => ({
        signature: oSig,
        pageType: parent.pageType,
        products: o.products,
        name: offerDisplayName(o.products),
        price: o.price,
        orders: o.orders,
        revenue: o.revenue,
        revenuePerCustomer: o.orders > 0 ? o.totalOrderRevenue / o.orders : 0,
        aov: o.orders > 0 ? o.revenue / o.orders : 0,
        distribution: totalOrders > 0 ? (o.orders / totalOrders) * 100 : 0,
        isParent: oSig === parentSig,
      }))
      .sort((a, b) => a.price - b.price)

    // Sum views and revenue across all deduplicated instances for this config
    let configViews = 0
    let configRevenue = 0
    for (const instance of instances) {
      // Views are page-level — use any offer's views (they're identical per instance)
      configViews += instance.offers[0]?.views ?? 0
      configRevenue += instance.offers.reduce((s, o) => s + o.revenue, 0)
    }

    subGroups.push({ configurationId: cfgSig, offers, totalViews: configViews, totalRevenue: configRevenue })
  }

  // Sort sub-groups by parent's revenue in each, descending
  subGroups.sort((a, b) => {
    const parentRevA = a.offers.find((o) => o.isParent)?.revenue ?? 0
    const parentRevB = b.offers.find((o) => o.isParent)?.revenue ?? 0
    return parentRevB - parentRevA
  })

  return subGroups
}

// ─── Derived filter options ───────────────────────────────────────────────

const PRODUCT_OPTIONS = [...new Set(OFFERS.flatMap((o) => o.products.map((p) => PRODUCT_CATALOG[p.productId]?.name ?? p.productId)))].sort()
const OFFER_ITEMS_OPTIONS = [...new Set(OFFERS.map((o) => o.name))].sort()
const PAGE_TYPE_OPTIONS = [...new Set(OFFERS.map((o) => o.pageType))].sort()

// ─── Sort ─────────────────────────────────────────────────────────────────

type OfferSortKey = "name" | "pageType" | "price" | "shopifyPrice" | "discount" | "views" | "orders" | "takeRate" | "aov" | "revenue"
type SortDir = "asc" | "desc"

function sortOffers(a: AggregatedOffer, b: AggregatedOffer, key: OfferSortKey, dir: SortDir): number {
  let cmp = 0
  switch (key) {
    case "name": cmp = a.name.localeCompare(b.name); break
    case "pageType": cmp = a.pageType.localeCompare(b.pageType); break
    case "price": cmp = a.price - b.price; break
    case "shopifyPrice": cmp = shopifyTotalOf(a.products) - shopifyTotalOf(b.products); break
    case "discount": { const da = shopifyTotalOf(a.products) - a.price; const db = shopifyTotalOf(b.products) - b.price; cmp = da - db; break }
    case "views": cmp = a.views - b.views; break
    case "orders": cmp = a.orders - b.orders; break
    case "takeRate": cmp = a.takeRate - b.takeRate; break
    case "aov": cmp = a.aov - b.aov; break
    case "revenue": cmp = a.revenue - b.revenue; break
  }
  return dir === "asc" ? cmp : -cmp
}

// ─── FilterRow ────────────────────────────────────────────────────────────

function FilterRow({ label, options, selected, onChange, isOpen, onToggle }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void; isOpen: boolean; onToggle: () => void
}) {
  const [filterText, setFilterText] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const sorted = [...options].sort((a, b) => a.localeCompare(b))
  const allSelected = selected.length >= sorted.length && sorted.every((o) => selected.includes(o))
  const filtered = filterText ? sorted.filter((o) => o.toLowerCase().includes(filterText.toLowerCase())) : sorted
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt])
  }
  const displayValue = selected.length === 0 || allSelected ? "All" : selected.length <= 2 ? selected.join(", ") : `${selected.length} selected`

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) onToggle()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen, onToggle])

  useEffect(() => {
    if (selected.length === 0 && options.length > 0) onChange([...options])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={dropdownRef}>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      <button type="button" onClick={() => { onToggle(); setFilterText("") }}
        className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors", isOpen ? "border-amber-400 ring-1 ring-amber-400" : "hover:border-foreground/20")}>
        <span className={cn("truncate", allSelected && "text-muted-foreground")}>{displayValue}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="mt-1 border rounded-lg bg-background shadow-sm overflow-hidden">
          <div className="px-2 pt-2 pb-1">
            <input type="text" placeholder={`Search ${label.toLowerCase()}...`} value={filterText} onChange={(e) => setFilterText(e.target.value)}
              className="w-full text-sm px-2.5 py-1.5 rounded-md border bg-background outline-none focus:ring-1 focus:ring-amber-400" autoFocus />
          </div>
          <div className="flex items-center justify-between px-3 py-1.5">
            <button type="button" onClick={() => onChange([...sorted])} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">Select all</button>
            <button type="button" onClick={() => onChange([])} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">Clear</button>
          </div>
          <div className="py-1 max-h-48 overflow-y-auto border-t border-border/50">
            {filtered.length === 0 ? <p className="px-3 py-2 text-sm text-muted-foreground">No matches</p> : filtered.map((opt) => (
              <label key={opt} className="flex items-start gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sort header ──────────────────────────────────────────────────────────

function SortHeader({ label, sortKey: sk, currentSort, currentDir, onSort, align = "left", tooltip }: {
  label: string; sortKey: OfferSortKey; currentSort: OfferSortKey; currentDir: SortDir; onSort: (k: OfferSortKey) => void; align?: "left" | "right"; tooltip?: string
}) {
  const active = currentSort === sk
  return (
    <th className={cn("font-medium text-foreground px-4 py-3 text-xs cursor-pointer select-none hover:text-foreground/80 transition-colors whitespace-nowrap", align === "right" ? "text-right" : "text-left")} onClick={() => onSort(sk)}>
      <span className={cn("inline-flex items-center gap-1", align === "right" && "justify-end")}>
        {label}
        {tooltip && (
          <span className="relative group">
            <Info className="h-3 w-3 text-muted-foreground/40" />
            <span className="absolute left-0 top-full mt-1.5 px-3 py-2 rounded-lg border bg-background shadow-md text-xs text-foreground font-normal text-left w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-normal" style={{ zIndex: 99999 }}>{tooltip}</span>
          </span>
        )}
        {active && (currentDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </span>
    </th>
  )
}

// ─── Group by ─────────────────────────────────────────────────────────────

type OfferGroupBy = "none" | "product" | "offerItems" | "pageType"

interface GroupByCategory { label: string; options: { key: OfferGroupBy; label: string }[] }
const GROUP_BY_CATEGORIES: GroupByCategory[] = [
  { label: "Offer", options: [{ key: "product", label: "Product" }, { key: "offerItems", label: "Offer Items" }, { key: "pageType", label: "Page Type" }] },
]
const ALL_GROUP_OPTIONS = GROUP_BY_CATEGORIES.flatMap((c) => c.options)

function GroupBySelect({ value, onChange }: { value: OfferGroupBy; onChange: (v: OfferGroupBy) => void }) {
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
          <div className="absolute right-0 top-full mt-2 w-56 bg-background border rounded-lg shadow-lg py-1 z-[9999]">
            <button type="button" onClick={() => { onChange("none"); setOpen(false) }} className={cn("w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors", value === "none" && "bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400")}>None</button>
            {GROUP_BY_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="border-t border-border/50 mt-1" />
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{cat.label}</p>
                {cat.options.map((opt) => (
                  <button key={opt.key} type="button" onClick={() => { onChange(opt.key); setOpen(false) }} className={cn("w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors", value === opt.key && "bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/30 dark:text-amber-400")}>{opt.label}</button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Offer Insights ───────────────────────────────────────────────────────

interface OfferInsight {
  adName: string
  insight: string
  date: string
  observationHeadline: string
  observationBullets: string[]
}

// Keyed by "offerName|price" — plain-English observations about what was tried and what changed
const OFFER_INSIGHTS: Record<string, OfferInsight[]> = {
  "GlowSerum Pro × 1|47": [
    { adName: "", insight: "Pricing GlowSerum Pro × 1 at $47 instead of $45 decreased take rate by 0.4% (3.1% vs. 3.5%)", date: "2026-04-14T08:00:00", observationHeadline: "Price sensitivity at the single-unit level", observationBullets: ["The $2 increase crossed a price-sensitivity threshold where meaningfully fewer single-unit buyers converted"] },
  ],
  "GlowSerum Pro × 2|94": [
    { adName: "", insight: "Pricing GlowSerum Pro × 2 at $94 instead of $90 decreased take rate by 0.3% (4.1% vs. 4.4%)", date: "2026-04-14T09:00:00", observationHeadline: "Price threshold for this bundle size", observationBullets: ["The $4 increase crossed a price threshold for this bundle size"] },
    { adName: "", insight: "Customers who chose GlowSerum Pro × 2 at $94 spent an average of $105 — $11 of additional items at checkout", date: "2026-04-13T11:00:00", observationHeadline: "Modest checkout attach at mid-bundle", observationBullets: ["Mid-bundle buyers showed modest willingness to add small extras on top of the primary purchase"] },
  ],
  "GlowSerum Pro × 3|141": [
    { adName: "", insight: "Pricing GlowSerum Pro × 3 at $141 instead of $135 decreased take rate by 0.1% (2.6% vs. 2.7%)", date: "2026-04-14T10:00:00", observationHeadline: "Minimal price effect at top tier", observationBullets: ["The price change had minimal effect, suggesting buyers at this level are selecting for the largest bundle regardless of small price variations"] },
    { adName: "", insight: "Customers who chose GlowSerum Pro × 3 at $141 spent an average of $159 — $18 of additional items at checkout", date: "2026-04-13T14:00:00", observationHeadline: "Largest per-order attach of GlowSerum sales page options", observationBullets: ["Top-bundle buyers showed the largest per-order attach of the GlowSerum sales page options"] },
  ],
  "GlowSerum Pro × 1|45": [
    { adName: "", insight: "Pricing GlowSerum Pro × 1 at $45 instead of $47 increased take rate by 0.4% (3.5% vs. 3.1%) and generated 57% more orders", date: "2026-04-13T08:00:00", observationHeadline: "Real price threshold between $45 and $47", observationBullets: ["The $2 decrease pulled substantially more single-unit buyers, indicating a real price threshold between $45 and $47"] },
    { adName: "", insight: "Pairing GlowSerum Pro × 1 at $45 with GlowSerum Pro × 2 at $90 as the middle option increased the middle option's take rate to 5.1%", date: "2026-04-12T09:00:00", observationHeadline: "Clean 2x price relationship drives middle-option performance", observationBullets: ["The highest of any GlowSerum configuration — the clean 2x price relationship made the middle option feel like the best value"] },
  ],
  "GlowSerum Pro × 2|90": [
    { adName: "", insight: "Pricing GlowSerum Pro × 2 at $90 instead of $94 increased take rate by 0.3% (4.4% vs. 4.1%) and generated 72% more orders", date: "2026-04-14T09:30:00", observationHeadline: "Price threshold crossed at $90", observationBullets: ["The $4 decrease crossed a price threshold that unlocked substantially more volume"] },
    { adName: "", insight: "Pairing GlowSerum Pro × 2 at $90 with GlowSerum Pro × 1 at $45 as the cheaper option increased take rate to 5.1%", date: "2026-04-13T10:30:00", observationHeadline: "Best-performing configuration for this offer", observationBullets: ["The 2x price step between the two options made the $90 bundle feel like a clear upgrade without being a stretch"] },
    { adName: "", insight: "Customers who chose GlowSerum Pro × 2 at $90 spent an average of $100 — $10 of additional items at checkout", date: "2026-04-12T11:00:00", observationHeadline: "Consistent attach across configurations", observationBullets: ["The attach behavior stayed consistent across every configuration this offer appeared in"] },
  ],
  "GlowSerum Pro × 3|135": [
    { adName: "", insight: "Pricing GlowSerum Pro × 3 at $135 instead of $141 increased take rate by 0.1% (2.7% vs. 2.6%)", date: "2026-04-12T11:00:00", observationHeadline: "Limited effect at top tier", observationBullets: ["The price drop had limited effect, suggesting further price reduction wouldn't meaningfully grow volume at this bundle size"] },
    { adName: "", insight: "Customers who chose GlowSerum Pro × 3 at $135 spent an average of $149 — $14 of additional items at checkout", date: "2026-04-11T14:00:00", observationHeadline: "Lower attach from more price-conscious buyers", observationBullets: ["Top-bundle buyers at the lower price showed slightly lower attach than those at $141, consistent with more price-conscious buyers keeping overall spend down"] },
  ],
  "GlowSerum Pro × 3 + Daily Moisturizer × 1|166": [
    { adName: "", insight: "Selling a GlowSerum Pro × 3 + Daily Moisturizer × 1 bundle at $166 instead of a plain GlowSerum Pro × 3 at $141 decreased take rate by 0.2% but increased revenue by $5,566", date: "2026-04-13T14:00:00", observationHeadline: "Bundle trades take rate for higher revenue per order", observationBullets: ["The bundle converted slightly fewer buyers but each one spent meaningfully more"] },
    { adName: "", insight: "Customers who chose GlowSerum Pro × 3 + Daily Moisturizer × 1 at $166 spent an average of $184 — $18 of additional items at checkout", date: "2026-04-12T15:00:00", observationHeadline: "Routine-completion framing drives attach", observationBullets: ["The moisturizer addition encouraged customers to complete their skincare routine rather than trade up to a bigger bundle"] },
  ],
  "GlowSerum Pro × 1 + Daily Moisturizer × 1|75": [
    { adName: "", insight: "Selling a GlowSerum Pro × 1 + Daily Moisturizer × 1 bundle at $75 produced a 4.0% take rate — close to a plain GlowSerum Pro × 2 at $94 (4.1%)", date: "2026-04-12T15:00:00", observationHeadline: "Category bundling competes with quantity bundling", observationBullets: ["Buyers at this price range responded equally well to adding a complementary product as they did to buying two of the same"] },
    { adName: "", insight: "Customers who chose GlowSerum Pro × 1 + Daily Moisturizer × 1 at $75 spent an average of $83 — $8 of additional items at checkout", date: "2026-04-11T14:00:00", observationHeadline: "Bundle treated as complete purchase", observationBullets: ["The small add-on suggests buyers treated the bundle as a complete purchase rather than a starting point"] },
  ],
  "GlowSerum Pro × 3 + Daily Moisturizer × 1|159": [
    { adName: "", insight: "Pricing the GlowSerum Pro × 3 + Daily Moisturizer × 1 bundle at $159 instead of $166 increased take rate by 0.2% and generated $5,444 more in revenue", date: "2026-04-13T12:00:00", observationHeadline: "Sub-$160 threshold pulls in additional buyers", observationBullets: ["The $7 decrease crossed a sub-$160 threshold that pulled in buyers who didn't convert at the higher price"] },
    { adName: "", insight: "Customers who chose GlowSerum Pro × 3 + Daily Moisturizer × 1 at $159 spent an average of $181 — $22 of additional items at checkout", date: "2026-04-12T14:00:00", observationHeadline: "Largest attach of any GlowSerum sales page configuration", observationBullets: ["The commitment to a multi-product bundle opened customers to further additions"] },
  ],
  "GlowSerum Pro × 2|91": [
    { adName: "", insight: "Positioning GlowSerum Pro × 2 at $91 as a post-purchase upsell increased take rate to 21.4% — roughly 5x the same offer's take rate on the sales page", date: "2026-04-10T09:00:00", observationHeadline: "Already-committed buyers show much less price resistance", observationBullets: ["Buyers who already committed to an initial purchase showed much less price resistance to a second related offer"] },
    { adName: "", insight: "Pricing GlowSerum Pro × 2 at $91 instead of $94 on the upsell page increased take rate by 3% (21.4% vs. 18.4%)", date: "2026-04-09T15:00:00", observationHeadline: "Small price difference meaningfully shifted upsell conversion", observationBullets: ["Even a small price difference meaningfully shifted conversion at the upsell position"] },
  ],
  "GlowSerum Pro × 2|94_upsell": [
    { adName: "", insight: "Pricing GlowSerum Pro × 2 at $94 instead of $91 on the upsell page decreased take rate by 3% (18.4% vs. 21.4%)", date: "2026-04-09T15:30:00", observationHeadline: "The $3 difference crossed a threshold at the upsell position", observationBullets: ["The $3 difference crossed a threshold that made this the weaker-performing price at the upsell position"] },
  ],
  "Down Alternative Pillow × 1|125": [
    { adName: "", insight: "Pricing Down Alternative Pillow × 1 at $125 instead of $120 decreased take rate by 0.3% (2.8% vs. 3.1%) and generated 59% fewer orders", date: "2026-04-14T11:00:00", observationHeadline: "Meaningful threshold for single-pillow buyers", observationBullets: ["The $5 increase crossed a meaningful threshold for single-pillow buyers"] },
    { adName: "", insight: "Customers who chose the single pillow at $125 spent an average of $141 — $16 of additional items at checkout", date: "2026-04-13T10:00:00", observationHeadline: "Single-pillow buyers add small items but don't trade up", observationBullets: ["Consistent with shoppers looking for exactly one pillow"] },
  ],
  "Down Alternative Pillow × 2|250": [
    { adName: "", insight: "Pricing Down Alternative Pillow × 2 at $250 instead of $239 decreased take rate by 0.4% (4.5% vs. 4.9%) and cut revenue by more than half", date: "2026-04-14T10:30:00", observationHeadline: "Psychological threshold near $240", observationBullets: ["The $11 increase crossed a psychological threshold near $240 where buyer willingness dropped sharply"] },
    { adName: "", insight: "Customers who chose Down Alternative Pillow × 2 at $250 spent an average of $275 — $25 of additional items at checkout", date: "2026-04-13T11:00:00", observationHeadline: "Consistent mid-sized attach", observationBullets: ["The 2-pack buyer profile showed consistent mid-sized attach regardless of which configuration the offer appeared in"] },
  ],
  "Down Alternative Pillow × 3|374": [
    { adName: "", insight: "Customers who chose Down Alternative Pillow × 3 at $374 spent an average of $423 — $49 of additional items at checkout", date: "2026-04-14T13:00:00", observationHeadline: "Largest per-order attach of any pillow configuration", observationBullets: ["Consistent with upmarket buyers being more comfortable adding extras to an already substantial order"] },
  ],
  "Down Alternative Pillow × 1|120": [
    { adName: "", insight: "Pricing Down Alternative Pillow × 1 at $120 instead of $125 increased take rate by 0.3% (3.1% vs. 2.8%) and generated 142% more orders", date: "2026-04-13T11:00:00", observationHeadline: "Meaningful psychological break at sub-$125", observationBullets: ["The $5 decrease unlocked substantially more single-pillow buyers"] },
    { adName: "", insight: "Customers who chose Down Alternative Pillow × 1 at $120 spent an average of $131 — $11 of additional items at checkout", date: "2026-04-12T10:00:00", observationHeadline: "Lower price attracts more budget-conscious buyers", observationBullets: ["The smaller attach compared to the $125 version suggests the lower price attracts more budget-conscious buyers who keep their basket tighter"] },
  ],
  "Down Alternative Pillow × 2|239": [
    { adName: "", insight: "Pricing Down Alternative Pillow × 2 at $239 instead of $250 increased take rate by 0.4% (4.9% vs. 4.5%) and more than doubled revenue", date: "2026-04-14T10:30:00", observationHeadline: "Psychological break near $240 unlocked a much larger buyer pool", observationBullets: ["The $11 decrease crossed a psychological break near $240 that unlocked a much larger buyer pool"] },
    { adName: "", insight: "Selling a Pillow × 3 + Sleep Mask bundle at $385 as the top option instead of a plain Pillow × 3 at $374 increased Down Alternative Pillow × 2's share of orders by 6% (54% vs. 48%)", date: "2026-04-12T11:00:00", observationHeadline: "Bigger top-tier step pushes buyers toward the comfortable middle", observationBullets: ["Making the top tier feel like a bigger step pushed more buyers toward the 2-pack as a comfortable middle choice"] },
  ],
  "Down Alternative Pillow × 3|359": [
    { adName: "", insight: "Pricing Down Alternative Pillow × 3 at $359 instead of $374 increased take rate by 0.3% (2.3% vs. 2.0%)", date: "2026-04-11T13:00:00", observationHeadline: "$15 decrease pulled in additional top-bundle buyers", observationBullets: ["The $15 decrease pulled in a small additional share of top-bundle buyers at an otherwise hesitant price point"] },
    { adName: "", insight: "Customers who chose Down Alternative Pillow × 3 at $359 spent an average of $402 — $43 of additional items at checkout", date: "2026-04-10T14:00:00", observationHeadline: "Strong attach behavior even at reduced price", observationBullets: ["Even at the reduced price, 3-pack buyers showed consistently strong attach behavior"] },
  ],
  "Down Alternative Pillow × 3 + Sleep Mask × 1|385": [
    { adName: "", insight: "Selling a Pillow × 3 + Sleep Mask bundle at $385 instead of a plain Pillow × 3 at $374 decreased take rate by 0.2% (1.8% vs. 2.0%) but increased AOV by $9", date: "2026-04-09T11:00:00", observationHeadline: "Bundle sold to fewer buyers but those who took it spent more", observationBullets: ["The bundle sold to fewer buyers but those who took it spent more per order"] },
    { adName: "", insight: "Customers who chose Down Alternative Pillow × 3 + Sleep Mask × 1 at $385 spent an average of $431 — $46 of additional items at checkout", date: "2026-04-08T11:00:00", observationHeadline: "Bundle didn't reduce downstream add-on behavior", observationBullets: ["The bundle didn't reduce downstream checkout add-on behavior despite already starting with a higher baseline order value"] },
  ],
  "Down Alternative Pillow × 3 + Sleep Mask × 1|369": [
    { adName: "", insight: "Pricing the Pillow × 3 + Sleep Mask bundle at $369 instead of $385 increased take rate by 0.3% (2.1% vs. 1.8%)", date: "2026-04-08T10:00:00", observationHeadline: "$16 price drop unlocked additional top-tier acceptance", observationBullets: ["The $16 price drop unlocked additional top-tier acceptance without changing what was in the bundle"] },
  ],
  "Down Alternative Pillow × 2|247": [
    { adName: "", insight: "Positioning Down Alternative Pillow × 2 at $247 as a post-purchase upsell produced a 12.8% take rate — roughly 3x the same bundle's sales page rate", date: "2026-04-12T10:00:00", observationHeadline: "Single-pillow buyers willing to add a second at upsell", observationBullets: ["Single-pillow buyers showed meaningful willingness to add a second pillow when presented at the upsell moment"] },
    { adName: "", insight: "Customers who accepted Down Alternative Pillow × 2 at $247 as an upsell spent an average of $368 in total — effectively doubling their basket from the initial single-pillow intent", date: "2026-04-11T10:00:00", observationHeadline: "Upsell buyers doubled their basket size", observationBullets: ["These buyers effectively doubled their basket size from the initial single-pillow intent"] },
  ],
  "Daily Moisturizer × 1|26": [
    { adName: "", insight: "Positioning Daily Moisturizer × 1 at $26 as a post-purchase upsell produced a 26.6% take rate — the highest upsell rate in the account", date: "2026-04-11T14:30:00", observationHeadline: "Low price + routine-completion pairing drives near-automatic acceptance", observationBullets: ["The combination of a low price and a natural routine-completion pairing made this near-automatic for skincare buyers"] },
    { adName: "", insight: "Showing Daily Moisturizer × 1 at $26 after a GlowSerum bundle purchase instead of a single-unit purchase increased take rate by 2x", date: "2026-04-10T14:00:00", observationHeadline: "Larger skincare purchases prime buyers for routine completion", observationBullets: ["Buyers who already committed to a larger skincare purchase were much more likely to complete their routine with an additional product"] },
    { adName: "", insight: "Showing Daily Moisturizer × 1 at $26 on orders over $200 instead of orders under $150 increased take rate by 12% (31% vs. 19%)", date: "2026-04-09T14:00:00", observationHeadline: "Larger cart sizes show less price sensitivity to small add-ons", observationBullets: ["Larger cart sizes showed noticeably less price sensitivity to small add-ons"] },
  ],
  "Recovery Kit × 1|61": [
    { adName: "", insight: "Positioning Recovery Kit × 1 at $61 on the upsell page instead of at checkout increased take rate by 9.4% (18.6% vs. 9.2%)", date: "2026-04-10T16:45:00", observationHeadline: "Dedicated upsell page gave buyers the consideration time a $61 item needs", observationBullets: ["Checkout's faster pace didn't support the consideration this price point needs"] },
    { adName: "", insight: "Showing Recovery Kit × 1 at $61 after a pillow purchase instead of a skincare purchase increased take rate by 13% (24% vs. 11%)", date: "2026-04-09T16:00:00", observationHeadline: "Sleep and comfort buyers responded strongly", observationBullets: ["Sleep and comfort buyers responded strongly to the Recovery Kit's positioning in ways skincare buyers didn't"] },
  ],
  "Extended Warranty × 1|9.99": [
    { adName: "", insight: "Positioning Extended Warranty × 1 at $9.99 at checkout produced an 18.1% take rate", date: "2026-04-14T12:00:00", observationHeadline: "Low price + perceived protection value drives consistent acceptance", observationBullets: ["The combination of a low absolute price and perceived protection value produced consistent acceptance without requiring significant consideration"] },
  ],
  "Shipping Protection × 1|4.99": [
    { adName: "", insight: "Positioning Shipping Protection × 1 at $4.99 at checkout produced a 64.2% take rate — the highest take rate of any offer in the account", date: "2026-04-14T12:00:00", observationHeadline: "Near-default acceptance at the $5 price point", observationBullets: ["The $5 price combined with shipping risk messaging made this operate closer to a default selection than a considered add-on"] },
  ],
  "Sleep Mask × 1|14": [
    { adName: "", insight: "Showing Sleep Mask × 1 at $14 on orders over $200 instead of orders under $150 increased take rate by 13% (31% vs. 18%)", date: "2026-04-13T09:15:00", observationHeadline: "Larger cart sizes show significantly lower price sensitivity", observationBullets: ["Larger cart sizes showed significantly lower price sensitivity to the small checkout add-on"] },
    { adName: "", insight: "Sleep Mask × 1 at $14 performed strongest as a checkout add-on after pillow purchases", date: "2026-04-12T09:00:00", observationHeadline: "Category adjacency drives sleep accessory acceptance", observationBullets: ["Consistent with buyers completing a sleep-focused basket rather than adding unrelated items"] },
  ],
  "Night Cream × 1|36": [
    { adName: "", insight: "Night Cream × 1 at $36 produced a 21.9% take rate on the upsell page, performing strongest after skincare-focused primary purchases", date: "2026-04-12T14:00:00", observationHeadline: "Skincare buyers accept skincare upsells at higher rates", observationBullets: ["Category adjacency shapes acceptance — the $36 price point sits in the comfortable range for post-purchase add-ons"] },
  ],
  "Facial Mist × 1|21": [
    { adName: "", insight: "Facial Mist × 1 at $21 produced a 30.1% take rate on the upsell page — the second-highest upsell take rate after Daily Moisturizer", date: "2026-04-11T10:00:00", observationHeadline: "Low price + routine completion drives strong acceptance", observationBullets: ["The $21 price point triggers minimal price resistance in post-purchase context"] },
  ],
}

function renderInsightText(text: string, offerLabel: string): React.ReactNode {
  const parts = text.split("{offer}")
  if (parts.length === 1) return text
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && <span className="font-semibold text-amber-700 dark:text-amber-400">{offerLabel}</span>}
    </React.Fragment>
  ))
}

// ─── Offer detail ─────────────────────────────────────────────────────────

function OfferDetail({ offer }: { offer: AggregatedOffer }) {
  const totalQty = offer.products.reduce((s, p) => s + p.quantity, 0)
  const shopifyTotal = shopifyTotalOf(offer.products)

  // Proportionally allocate sell price across products by shopify weight
  const productRows = offer.products.map((p) => {
    const catalogEntry = PRODUCT_CATALOG[p.productId]
    const name = catalogEntry?.name ?? p.productId
    const shopifyPerUnit = catalogEntry?.shopifyPrice ?? 0
    const weight = shopifyPerUnit * p.quantity
    const lineTotal = shopifyTotal > 0 ? (weight / shopifyTotal) * offer.price : offer.price / offer.products.length
    const unitSellPrice = p.quantity > 0 ? lineTotal / p.quantity : 0
    return { name, productId: p.productId, quantity: p.quantity, shopifyPerUnit, unitSellPrice, lineTotal }
  })

  const subGroups = getPageOffersSubGroups(offer)

  // Insights for this specific offer composition + price
  const insightKey = `${offer.name}|${offer.price}`
  const ptSuffix = offer.pageType === "Upsell Page" ? "_upsell" : offer.pageType === "Checkout Page" ? "_checkout" : ""
  const insightRows = (ptSuffix ? OFFER_INSIGHTS[insightKey + ptSuffix] : null) ?? OFFER_INSIGHTS[insightKey] ?? []
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null)
  const offerLabel = `${offer.name} ($${offer.price.toFixed(2)})`

  return (
    <div className="bg-muted px-6 py-5">
      <div className="rounded-xl border bg-background p-5 space-y-5">
        {/* Offer Items */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Offer Items</p>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Product</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Qty</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Shopify Price</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Sell Price</th>
                  <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((p, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">IMG</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">Product ID: {"{shopify_product_id}"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{p.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">${p.shopifyPerUnit.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">${p.unitSellPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">${p.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/50 font-semibold text-sm">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totalQty}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right tabular-nums">${offer.price.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Insights */}
        {insightRows.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Insights</p>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 36 }} />
                </colgroup>
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Insight</th>
                    <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Date</th>
                    <th className="px-2 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {insightRows.map((ins, i) => {
                    const isInsExpanded = expandedInsight === i
                    return (
                      <React.Fragment key={i}>
                        <tr
                          className={cn("border-b cursor-pointer transition-colors", isInsExpanded ? "bg-muted/50 border-l-2 border-l-amber-400" : "hover:bg-muted/30 border-l-2 border-l-transparent")}
                          onClick={() => setExpandedInsight(isInsExpanded ? null : i)}
                        >
                          <td className="px-4 py-3"><p className="text-sm text-foreground truncate">{renderInsightText(ins.insight, offerLabel)}</p></td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-foreground">
                              {new Date(ins.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(ins.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} PDT
                            </p>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isInsExpanded && "rotate-90")} />
                          </td>
                        </tr>
                        {isInsExpanded && (
                          <tr className="border-b">
                            <td colSpan={3} className="p-0">
                              <div className="px-6 py-4 border-l-2 border-l-amber-400">
                                <p className="text-sm font-semibold text-foreground mb-3">{renderInsightText(ins.observationHeadline, offerLabel)}</p>
                                <ul className="text-sm text-foreground space-y-2 list-disc list-inside">
                                  {ins.observationBullets.map((b, j) => <li key={j} className="leading-relaxed">{renderInsightText(b, offerLabel)}</li>)}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compare Offer Configurations */}
        {subGroups.length > 0 && (() => {
          const pageOffersGroups = subGroups.map((sg, i) => ({
            key: sg.configurationId,
            label: `Configuration ${String.fromCharCode(65 + i)}`,
            count: sg.offers.length,
            items: sg.offers,
            totalViews: sg.totalViews,
            totalRevenue: sg.totalRevenue,
          }))

          return (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground">Compare Offer Configurations</p>
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                  <div className="absolute left-0 top-full mt-1.5 px-3 py-2 rounded-lg border bg-background shadow-md text-xs text-foreground text-left w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" style={{ zIndex: 99999 }}>
                    Compare how this offer performed across different page configurations it was presented on.
                  </div>
                </div>
              </div>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="text-left font-medium text-foreground px-4 py-3 text-xs">Offer</th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">Sell Price</th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">AOV</th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">Orders</th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">
                        <span className="inline-flex items-center gap-1 justify-end">
                          Distribution
                          <span className="relative group">
                            <Info className="h-3 w-3 text-muted-foreground/40" />
                            <span className="absolute left-0 top-full mt-1.5 px-3 py-2 rounded-lg border bg-background shadow-md text-xs text-foreground font-normal text-left w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-normal" style={{ zIndex: 99999 }}>Share of total orders on this page captured by each offer.</span>
                          </span>
                        </span>
                      </th>
                      <th className="text-right font-medium text-foreground px-4 py-3 text-xs">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageOffersGroups.map((group) => (
                      <React.Fragment key={group.key}>
                        <tr className="bg-muted border-l-2 border-l-foreground/20">
                          <td colSpan={6} className="px-4 py-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-foreground">{group.label}</span>
                              <span className="text-xs text-muted-foreground">{group.totalViews.toLocaleString()} views · ${group.totalRevenue.toLocaleString()} revenue</span>
                            </div>
                          </td>
                        </tr>
                        {group.items.map((o) => (
                            <tr key={`${group.key}-${o.signature}`} className={cn("border-b border-l-2 border-l-transparent", o.isParent && "bg-amber-50/50 dark:bg-amber-950/20 border-l-amber-400")}>
                              <td className="pl-8 pr-4 py-3 text-sm text-foreground">
                                {o.name}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">${o.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right tabular-nums text-foreground">${o.revenuePerCustomer.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right tabular-nums text-foreground">{o.orders.toLocaleString()}</td>
                              <td className="px-4 py-1.5 text-right">
                                <div className="inline-flex items-center justify-end">
                                  <div className="relative inline-flex items-center justify-center" style={{ width: 30, height: 30 }}>
                                    <svg width={30} height={30} className="shrink-0">
                                      <circle cx={15} cy={15} r={12} stroke="currentColor" className="text-muted/40" strokeWidth={2.5} fill="none" />
                                      <circle cx={15} cy={15} r={12} stroke={o.distribution >= 40 ? "#10b981" : o.distribution >= 20 ? "#f59e0b" : "#94a3b8"} strokeWidth={2.5} fill="none" strokeDasharray={2 * Math.PI * 12} strokeDashoffset={2 * Math.PI * 12 * (1 - o.distribution / 100)} strokeLinecap="round" transform="rotate(-90 15 15)" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-[9px] tabular-nums font-semibold leading-none text-foreground">{o.distribution.toFixed(0)}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">${o.revenue.toLocaleString()}</td>
                            </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function OffersPage() {
  const [search, setSearch] = useState("")
  const [groupBy, setGroupBy] = useState<OfferGroupBy>("pageType")
  const [sortKey, setSortKey] = useState<OfferSortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [expandedSig, setExpandedSig] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  const [productFilters, setProductFilters] = useState<string[]>([])
  const [offerItemsFilters, setOfferItemsFilters] = useState<string[]>([])
  const [pageTypeFilters, setPageTypeFilters] = useState<string[]>([])

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false) }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSort = (key: OfferSortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  const clearAllFilters = () => { setProductFilters([]); setOfferItemsFilters([]); setPageTypeFilters([]) }

  const isAll = (sel: string[], opts: string[]) => sel.length > 0 && sel.length >= opts.length && opts.every((o) => sel.includes(o))
  const activeFilters = [
    ...(isAll(productFilters, PRODUCT_OPTIONS) ? [] : productFilters.map((f) => ({ key: `product:${f}`, label: `Product: ${f}`, clear: () => setProductFilters((p) => p.filter((x) => x !== f)) }))),
    ...(isAll(offerItemsFilters, OFFER_ITEMS_OPTIONS) ? [] : offerItemsFilters.map((f) => ({ key: `offer:${f}`, label: `Offer: ${f}`, clear: () => setOfferItemsFilters((p) => p.filter((x) => x !== f)) }))),
    ...(isAll(pageTypeFilters, PAGE_TYPE_OPTIONS) ? [] : pageTypeFilters.map((f) => ({ key: `page:${f}`, label: `Page: ${f}`, clear: () => setPageTypeFilters((p) => p.filter((x) => x !== f)) }))),
  ]

  function groupKeyOf(o: AggregatedOffer): string {
    switch (groupBy) {
      case "product": return o.productGroup
      case "offerItems": return o.name
      case "pageType": return o.pageType
      default: return ""
    }
  }

  const filtered = useMemo(() => {
    let result = OFFERS as AggregatedOffer[]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((o) => o.name.toLowerCase().includes(q) || o.productGroup.toLowerCase().includes(q) || o.pageType.toLowerCase().includes(q) || o.campaign.toLowerCase().includes(q) || o.ad.toLowerCase().includes(q))
    }
    if (productFilters.length > 0) result = result.filter((o) => o.products.some((p) => productFilters.includes(PRODUCT_CATALOG[p.productId]?.name ?? p.productId)))
    if (offerItemsFilters.length > 0) result = result.filter((o) => offerItemsFilters.includes(o.name))
    if (pageTypeFilters.length > 0) result = result.filter((o) => pageTypeFilters.includes(o.pageType))
    return result
  }, [search, productFilters, offerItemsFilters, pageTypeFilters])

  const sorted = useMemo(() => {
    const result = [...filtered]
    if (groupBy === "none") {
      result.sort((a, b) => sortOffers(a, b, sortKey, sortDir))
    } else {
      result.sort((a, b) => {
        const ga = groupKeyOf(a)
        const gb = groupKeyOf(b)
        const groupCmp = ga.localeCompare(gb)
        if (groupCmp !== 0) return groupCmp
        return sortOffers(a, b, sortKey, sortDir)
      })
    }
    return result
  }, [filtered, groupBy, sortKey, sortDir])

  const grouped = useMemo(() => {
    if (groupBy === "none") return [{ key: "all", label: "", count: 0, items: sorted }]

    if (groupBy === "product") {
      const map = new Map<string, AggregatedOffer[]>()
      for (const o of filtered) {
        for (const p of o.products) {
          const pName = PRODUCT_CATALOG[p.productId]?.name ?? p.productId
          if (!map.has(pName)) map.set(pName, [])
          map.get(pName)!.push(o)
        }
      }
      return Array.from(map.entries())
        .map(([key, items]) => ({ key, label: key, count: items.length, items: [...items].sort((a, b) => sortOffers(a, b, sortKey, sortDir)) }))
        .sort((a, b) => a.label.localeCompare(b.label))
    }

    const map = new Map<string, AggregatedOffer[]>()
    for (const o of sorted) {
      const k = groupKeyOf(o)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(o)
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, label: key, count: items.length, items }))
  }, [sorted, filtered, groupBy, sortKey, sortDir])

  // Take rate color scale — min/max per page type from filtered set
  const takeRateRange = useMemo(() => {
    const ranges = new Map<string, { min: number; max: number }>()
    for (const o of filtered) {
      const existing = ranges.get(o.pageType)
      if (existing) {
        existing.min = Math.min(existing.min, o.takeRate)
        existing.max = Math.max(existing.max, o.takeRate)
      } else {
        ranges.set(o.pageType, { min: o.takeRate, max: o.takeRate })
      }
    }
    return ranges
  }, [filtered])

  function takeRateBg(offer: AggregatedOffer): string {
    const range = takeRateRange.get(offer.pageType)
    if (!range || range.max === range.min) return "transparent"
    const t = (offer.takeRate - range.min) / (range.max - range.min)
    // #43c8af = rgb(67, 200, 175) — continuous opacity from 0 (lowest) to 0.5 (highest)
    return `rgba(67, 200, 175, ${(t * 0.5).toFixed(2)})`
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">Offers</h2>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search offers" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-11 text-sm" />
        </div>
        <GroupBySelect value={groupBy} onChange={setGroupBy} />
        <div className="relative shrink-0" ref={filterRef}>
          <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="h-11 gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilters.length}</span>}
          </Button>
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-[22rem] bg-background border rounded-xl shadow-xl p-4 space-y-4" style={{ zIndex: 9999 }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Filters</p>
                {activeFilters.length > 0 && <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear all</button>}
              </div>
              <FilterRow label="Product" options={PRODUCT_OPTIONS} selected={productFilters} onChange={setProductFilters} isOpen={openFilter === "product"} onToggle={() => setOpenFilter(openFilter === "product" ? null : "product")} />
              <FilterRow label="Offer Items" options={OFFER_ITEMS_OPTIONS} selected={offerItemsFilters} onChange={setOfferItemsFilters} isOpen={openFilter === "offerItems"} onToggle={() => setOpenFilter(openFilter === "offerItems" ? null : "offerItems")} />
              <FilterRow label="Page Type" options={PAGE_TYPE_OPTIONS} selected={pageTypeFilters} onChange={setPageTypeFilters} isOpen={openFilter === "pageType"} onToggle={() => setOpenFilter(openFilter === "pageType" ? null : "pageType")} />
            </div>
          )}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((f) => (
            <button key={f.key} onClick={f.clear} className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors">{f.label}<X className="h-3 w-3 text-muted-foreground" /></button>
          ))}
          <button onClick={clearAllFilters} className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-1">Clear all</button>
        </div>
      )}

      <Card className="py-0 gap-0">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm" style={{ tableLayout: "fixed", width: "100%", minWidth: "max-content" }}>
            <colgroup>
              <col style={{ width: 280 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 36 }} />
            </colgroup>
            <thead>
              <tr className="bg-muted border-b">
                <SortHeader label="Offer" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Page Type" sortKey="pageType" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortHeader label="Sell Price" sortKey="price" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" tooltip="The price customers pay for this offer through Velocity." />
                <SortHeader label="Shopify Price" sortKey="shopifyPrice" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" tooltip="The retail price of this offer on the merchant's Shopify store." />
                <SortHeader label="Discount" sortKey="discount" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Views" sortKey="views" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Orders" sortKey="orders" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Take Rate" sortKey="takeRate" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" tooltip="Percentage of views that converted to an order for this offer." />
                <SortHeader label="AOV" sortKey="aov" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Revenue" sortKey="revenue" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">No offers match your filters.</td></tr>
              ) : (
                grouped.map((group) => (
                  <React.Fragment key={group.key}>
                    {group.label && (
                      <tr className="bg-muted border-l-2 border-l-foreground/20">
                        <td colSpan={11} className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {groupBy === "product" ? (
                              <span className={cn("inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full",
                                group.label === "Down Alternative Pillow" ? "bg-amber-100 text-amber-700" :
                                group.label === "GlowSerum Pro" ? "bg-violet-100 text-violet-700" :
                                group.label === "Daily Moisturizer" ? "bg-sky-100 text-sky-700" :
                                group.label === "Recovery Kit" ? "bg-emerald-100 text-emerald-700" :
                                group.label === "Sleep Mask" ? "bg-rose-100 text-rose-700" :
                                group.label === "Shipping Protection" ? "bg-slate-100 text-slate-700" :
                                group.label === "Extended Warranty" ? "bg-orange-100 text-orange-700" :
                                "bg-muted text-foreground"
                              )}>{group.label}</span>
                            ) : (
                              <span className="text-sm font-bold text-foreground">{group.label}</span>
                            )}
                            <span className="text-xs text-muted-foreground">{group.count} {group.count === 1 ? "offer" : "offers"}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {group.items.map((offer) => {
                      const isExpanded = expandedSig === offer.signature
                      const shopTotal = shopifyTotalOf(offer.products)
                      const discountPct = shopTotal > 0 ? ((shopTotal - offer.price) / shopTotal) * 100 : 0
                      return (
                        <React.Fragment key={`${group.key}-${offer.signature}`}>
                          <tr className={cn("border-b cursor-pointer transition-colors", isExpanded ? "bg-muted/50 border-l-2 border-l-amber-400" : "hover:bg-muted/30 border-l-2 border-l-transparent")}
                            onClick={() => setExpandedSig(isExpanded ? null : offer.signature)}>
                            <td className="px-4 py-3"><span className="text-sm text-foreground truncate block">{offer.name}</span></td>
                            <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground">{offer.pageType}</span></td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">${offer.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-foreground">${shopTotal.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                              {discountPct > 0 ? `${discountPct.toFixed(2)}%` : "\u2014"}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-foreground">{offer.views.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-foreground">{offer.orders.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground" style={{ backgroundColor: takeRateBg(offer) }}>{offer.takeRate.toFixed(1)}%</td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">${offer.aov.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">${offer.revenue.toLocaleString()}</td>
                            <td className="px-2 py-3 text-center"><ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} /></td>
                          </tr>
                          {isExpanded && (
                            <tr className="border-b"><td colSpan={11} className="p-0"><OfferDetail offer={offer} /></td></tr>
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
