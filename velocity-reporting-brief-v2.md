# Velocity Reporting Prototype — Claude Code Brief

## Context for Claude Code

You are building a **merchant-facing reporting dashboard prototype** for Velocity, Matter Inc.'s performance marketing platform. This is a UI mockup with synthetic data — no backend, no API calls. The goal is to present this to the team for review and debate.

**Critical context:** Velocity is an autonomous content generation and experimentation platform for DTC/eCommerce merchants. The system auto-generates funnel variants (series of pages: presell → sales → checkout → upsell flow), each containing offers (bundles of merchant products with strategic pricing). Over time, a single merchant may have 100,000+ variants and offers. Traditional drill-down reporting breaks at this scale — it overwhelms the merchant and doesn't answer what they actually care about.

**The paradigm shift:** This report is NOT a conventional analytics dashboard. It has three layers:

1. **Comfort Layer** — A concise, always-visible report that answers the merchant's core anxiety: "Am I making money? Is Velocity worth it?" Product-oriented and opinionated about what to show.
2. **Intelligence Layer** — LLM-generated insights that surface what's working, what's changing, and what the merchant should know — at both the portfolio and experiment level. This includes a running "learning log" that accumulates insights over time, replacing the team of analysts a brand would normally need.
3. **Agent Layer** — A chat interface where merchants ask questions in plain language and get accurate, contextual answers drawn from all the granular data they never see directly. This replaces traditional drill-downs.

---

## Key Concepts

**Products vs. Offers:** Merchants think in products (their Shopify catalog). Offers are Matter's internal concept — a composition of 1-n products with strategic pricing/bundling. The reporting translates offer performance into product language. The merchant sees "GlowSerum Pro sells best when bundled with Daily Moisturizer at $67" — never "Offer ID 205."

**Experiments:** Merchants are given one experiment link per hero product (e.g., `exp-123/abc` for Product A, `exp-123/efg` for Product B). They point ad spend at these links. Behind each link, the system rotates many funnel variants autonomously. The merchant needs to see experiment-level performance (traffic, CVR, revenue for that link) but NOT the individual variant breakdown.

**Journey Types:** Some funnel variants include a presell page (listicle/article), some go straight to the sales page. These convert at fundamentally different rates and cannot be compared in a single aggregate funnel. The funnel visualization must segment by journey type (with presell / without presell).

**Learning Log:** An LLM-populated timeline of insights — timestamped findings that accumulate over time. This shows the merchant that the system is continuously learning and gives them a narrative arc of optimization decisions they'd normally need a CRO team to produce.

---

## What to Build

A single-page React application (Next.js or plain React, Tailwind CSS) with the following structure. Use synthetic data hardcoded in a data file — no backend needed.

### Layout Requirements

**IMPORTANT — the current prototype has layout issues that must be fixed:**
- The main content area must not clip or overflow. Use proper `min-width: 0` on flex/grid children, and ensure the sidebar + main content fill the viewport without horizontal overflow.
- KPI cards: use `grid-template-columns: repeat(5, minmax(0, 1fr))` — NOT fixed widths. Text inside KPI cards should wrap or truncate gracefully, never overflow the card boundary.
- Product cards in the Top Products row: same approach — `minmax(0, 1fr)` grid. If 5 cards don't fit, allow horizontal scroll with `overflow-x: auto` on the row container, or reduce to 4 visible with a scroll hint.
- The main content area should have `min-width: 0; overflow-x: hidden` to prevent any child from pushing the layout wider than the viewport.
- Sidebar should be `flex-shrink: 0` with a fixed width (200px). Main content fills remaining space.
- All cards and content containers should use `box-sizing: border-box` and respect their parent's width constraints.
- Target viewport: 1280px+ desktop. At exactly 1280px, everything must fit without horizontal scrollbar.

### Global Chrome

- **Sidebar (left, 200px fixed):** "Velocity" branding + merchant name ("Glow Botanics") at top. Nav items: Summary, Experiments, Products, Orders. Active state highlighted.
- **Header (top of main content area):** Date range picker (functional — see below), MERCHANT / INTERNAL toggle (display only, default to MERCHANT).

**Date Range Picker:**
The date range picker must be interactive and appear on every screen. It controls the reporting period for all metrics, funnel data, learning log entries, and insights on the page.

Implementation for the prototype:
- Display the currently selected range as a clickable element (e.g., "Mar 17, 2026 – Apr 15, 2026").
- On click, open a dropdown/popover with preset options: "Last 7 days," "Last 14 days," "Last 30 days," "Last 90 days," "Custom range."
- Selecting a preset updates the displayed date string and triggers a visual refresh of all period-specific content on the page. For the prototype, the underlying data can stay the same (it's all synthetic) — but the selected range label must update everywhere it appears, and ideally the KPI trend labels should reflect the period (e.g., "vs prior 30 days" vs. "vs prior 7 days").
- "Custom range" can open a simple dual calendar picker or just two date inputs. Functional enough to select dates and update the display — doesn't need to be pixel-perfect.
- The picker state should persist across screen navigation (if I select "Last 7 days" on Summary and navigate to Experiments, it should still show "Last 7 days").
- **Bottom-right:** Persistent floating chat button — "Ask Velocity" — that opens the agent modal.

### Screen 1: Summary (default view)

The merchant's home screen. Everything answerable at a glance in one scroll.

**Top KPI Cards (horizontal row, 5 cards):**
- Revenue: $48,320 ↑ 8.3%
- Orders: 298 ↑ 12.4%
- AOV: $41.61 ↓ 2.1%
- Conversion Rate: 4.21% ↑ 1.8%
- Upsell Take Rate: 34.9% ↑ 3.7%

Each card shows: metric name, value, trend vs. prior period (green up / red down). Period label: "Last 30 days."

**Funnel Visualization — Segmented by Journey Type (below KPIs):**

A horizontal bar chart showing session progression, split into TWO tracks: "With presell" and "Without presell." This is critical because funnel variants with a presell page convert at fundamentally different rates than those without. Aggregating them into one funnel produces misleading conversion rates.

| Step | With Presell | Without Presell |
|------|-------------|----------------|
| Sessions | 1,000 (100%) | 1,000 (100%) |
| Presell | 1,000 (100%) | — (skipped) |
| Sales Page | 800 (80%) | 1,000 (100%) |
| Checkout | 480 (48%) | 600 (60%) |
| Order | 288 (28.8%) | 360 (36%) |
| Upsell Taken | 115 (11.5%) | 144 (14.4%) |

Show both tracks side-by-side at each step (two bars per step, different colors/shades). Include a legend. The "Presell" step only appears for the "With presell" track. Note: even though "Without presell" has higher step-to-step conversion, the presell path may have higher quality traffic or different AOV — the insights card addresses this.

**"What's Working" — Current Insights (below funnel):**

A card with left accent border, titled "What's working." Contains 3-4 LLM-generated insight paragraphs (hardcoded for prototype). Written in plain merchant language, bold product names:

- "Your best-selling product is **GlowSerum Pro** — it converts 2.3x higher when bundled with the Daily Moisturizer at $67 vs. sold alone at $39."
- "Upsell take rate improved 3.7% this period. Customers who see the **Recovery Kit** as a first upsell are 40% more likely to accept a second upsell."
- "Funnels with a presell page convert 18% higher end-to-end than those without. The top-performing presell angle is ingredient education — consider using this angle in your own ad creative."
- "Your checkout add-on (**Travel Size Kit**, $10) has a 28% take rate — this is strong. Consider testing a higher price point."

**Learning Log (below insights):**

A table/timeline showing accumulated LLM-generated insights over time. Each row has: date, category tag (e.g., "Products," "Offers," "Upsells," "Content"), and the insight text. This is the "team of analysts" replacement — it shows the merchant the system is continuously learning.

| Date | Category | Insight |
|------|----------|---------|
| Apr 12 | Products | GlowSerum Pro + Daily Moisturizer bundle ($67) now outperforms single-product offers by 2.3x on conversion rate. Recommend increasing bundle visibility. |
| Apr 8 | Upsells | Reordering the upsell flow to show Recovery Kit first (before Vitamin C Drops) increased cumulative upsell take rate from 29% to 34.9%. |
| Apr 3 | Content | Presell pages using ingredient education angle convert 18% higher than testimonial-based presells. Shifting generation strategy to prioritize education angles. |
| Mar 28 | Offers | Testing $67 price point for the GlowSerum + Moisturizer bundle (was $59). Conversion held steady while AOV increased $8 per order. Keeping new price. |
| Mar 22 | Products | Customers who purchase Recovery Kit have 2.1x higher 30-day repeat purchase rate. Flagging for hero product consideration. |
| Mar 17 | Content | Initial funnel variants launched. Baseline CVR: 3.2%. 12 variants active across 2 journey types. |

Show 5-6 rows, most recent first. The tone is a knowledgeable advisor narrating what the system learned. Each entry is actionable or informational — never just a metric change without context.

**Top Products (below learning log):**

A horizontal row of product cards (5 visible, no clipping), each showing:
- Product image placeholder (colored circle with product initial)
- Product name
- Units sold
- Revenue

Clicking a product card navigates to the Products screen with that product selected.

**Your Earnings (below products):**

Financial summary card:
- Gross Revenue: $48,320.00
- − Refunds: $892.00
- − Matter Platform Fee: $2,371.40
- − Processing Fees: $1,401.28
- = **Net Profit (Your Share): $43,655.32**

### Screen 2: Experiments

Shows one row per hero product experiment. The merchant is spending ad dollars on these links — they need to see performance at this level.

**Experiment List:**

| Experiment | Status | Link | Sessions | Orders | CVR | Revenue | AOV | Trend |
|-----------|--------|------|----------|--------|-----|---------|-----|-------|
| GlowSerum Pro | Running | exp-123/abc | 1,200 | 178 | 4.52% | $28,400 | $42.80 | ↑ 12% |
| Recovery Kit | Running | exp-123/efg | 800 | 120 | 3.84% | $19,920 | $52.10 | ↑ 6% |

Each row shows: hero product name, status badge (Running/Ended), the experiment link (with copy button), key metrics. Clicking a row opens the experiment detail.

**Experiment Detail (on click — expanded section or slide-out):**

When an experiment is selected, show:

- **Experiment summary:** Hero product, start date, status, active variants count, experiment link with copy button
- **KPI row:** Sessions, Orders, CVR, Revenue, AOV, EPC for this experiment
- **Journey type split:** Mini funnel or comparison showing with-presell vs. without-presell performance for this experiment specifically
- **"What's Working" for this experiment:** 2-3 LLM-generated insights scoped to this hero product's data. E.g., "For GlowSerum Pro, the ingredient education presell is converting 31% higher than the testimonial angle. The 2-pack bundle at $67 is your top offer — 3x the take rate of the single."
- **System status:** "12 variants active. Current winner outperforming baseline by 23%. Last variant rotation: 2 days ago." — just enough to show the machine is working.

**Important:** Do NOT show a variant-by-variant table. The merchant doesn't need to see V-001, V-002, etc. The system handles that. The experiment detail shows aggregate performance and LLM-synthesized insights about what's winning.

### Screen 3: Products

Product-first performance view. This replaces the conventional "Offers" drill-down.

**Product list (full-width rows):**

Each product gets a row showing:
- Product avatar (colored circle with initial)
- Product name
- "Sells best as:" one-liner (plain language bundle description)
- Revenue, Units
- AOV when this product is in the order
- Trend indicator

**Product detail (on click — expanded section):**

- **Performance:** Revenue, Units, AOV, Conversion Rate
- **Best Combinations:** Ranked list of product combinations with order count and revenue. "GlowSerum + Daily Moisturizer ($67) — 142 orders, $9,514 revenue." This is the offer-to-product translation layer.
- **Insight:** One LLM-generated line about this product's performance pattern.

**No offer IDs, variant IDs, or experiment IDs visible anywhere in this view.**

### Screen 4: Orders

Order list with detail panel.

**Order list:**
- Searchable table
- Columns: Order # (Shopify order name), Date, Customer, Total
- Status indicators for refunded orders
- Show 7-10 synthetic orders

**Order detail (slide-out panel on click):**
- Order Summary: Date, Shopify Order # (linked), Velocity Order ID, Payment Method
- Customer: Name, Email, Shipping Address
- Transactions: Line items with product name, quantity, price
- Payment: Subtotal, Taxes, Refunds, Total
- Your Earnings: Gross Revenue − Refunds − Matter Fee − Processing Fees = Net Profit (Your Share)

### Agent Modal

**Trigger:** Floating "Ask Velocity" button, bottom-right, always visible across all screens.

**Modal:** Centered modal with:
- Chat history (scrollable)
- Text input with placeholder: "Ask anything about your performance..."
- Welcome message: "Hi! I can answer any questions about your Velocity performance. Try asking about your best-selling products, upsell performance, or revenue trends."

**Hardcoded Q&A pairs (respond to exact matches or close matches):**

1. "What are my best-selling product combinations?" → Top 3 combos with revenue, order count, and context about why each works.
2. "How are my upsells performing?" → Take rate breakdown, best-performing upsell, sequence insights.
3. "What's my refund rate?" → Rate, comparison to industry average, pattern analysis.
4. "Which traffic sources convert best?" → Meta, Google, TikTok breakdown with CVR per source.
5. "What changed this week vs. last?" → Revenue, orders, AOV, CVR deltas with drivers.
6. "What's the average customer spend range?" → Not just AOV but distribution: "62% of orders fall between $35-$55, but your $67+ bundles convert at a higher rate."
7. "What upsell flow is working best?" → Sequence analysis: which first upsell → second upsell path has highest cumulative take rate.

**Suggested question pills** shown below the input area — clicking one auto-sends it.

The agent tone: knowledgeable, specific, conversational. Product names, dollar amounts, plain language. No jargon, no internal IDs. Like talking to a smart CRO analyst who knows your account deeply.

---

## Synthetic Data

Create a single `data.ts` (or `data.js`) file with all synthetic data. The data should feel realistic for a skincare DTC brand called "Glow Botanics."

Include:
- Merchant info
- KPIs with trend values
- Funnel data split by journey type (with presell / without presell)
- 2 experiments (GlowSerum Pro, Recovery Kit) with metrics
- 5 products with revenue, units, AOV, best combos
- Learning log entries (6 timestamped insights)
- 7-10 orders with full detail (customer, transactions, earnings breakdown)
- Agent Q&A pairs (7 hardcoded conversations)
- Current insights (4 "what's working" paragraphs)
- Experiment-level insights (2-3 per experiment)

All numbers should be internally consistent — product revenues should roughly sum to total revenue, order counts should align, funnel math should work out.

---

## Design Direction

**Aesthetic:** Clean, modern SaaS dashboard — warmer and less intimidating than typical analytics tools. This is for a DTC merchant (small business owner, marketer), not a data analyst. Think Shopify admin meets Linear, not Looker or Tableau.

**Specifics:**
- Light background, generous whitespace, generous padding inside cards
- Subtle card borders (not heavy shadows)
- Accent color: warm tone (amber/orange for the current prototype works well — keep it consistent)
- Typography: Clean sans-serif, slightly warmer than Inter. DM Sans or Plus Jakarta Sans work well.
- The "What's Working" insights card should feel visually distinct — left accent border, subtle background tint — to distinguish intelligence from data.
- The Learning Log should feel like a timeline/journal, not a data table. Subtle date labels, category tags as small pills, insight text as the primary content.
- The agent modal should feel conversational — chat bubble styling, not a terminal.

**What NOT to do:**
- Don't show internal IDs (variant IDs, offer IDs) anywhere in the merchant view
- Don't create complex drill-down hierarchies — the agent handles depth
- Don't overwhelm with metrics — this report is deliberately minimal
- Don't use charts for the sake of charts — only the funnel visualization earns its place as a chart
- Don't clip content — every element must fit within its container without overflow

---

## Technical Notes

- React + Tailwind CSS (Tailwind v4 if possible)
- Single page app with client-side routing for 4 nav items (Summary, Experiments, Products, Orders)
- All data from a single data file — no API calls
- Agent chat is UI-only — no LLM integration. Hardcoded responses matched to input.
- Optimize for desktop 1280px+ — no horizontal scrollbar at 1280px
- Deploy to Vercel when complete

---

## What Success Looks Like

After building this, the team should be able to:
1. **See** what a merchant sees when they log in — and feel that it answers "am I making money?" within 5 seconds
2. **Understand** the product-first orientation — reporting organized around their products, not our internal variant/offer hierarchy
3. **See experiments** — the merchant can check performance for each link they're spending ad dollars on, without being overwhelmed by variant-level detail
4. **Experience** the intelligence layer — LLM-generated insights that replace a CRO team, accumulating over time in the learning log
5. **Experience** the agent — deep questions answered conversationally, not through drill-down tables
6. **Debate** what's missing, what's unnecessary, and whether this paradigm works — before any engineering work begins

This is a prototype for internal alignment, not a production build.
