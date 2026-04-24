# Velocity Metrics Glossary

This document is the source of truth for every metric shown in Velocity's merchant reporting. It populates the in-app Metrics Glossary sidebar and trains the embedded agent on metric meaning, calculation, and relationships.

Metrics are grouped by category. Within each category, metrics are listed alphabetically.

**Glossary entry structure:**

- **Metric name** — full name (acts as the anchor target for linking)
- **Short name** — abbreviated form if applicable
- **Current value** — merchant's actual value for the current period (populated dynamically)
- **Your baseline** — merchant's pre-Velocity or starting value (populated dynamically)
- **Definition** — plain language description
- **Calculation** — formula in plain language (if applicable)
- **Why it matters** — the decision or insight this metric enables
- **What it doesn't tell you** — limitations and what to pair it with

**Cross-references:** Any mention of another metric within a definition, formula, or "why it matters" section is an inline anchor link. No separate "Related metrics" list at the bottom of entries.

---

## Economics metrics

Metrics related to the unit economics of each customer acquisition.

---

### Average Order Value

**Short name:** AOV

**Definition:**
The average total value of orders processed through this ad's traffic. Includes product price, upsells, and bundle adjustments; excludes taxes and shipping.

**Calculation:**
AOV = total revenue / number of orders

**Why it matters:**
AOV tells you how much each customer spends. A higher AOV means you can tolerate a higher CPA while staying profitable. Velocity optimizes AOV through offer design, bundles, and post-purchase upsells — this is a metric the system actively influences.

**What it doesn't tell you:**
AOV alone doesn't tell you whether the ad is profitable. You need CPA and contribution margin to complete the picture. A high AOV from a high-cost-of-goods product might be less profitable than a lower AOV on a high-margin one.


---

### Cost Per Acquisition

**Short name:** CPA

**Definition:**
The observed cost per customer for this ad, calculated from actual spend and actual orders produced, including all variants currently in testing.

**Calculation:**
CPA = ad spend directed at this ad / unique customers produced by this ad's traffic

**Why it matters:**
CPA is the bottom-line ad efficiency metric — how much you paid to acquire each customer. Media buyers use CPA to judge whether an ad is profitable relative to the offer's margin.

**What it doesn't tell you:**
Observed CPA during experimentation is polluted by variants that haven't won yet. For a cleaner read of the ad's performance, see True CPA. CPA also doesn't reflect offer economics on its own — pair with AOV and contribution margin to judge whether the CPA is healthy for this product.


---

### Cost per Customer

**Short name:** none

**Definition:**
The cost of acquiring each customer through Velocity. A scoped version of CAC that only includes traffic sent to Velocity funnels.

**Calculation:**
Cost per Customer = ad spend directed to Velocity / orders processed through Velocity's checkout

**Why it matters:**
This is the cost side of unit economics for the Velocity experience specifically. Merchants use it to judge whether the price of acquiring a customer is reasonable given the offer's value. Unlike blended CAC across the whole account, this metric is auditable from both sides — the merchant knows their ad spend, Velocity knows the orders.

**What it doesn't tell you:**
Observed Cost per Customer during experimentation can be inflated by variants being tested. For the cleaner version, see True CPA. Cost per Customer alone also doesn't tell you if the CAC is healthy — pair with AOV and contribution margin.


---

### True CPA

**Short name:** True CPA

**Definition:**
The projected cost per acquisition for this ad if traffic were routed to the current winning variant. Separates the ad's actual performance from the temporary cost of Velocity's experimentation.

**Calculation:**
Of all variants for this ad that have accumulated sufficient data to judge, True CPA equals the CPA of the best-performing variant.

True CPA = spend on winning variant / customers acquired through winning variant

Variants in "learning" or "new" state do not contribute. Variants the system has identified as underperformers and plans to retire do not contribute.

**Why it matters:**
During experimentation, observed CPA is inflated because some portion of traffic is routed to variants being tested. This drags down the aggregate number even when the ad itself is performing well. True CPA answers the question: "What would this ad's CPA be if we finished experimenting and committed to the winner?" Merchants use True CPA to decide whether to scale or pause an ad. Without it, they risk killing winning ads based on observed CPA that includes experimentation drag.

**What it doesn't tell you:**
True CPA is a projection, not a guarantee. Its reliability depends on data volume and the margin between the winner and next-best variant. A confidence indicator accompanies every True CPA estimate to communicate reliability.


---

## Efficiency metrics

Metrics that measure how efficiently ads are converting traffic into value.

---

### Conversion Rate

**Short name:** CVR

**Definition:**
The percentage of visitors from this ad that complete a purchase.

**Calculation:**
CVR = orders / visitors, expressed as a percentage

**Why it matters:**
CVR tells you how effective the funnel is at converting traffic into customers. Within a specific experiment or niche comparison, CVR is a clean signal. Velocity optimizes CVR through landing page, presell, and checkout design.

**What it doesn't tell you:**
CVR in aggregate across different offers, audiences, or funnels is misleading. A low CVR from a high-intent audience might produce better economics than a high CVR from a low-intent audience. CVR should be interpreted within comparable segments (same niche, same offer, same ad angle) rather than portfolio-wide. For a unified efficiency read, use RPV, which combines CVR and AOV.


---

### Earnings Per Click

**Short name:** EPC

**Definition:**
The revenue produced per click on this ad. A normalized view of ad efficiency that combines conversion and order value into one number.

**Calculation:**
EPC = total revenue from this ad / total clicks on this ad

**Why it matters:**
EPC is a single efficiency metric that captures whether the ad's traffic produces value. Two ads with different click volumes can be compared directly. Higher EPC means the traffic converts well and spends well — Velocity's funnel is doing its job.

**What it doesn't tell you:**
EPC doesn't include ad spend. Pair with CPC (cost per click) to judge profitability. If EPC is $5 and CPC is $3, you're profitable per click. If CPC is $6, you're not.


---

### Rank

**Short name:** none

**Definition:**
A percentile score showing how this ad is performing relative to the merchant's other ads, combining multiple performance metrics into a single signal. Expressed as a percentile from 0 to 100.

**Calculation:**
Rank is a composite score derived from weighted performance metrics (CVR, RPV, ROAS), benchmarked against all Established and Optimizing ads in the merchant's account. Ads in New or Learning phase are excluded from the ranking pool because their metrics aren't reliable yet.

**Why it matters:**
Rank gives a scannable single-number view of ad performance. It lets merchants quickly identify their best and worst ads without cross-referencing multiple metric columns. Higher rank = better performer relative to the rest of the account.

**What it doesn't tell you:**
Rank is relative, not absolute. An ad at 50th percentile in a high-performing account might outperform an ad at 90th percentile in a weak account. Rank also doesn't tell you which dimension is driving the score — for that, look at the individual metrics.


---

### Return on Ad Spend

**Short name:** ROAS

**Definition:**
Revenue produced per dollar of ad spend. A top-level efficiency metric.

**Calculation:**
ROAS = revenue / spend, expressed as a multiplier (e.g., 2.5x)

**Why it matters:**
ROAS is the simplest measure of ad profitability. ROAS above 1.0 means the ads are producing more revenue than they cost; ROAS below 1.0 means they're losing money. Most merchants have a target ROAS based on their margins.

**What it doesn't tell you:**
ROAS doesn't account for cost of goods or operating expenses. A ROAS of 2x might be unprofitable for a product with 60% cost of goods. Pair with contribution margin to judge true profitability. ROAS also doesn't isolate what Velocity controls — it's influenced by both the merchant's ad costs and Velocity's funnel performance.


---

### Revenue Per Visitor

**Short name:** RPV

**Definition:**
The average revenue produced per visitor who reaches Velocity's funnel.

**Calculation:**
RPV = total revenue from this traffic / total visitors from this traffic

**Why it matters:**
RPV is a unified efficiency metric that combines conversion rate and average order value. If RPV is climbing, Velocity's funnel is converting visitors into more value per head — the metric moves whether CVR improved, AOV improved, or both. RPV is especially useful for comparing two ads or two time periods without needing to reason about CVR and AOV separately.

**What it doesn't tell you:**
RPV doesn't include spend, so it can't tell you if the ad is profitable. Pair with CPC to determine profitability per click.


---

## Volume metrics

Metrics that measure the size of the ad's activity — traffic, orders, and spend.

---

### Clicks

**Short name:** none

**Definition:**
The number of clicks on this ad during the current period, as reported by Meta.

**Calculation:**
Direct pull from Meta ad platform.

**Why it matters:**
Clicks are the top of Velocity's funnel — the visitors sent to Velocity's experiment links. Click volume determines how much data Velocity can use to run experiments effectively.

**What it doesn't tell you:**
Click volume alone doesn't tell you anything about quality. High clicks with low conversions could indicate an audience mismatch between ad and offer.


---

### Cost Per Click

**Short name:** CPC

**Definition:**
The average cost the merchant pays per click on this ad.

**Calculation:**
CPC = spend / clicks

**Why it matters:**
CPC tells you the cost of traffic. Lower CPC means more clicks per dollar. CPC is a merchant-owned metric — driven by audience targeting, creative quality, and Meta's auction dynamics. Pair CPC with EPC to judge per-click profitability.

**What it doesn't tell you:**
CPC alone doesn't tell you if clicks are converting. A low CPC on low-quality traffic can produce worse economics than a high CPC on high-quality traffic.


---

### Orders

**Short name:** none

**Definition:**
The total number of customer orders processed through Velocity's checkout from this ad's traffic during the current period.

**Calculation:**
Count of unique orders from this ad's traffic.

**Why it matters:**
Orders is the fact of conversion. It's the numerator for CVR and the denominator for CPA and AOV. Order count is what ultimately makes the merchant money.

**What it doesn't tell you:**
Order count without context doesn't tell you efficiency. Pair with visitors (for CVR) or spend (for CPA) to make it meaningful.


---

### Revenue

**Short name:** none

**Definition:**
Total revenue processed through Matter's checkout from this ad's traffic. A factual total, not an attribution claim.

**Calculation:**
Revenue = sum of all order values from this ad's traffic

**Why it matters:**
Revenue is the outcome. It tells you the total value Velocity's funnel has produced from this ad's visitors. Revenue is always shown contextualized with visitor count so the merchant can connect it to their ad spend.

**What it doesn't tell you:**
Revenue alone doesn't tell you whether the system is working. High revenue could come from high traffic volume (merchant's variable) rather than improved rates (Velocity's variable). To judge Velocity's impact, use rate metrics (CVR, AOV, RPV) and compare to baseline.


---

### Spend

**Short name:** none

**Definition:**
Total ad spend on ads directed to Velocity for the current period.

**Calculation:**
Spend is pulled directly from Meta and reflects what the merchant paid for ads pointing to Velocity experiment links.

**Why it matters:**
Spend is the merchant's input — what they paid to send traffic to Velocity. It's the denominator for CPA, CPC, and ROAS calculations. Spend is a merchant-owned variable; Velocity doesn't control how much traffic the merchant buys.

**What it doesn't tell you:**
Spend alone doesn't tell you anything about performance. Pair with clicks (for CPC), orders (for CPA), or revenue (for ROAS) to make it meaningful.


---

## Experimentation metrics

Metrics specific to Velocity's experimentation system and the reliability of its data.

---

### Confidence Indicator

**Short name:** none (shown as a tag: High / Medium / Low)

**Definition:**
A reliability signal attached to True CPA estimates. Tells merchants how much to trust the projection.

**Calculation:**
Confidence is derived from three factors:
1. Data volume on the winning variant (more orders = tighter estimate)
2. Margin between the winner and the next-best variant (clearer separation = higher confidence)
3. Duration of the winner's lead (longer consistency = higher confidence)

These combine into a score that maps to three levels: High (ample data, clear lead, consistent), Medium (enough data but narrow margin or short duration), Low (just enough data, close race, or recent emergence).

**Why it matters:**
True CPA is a projection, and projections vary in reliability. Showing confidence prevents merchants from over-trusting early estimates that might shift as more data comes in.

**What it doesn't tell you:**
Confidence is about the projection, not about the ad's quality. Low confidence on a high True CPA estimate doesn't mean the ad is bad — it means the system hasn't settled on a clear winner yet.


---

### Phase

**Short name:** none (shown as a tag: New / Learning / Optimizing / Established)

**Definition:**
A lifecycle indicator showing how mature Velocity's experimentation is for this ad's traffic, and consequently how reliable the performance data is.

**Calculation:**
Phase is determined by two signals: whether the ad has accumulated enough traffic to be judged, and whether the experiment behind the ad has identified a winning approach. If either signal hasn't matured, Phase reflects the less-mature state.

Stages: New (just started, minimal data), Learning (actively exploring, no winner yet), Optimizing (winner found, fine-tuning), Established (stable winner, consistent performance).

**Why it matters:**
Phase tells merchants which ads they can trust the data on. A low-ranking ad in Learning phase isn't necessarily underperforming — it hasn't accumulated enough data to judge. Phase prevents premature scaling or killing decisions.

**What it doesn't tell you:**
Phase tells you about data reliability, not performance quality. An Established ad can be a winner or a loser; the Phase tag just means the performance read is trustworthy.


---

## Engagement metrics

Metrics that measure behavior within the funnel beyond conversion.

---

### Upsell Take Rate

**Short name:** none

**Definition:**
The percentage of customers who accept a post-purchase upsell offer.

**Calculation:**
Upsell Take Rate = customers who accepted at least one upsell / total customers, expressed as a percentage

**Why it matters:**
Upsell take rate drives AOV. If the rate is high, the upsell offer resonates with the audience and boosts per-customer revenue. Velocity tests upsell offers and order as part of variant experimentation.

**What it doesn't tell you:**
Take rate alone doesn't tell you the revenue impact. Pair with upsell price to calculate the AOV lift. A 50% take rate on a $10 upsell produces less revenue than a 20% take rate on a $50 upsell.


---

## Metrics intentionally NOT included

Transparency on what we don't show and why:

- **CTR (Click-Through Rate):** Pre-click metric available in Meta Ads Manager. Velocity reports on what happens after the click.
- **CPM (Cost Per Mille):** Ad delivery metric available upstream in Meta. Not in Velocity's scope.
- **Video Hook Rate / Video Hold Rate:** Considered noisy signals that don't correlate well with ultimate CPA. Deprioritized in favor of CPA and True CPA.
- **Demographic Breakdown:** Useful for creative adjustments but not for targeting changes. Available in Meta for merchants who want it.
- **Individual Variant Performance:** Never shown merchant-facing. Exposing individual variant metrics invites micromanagement and undermines the accountability boundary.

---

## Agent Training Guidelines

The embedded agent should be able to answer questions like:

- "Why is this ad's observed CPA different from its True CPA?"
- "Should I scale this ad?"
- "My CVR looks bad — is something wrong?"
- "What's the difference between CPA and Cost per Customer?"
- "Why isn't CVR on the KPI cards?"
- "How do I know when to trust the data?"

Answers should:

1. Use the metric definitions and relationships documented above
2. Reinforce the accountability boundary (Velocity controls rates and variant routing, merchant controls spend and traffic)
3. Acknowledge uncertainty honestly when data is insufficient
4. Never recommend specific actions (scale, kill, pause). Present facts and relationships; let the merchant decide
5. Direct the merchant to the "Learn more" glossary entry when a concept requires deeper explanation than a chat message can carry

---

## Source

This documentation is grounded in:

- Velocity accountability framework (merchants own up to the ad; Matter owns the destination)
- Jason's Velocity UI principles (rate-first, calm by default, scale-aware, phase-aware)
- Naveed's merchant and media-buyer input (CPA north star, True CPA concept, CVR in segments only, EPC as synthesized efficiency metric)
- Velocity evaluator skill (accountability, hierarchy, scale, phase, language, trust dimensions)
