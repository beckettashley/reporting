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
  headline: string
  body: string
  date: string
}

// Keyed by "offerName|price" — structured headline + body for clean rendering
const OFFER_INSIGHTS: Record<string, OfferInsight[]> = {
  "GlowSerum Pro × 1|47": [
    { headline: "Pricing GlowSerum Pro × 1 at $47 instead of $45 decreased take rate by 0.4%", body: "At 3.1% vs. 3.5%, the $2 increase crossed a price-sensitivity threshold where meaningfully fewer single-unit buyers converted — at current traffic, the margin gained on the higher price doesn't offset the volume lost.", date: "2026-04-14T22:00:00" },
  ],
  "GlowSerum Pro × 2|94": [
    { headline: "Pricing GlowSerum Pro × 2 at $94 instead of $90 decreased take rate by 0.3%", body: "At 4.1% vs. 4.4%, the $4 increase looks small on paper but crosses a price threshold — the $90 version produced $37k more in revenue at the same view volume.", date: "2026-04-14T19:00:00" },
    { headline: "Customers who chose GlowSerum Pro × 2 at $94 spent an average of $105", body: "$11 of additional items at checkout. The attach beyond the bundle itself is where the real margin sits; the bundle price anchors the order, but the downstream add-ons compound it.", date: "2026-04-14T16:00:00" },
  ],
  "GlowSerum Pro × 3|141": [
    { headline: "Customers who chose GlowSerum Pro × 3 at $141 spent an average of $159", body: "$18 of additional items at checkout. The top-tier bundle doesn't just produce higher primary revenue; it produces a buyer who adds more at checkout. The $18 attach alone is meaningful revenue that wouldn't exist if buyers traded down to smaller bundles.", date: "2026-04-14T13:00:00" },
    { headline: "Pricing GlowSerum Pro × 3 at $141 instead of $135 decreased take rate by 0.1%", body: "At 2.6% vs. 2.7%, at this bundle size, the price change barely moved conversion — top-tier buyers are already self-selecting for the largest option regardless of small price variations.", date: "2026-04-14T10:00:00" },
  ],
  "GlowSerum Pro × 1|45": [
    { headline: "Pricing GlowSerum Pro × 1 at $45 instead of $47 increased take rate by 0.4%", body: "At 3.5% vs. 3.1%, and generated 57% more orders. The $2 difference isn't a margin decision — it's a volume threshold. Below $46, the single unit pulls substantially more buyers; above it, volume drops disproportionately.", date: "2026-04-14T07:00:00" },
    { headline: "Pairing GlowSerum Pro × 1 at $45 with GlowSerum Pro × 2 at $90 as the middle option increased the middle option's take rate to 5.1%", body: "the highest of any GlowSerum configuration. The job of this single unit isn't to sell well on its own; it's to make the 2-pack feel like the smart choice. A 2x price step between them does that cleanly.", date: "2026-04-14T04:00:00" },
  ],
  "GlowSerum Pro × 2|90": [
    { headline: "Pricing GlowSerum Pro × 2 at $90 instead of $94 increased take rate by 0.3%", body: "At 4.4% vs. 4.1%, and generated 72% more orders. The $4 decrease unlocked a volume tier that $94 didn't reach — this isn't a gentle price curve, it's a threshold effect near $92.", date: "2026-04-14T01:00:00" },
    { headline: "Pairing GlowSerum Pro × 2 at $90 with GlowSerum Pro × 1 at $45 as the cheaper option increased take rate to 5.1%", body: "the best-performing configuration for this offer. The $45 single isn't anchoring on absolute value; it's anchoring on the 2x ratio to the bundle, making the bundle feel like the clearly better deal.", date: "2026-04-13T22:00:00" },
    { headline: "Customers who chose GlowSerum Pro × 2 at $90 spent an average of $100", body: "$10 of additional items at checkout. The attach behavior stayed consistent across every configuration this offer appeared in, suggesting the attach is a property of this bundle size's buyer, not the page context.", date: "2026-04-13T19:00:00" },
  ],
  "GlowSerum Pro × 3|135": [
    { headline: "Pricing GlowSerum Pro × 3 at $135 instead of $141 increased take rate by 0.1%", body: "At 2.7% vs. 2.6%, the flat response at the top tier suggests further price reduction wouldn't grow volume meaningfully — top-bundle buyers aren't price-shopping within small ranges.", date: "2026-04-13T16:00:00" },
    { headline: "Customers who chose GlowSerum Pro × 3 at $135 spent an average of $149", body: "$14 of additional items at checkout. Buyers at the lower top-tier price show slightly smaller attach than those at $141, consistent with more price-conscious top-tier buyers keeping overall spend down.", date: "2026-04-13T13:00:00" },
  ],
  "GlowSerum Pro × 3 + Daily Moisturizer × 1|166": [
    { headline: "Selling a GlowSerum Pro × 3 + Daily Moisturizer × 1 bundle at $166 instead of a plain GlowSerum Pro × 3 at $141 decreased take rate by 0.2%", body: "At 2.4% vs. 2.6%, but increased revenue by $5,566. The bundle is pulling a slightly narrower slice of buyers, but each buyer spent meaningfully more per order — the tradeoff pays off at this view volume.", date: "2026-04-13T10:00:00" },
    { headline: "Customers who chose GlowSerum Pro × 3 + Daily Moisturizer × 1 at $166 spent an average of $184", body: "$18 of additional items at checkout. The moisturizer doesn't displace other attach; it stacks on top of it, consistent with skincare buyers who frame spending as completing a regimen rather than budgeting against a ceiling.", date: "2026-04-13T07:00:00" },
  ],
  "GlowSerum Pro × 1 + Daily Moisturizer × 1|75": [
    { headline: "Selling a GlowSerum Pro × 1 + Daily Moisturizer × 1 bundle at $75 produced a 4.0% take rate", body: "nearly matching the 4.1% take rate of a plain GlowSerum Pro × 2 at $94 at a comparable price. Buyers respond about equally to \"two of the same\" and \"two complementary products\" at this price range, suggesting the bundle category is flexible at this tier.", date: "2026-04-13T04:00:00" },
    { headline: "Customers who chose GlowSerum Pro × 1 + Daily Moisturizer × 1 at $75 spent an average of $83", body: "$8 of additional items at checkout. The small attach indicates buyers treated the bundle as the complete purchase rather than a starting point.", date: "2026-04-13T01:00:00" },
  ],
  "GlowSerum Pro × 3 + Daily Moisturizer × 1|159": [
    { headline: "Pricing the GlowSerum Pro × 3 + Daily Moisturizer × 1 bundle at $159 instead of $166 increased take rate by 0.2%", body: "At 2.6% vs. 2.4%, and generated $5,444 more in revenue. The $7 decrease crosses a sub-$160 threshold — the price point does as much work as the bundle composition.", date: "2026-04-12T22:00:00" },
    { headline: "Customers who chose GlowSerum Pro × 3 + Daily Moisturizer × 1 at $159 spent an average of $181", body: "$22 of additional items at checkout, the largest attach of any GlowSerum sales page configuration. Committing to a multi-product bundle appears to open buyers to additional items rather than cap their spend.", date: "2026-04-12T19:00:00" },
  ],
  "GlowSerum Pro × 2|91": [
    { headline: "Positioning GlowSerum Pro × 2 at $91 as a post-purchase upsell increased take rate to 21.4%", body: "roughly 5x the same offer's sales page take rate. The upsell position doesn't just catch buyers at a different moment; it catches a fundamentally different buyer — one who has already committed and shows much less price resistance to a related second offer.", date: "2026-04-12T16:00:00" },
    { headline: "Pricing GlowSerum Pro × 2 at $91 instead of $94 on the upsell page increased take rate by 3%", body: "At 21.4% vs. 18.4%, even at the upsell position, a $3 difference moves acceptance meaningfully — price thresholds still matter after conversion, just with different ceilings.", date: "2026-04-12T13:00:00" },
  ],
  "GlowSerum Pro × 2|94_upsell": [
    { headline: "Pricing GlowSerum Pro × 2 at $94 instead of $91 on the upsell page decreased take rate by 3%", body: "At 18.4% vs. 21.4%, the threshold that matters at this bundle size isn't $94 vs. $90 — it's the $91 ceiling for post-purchase acceptance.", date: "2026-04-12T10:00:00" },
  ],
  "Down Alternative Pillow × 1|125": [
    { headline: "Pricing Down Alternative Pillow × 1 at $125 instead of $120 decreased take rate by 0.3%", body: "At 2.8% vs. 3.1%, and generated 59% fewer orders. The $5 difference isn't a gentle slope — it's a psychological break in how buyers evaluate a single-pillow purchase.", date: "2026-04-12T07:00:00" },
    { headline: "Customers who chose the single pillow at $125 spent an average of $141", body: "$16 of additional items at checkout. Single-pillow buyers add small items but don't trade up to bundles, consistent with shoppers who arrived looking for exactly one pillow rather than evaluating their options.", date: "2026-04-12T04:00:00" },
  ],
  "Down Alternative Pillow × 2|250": [
    { headline: "Pricing Down Alternative Pillow × 2 at $250 instead of $239 decreased take rate by 0.4%", body: "At 4.5% vs. 4.9%, and cut revenue by more than half. The $11 difference crosses a threshold near $240 that fundamentally changes buyer willingness — this isn't a pricing decision with a margin tradeoff, it's a cliff.", date: "2026-04-12T01:00:00" },
    { headline: "Customers who chose Down Alternative Pillow × 2 at $250 spent an average of $275", body: "$25 of additional items at checkout. The 2-pack buyer profile shows consistent mid-sized attach regardless of configuration, suggesting this bundle size produces a predictable attach pattern independent of page context.", date: "2026-04-11T22:00:00" },
  ],
  "Down Alternative Pillow × 3|374": [
    { headline: "Customers who chose Down Alternative Pillow × 3 at $374 spent an average of $423", body: "$49 of additional items at checkout, the largest per-order attach of any pillow configuration. The 3-pack doesn't just produce more primary revenue; it produces a buyer with substantially different basket behavior — upmarket buyers treat checkout add-ons as a natural extension of an already committed order.", date: "2026-04-11T19:00:00" },
  ],
  "Down Alternative Pillow × 1|120": [
    { headline: "Pricing Down Alternative Pillow × 1 at $120 instead of $125 increased take rate by 0.3%", body: "At 3.1% vs. 2.8%, and generated 142% more orders. The $5 difference more than doubles the single-pillow buyer pool — sub-$125 is where the mental category \"reasonable single-pillow purchase\" sits.", date: "2026-04-11T16:00:00" },
    { headline: "Customers who chose Down Alternative Pillow × 1 at $120 spent an average of $131", body: "$11 of additional items at checkout. Buyers at this lower price add less than buyers at $125 do, consistent with the lower price attracting a more budget-conscious segment who keeps their basket tight.", date: "2026-04-11T13:00:00" },
  ],
  "Down Alternative Pillow × 2|239": [
    { headline: "Pricing Down Alternative Pillow × 2 at $239 instead of $250 increased take rate by 0.4%", body: "At 4.9% vs. 4.5%, and more than doubled revenue. The $11 decrease doesn't just trim margin — it unlocks a substantially larger buyer pool, meaning the higher price isn't protecting margin, it's capping volume.", date: "2026-04-11T10:00:00" },
    { headline: "Selling a Pillow × 3 + Sleep Mask bundle at $385 as the top option instead of a plain Pillow × 3 at $374 increased Down Alternative Pillow × 2's share of orders by 6%", body: "At 54% vs. 48%, the top-tier offer's job isn't to sell — it's to make the middle option feel like the smart choice. A bundle with visible add-ons does that better than a plain scale-up does.", date: "2026-04-11T07:00:00" },
  ],
  "Down Alternative Pillow × 3|359": [
    { headline: "Pricing Down Alternative Pillow × 3 at $359 instead of $374 increased take rate by 0.3%", body: "At 2.3% vs. 2.0%, the $15 decrease pulls in a small additional share of top-bundle buyers — at the top tier, price movements produce smaller volume shifts than they do at entry or middle tiers.", date: "2026-04-11T04:00:00" },
    { headline: "Customers who chose Down Alternative Pillow × 3 at $359 spent an average of $402", body: "$43 of additional items at checkout. Even at a reduced price, the top-bundle buyer profile maintains its strong attach behavior — attach appears to be a property of the tier choice, not the absolute price.", date: "2026-04-11T01:00:00" },
  ],
  "Down Alternative Pillow × 3 + Sleep Mask × 1|385": [
    { headline: "Selling a Pillow × 3 + Sleep Mask bundle at $385 instead of a plain Pillow × 3 at $374 decreased take rate by 0.2%", body: "At 1.8% vs. 2.0%, but increased AOV by $9. The bundle narrows the buyer pool slightly but the ones it captures spend more per order — worth it at this view volume.", date: "2026-04-10T22:00:00" },
    { headline: "Customers who chose Down Alternative Pillow × 3 + Sleep Mask × 1 at $385 spent an average of $431", body: "$46 of additional items at checkout. Starting from a higher baseline doesn't appear to suppress attach; the bundle's composition and base order value compound rather than trade off.", date: "2026-04-10T19:00:00" },
  ],
  "Down Alternative Pillow × 3 + Sleep Mask × 1|369": [
    { headline: "Pricing the Pillow × 3 + Sleep Mask bundle at $369 instead of $385 increased take rate by 0.3%", body: "At 2.1% vs. 1.8%, the $16 drop unlocks additional top-tier acceptance without changing what's in the bundle — price is doing the lifting, not composition.", date: "2026-04-10T16:00:00" },
  ],
  "Down Alternative Pillow × 2|247": [
    { headline: "Positioning Down Alternative Pillow × 2 at $247 as a post-purchase upsell produced a 12.8% take rate", body: "roughly 3x the same bundle's sales page rate. Single-pillow buyers aren't finished shopping at the sales page; the upsell position captures meaningful trade-up intent that the sales page alone doesn't surface.", date: "2026-04-10T13:00:00" },
    { headline: "Customers who accepted Down Alternative Pillow × 2 at $247 as an upsell spent an average of $368 in total", body: ", combining their initial pillow purchase with the upsell offer. These buyers effectively doubled their basket from their initial single-pillow intent — the upsell didn't convert a different buyer, it expanded the same buyer's order.", date: "2026-04-10T10:00:00" },
  ],
  "Daily Moisturizer × 1|26": [
    { headline: "Positioning Daily Moisturizer × 1 at $26 as a post-purchase upsell produced a 26.6% take rate", body: "the highest upsell rate in the account. A $26 price on a routine-completion pairing operates closer to a default \"yes\" than a considered decision, which is where small-ticket upsells earn their keep.", date: "2026-04-10T07:00:00" },
    { headline: "Showing Daily Moisturizer × 1 at $26 after a GlowSerum bundle purchase instead of a single-unit GlowSerum purchase increased take rate by 2x", body: "The bundle buyer isn't just a larger-cart version of the single-unit buyer — they're a categorically more receptive audience for further skincare, suggesting attach behavior follows commitment level, not just cart size.", date: "2026-04-10T04:00:00" },
    { headline: "Showing Daily Moisturizer × 1 at $26 on orders over $200 instead of orders under $150 increased take rate by 12%", body: "At 31% vs. 19%, larger carts show less price sensitivity to small add-ons — the $26 feels smaller against a bigger order, not because of the absolute price, but because of the relative framing.", date: "2026-04-10T01:00:00" },
  ],
  "Recovery Kit × 1|61": [
    { headline: "Positioning Recovery Kit × 1 at $61 on the upsell page instead of at checkout increased take rate by 9.4%", body: "At 18.6% vs. 9.2%, a $61 item isn't a checkout impulse buy — the checkout position rushes the decision past what the price point requires. The upsell page gives the offer the space it needs.", date: "2026-04-09T22:00:00" },
    { headline: "Showing Recovery Kit × 1 at $61 after a pillow purchase instead of a skincare purchase increased take rate by 13%", body: "At 24% vs. 11%, category adjacency determines acceptance more than cart size or buyer intent — sleep-and-comfort buyers read \"recovery\" as continuous with what they came for; skincare buyers don't.", date: "2026-04-09T19:00:00" },
  ],
  "Extended Warranty × 1|9.99": [
    { headline: "Positioning Extended Warranty × 1 at $9.99 at checkout produced an 18.1% take rate", body: "The combination of sub-$10 absolute price and perceived protection value operates in the \"low-consideration yes\" zone — buyers don't weigh this against other options, they either see the value instantly or skip it.", date: "2026-04-09T16:00:00" },
  ],
  "Shipping Protection × 1|4.99": [
    { headline: "Positioning Shipping Protection × 1 at $4.99 at checkout produced a 64.2% take rate", body: "the highest take rate of any offer in the account. At this price and framing, the offer stops functioning as an add-on decision and starts functioning closer to a default selection — buyers include it unless they actively opt out.", date: "2026-04-09T13:00:00" },
  ],
  "Sleep Mask × 1|14": [
    { headline: "Showing Sleep Mask × 1 at $14 on orders over $200 instead of orders under $150 increased take rate by 13%", body: "At 31% vs. 18%, the $14 price doesn't change; what changes is how large it feels against the rest of the order. On a $200 primary purchase, $14 reads as a small completion; on a $100 primary purchase, it reads as a meaningful addition.", date: "2026-04-09T10:00:00" },
    { headline: "Sleep Mask × 1 at $14 performed strongest as a checkout add-on after pillow purchases", body: ", consistent with buyers completing a sleep-focused basket — category adjacency reinforces the buying logic already in motion.", date: "2026-04-09T07:00:00" },
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
                          <td className="px-4 py-3"><p className="text-sm text-foreground truncate">{renderInsightText(ins.headline, offerLabel)}</p></td>
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
                                <p className="text-sm font-semibold text-foreground mb-2">{renderInsightText(ins.headline, offerLabel)}</p>
                                <p className="text-sm text-foreground leading-relaxed">{renderInsightText(ins.body, offerLabel)}</p>
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
                <SortHeader label="Shopify Price" sortKey="shopifyPrice" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" tooltip="Current sell price in your Shopify store for all offer items." />
                <SortHeader label="Discount" sortKey="discount" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Views" sortKey="views" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Orders" sortKey="orders" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                <SortHeader label="Take Rate" sortKey="takeRate" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" tooltip="Percentage of users who accepted the offer of those shown." />
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
