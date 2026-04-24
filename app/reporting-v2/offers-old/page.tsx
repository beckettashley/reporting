"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { Search, ChevronDown, ChevronUp, ChevronRight, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { V2Header } from "@/components/dashboard/v2-header"
import { V2Sidebar } from "@/components/dashboard/v2-sidebar"

// ─── Types ─────────────────────────────────────────────────────────────────

interface OfferProduct { name: string; quantity: number; unitPrice: number }
interface RelatedInsight { adName: string; adUrl: string; product: string; insight: string; date: string; observationHeadline: string; observationBullets: string[] }

interface OfferRow {
  id: string
  name: string
  products: OfferProduct[]
  productGroup: string
  pageType: "Sales Page" | "Checkout Page" | "Upsell Page"
  price: number
  compareAtPrice?: number
  orders: number
  cvr: number
  takeRate: number
  aov: number
  revenue: number
  date: string
  campaign: string
  adSet: string
  ad: string
  destinationLink: string
  sessions?: number
  attempts?: number
  relatedInsights: RelatedInsight[]
}

// ─── Mock data ─────────────────────────────────────────────────────────────

const ri = (insight: string, adName = "Ingredient story — carousel", product = "GlowSerum Pro", date = "2026-04-12T14:22:00"): RelatedInsight => ({
  adName, adUrl: "https://business.facebook.com/adsmanager/manage/ads", product, insight, date,
  observationHeadline: insight, observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"],
})

const OFFERS: OfferRow[] = [
  // ─── GlowSerum Pro — Sales Page (×1, ×2, ×3 at two prices each + bundle) ──
  { id: "gs_1a", name: "GlowSerum Pro", products: [{ name: "GlowSerum Pro", quantity: 1, unitPrice: 39 }], productGroup: "GlowSerum Pro", pageType: "Sales Page", price: 39, compareAtPrice: 49, orders: 245, cvr: 3.2, takeRate: 18.4, aov: 39, revenue: 9555, date: "2026-04-14T08:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc", sessions: 7656, relatedInsights: [ri("Single-unit serves as price anchor — bundle conversion lifts when single is visible")] },
  { id: "gs_1b", name: "GlowSerum Pro", products: [{ name: "GlowSerum Pro", quantity: 1, unitPrice: 35 }], productGroup: "GlowSerum Pro", pageType: "Sales Page", price: 35, compareAtPrice: 49, orders: 298, cvr: 3.6, takeRate: 22.1, aov: 35, revenue: 10430, date: "2026-04-13T10:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc", sessions: 8278, relatedInsights: [ri("Lower $35 price point lifts CVR 12% vs. $39 — marginal AOV trade-off")] },
  { id: "gs_2a", name: "GlowSerum Pro × 2", products: [{ name: "GlowSerum Pro", quantity: 2, unitPrice: 35 }], productGroup: "GlowSerum Pro", pageType: "Sales Page", price: 70, compareAtPrice: 98, orders: 312, cvr: 4.1, takeRate: 28.6, aov: 70, revenue: 21840, date: "2026-04-14T09:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Before/after UGC — reel", destinationLink: "https://brand.com/exp-123/abc", sessions: 7610, relatedInsights: [ri("2-pack at $70 is the highest-volume GlowSerum offer on the sales page")] },
  { id: "gs_2b", name: "GlowSerum Pro × 2", products: [{ name: "GlowSerum Pro", quantity: 2, unitPrice: 30 }], productGroup: "GlowSerum Pro", pageType: "Sales Page", price: 60, compareAtPrice: 98, orders: 368, cvr: 4.5, takeRate: 32.4, aov: 60, revenue: 22080, date: "2026-04-12T11:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Before/after UGC — reel", destinationLink: "https://brand.com/exp-123/abc", sessions: 8178, relatedInsights: [ri("Deeper discount on 2-pack ($60 vs $70) lifts take rate 4pp but reduces revenue per order")] },
  { id: "gs_3a", name: "GlowSerum Pro × 3", products: [{ name: "GlowSerum Pro", quantity: 3, unitPrice: 30 }], productGroup: "GlowSerum Pro", pageType: "Sales Page", price: 90, compareAtPrice: 147, orders: 198, cvr: 4.8, takeRate: 24.2, aov: 90, revenue: 17820, date: "2026-04-11T14:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc", sessions: 4125, relatedInsights: [ri("3-pack at $90 converts highest CVR of any GlowSerum single-product offer")] },
  { id: "gs_3b", name: "GlowSerum Pro × 3", products: [{ name: "GlowSerum Pro", quantity: 3, unitPrice: 27 }], productGroup: "GlowSerum Pro", pageType: "Sales Page", price: 81, compareAtPrice: 147, orders: 224, cvr: 5.1, takeRate: 26.8, aov: 81, revenue: 18144, date: "2026-04-10T15:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc", sessions: 4392, relatedInsights: [ri("$81 price point on 3-pack pushes CVR to 5.1% — best single-product CVR in account")] },
  // GlowSerum bundle offers
  { id: "gs_b1", name: "GlowSerum Pro × 3 + Daily Moisturizer", products: [{ name: "GlowSerum Pro", quantity: 3, unitPrice: 28 }, { name: "Daily Moisturizer", quantity: 1, unitPrice: 20 }], productGroup: "GlowSerum Pro", pageType: "Sales Page", price: 104, compareAtPrice: 161, orders: 186, cvr: 5.4, takeRate: 22.8, aov: 104, revenue: 19344, date: "2026-04-09T13:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc", sessions: 3444, relatedInsights: [ri("Bundle at $104 outperforms 3-pack alone — moisturizer add lifts AOV $14 with minimal CVR drop"), ri("Bundle offers beat single-unit for value-framed retargeting audiences", "Sleep Drops – Value Prop 03", "Acme Sleep Drops", "2026-04-12T09:45:00")] },
  { id: "gs_b2", name: "GlowSerum Pro × 3 + Daily Moisturizer", products: [{ name: "GlowSerum Pro", quantity: 3, unitPrice: 25 }, { name: "Daily Moisturizer", quantity: 1, unitPrice: 18 }], productGroup: "GlowSerum Pro", pageType: "Sales Page", price: 93, compareAtPrice: 161, orders: 212, cvr: 5.8, takeRate: 25.4, aov: 93, revenue: 19716, date: "2026-04-08T12:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc", sessions: 3655, relatedInsights: [ri("$93 bundle is highest-CVR offer in the account at 5.8% — deeper discount drives commitment")] },
  // ─── Down Alternative Pillow — Sales Page (×1, ×2, ×3 at two prices each + bundle) ──
  { id: "pil_1a", name: "Down Alternative Pillow", products: [{ name: "Down Alternative Pillow", quantity: 1, unitPrice: 115 }], productGroup: "Down Alternative Pillow", pageType: "Sales Page", price: 115, orders: 189, cvr: 2.8, takeRate: 16.2, aov: 115, revenue: 21735, date: "2026-04-13T11:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc", sessions: 6750, relatedInsights: [ri("Single pillow at $115 is the baseline — 2-pack outperforms by 46%", "Pillow Comfort Ad 01", "Down Alternative Pillow", "2026-04-13T11:00:00")] },
  { id: "pil_1b", name: "Down Alternative Pillow", products: [{ name: "Down Alternative Pillow", quantity: 1, unitPrice: 99 }], productGroup: "Down Alternative Pillow", pageType: "Sales Page", price: 99, compareAtPrice: 115, orders: 234, cvr: 3.2, takeRate: 20.1, aov: 99, revenue: 23166, date: "2026-04-12T10:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc", sessions: 7313, relatedInsights: [ri("$99 price point lifts single-pillow CVR from 2.8% to 3.2%", "Pillow Comfort Ad 01", "Down Alternative Pillow", "2026-04-12T10:00:00")] },
  { id: "pil_2a", name: "Down Alternative Pillow × 2", products: [{ name: "Down Alternative Pillow", quantity: 2, unitPrice: 92 }], productGroup: "Down Alternative Pillow", pageType: "Sales Page", price: 184, compareAtPrice: 230, orders: 312, cvr: 4.1, takeRate: 32.4, aov: 184, revenue: 57408, date: "2026-04-14T10:30:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc", sessions: 7610, relatedInsights: [ri("2-pack at $184 is the top revenue pillow offer — anchors the price ladder", "Pillow Comfort Ad 01", "Down Alternative Pillow", "2026-04-14T10:30:00")] },
  { id: "pil_2b", name: "Down Alternative Pillow × 2", products: [{ name: "Down Alternative Pillow", quantity: 2, unitPrice: 82 }], productGroup: "Down Alternative Pillow", pageType: "Sales Page", price: 164, compareAtPrice: 230, orders: 378, cvr: 4.8, takeRate: 38.6, aov: 164, revenue: 61992, date: "2026-04-13T09:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc", sessions: 7875, relatedInsights: [ri("$164 2-pack lifts take rate 6pp vs. $184 — higher volume, slightly lower AOV", "Pillow Comfort Ad 01", "Down Alternative Pillow", "2026-04-13T09:00:00")] },
  { id: "pil_3a", name: "Down Alternative Pillow × 3", products: [{ name: "Down Alternative Pillow", quantity: 3, unitPrice: 80 }], productGroup: "Down Alternative Pillow", pageType: "Sales Page", price: 240, compareAtPrice: 345, orders: 142, cvr: 3.6, takeRate: 18.4, aov: 240, revenue: 34080, date: "2026-04-11T13:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc", sessions: 3944, relatedInsights: [ri("3-pack at $240 has lower take rate but highest AOV — attracts committed buyers", "Pillow Comfort Ad 01", "Down Alternative Pillow", "2026-04-11T13:00:00")] },
  { id: "pil_3b", name: "Down Alternative Pillow × 3", products: [{ name: "Down Alternative Pillow", quantity: 3, unitPrice: 72 }], productGroup: "Down Alternative Pillow", pageType: "Sales Page", price: 216, compareAtPrice: 345, orders: 168, cvr: 4.0, takeRate: 21.2, aov: 216, revenue: 36288, date: "2026-04-10T14:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc", sessions: 4200, relatedInsights: [ri("$216 3-pack lifts volume 18% vs. $240 with proportional revenue gain", "Pillow Comfort Ad 01", "Down Alternative Pillow", "2026-04-10T14:00:00")] },
  // Pillow bundle
  { id: "pil_b1", name: "Down Alternative Pillow × 3 + Sleep Mask", products: [{ name: "Down Alternative Pillow", quantity: 3, unitPrice: 72 }, { name: "Sleep Mask", quantity: 1, unitPrice: 10 }], productGroup: "Down Alternative Pillow", pageType: "Sales Page", price: 226, compareAtPrice: 359, orders: 124, cvr: 3.8, takeRate: 16.8, aov: 226, revenue: 28024, date: "2026-04-09T11:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc", sessions: 3263, relatedInsights: [ri("Sleep mask add-on to 3-pack lifts AOV $10 with minimal take rate impact", "Pillow Comfort Ad 01", "Down Alternative Pillow", "2026-04-09T11:00:00")] },
  { id: "pil_b2", name: "Down Alternative Pillow × 3 + Sleep Mask", products: [{ name: "Down Alternative Pillow", quantity: 3, unitPrice: 66 }, { name: "Sleep Mask", quantity: 1, unitPrice: 8 }], productGroup: "Down Alternative Pillow", pageType: "Sales Page", price: 206, compareAtPrice: 359, orders: 148, cvr: 4.2, takeRate: 19.4, aov: 206, revenue: 30488, date: "2026-04-08T10:00:00", campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc", sessions: 3524, relatedInsights: [ri("$206 bundle beats $226 on volume — 19% more orders at lower price", "Pillow Comfort Ad 01", "Down Alternative Pillow", "2026-04-08T10:00:00")] },
  // Checkout Page
  {
    id: "offer_7", name: "Shipping Protection",
    products: [{ name: "Shipping Protection", quantity: 1, unitPrice: 4.99 }],
    productGroup: "Shipping Protection", pageType: "Checkout Page", price: 4.99,
    orders: 892, cvr: 3.8, takeRate: 64.2, aov: 4.99, revenue: 4451, date: "2026-04-14T12:00:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc",
    attempts: 1389,
    relatedInsights: [
      { adName: "Ingredient story — carousel", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "GlowSerum Pro", insight: "Shipping protection converts at 64% — highest take rate of any checkout offer", date: "2026-04-14T12:00:00", observationHeadline: "Shipping protection converts at 64% — highest take rate of any checkout offer", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
  {
    id: "offer_8", name: "Extended Warranty",
    products: [{ name: "Extended Warranty", quantity: 1, unitPrice: 9.99 }],
    productGroup: "Extended Warranty", pageType: "Checkout Page", price: 9.99,
    orders: 251, cvr: 2.9, takeRate: 18.1, aov: 9.99, revenue: 2507, date: "2026-04-14T12:00:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc",
    attempts: 1387,
    relatedInsights: [
      { adName: "Pillow Comfort Ad 01", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "Down Alternative Pillow", insight: "Warranty take rate is 22% higher on orders over $100", date: "2026-04-14T12:00:00", observationHeadline: "Warranty take rate is 22% higher on orders over $100", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
  {
    id: "offer_9", name: "Sleep Mask Add-On",
    products: [{ name: "Sleep Mask", quantity: 1, unitPrice: 14 }],
    productGroup: "Sleep Mask", pageType: "Checkout Page", price: 14,
    orders: 316, cvr: 3.1, takeRate: 22.8, aov: 14, revenue: 4424, date: "2026-04-13T09:15:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc",
    attempts: 1386,
    relatedInsights: [
      { adName: "Pillow Comfort Ad 01", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "Down Alternative Pillow", insight: "Sleep mask take rate peaks at 28% on pillow 2-pack orders — natural product pairing", date: "2026-04-13T09:15:00", observationHeadline: "Sleep mask take rate peaks at 28% on pillow 2-pack orders — natural product pairing", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
  // Upsell Page
  {
    id: "offer_10", name: "GlowSerum Pro × 2",
    products: [{ name: "GlowSerum Pro", quantity: 2, unitPrice: 22.5 }],
    productGroup: "GlowSerum Pro", pageType: "Upsell Page", price: 45, compareAtPrice: 58,
    orders: 186, cvr: 4.2, takeRate: 22.0, aov: 45, revenue: 8370, date: "2026-04-10T09:00:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Before/after UGC — reel", destinationLink: "https://brand.com/exp-123/abc",
    attempts: 845,
    relatedInsights: [
      { adName: "Sleep Drops – Problem Aware 01", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "Acme Sleep Drops", insight: "GlowSerum upsell take rate is highest (31%) when initial order already contains GlowSerum", date: "2026-04-10T09:00:00", observationHeadline: "GlowSerum upsell take rate is highest (31%) when initial order already contains GlowSerum", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
  {
    id: "offer_11", name: "Daily Moisturizer",
    products: [{ name: "Daily Moisturizer", quantity: 1, unitPrice: 24 }],
    productGroup: "Daily Moisturizer", pageType: "Upsell Page", price: 24, compareAtPrice: 28,
    orders: 224, cvr: 4.5, takeRate: 28.4, aov: 24, revenue: 5376, date: "2026-04-11T14:30:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc",
    attempts: 789,
    relatedInsights: [
      { adName: "Ingredient story — carousel", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "GlowSerum Pro", insight: "Moisturizer is the top-converting upsell for GlowSerum buyers — natural cross-sell", date: "2026-04-11T14:30:00", observationHeadline: "Moisturizer is the top-converting upsell for GlowSerum buyers — natural cross-sell", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
  {
    id: "offer_12", name: "Down Alternative Pillow × 2",
    products: [{ name: "Down Alternative Pillow", quantity: 2, unitPrice: 82 }],
    productGroup: "Down Alternative Pillow", pageType: "Upsell Page", price: 164, compareAtPrice: 230,
    orders: 94, cvr: 2.4, takeRate: 12.8, aov: 164, revenue: 15416, date: "2026-04-12T10:00:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc",
    attempts: 734,
    relatedInsights: [
      { adName: "Pillow Comfort Ad 01", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "Down Alternative Pillow", insight: "Pillow upsell at $164 has lower take rate (12.8%) but highest revenue per acceptance", date: "2026-04-12T10:00:00", observationHeadline: "Pillow upsell at $164 has lower take rate (12.8%) but highest revenue per acceptance", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
  {
    id: "offer_13", name: "Recovery Kit",
    products: [{ name: "Recovery Kit", quantity: 1, unitPrice: 50 }],
    productGroup: "Recovery Kit", pageType: "Upsell Page", price: 50, compareAtPrice: 65,
    orders: 142, cvr: 3.4, takeRate: 18.6, aov: 50, revenue: 7100, date: "2026-04-10T16:45:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Clinical results — static", destinationLink: "https://brand.com/exp-123/efg",
    attempts: 763,
    relatedInsights: [
      { adName: "Clinical results — static", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "Recovery Kit", insight: "Recovery Kit upsell converts best when paired with skincare-focused initial orders", date: "2026-04-10T16:45:00", observationHeadline: "Recovery Kit upsell converts best when paired with skincare-focused initial orders", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
  // Same composition, different prices
  {
    id: "offer_14", name: "Down Alternative Pillow × 2",
    products: [{ name: "Down Alternative Pillow", quantity: 2, unitPrice: 82 }],
    productGroup: "Down Alternative Pillow", pageType: "Sales Page", price: 164, compareAtPrice: 230,
    orders: 198, cvr: 4.8, takeRate: 42.1, aov: 164, revenue: 32472, date: "2026-04-13T09:00:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Pillow Comfort Ad 01", destinationLink: "https://brand.com/exp-456/abc",
    sessions: 4125,
    relatedInsights: [
      { adName: "Pillow Comfort Ad 01", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "Down Alternative Pillow", insight: "Lower price point on the 2-pack lifts take rate by 10% vs. the $184 version", date: "2026-04-13T09:00:00", observationHeadline: "Lower price point on the 2-pack lifts take rate by 10% vs. the $184 version", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
  {
    id: "offer_15", name: "GlowSerum Pro + Daily Moisturizer",
    products: [{ name: "GlowSerum Pro", quantity: 1, unitPrice: 55 }, { name: "Daily Moisturizer", quantity: 1, unitPrice: 20 }],
    productGroup: "GlowSerum Pro", pageType: "Sales Page", price: 75, compareAtPrice: 115,
    orders: 312, cvr: 5.2, takeRate: 48.6, aov: 75, revenue: 23400, date: "2026-04-11T11:00:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Ingredient story — carousel", destinationLink: "https://brand.com/exp-123/abc",
    sessions: 6000,
    relatedInsights: [
      { adName: "Sleep Drops – Value Prop 03", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "Acme Sleep Drops", insight: "Deeper discount on the bundle lifts CVR from 4.6% to 5.2% but reduces AOV by $14", date: "2026-04-11T11:00:00", observationHeadline: "Deeper discount on the bundle lifts CVR from 4.6% to 5.2% but reduces AOV by $14", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
  {
    id: "offer_16", name: "GlowSerum Pro × 2",
    products: [{ name: "GlowSerum Pro", quantity: 2, unitPrice: 29 }],
    productGroup: "GlowSerum Pro", pageType: "Upsell Page", price: 58, compareAtPrice: 78,
    orders: 142, cvr: 3.8, takeRate: 18.4, aov: 58, revenue: 8236, date: "2026-04-09T15:30:00",
    campaign: "{Campaign Name}", adSet: "{Ad Set Name}", ad: "Before/after UGC — reel", destinationLink: "https://brand.com/exp-123/abc",
    attempts: 772,
    relatedInsights: [
      { adName: "Sleep Drops – Problem Aware 01", adUrl: "https://business.facebook.com/adsmanager/manage/ads", product: "Acme Sleep Drops", insight: "Higher-priced GlowSerum upsell ($58 vs $45) reduces take rate by 3.6pp but lifts revenue per attempt", date: "2026-04-09T15:30:00", observationHeadline: "Higher-priced GlowSerum upsell ($58 vs $45) reduces take rate by 3.6pp but lifts revenue per attempt", observationBullets: ["Pattern observed across the selected date range", "Velocity continues to monitor and adjust traffic allocation"] },
    ],
  },
]

// Derived filter options
const PRODUCT_OPTIONS = [...new Set(OFFERS.flatMap((o) => o.products.map((p) => p.name)))].sort()
const OFFER_ITEMS_OPTIONS = [...new Set(OFFERS.map((o) => o.name))].sort()
const PAGE_TYPE_OPTIONS = [...new Set(OFFERS.map((o) => o.pageType))].sort()
const CAMPAIGN_OPTIONS = [...new Set(OFFERS.map((o) => o.campaign))].sort()
const ADSET_OPTIONS = [...new Set(OFFERS.map((o) => o.adSet))].sort()
const AD_OPTIONS = [...new Set(OFFERS.map((o) => o.ad))].sort()
const DESTINATION_OPTIONS = [...new Set(OFFERS.map((o) => o.destinationLink))].sort()

// ─── Sort ──────────────────────────────────────────────────────────────────

type OfferSortKey = "name" | "pageType" | "price" | "shopifyPrice" | "compareAt" | "orders" | "takeRate" | "aov" | "revenue"
type SortDir = "asc" | "desc"

function sortOffers(a: OfferRow, b: OfferRow, key: OfferSortKey, dir: SortDir): number {
  let cmp = 0
  switch (key) {
    case "name": cmp = a.name.localeCompare(b.name); break
    case "pageType": cmp = a.pageType.localeCompare(b.pageType); break
    case "price": cmp = a.price - b.price; break
    case "shopifyPrice": cmp = (a.compareAtPrice ?? 0) - (b.compareAtPrice ?? 0); break
    case "compareAt": cmp = (a.compareAtPrice ?? 0) - (b.compareAtPrice ?? 0); break
    case "orders": cmp = a.orders - b.orders; break
    case "takeRate": cmp = a.takeRate - b.takeRate; break
    case "aov": cmp = a.aov - b.aov; break
    case "revenue": cmp = a.revenue - b.revenue; break
  }
  return dir === "asc" ? cmp : -cmp
}

// ─── FilterRow ─────────────────────────────────────────────────────────────

function FilterRow({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [filterText, setFilterText] = useState("")
  const sorted = [...options].sort((a, b) => a.localeCompare(b))
  const allSelected = selected.length >= sorted.length && sorted.every((o) => selected.includes(o))
  const filtered = filterText ? sorted.filter((o) => o.toLowerCase().includes(filterText.toLowerCase())) : sorted
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt])
  }
  const displayValue = selected.length === 0 || allSelected ? "All" : selected.length <= 2 ? selected.join(", ") : `${selected.length} selected`
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      <button type="button" onClick={() => { setOpen(!open); setFilterText("") }}
        className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors", open ? "border-amber-400 ring-1 ring-amber-400" : "hover:border-foreground/20")}>
        <span className={cn("truncate", selected.length === 0 && "text-muted-foreground")}>{displayValue}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 border rounded-lg bg-background shadow-sm overflow-hidden">
          <div className="px-2 pt-2 pb-1">
            <input type="text" placeholder={`Search ${label.toLowerCase()}...`} value={filterText} onChange={(e) => setFilterText(e.target.value)}
              className="w-full text-sm px-2.5 py-1.5 rounded-md border bg-background outline-none focus:ring-1 focus:ring-amber-400" autoFocus />
          </div>
          <div className="py-1 max-h-48 overflow-y-auto">
            {filtered.length > 0 && (
              <label className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50">
                <input type="checkbox" checked={filtered.every((o) => selected.includes(o)) && selected.length === filtered.length}
                  onChange={() => { if (filtered.every((o) => selected.includes(o))) { onChange(selected.filter((s) => !filtered.includes(s))) } else { onChange([...new Set([...selected, ...filtered])]) } }}
                  className="rounded border-muted-foreground/30 h-4 w-4 accent-amber-500 shrink-0" />
                <span className="text-sm font-medium">Select all</span>
              </label>
            )}
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

// ─── Sort header ───────────────────────────────────────────────────────────

function SortHeader({ label, sortKey: sk, currentSort, currentDir, onSort, align = "left" }: {
  label: string; sortKey: OfferSortKey; currentSort: OfferSortKey; currentDir: SortDir; onSort: (k: OfferSortKey) => void; align?: "left" | "right"
}) {
  const active = currentSort === sk
  return (
    <th className={cn("font-medium text-foreground px-4 py-3 text-xs cursor-pointer select-none hover:text-foreground/80 transition-colors", align === "right" ? "text-right" : "text-left")} onClick={() => onSort(sk)}>
      <span className={cn("inline-flex items-center gap-1", align === "right" && "justify-end")}>
        {label}
        {active && (currentDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </span>
    </th>
  )
}

// ─── Group by ──────────────────────────────────────────────────────────────

type OfferGroupBy = "none" | "product" | "offerItems" | "pageType" | "campaign" | "adset" | "ad" | "destination"

interface GroupByCategory { label: string; options: { key: OfferGroupBy; label: string }[] }
const GROUP_BY_CATEGORIES: GroupByCategory[] = [
  { label: "Offer", options: [{ key: "product", label: "Product" }, { key: "offerItems", label: "Offer Items" }, { key: "pageType", label: "Page Type" }] },
  { label: "Attribution", options: [{ key: "campaign", label: "Campaign" }, { key: "adset", label: "Ad Set" }, { key: "ad", label: "Ad" }, { key: "destination", label: "Destination Link" }] },
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

// ─── Offer detail ──────────────────────────────────────────────────────────

function OfferDetail({ offer }: { offer: OfferRow }) {
  const totalQty = offer.products.reduce((s, p) => s + p.quantity, 0)
  const pricePerUnit = totalQty > 0 ? offer.price / totalQty : offer.price
  const savings = offer.compareAtPrice ? offer.compareAtPrice - offer.price : 0

  const [expandedInsight, setExpandedInsight] = useState<number | null>(null)

  return (
    <div className="bg-muted px-6 py-5">
      <div className="rounded-xl border bg-background p-5 space-y-5">
        {/* Products */}
        <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Products</p>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Product</th>
                <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Qty</th>
                <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Unit Price</th>
                <th className="text-right font-medium text-foreground px-4 py-2.5 text-xs">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {offer.products.map((p, i) => (
                <tr key={i} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">IMG</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Product ID: {"{product id}"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{p.quantity}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">${p.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">${(p.unitPrice * p.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/50 font-semibold text-sm">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular-nums">{totalQty}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right tabular-nums">${offer.price.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div>

        {/* Insights */}
        {offer.relatedInsights.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Insights</p>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <colgroup>
                <col style={{ width: "35%" }} />
                <col />
                <col style={{ width: 150 }} />
                <col style={{ width: 40 }} />
              </colgroup>
              <thead>
                <tr className="bg-muted">
                  <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Ad</th>
                  <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Insight</th>
                  <th className="text-left font-medium text-foreground px-4 py-2.5 text-xs">Date</th>
                  <th className="px-2 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {[...offer.relatedInsights].sort((a, b) => b.date.localeCompare(a.date)).map((ri, i) => (
                  <React.Fragment key={i}>
                    <tr
                      className={cn("border-t border-border/50 cursor-pointer transition-colors", expandedInsight === i ? "bg-muted/50" : "hover:bg-muted/30")}
                      onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg border bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">IMG</div>
                          <div className="min-w-0">
                            <a href={ri.adUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400 truncate block">{ri.adName}</a>
                            <p className="text-xs text-muted-foreground truncate">{ri.product}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{ri.insight}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{new Date(ri.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(ri.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} PDT</p>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedInsight === i && "rotate-90")} />
                      </td>
                    </tr>
                    {expandedInsight === i && (
                      <tr>
                        <td colSpan={4} className="p-0">
                          <div className="px-6 py-4 border-l-2 border-l-amber-400">
                            <p className="text-sm font-semibold text-foreground mb-3">{ri.observationHeadline}</p>
                            <ul className="text-sm text-foreground space-y-2 list-disc list-inside">
                              {ri.observationBullets.map((b, j) => <li key={j} className="leading-relaxed">{b}</li>)}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function OffersPage() {
  const [search, setSearch] = useState("")
  const [groupBy, setGroupBy] = useState<OfferGroupBy>("product")
  const [sortKey, setSortKey] = useState<OfferSortKey>("orders")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const [productFilters, setProductFilters] = useState<string[]>([])
  const [offerItemsFilters, setOfferItemsFilters] = useState<string[]>([])
  const [pageTypeFilters, setPageTypeFilters] = useState<string[]>([])
  const [campaignFilters, setCampaignFilters] = useState<string[]>([])
  const [adSetFilters, setAdSetFilters] = useState<string[]>([])
  const [adFilters, setAdFilters] = useState<string[]>([])
  const [destinationFilters, setDestinationFilters] = useState<string[]>([])

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false) }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSort = (key: OfferSortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  const clearAllFilters = () => { setProductFilters([]); setOfferItemsFilters([]); setPageTypeFilters([]); setCampaignFilters([]); setAdSetFilters([]); setAdFilters([]); setDestinationFilters([]) }

  const isAll = (sel: string[], opts: string[]) => sel.length > 0 && sel.length >= opts.length && opts.every((o) => sel.includes(o))
  const activeFilters = [
    ...(isAll(productFilters, PRODUCT_OPTIONS) ? [] : productFilters.map((f) => ({ key: `product:${f}`, label: `Product: ${f}`, clear: () => setProductFilters((p) => p.filter((x) => x !== f)) }))),
    ...(isAll(offerItemsFilters, OFFER_ITEMS_OPTIONS) ? [] : offerItemsFilters.map((f) => ({ key: `offer:${f}`, label: `Offer: ${f}`, clear: () => setOfferItemsFilters((p) => p.filter((x) => x !== f)) }))),
    ...(isAll(pageTypeFilters, PAGE_TYPE_OPTIONS) ? [] : pageTypeFilters.map((f) => ({ key: `page:${f}`, label: `Page: ${f}`, clear: () => setPageTypeFilters((p) => p.filter((x) => x !== f)) }))),
    ...(isAll(campaignFilters, CAMPAIGN_OPTIONS) ? [] : campaignFilters.map((f) => ({ key: `campaign:${f}`, label: `Campaign: ${f}`, clear: () => setCampaignFilters((p) => p.filter((x) => x !== f)) }))),
    ...(isAll(adSetFilters, ADSET_OPTIONS) ? [] : adSetFilters.map((f) => ({ key: `adset:${f}`, label: `Ad Set: ${f}`, clear: () => setAdSetFilters((p) => p.filter((x) => x !== f)) }))),
    ...(isAll(adFilters, AD_OPTIONS) ? [] : adFilters.map((f) => ({ key: `ad:${f}`, label: `Ad: ${f}`, clear: () => setAdFilters((p) => p.filter((x) => x !== f)) }))),
    ...(isAll(destinationFilters, DESTINATION_OPTIONS) ? [] : destinationFilters.map((f) => ({ key: `dest:${f}`, label: `Destination: ${f}`, clear: () => setDestinationFilters((p) => p.filter((x) => x !== f)) }))),
  ]

  // Group key extractor
  function groupKeyOf(o: OfferRow): string {
    switch (groupBy) {
      case "product": return o.productGroup
      case "offerItems": return o.name
      case "pageType": return o.pageType
      case "campaign": return o.campaign
      case "adset": return o.adSet
      case "ad": return o.ad
      case "destination": return o.destinationLink
      default: return ""
    }
  }

  const filtered = useMemo(() => {
    let result = OFFERS as OfferRow[]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((o) => o.name.toLowerCase().includes(q) || o.productGroup.toLowerCase().includes(q) || o.pageType.toLowerCase().includes(q) || o.campaign.toLowerCase().includes(q) || o.ad.toLowerCase().includes(q))
    }
    if (productFilters.length > 0) result = result.filter((o) => o.products.some((p) => productFilters.includes(p.name)))
    if (offerItemsFilters.length > 0) result = result.filter((o) => offerItemsFilters.includes(o.name))
    if (pageTypeFilters.length > 0) result = result.filter((o) => pageTypeFilters.includes(o.pageType))
    if (campaignFilters.length > 0) result = result.filter((o) => campaignFilters.includes(o.campaign))
    if (adSetFilters.length > 0) result = result.filter((o) => adSetFilters.includes(o.adSet))
    if (adFilters.length > 0) result = result.filter((o) => adFilters.includes(o.ad))
    if (destinationFilters.length > 0) result = result.filter((o) => destinationFilters.includes(o.destinationLink))
    return result
  }, [search, productFilters, offerItemsFilters, pageTypeFilters, campaignFilters, adSetFilters, adFilters, destinationFilters])

  // Sort: group key primary, then column sort secondary
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

  // Build grouped view — detect group boundaries in the sorted flat list
  const grouped = useMemo(() => {
    if (groupBy === "none") return [{ key: "all", label: "", count: 0, items: sorted }]

    // For product group-by, an offer appears under every product it contains
    if (groupBy === "product") {
      const map = new Map<string, OfferRow[]>()
      for (const o of filtered) {
        for (const p of o.products) {
          if (!map.has(p.name)) map.set(p.name, [])
          map.get(p.name)!.push(o)
        }
      }
      return Array.from(map.entries())
        .map(([key, items]) => ({ key, label: key, count: items.length, items: [...items].sort((a, b) => sortOffers(a, b, sortKey, sortDir)) }))
        .sort((a, b) => a.label.localeCompare(b.label))
    }

    const map = new Map<string, OfferRow[]>()
    for (const o of sorted) {
      const k = groupKeyOf(o)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(o)
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, label: key, count: items.length, items }))
  }, [sorted, filtered, groupBy, sortKey, sortDir])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <V2Sidebar activeKey="offers-old" />
      <div className="flex-1 flex flex-col min-w-0">
        <V2Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-6 py-6 space-y-4">
            <h2 className="text-lg font-semibold">Offers</h2>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search offers, products, campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-11 text-sm" />
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
                    <FilterRow label="Product" options={PRODUCT_OPTIONS} selected={productFilters} onChange={setProductFilters} />
                    <FilterRow label="Offer Items" options={OFFER_ITEMS_OPTIONS} selected={offerItemsFilters} onChange={setOfferItemsFilters} />
                    <FilterRow label="Page Type" options={PAGE_TYPE_OPTIONS} selected={pageTypeFilters} onChange={setPageTypeFilters} />
                    <div className="border-t border-border/50" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Attribution</p>
                    <FilterRow label="Campaign" options={CAMPAIGN_OPTIONS} selected={campaignFilters} onChange={setCampaignFilters} />
                    <FilterRow label="Ad Set" options={ADSET_OPTIONS} selected={adSetFilters} onChange={setAdSetFilters} />
                    <FilterRow label="Ad" options={AD_OPTIONS} selected={adFilters} onChange={setAdFilters} />
                    <FilterRow label="Destination Link" options={DESTINATION_OPTIONS} selected={destinationFilters} onChange={setDestinationFilters} />
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

            <Card className="py-0 gap-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ tableLayout: "fixed", width: "100%", minWidth: "max-content" }}>
                  <colgroup>
                    <col style={{ width: 300 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 110 }} />
                    <col style={{ width: 100 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 110 }} />
                    <col style={{ width: 40 }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-muted border-b">
                      <SortHeader label="Offer" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                      <SortHeader label="Page Type" sortKey="pageType" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                      <SortHeader label="Price" sortKey="price" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                      <SortHeader label="Shopify Price" sortKey="shopifyPrice" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                      <SortHeader label="Compare At" sortKey="compareAt" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                      <SortHeader label="Orders" sortKey="orders" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                      <SortHeader label="Take Rate" sortKey="takeRate" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                      <SortHeader label="AOV" sortKey="aov" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                      <SortHeader label="Revenue" sortKey="revenue" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                      <th className="px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.length === 0 ? (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">No offers match your filters.</td></tr>
                    ) : (
                      grouped.map((group) => (
                        <React.Fragment key={group.key}>
                          {group.label && (
                            <tr className="bg-muted border-l-2 border-l-foreground/20">
                              <td colSpan={10} className="px-4 py-2.5">
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
                            const isExpanded = expandedId === offer.id
                            return (
                              <React.Fragment key={`${group.key}-${offer.id}`}>
                                <tr className={cn("border-b cursor-pointer transition-colors", isExpanded ? "bg-muted/50 border-l-2 border-l-amber-400" : "hover:bg-muted/30 border-l-2 border-l-transparent")}
                                  onClick={() => setExpandedId(isExpanded ? null : offer.id)}>
                                  <td className="px-4 py-3"><span className="text-sm font-semibold text-foreground truncate block">{offer.name}</span></td>
                                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{offer.pageType}</span></td>
                                  <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">${offer.price.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{offer.compareAtPrice ? `$${offer.compareAtPrice.toFixed(2)}` : "—"}</td>
                                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{offer.compareAtPrice ? `$${offer.compareAtPrice.toFixed(2)}` : "—"}</td>
                                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{offer.orders.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{offer.takeRate.toFixed(1)}%</td>
                                  <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">${offer.aov.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">${offer.revenue.toLocaleString()}</td>
                                  <td className="px-2 py-3 text-center"><ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} /></td>
                                </tr>
                                {isExpanded && (
                                  <tr className="border-b"><td colSpan={10} className="p-0"><OfferDetail offer={offer} /></td></tr>
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
        </main>
      </div>
    </div>
  )
}
