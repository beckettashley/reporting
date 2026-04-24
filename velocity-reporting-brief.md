# Velocity Reporting Prototype — Claude Code Brief

## Context for Claude Code

You are building a **merchant-facing reporting dashboard prototype** for Velocity, Matter Inc.'s performance marketing platform. This is a UI mockup with synthetic data — no backend, no API calls. The goal is to present this to the team for review and debate.

**Critical context:** Velocity is an autonomous content generation and experimentation platform for DTC/eCommerce merchants. The system auto-generates funnel variants (series of pages: presell → sales → checkout → upsell flow), each containing offers (bundles of merchant products with strategic pricing). Over time, a single merchant may have 100,000+ variants and offers. Traditional drill-down reporting breaks at this scale — it overwhelms the merchant and doesn't answer what they actually care about.

**The paradigm shift:** This report is NOT a conventional analytics dashboard. It has two layers:

1. **Comfort Layer** — A concise, static report that answers the merchant's core anxiety: "Am I making money? Is Velocity worth it?" This is always visible, product-oriented, and opinionated about what to show.
2. **AI Agent Layer** — A chat interface where merchants ask questions in plain language and get accurate, contextual answers drawn from all the granular data they never see directly. This replaces traditional drill-downs.

---

## What to Build

A single-page React application (Next.js or plain React, Tailwind CSS) with the following structure. Use synthetic data hardcoded in a data file — no backend needed.

### Global Chrome

- **Header:** "Velocity" branding (left), date range selector showing "Mar 17, 2026 – Apr 15, 2026" (display only, not functional), MERCHANT / INTERNAL toggle (display only, default to MERCHANT view)
- **Left sidebar nav:** Summary, Products, Orders — three items only. No "Experiments" or "Offers" nav items in the merchant view. Those concepts are internal.
- **Bottom-right:** Persistent floating chat button (💬 or "Ask Velocity") that opens the agent modal

### Screen 1: Summary (default view)

This is the merchant's home screen. Everything here should be answerable at a glance.

**Top KPI Cards (horizontal row, 5 cards):**
- Revenue: $48,320 ↑ 8.3%
- Orders: 298 ↑ 12.4%
- AOV: $41.61 ↓ 2.1%
- Conversion Rate: 4.21% ↑ 1.8%
- Upsell Take Rate: 34.9% ↑ 3.7%

Each card shows: metric name, value, trend vs. prior period (green up / red down arrows). Period label: "Last 30 days."

**Funnel Visualization (below KPIs):**

A horizontal funnel/waterfall chart showing session progression through the funnel steps. This is one of the most valuable visual elements — it's hard to convey in chat and gives the merchant immediate spatial understanding of where users drop off.

| Step | Count | % of Sessions |
|------|-------|---------------|
| Sessions | 2,000 | 100% |
| Presell | 1,600 | 80% |
| Sales Page | 1,400 | 70% |
| Checkout | 600 | 30% |
| Order | 288 | 14.4% |
| Upsell Taken | 104 | 5.2% |

Show this as a stepped bar/waterfall chart with the count and percentage at each step. Use a single color that gets progressively lighter or use decreasing bar widths to convey the funnel shape.

**AI Insights Card (below funnel):**

This is the bridge between the comfort layer and the agent. A card titled "What's Working" with 3-4 LLM-generated insight bullets. These are pre-generated summaries (hardcoded for the prototype), written in plain merchant language:

- "Your best-selling product is **GlowSerum Pro** — it converts 2.3x higher when bundled with the Daily Moisturizer at $67 vs. sold alone at $39."
- "Upsell take rate improved 3.7% this period. Customers who see the **Recovery Kit** as a first upsell are 40% more likely to accept a second upsell."
- "Funnels with a presell page convert 18% higher than those without. The top-performing presell angle is ingredient education."
- "Your checkout add-on (Travel Size Kit, $10) has a 28% take rate — this is strong. Consider testing a higher price point."

Style: clean card with a subtle accent border or background. Each insight is a short paragraph, not a bullet list. Bold the product names. The tone is a knowledgeable advisor, not a data dump.

**Top Products (below insights):**

A horizontal scrollable row of product cards (4-5 visible), each showing:
- Product image placeholder (colored rectangle with product initial)
- Product name
- Units sold
- Revenue

Products (synthetic):
1. GlowSerum Pro — 412 units, $16,068
2. Daily Moisturizer — 298 units, $8,940
3. Recovery Kit — 187 units, $9,350
4. Travel Size Kit — 156 units, $1,560
5. Vitamin C Drops — 134 units, $5,360

This is the product-first orientation. Merchants think in products, not offers or variants. The reporting meets them where they are.

### Screen 2: Products (nav item)

A detail view for product performance. This replaces the conventional "Experiments" and "Offers" drill-down.

**Product list (left panel or full-width cards):**

Each product gets a card/row showing:
- Product name
- Total revenue
- Units sold
- AOV when this product is in the order
- Best-performing bundle (plain language: "Sells best as: GlowSerum + Daily Moisturizer bundle at $67")

**Product detail (on click — slide-out panel or expanded section):**

When a product is selected, show:
- **Performance summary:** Revenue, Units, AOV, Conversion Rate for funnels featuring this product
- **Best Combinations:** "This product sells best when bundled with [X] at [price]" — this is the offer-to-product translation layer. The merchant sees products and combinations; internally this maps to offer performance.
- **Trend:** Simple sparkline or "↑ 12% vs. prior period"

**Important: No offer IDs, no variant IDs, no experiment IDs visible in the merchant view.** The merchant doesn't know or care about these internal concepts. The system abstracts them away.

### Screen 3: Orders

An order list with detail panel, similar to the existing v0 mockup. This is conventional and merchants expect it.

**Order list (left/main area):**
- Searchable, sortable table
- Columns: Order # (Shopify order name), Date, Customer, Total
- Show 7-10 synthetic orders

**Order detail (slide-out panel on click):**
- Order Summary: Date, Shopify Order # (linked), Velocity Order ID, Payment Method
- Customer: Name, Email, Shipping Address
- Transactions: List of line items with product name, quantity, price
- Payment: Subtotal, Taxes, Refunds, Total
- Your Earnings: Gross Revenue − Refunds − Matter Platform Fee − Processing Fees = Net Profit (Your Share)

The "Your Earnings" breakdown is the financial comfort layer. The merchant needs to see exactly how the money flows.

### Agent Modal

**Trigger:** Floating button bottom-right, always visible. Label: "Ask Velocity" or chat icon.

**Modal behavior:** Opens a centered or right-anchored modal/drawer with:
- Chat history area (scrollable)
- Text input at bottom with placeholder: "Ask anything about your performance..."
- Pre-seeded with a welcome message: "Hi! I can answer any questions about your Velocity performance. Try asking: 'What's my best-selling product combo?' or 'Why did AOV drop this week?'"

**Hardcoded demo conversation (pre-loaded to show capability):**

> **Merchant:** What are my best-selling product combinations?
>
> **Velocity:** Your top 3 product combinations by revenue:
>
> 1. **GlowSerum Pro + Daily Moisturizer** ($67 bundle) — 142 orders, $9,514 revenue. This is your strongest combo — customers who buy this bundle have a 23% higher lifetime value.
>
> 2. **GlowSerum Pro (single)** ($39) — 98 orders, $3,822 revenue. Solid standalone performer but converts 2.3x lower than the bundle above.
>
> 3. **Recovery Kit + Vitamin C Drops** ($75 bundle) — 67 orders, $5,025 revenue. This combination has the highest AOV of any bundle at $75.
>
> Your upsell flow is also performing well — 34.9% of customers who complete checkout accept at least one upsell. The Travel Size Kit at $10 is your most-accepted upsell at 28% take rate.

The agent should feel knowledgeable, specific, and conversational. No jargon, no internal IDs. Product names, dollar amounts, plain language.

**Additional suggested questions (shown as clickable pills below the input):**
- "How are my upsells performing?"
- "What's my refund rate?"
- "Which traffic sources convert best?"
- "What changed this week vs. last?"

---

## Synthetic Data Model

Create a single `data.ts` file with all synthetic data. The data should feel realistic for a skincare DTC brand.

```typescript
// Merchant
merchant: {
  name: "Glow Botanics",
  experiment: "EXP-2847",
  dateRange: { start: "2026-03-17", end: "2026-04-15" }
}

// Products (what the merchant sees)
products: [
  { id: "prod_1", name: "GlowSerum Pro", price: 39.00, unitsSold: 412, revenue: 16068 },
  { id: "prod_2", name: "Daily Moisturizer", price: 30.00, unitsSold: 298, revenue: 8940 },
  { id: "prod_3", name: "Recovery Kit", price: 50.00, unitsSold: 187, revenue: 9350 },
  { id: "prod_4", name: "Travel Size Kit", price: 10.00, unitsSold: 156, revenue: 1560 },
  { id: "prod_5", name: "Vitamin C Drops", price: 40.00, unitsSold: 134, revenue: 5360 },
]

// KPIs
kpis: {
  revenue: { value: 48320, change: 8.3 },
  orders: { value: 298, change: 12.4 },
  aov: { value: 41.61, change: -2.1 },
  cvr: { value: 4.21, change: 1.8 },
  upsellTakeRate: { value: 34.9, change: 3.7 },
}

// Funnel steps
funnel: [
  { step: "Sessions", count: 2000, pct: 100 },
  { step: "Presell", count: 1600, pct: 80 },
  { step: "Sales Page", count: 1400, pct: 70 },
  { step: "Checkout", count: 600, pct: 30 },
  { step: "Order", count: 288, pct: 14.4 },
  { step: "Upsell Taken", count: 104, pct: 5.2 },
]

// Orders (7-10 entries with realistic names, dates, amounts)
// Financial summary (gross, refunds, matter fee, processing, net)
// AI insights (array of pre-written strings)
// Agent conversation (pre-seeded Q&A pairs)
```

---

## Design Direction

**Aesthetic:** Clean, modern SaaS dashboard — but warmer and less intimidating than typical analytics tools. This is for a DTC merchant (small business owner, marketer), not a data analyst. Think Shopify admin meets Linear, not Looker or Tableau.

**Specifics:**
- Light background, generous whitespace
- Subtle card elevation (light shadows, not hard borders)
- Accent color: a warm tone (amber, coral, or sage green) — not the typical blue/purple SaaS palette
- Typography: One clean sans-serif for data, slightly warmer/rounder than Inter. Consider Plus Jakarta Sans, DM Sans, or similar.
- The AI Insights card should feel slightly different from the rest — a subtle background tint or left accent border to distinguish it as "intelligence" vs. "data"
- The agent modal should feel conversational — think iMessage or WhatsApp, not a terminal

**What NOT to do:**
- Don't show internal IDs (variant IDs, offer IDs, experiment IDs) anywhere in the merchant view
- Don't create complex drill-down hierarchies — the agent handles depth
- Don't overwhelm with metrics — this report is deliberately minimal
- Don't use charts for the sake of charts — only the funnel visualization earns its place as a chart

---

## Technical Notes

- React + Tailwind CSS (use Tailwind v4 conventions if possible)
- Single page app with client-side routing for the 3 nav items (Summary, Products, Orders)
- All data from a single `data.ts` file — no API calls
- The agent chat is UI-only — no actual LLM integration. Pre-seed with hardcoded responses. The text input can accept input and display it, but the "response" is always the same hardcoded demo.
- Responsive is nice-to-have but not required — optimize for desktop ~1280px+
- Deploy to Vercel when complete

---

## What Success Looks Like

After building this, the team should be able to:
1. **See** what a merchant would see when they log in — and feel that it answers "am I making money?" within 5 seconds
2. **Understand** the product-first orientation — reporting organized around their products, not our internal variant/offer hierarchy
3. **Experience** the agent interaction — see that deep questions get answered conversationally, not through drill-down tables
4. **Debate** what's missing, what's unnecessary, and whether this paradigm shift feels right — before any engineering work begins

This is a prototype for internal alignment, not a production build.
