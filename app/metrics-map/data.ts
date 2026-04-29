// Source: docs/Reporting Metrics 2026.pdf
// Faithfully transcribed from the PDF. Layer-specific tags / system metrics
// will be layered in separately later.

export type MetricType = 'result' | 'actionable' | 'diagnostic' | 'cost';

export type Domain = {
  id: string;
  label: string;
  desc: string;
};

export type Metric = {
  id: string;
  label: string;
  parent: string;
  type: MetricType;
  desc: string;
};

export type Edge = [string, string];

export const TYPE_COLOR: Record<MetricType, { border: string; bg: string; chip: string; text: string }> = {
  result:     { border: '#22c55e', bg: '#ffffff', chip: '#dcfce7', text: '#166534' },
  actionable: { border: '#3b82f6', bg: '#ffffff', chip: '#dbeafe', text: '#1e40af' },
  diagnostic: { border: '#eab308', bg: '#ffffff', chip: '#fef9c3', text: '#854d0e' },
  cost:       { border: '#ef4444', bg: '#ffffff', chip: '#fee2e2', text: '#991b1b' },
};

export const TYPE_DESC: Record<MetricType, string> = {
  result:     'Calculated outcome of a period — influenced by actionable + cost metrics.',
  actionable: 'Directly impacted by specific actions or system levers.',
  diagnostic: 'Ratio of two other metrics; not actionable directly, but indicates health.',
  cost:       'Entry cost feeding the funnel or system economics.',
};

export const domains: Domain[] = [
  { id: 'd_logistics',     label: 'Logistics & Operations', desc: 'Inventory, fulfillment, and shipping operations.' },
  { id: 'd_returns',       label: 'Returns & Refunds', desc: 'Return rate, refunds, and post-return customer service.' },
  { id: 'd_finance',       label: 'Revenue & Profitability', desc: 'Top financial spine: Revenue → Gross Profit → Net Profit, with cost drivers and margin diagnostics.' },
  { id: 'd_cs',            label: 'Customer Service & Support', desc: 'Ticketing throughput and customer satisfaction signals (CSAT, NPS).' },
  { id: 'd_loyalty',       label: 'Loyalty Program', desc: 'Loyalty engagement, redemption, and program ROI.' },
  { id: 'd_orders',        label: 'Orders', desc: 'Order outcomes — Conversion Rate, Orders, AOV, % Cancelled Orders.' },
  { id: 'd_prod',          label: 'Product', desc: 'Per-item and per-order product metrics — units, prices, ratings, availability.' },
  { id: 'd_offline',       label: 'Offline Commerce', desc: 'Brick-and-mortar sales — foot traffic, conversion rate, transaction value, staff efficiency.' },
  { id: 'd_crm',           label: 'CRM', desc: 'Customer acquisition and retention — new, total, active, and repeat customers; CAC and AVRPC.' },
  { id: 'd_checkout',      label: 'Checkout Process', desc: 'Cart-to-purchase funnel — cart views, checkouts, placed orders, abandonment.' },
  { id: 'd_marketplace',   label: 'Marketplace', desc: 'Third-party marketplace sales, returns, and commission.' },
  { id: 'd_subscription',  label: 'Subscription', desc: 'Recurring revenue — MRR, churn, subscriber growth.' },
  { id: 'd_referral',      label: 'Referral Program', desc: 'Customer-driven acquisition via referrals.' },
  { id: 'd_affiliate',     label: 'Affiliate Marketing', desc: 'Affiliate-driven traffic, revenue, commissions, and ROI.' },
  { id: 'd_influence',     label: 'Influence Marketing', desc: 'Influencer-driven attribution via promo codes.' },
  { id: 'd_content',       label: 'Content Marketing', desc: 'Editorial content driving leads and conversions.' },
  { id: 'd_conv',          label: 'Conversions', desc: 'On-site engagement that feeds the cart funnel — sessions, add-to-cart, items viewed, bounce rate.' },
  { id: 'd_livestream',    label: 'Livestream Commerce', desc: 'Live shopping events — viewers, watch time, engagement, conversion.' },
  { id: 'd_amazon_ads',    label: 'Amazon Ads', desc: 'Amazon advertising — impressions, clicks, orders, sales, ACOS.' },
  { id: 'd_social',        label: 'Social Media', desc: 'Organic social engagement.' },
  { id: 'd_seo',           label: 'SEO', desc: 'Organic search — impressions, clicks, CTR, position, keywords.' },
  { id: 'd_email',         label: 'Email', desc: 'Email marketing — deliveries, opens, clicks, and rates.' },
  { id: 'd_meta_ads',      label: 'Meta Ads', desc: 'Meta (Facebook / Instagram) advertising.' },
  { id: 'd_google_ads',    label: 'Google Ads', desc: 'Google advertising — including Ad Rank.' },
  { id: 'd_tiktok_ads',    label: 'TikTok Ads', desc: 'TikTok advertising — including video completion rate.' },
  { id: 'd_pinterest_ads', label: 'Pinterest Ads', desc: 'Pinterest advertising — including pin saves.' },
  { id: 'd_youtube_ads',   label: 'YouTube Ads', desc: 'YouTube advertising — including video view rate.' },

  // === Velocity-specific domains (added on top of the source PDF baseline) ===
  { id: 'd_revshare',      label: 'Revenue Share & Transactions', desc: 'Per-transaction revenue share primitives (Matter share / Merchant share / refunds / fees) and the Section 4c reconciliation roll-ups that produce Net Matter Revenue.' },
  { id: 'd_funnel',        label: 'Funnel Variant Performance', desc: 'Step-by-step funnel performance per variant — Page → Sales Page → Checkout → Order. Counts come from Page events filtered by page_type; rates are derived.' },
  { id: 'd_upsell',        label: 'Upsell / Downsell Flow', desc: 'Post-order upsell and downsell measurement. Built from Page (upsell/downsell), Product List Viewed (offers shown), Product Added (click-buy intent), and order-contains-product verification.' },
  { id: 'd_offers',        label: 'Offers', desc: 'Offer-level performance — take rates by context (main, checkout, upsell), top offers ranking, offers shown counts.' },
  { id: 'd_experiment',    label: 'Experiments', desc: 'Experiment-level aggregates over funnel variants — active count, win rate, lift, statistical confidence, time to significance, and performance by Generation Strategy / Hero Product tags.' }
];

export const metrics: Metric[] = [
  // === Logistics & Operations ===
  { id: 'inventory_turnover',   label: 'Inventory Turnover',     parent: 'd_logistics', type: 'actionable', desc: 'How quickly inventory cycles through (COGS / average inventory). Higher = healthier turnover.' },
  { id: 'dead_stock',           label: 'Dead Stock',             parent: 'd_logistics', type: 'result',     desc: 'Inventory that has not sold within an expected window — frozen capital and write-down risk.' },
  { id: 'stock_levels',         label: 'Stock Levels',           parent: 'd_logistics', type: 'result',     desc: 'Current on-hand inventory by SKU.' },
  { id: 'carrying_cost',        label: 'Carrying Cost',          parent: 'd_logistics', type: 'cost',       desc: 'Cost of holding inventory (warehousing, capital, insurance, shrinkage).' },
  { id: 'fulfillment_accuracy', label: 'Fulfillment Accuracy',   parent: 'd_logistics', type: 'actionable', desc: 'Share of orders shipped correctly (right item, right quantity, right address).' },
  { id: 'on_time_delivery',     label: 'On-Time Delivery Rate',  parent: 'd_logistics', type: 'actionable', desc: 'Share of orders delivered by promised date.' },
  { id: 'lost_damaged',         label: 'Lost or Damaged Goods',  parent: 'd_logistics', type: 'result',     desc: 'Units lost or damaged in fulfillment / transit.' },
  { id: 'shipping_costs',       label: 'Shipping Costs',         parent: 'd_logistics', type: 'cost',       desc: 'Outbound shipping and carrier costs.' },

  // === Returns & Refunds ===
  { id: 'return_rate',          label: 'Return Rate',            parent: 'd_returns', type: 'actionable',     desc: 'Returned orders / completed orders.' },
  { id: 'refunds',              label: 'Refunds',                parent: 'd_returns', type: 'cost',     desc: 'Total refunded amount over the period.' },
  { id: 'css_post_return',      label: 'CSS Post-Return',        parent: 'd_returns', type: 'actionable', desc: 'Customer satisfaction after a return — the return experience itself influences overall CSAT/NPS.' },
  { id: 'return_fraud_rate',    label: 'Return Fraud Rate',      parent: 'd_returns', type: 'actionable', desc: 'Share of returns flagged as fraudulent / abusive.' },
  { id: 'cost_per_return',      label: 'Cost per Return',        parent: 'd_returns', type: 'diagnostic', desc: 'Average operational cost incurred per return processed.' },

  // === Revenue & Profitability ===
  { id: 'sales_taxes',          label: 'Sales Taxes',            parent: 'd_finance', type: 'actionable',     desc: 'Sales tax collected on revenue.' },
  { id: 'net_profit',           label: 'Net Profit',             parent: 'd_finance', type: 'result',     desc: 'Bottom-line profit after all expenses, taxes, and refunds.' },
  { id: 'net_profit_growth',    label: 'Net Profit Growth Rate', parent: 'd_finance', type: 'diagnostic', desc: 'Period-over-period change in Net Profit.' },
  { id: 'net_profit_margin',    label: 'Net Profit Margin',      parent: 'd_finance', type: 'diagnostic', desc: 'Net Profit / Revenue.' },
  { id: 'ltv',                  label: 'LTV',                    parent: 'd_finance', type: 'diagnostic', desc: 'Lifetime Value — long-run profit attributable to a customer.' },
  { id: 'opex',                 label: 'Operational Expenses',   parent: 'd_finance', type: 'cost',       desc: 'Operating costs that reduce Gross Profit on the way to Net Profit.' },
  { id: 'marketing_expenses',   label: 'Marketing Expenses',     parent: 'd_finance', type: 'cost',       desc: 'Total marketing spend — sum of all paid channel budgets and program payments.' },
  { id: 'gross_profit',         label: 'Gross Profit',           parent: 'd_finance', type: 'result',     desc: 'Revenue − COGS.' },
  { id: 'gross_profit_margin',  label: 'Gross Profit Margin',    parent: 'd_finance', type: 'diagnostic', desc: 'Gross Profit / Revenue.' },
  { id: 'cogs',                 label: 'COGS (Cost of Goods Sold)', parent: 'd_finance', type: 'cost',     desc: 'Direct cost of the goods sold during the period.' },
  { id: 'revenue',              label: 'Revenue',                parent: 'd_finance', type: 'result',     desc: 'Gross sales over the period (before COGS and OpEx).' },
  { id: 'roas',                 label: 'ROAS (Return on Ad Spend)', parent: 'd_finance', type: 'diagnostic', desc: 'Revenue attributable to ads / ad spend.' },
  { id: 'discounts',            label: 'Discounts',              parent: 'd_finance', type: 'result',     desc: 'Total discount value applied to orders during the period.' },

  // === Customer Service & Support ===
  { id: 'ticket_resolution_time', label: 'Ticket Resolution Time', parent: 'd_cs', type: 'actionable', desc: 'Average time from ticket open to resolution.' },
  { id: 'csat',                 label: 'Customer Satisfaction Score', parent: 'd_cs', type: 'result',  desc: 'Customer-reported satisfaction (CSAT survey).' },
  { id: 'nps',                  label: 'NPS',                    parent: 'd_cs', type: 'result',     desc: 'Net Promoter Score — willingness to recommend.' },
  { id: 'ticket_resolution_rate', label: 'Ticket Resolution Rate', parent: 'd_cs', type: 'actionable', desc: 'Share of tickets resolved within target SLA.' },

  // === Loyalty Program ===
  { id: 'loyalty_roi',          label: 'Loyalty Program ROI',    parent: 'd_loyalty', type: 'diagnostic', desc: 'Net program benefit / program cost.' },
  { id: 'loyalty_active_participation', label: 'Active Participation Rate', parent: 'd_loyalty', type: 'actionable', desc: 'Share of enrolled members actively engaging during the period.' },
  { id: 'redemption_rate',      label: 'Redemption Rate',        parent: 'd_loyalty', type: 'actionable',     desc: 'Share of issued rewards / points actually redeemed. More frequent redemption increases discount cost.' },

  // === Orders ===
  { id: 'conversion_rate',      label: 'Conversion Rate',        parent: 'd_orders', type: 'actionable',     desc: 'Orders divided by visitors / sessions — primary funnel outcome.' },
  { id: 'orders',               label: 'Orders',                 parent: 'd_orders', type: 'result',     desc: 'Confirmed orders during the period.' },
  { id: 'aov',                  label: 'AOV',                    parent: 'd_orders', type: 'actionable',     desc: 'Average Order Value — Revenue / Orders.' },
  { id: 'pct_cancelled_orders', label: '% of Cancelled Orders',  parent: 'd_orders', type: 'diagnostic', desc: 'Cancelled orders / placed orders.' },

  // === Product ===
  { id: 'avg_units_per_item',   label: 'Average Units per Item', parent: 'd_prod', type: 'actionable',     desc: 'Average units sold per SKU.' },
  { id: 'units_sold',           label: 'Number of Units Sold',   parent: 'd_prod', type: 'result',     desc: 'Total units sold across all products.' },
  { id: 'avg_reviews_per_item', label: 'Average Reviews per Item', parent: 'd_prod', type: 'actionable',   desc: 'Average review count per SKU.' },
  { id: 'avg_item_rating',      label: 'Average Item Rating',    parent: 'd_prod', type: 'actionable',     desc: 'Average customer rating per SKU.' },
  { id: 'avg_items_per_order',  label: 'Average Items per Order', parent: 'd_prod', type: 'result',    desc: 'Units / Orders. Bundle / upsell strength.' },
  { id: 'total_items',          label: 'Total Items',            parent: 'd_prod', type: 'actionable',     desc: 'Total distinct items in catalog (or sold over the period — depending on slice).' },
  { id: 'product_availability', label: 'Product Availability Rate', parent: 'd_prod', type: 'result', desc: 'Share of catalog in-stock and orderable.' },
  { id: 'avg_price_per_item',   label: 'Average Price per Item', parent: 'd_prod', type: 'result',     desc: 'Average sale price across SKUs.' },
  { id: 'avg_cost_per_item',    label: 'Average Cost per Item',  parent: 'd_prod', type: 'actionable',     desc: 'Average COGS per SKU.' },
  { id: 'avg_margin_per_item',  label: 'Average Margin per Item', parent: 'd_prod', type: 'diagnostic', desc: 'Average price − average cost per SKU.' },

  // === Offline Commerce ===
  { id: 'offline_cr',           label: 'Offline Conversion Rate', parent: 'd_offline', type: 'actionable',  desc: 'In-store conversion — transactions / foot traffic.' },
  { id: 'offline_sales',        label: 'Offline Sales',          parent: 'd_offline', type: 'result',     desc: 'In-store / brick-and-mortar revenue.' },
  { id: 'staff_efficiency',     label: 'Staff Efficiency',       parent: 'd_offline', type: 'diagnostic', desc: 'Sales (or transactions) per staff hour.' },
  { id: 'avg_transaction_value', label: 'Average Transaction Value', parent: 'd_offline', type: 'result', desc: 'In-store average ticket size.' },
  { id: 'foot_traffic',         label: 'Foot Traffic',           parent: 'd_offline', type: 'result',     desc: 'In-store visitor count.' },

  // === CRM ===
  { id: 'repeat_customers',     label: 'Repeat Customers',       parent: 'd_crm', type: 'result',     desc: 'Customers who placed more than one order.' },
  { id: 'active_customers',     label: 'Active Customers',       parent: 'd_crm', type: 'result',     desc: 'Customers with activity in the period.' },
  { id: 'repeat_purchase_rate', label: 'Repeat Purchase Rate',   parent: 'd_crm', type: 'actionable', desc: 'Repeat Customers / Total Customers.' },
  { id: 'new_customers',        label: 'New Customers',          parent: 'd_crm', type: 'result',     desc: 'First-time buyers in the period.' },
  { id: 'time_to_first_purchase', label: 'Time to First Purchase', parent: 'd_crm', type: 'actionable',   desc: 'Time from first visit to first order.' },
  { id: 'total_customers',      label: 'Total Customers',        parent: 'd_crm', type: 'result',     desc: 'Total cumulative customer count.' },
  { id: 'cac',                  label: 'CAC',                    parent: 'd_crm', type: 'diagnostic', desc: 'Customer Acquisition Cost — Marketing Expenses / New Customers.' },
  { id: 'arppc',                label: 'ARPPC',                  parent: 'd_crm', type: 'diagnostic', desc: 'Average Revenue per Paying Customer.' },

  // === Checkout Process ===
  { id: 'cart_abandonment',     label: 'Cart Abandonment Rate',  parent: 'd_checkout', type: 'actionable', desc: 'Carts created that did not result in a placed order.' },
  { id: 'placed_orders',        label: 'Placed Orders',          parent: 'd_checkout', type: 'result',     desc: 'Orders submitted at the end of checkout.' },
  { id: 'checkout_conversion',  label: 'Checkout Conversion',    parent: 'd_checkout', type: 'diagnostic', desc: 'Placed Orders / Checkouts.' },
  { id: 'promo_code_applied',   label: 'Promo Code Applied',     parent: 'd_checkout', type: 'result',     desc: 'Orders with a promo code redeemed at checkout.' },
  { id: 'checkouts',            label: 'Checkouts',              parent: 'd_checkout', type: 'result',     desc: 'Sessions that began the checkout flow.' },
  { id: 'cart_views',           label: 'Cart Views',             parent: 'd_checkout', type: 'result',     desc: 'Cart page views.' },

  // === Marketplace ===
  { id: 'marketplace_aov',      label: 'Marketplace Average Order Value (AOV)', parent: 'd_marketplace', type: 'result', desc: 'Average order value for marketplace orders.' },
  { id: 'marketplace_sales',    label: 'Marketplace Sales',      parent: 'd_marketplace', type: 'result',     desc: 'Revenue earned through third-party marketplaces.' },
  { id: 'marketplace_return_rate', label: 'Marketplace Return Rate', parent: 'd_marketplace', type: 'actionable', desc: 'Return rate on marketplace orders.' },
  { id: 'marketplace_commission', label: 'Marketplace Commission', parent: 'd_marketplace', type: 'cost',     desc: 'Commission paid to the marketplace.' },

  // === Subscription ===
  { id: 'churn_rate',           label: 'Churn Rate',             parent: 'd_subscription', type: 'actionable', desc: 'Share of subscribers cancelling per period.' },
  { id: 'mrr',                  label: 'MRR',                    parent: 'd_subscription', type: 'result',     desc: 'Monthly Recurring Revenue.' },
  { id: 'subscriber_growth_rate', label: 'Subscriber Growth Rate', parent: 'd_subscription', type: 'diagnostic', desc: 'Net subscriber growth period-over-period.' },

  // === Referral Program ===
  { id: 'referral_rate',        label: 'Referral Rate',          parent: 'd_referral', type: 'actionable', desc: 'Customers who refer / total customers.' },
  { id: 'referral_conversion_rate', label: 'Referral Conversion Rate', parent: 'd_referral', type: 'diagnostic', desc: 'New customers from referrals / referrals sent.' },
  { id: 'referral_program_roi', label: 'Referral Program ROI',   parent: 'd_referral', type: 'diagnostic', desc: 'Net program benefit / program cost.' },

  // === Affiliate Marketing ===
  { id: 'epc',                  label: 'Earnings Per Click (EPC)', parent: 'd_affiliate', type: 'diagnostic', desc: 'Affiliate revenue / affiliate clicks.' },
  { id: 'affiliate_revenue',    label: 'Affiliate Revenue',      parent: 'd_affiliate', type: 'result',     desc: 'Revenue attributed to affiliates.' },
  { id: 'affiliate_roi',        label: 'Affiliate ROI',          parent: 'd_affiliate', type: 'diagnostic', desc: 'Affiliate Revenue / Affiliate Commissions.' },
  { id: 'affiliate_commissions', label: 'Affiliate Commissions', parent: 'd_affiliate', type: 'cost',       desc: 'Commission paid to affiliates.' },
  { id: 'active_affiliates',    label: 'Active Affiliates',      parent: 'd_affiliate', type: 'result',     desc: 'Affiliates that drove at least one event in the period.' },

  // === Influence Marketing ===
  { id: 'influencer_orders',    label: "Orders with Influencer's Coupons", parent: 'd_influence', type: 'result', desc: 'Orders attributed to an influencer via promo code.' },
  { id: 'collaborating_influencers', label: 'Collaborating Influencers', parent: 'd_influence', type: 'result', desc: 'Active influencer partners in the period.' },
  { id: 'total_influencer_payments', label: 'Total Influencer Payments', parent: 'd_influence', type: 'cost', desc: 'Total payments / fees to influencers.' },

  // === Content Marketing ===
  { id: 'content_conversion_rate', label: 'Content Conversion Rate', parent: 'd_content', type: 'actionable', desc: 'Conversions / content sessions.' },
  { id: 'content_marketing_leads', label: 'Content Marketing Leads', parent: 'd_content', type: 'result', desc: 'Leads attributed to content.' },
  { id: 'content_engagement_rate', label: 'Content Engagement Rate', parent: 'd_content', type: 'diagnostic', desc: 'Engaged sessions / content sessions.' },
  { id: 'content_pieces',       label: 'Content Pieces',         parent: 'd_content', type: 'result',     desc: 'Pieces of content published in the period.' },

  // === Conversions ===
  { id: 'add_to_cart_rate',     label: 'Add to Cart Rate',       parent: 'd_conv', type: 'actionable', desc: 'Add to Cart events / sessions.' },
  { id: 'add_to_cart',          label: 'Add to Cart',            parent: 'd_conv', type: 'result',     desc: 'Add to Cart events.' },
  { id: 'items_viewed',         label: 'Items Viewed',           parent: 'd_conv', type: 'result',     desc: 'Product detail page views.' },
  { id: 'bounce_rate',          label: 'Bounce Rate',            parent: 'd_conv', type: 'diagnostic', desc: 'Sessions that left without engagement.' },
  { id: 'dau',                  label: 'DAU (Daily Active Users)', parent: 'd_conv', type: 'result',   desc: 'Daily active users.' },
  { id: 'sessions',             label: 'Sessions',               parent: 'd_conv', type: 'result',     desc: 'Distinct visitor sessions.' },
  { id: 'engaged_sessions',     label: 'Engaged Sessions',       parent: 'd_conv', type: 'result',     desc: 'Sessions exceeding engagement threshold.' },
  { id: 'total_app_installs',   label: 'Total App Installs',     parent: 'd_conv', type: 'result',     desc: 'Cumulative mobile app installs.' },
  { id: 'active_users',         label: 'Active Users',           parent: 'd_conv', type: 'result',     desc: 'Active users in the period.' },

  // === Livestream Commerce ===
  { id: 'livestream_leads',     label: 'Livestream Leads',       parent: 'd_livestream', type: 'result',     desc: 'Leads generated from livestream events.' },
  { id: 'livestream_cr',        label: 'Livestream CR',          parent: 'd_livestream', type: 'actionable', desc: 'Conversion rate of livestream viewers.' },
  { id: 'livestream_roi',       label: 'Livestream ROI',         parent: 'd_livestream', type: 'diagnostic', desc: 'Net livestream revenue / livestream cost.' },
  { id: 'viewer_count',         label: 'Viewer Count',           parent: 'd_livestream', type: 'result',     desc: 'Concurrent / total viewers per stream.' },
  { id: 'avg_watch_time',       label: 'Average Watch Time',     parent: 'd_livestream', type: 'actionable',     desc: 'Average viewer watch time per stream.' },
  { id: 'livestream_engagement_rate', label: 'Livestream Engagement Rate', parent: 'd_livestream', type: 'diagnostic', desc: 'Engagement actions / viewers.' },

  // === Amazon Ads ===
  { id: 'amazon_sales',         label: 'Amazon Sales',           parent: 'd_amazon_ads', type: 'result',     desc: 'Sales attributed to Amazon Ads.' },
  { id: 'amazon_acos',          label: 'Amazon ACOS',            parent: 'd_amazon_ads', type: 'diagnostic', desc: 'Advertising Cost of Sales — Amazon Spend / Amazon Sales.' },
  { id: 'new_to_brand_orders',  label: 'New-to-Brand Orders',    parent: 'd_amazon_ads', type: 'result',     desc: 'Amazon orders from customers new to the brand.' },
  { id: 'amazon_orders',        label: 'Amazon Orders',          parent: 'd_amazon_ads', type: 'result',     desc: 'Orders attributed to Amazon Ads.' },
  { id: 'amazon_ctr',           label: 'Amazon CTR',             parent: 'd_amazon_ads', type: 'diagnostic', desc: 'Amazon Clicks / Amazon Impressions.' },
  { id: 'amazon_clicks',        label: 'Amazon Clicks',          parent: 'd_amazon_ads', type: 'result',     desc: 'Clicks on Amazon Ads.' },
  { id: 'amazon_impressions',   label: 'Amazon Impressions',     parent: 'd_amazon_ads', type: 'result',     desc: 'Amazon Ad impressions.' },
  { id: 'amazon_spend',         label: 'Amazon Spend',           parent: 'd_amazon_ads', type: 'cost',       desc: 'Amazon Ads spend.' },

  // === Social Media ===
  { id: 'social_engagement_rate', label: 'Engagement Rate',      parent: 'd_social', type: 'actionable', desc: 'Organic social engagement (likes, comments, shares) / impressions.' },
  { id: 'social_media_clicks',    label: 'Social Media Clicks',  parent: 'd_social', type: 'result',     desc: 'Clicks driven from organic social posts.' },
  { id: 'followers',              label: 'Followers',            parent: 'd_social', type: 'result',     desc: 'Total followers across organic social channels.' },
  { id: 'share_of_voice',         label: 'Share of Voice',       parent: 'd_social', type: 'diagnostic', desc: 'Brand mention / discussion share relative to competitors.' },

  // === SEO ===
  { id: 'organic_ctr',          label: 'Organic CTR',            parent: 'd_seo', type: 'diagnostic', desc: 'Organic Clicks / Organic Impressions.' },
  { id: 'organic_clicks',       label: 'Organic Clicks',         parent: 'd_seo', type: 'result',     desc: 'Clicks from organic search results.' },
  { id: 'average_position',     label: 'Average Position',       parent: 'd_seo', type: 'diagnostic', desc: 'Average ranking position in search results.' },
  { id: 'organic_impressions',  label: 'Organic Impressions',    parent: 'd_seo', type: 'result',     desc: 'Search result impressions.' },
  { id: 'keywords',             label: 'Keywords',               parent: 'd_seo', type: 'cost', desc: 'Keywords actively targeted / ranking.' },

  // === Email ===
  { id: 'email_click_rate',     label: 'Email Click Rate',       parent: 'd_email', type: 'diagnostic', desc: 'Clicks / opens (or / delivered, depending on definition).' },
  { id: 'clicked',              label: 'Clicked',                parent: 'd_email', type: 'result',     desc: 'Email link clicks.' },
  { id: 'open_rate',            label: 'Open Rate',              parent: 'd_email', type: 'actionable', desc: 'Opens / successful deliveries.' },
  { id: 'opened',               label: 'Opened',                 parent: 'd_email', type: 'result',     desc: 'Emails opened.' },
  { id: 'delivery_rate',        label: 'Delivery Rate',          parent: 'd_email', type: 'actionable', desc: 'Successful deliveries / sent.' },
  { id: 'successful_deliveries', label: 'Successful Deliveries', parent: 'd_email', type: 'result',     desc: 'Emails successfully delivered.' },

  // === Meta Ads ===
  { id: 'meta_ctr',             label: 'Meta CTR',               parent: 'd_meta_ads', type: 'diagnostic', desc: 'Meta Clicks / Meta Impressions.' },
  { id: 'meta_clicks',          label: 'Meta Clicks',            parent: 'd_meta_ads', type: 'result',     desc: 'Clicks on Meta Ads.' },
  { id: 'meta_cpc',             label: 'Meta CPC',               parent: 'd_meta_ads', type: 'diagnostic', desc: 'Meta Spend / Meta Clicks.' },
  { id: 'meta_cpm',             label: 'Meta CPM',               parent: 'd_meta_ads', type: 'actionable', desc: 'Meta Spend / 1000 Meta Impressions.' },
  { id: 'meta_impressions',     label: 'Meta Impressions',       parent: 'd_meta_ads', type: 'result',     desc: 'Meta Ad impressions.' },
  { id: 'meta_amount_spent',    label: 'Meta Amount Spent',      parent: 'd_meta_ads', type: 'cost',       desc: 'Total Meta Ads spend.' },

  // === Google Ads ===
  { id: 'ga_ctr',               label: 'GA CTR',                 parent: 'd_google_ads', type: 'diagnostic', desc: 'GA Clicks / GA Impressions.' },
  { id: 'ga_clicks',            label: 'GA Clicks',              parent: 'd_google_ads', type: 'result',     desc: 'Clicks on Google Ads.' },
  { id: 'ga_cpc',               label: 'GA CPC',                 parent: 'd_google_ads', type: 'diagnostic', desc: 'GA Spend / GA Clicks.' },
  { id: 'ad_rank',              label: 'Ad Rank',                parent: 'd_google_ads', type: 'actionable', desc: 'Google Ads ranking signal — drives auction position and impressions.' },
  { id: 'ga_impressions',       label: 'GA Impressions',         parent: 'd_google_ads', type: 'result',     desc: 'Google Ad impressions.' },
  { id: 'ga_cpm',               label: 'GA CPM',                 parent: 'd_google_ads', type: 'actionable', desc: 'GA Spend / 1000 GA Impressions.' },
  { id: 'ga_avg_daily_budget',  label: 'GA Average Daily Budget', parent: 'd_google_ads', type: 'cost',      desc: 'Daily budget allocated to Google Ads.' },

  // === TikTok Ads ===
  { id: 'tt_ctr',               label: 'TT CTR',                 parent: 'd_tiktok_ads', type: 'diagnostic', desc: 'TT Clicks / TT Impressions.' },
  { id: 'tt_clicks',            label: 'TT Clicks',              parent: 'd_tiktok_ads', type: 'result',     desc: 'Clicks on TikTok Ads.' },
  { id: 'tt_cpc',               label: 'TT CPC',                 parent: 'd_tiktok_ads', type: 'diagnostic', desc: 'TT Budget / TT Clicks.' },
  { id: 'video_completion_rate', label: 'Video Completion Rate', parent: 'd_tiktok_ads', type: 'actionable', desc: 'Videos played to completion / videos started.' },
  { id: 'tt_impressions',       label: 'TT Impressions',         parent: 'd_tiktok_ads', type: 'result',     desc: 'TikTok Ad impressions.' },
  { id: 'tt_budget',            label: 'TT Budget',              parent: 'd_tiktok_ads', type: 'cost',       desc: 'TikTok Ads budget.' },

  // === Pinterest Ads ===
  { id: 'pinterest_ctr',        label: 'Pinterest CTR',          parent: 'd_pinterest_ads', type: 'diagnostic', desc: 'Pinterest Clicks / Pinterest Impressions.' },
  { id: 'pinterest_clicks',     label: 'Pinterest Clicks',       parent: 'd_pinterest_ads', type: 'result',     desc: 'Clicks on Pinterest Ads.' },
  { id: 'pinterest_cpc',        label: 'Pinterest CPC',          parent: 'd_pinterest_ads', type: 'diagnostic', desc: 'Pinterest Budget / Pinterest Clicks.' },
  { id: 'pin_saves',            label: 'Pin Saves',              parent: 'd_pinterest_ads', type: 'result',     desc: 'Saves of Pinterest Ad pins.' },
  { id: 'pinterest_impressions', label: 'Pinterest Impressions', parent: 'd_pinterest_ads', type: 'result',     desc: 'Pinterest Ad impressions.' },
  { id: 'pinterest_budget',     label: 'Pinterest Budget',       parent: 'd_pinterest_ads', type: 'cost',       desc: 'Pinterest Ads budget.' },

  // === YouTube Ads ===
  { id: 'youtube_ctr',          label: 'YouTube CTR',            parent: 'd_youtube_ads', type: 'diagnostic', desc: 'YouTube Clicks / YouTube Impressions.' },
  { id: 'youtube_clicks',       label: 'YouTube Clicks',         parent: 'd_youtube_ads', type: 'result',     desc: 'Clicks on YouTube Ads.' },
  { id: 'youtube_cpc',          label: 'YouTube CPC',            parent: 'd_youtube_ads', type: 'diagnostic', desc: 'YouTube Budget / YouTube Clicks.' },
  { id: 'video_view_rate',      label: 'Video View Rate',        parent: 'd_youtube_ads', type: 'actionable', desc: 'Video views / impressions.' },
  { id: 'youtube_impressions',  label: 'YouTube Impressions',    parent: 'd_youtube_ads', type: 'result',     desc: 'YouTube Ad impressions.' },
  { id: 'youtube_budget',       label: 'YouTube Budget',         parent: 'd_youtube_ads', type: 'cost',       desc: 'YouTube Ads budget.' },

  // ═══════════════════════════════════════════════════════════════════════
  // VELOCITY-SPECIFIC ADDITIONS (PRD Section 4 / 8a / 8b + Events spec)
  // ═══════════════════════════════════════════════════════════════════════

  // === Returns & Refunds (additions) ===
  { id: 'refund_rate',          label: 'Refund Rate',            parent: 'd_returns', type: 'diagnostic', desc: 'Refunds / Orders. Financial refund frequency at the order level (distinct from product Return Rate).' },

  // === Revenue Share & Transactions ===
  // Per-transaction primitives (PRD Section 4a)
  { id: 'total_charged',         label: 'Total Charged',           parent: 'd_revshare', type: 'result',     desc: 'Amount charged to customer (Gross Sales + Tax).' },
  { id: 'gross_sales_txn',       label: 'Gross Sales',             parent: 'd_revshare', type: 'result',     desc: 'Total Charged − Tax. Pre-split, pre-discount transaction value.' },
  { id: 'tax_txn',               label: 'Tax (Transaction)',       parent: 'd_revshare', type: 'result',     desc: 'Tax collected on the transaction.' },
  { id: 'matter_share_pct',      label: 'Matter Share %',          parent: 'd_revshare', type: 'diagnostic', desc: 'Matter\'s revenue share, set per Offer at the transaction level. Not a flat platform-wide rate.' },
  { id: 'matter_share_amount',   label: 'Matter Share Amount',     parent: 'd_revshare', type: 'result',     desc: 'Gross Sales × Matter Share %. Matter\'s share of the transaction.' },
  { id: 'merchant_share_amount', label: 'Merchant Share Amount',   parent: 'd_revshare', type: 'result',     desc: 'Gross Sales − Matter Share. Merchant\'s share of the transaction.' },
  { id: 'sent_to_merchant',      label: 'Sent to Merchant',        parent: 'd_revshare', type: 'result',     desc: 'Merchant Share + Tax. What the merchant actually receives per transaction.' },
  { id: 'sent_to_matter',        label: 'Sent to Matter',          parent: 'd_revshare', type: 'result',     desc: 'Matter Share only (no tax). What Matter receives per transaction.' },
  // Per-refund primitives (PRD Section 4b)
  { id: 'refund_total',          label: 'Refund Total',            parent: 'd_revshare', type: 'cost',       desc: 'Total returned to customer (Refund Gross + Refund Tax).' },
  { id: 'refund_gross',          label: 'Refund Gross',            parent: 'd_revshare', type: 'cost',       desc: 'Refund excluding tax.' },
  { id: 'refund_tax',            label: 'Refund Tax',              parent: 'd_revshare', type: 'cost',       desc: 'Tax portion of refund.' },
  { id: 'refund_gross_pct',      label: 'Refund Gross %',          parent: 'd_revshare', type: 'diagnostic', desc: 'Refund Gross / Original Gross Sales. Drives proportional clawback.' },
  { id: 'merchant_refund_amount', label: 'Merchant Refund Amount', parent: 'd_revshare', type: 'cost',       desc: 'Original Merchant Share × Refund Gross %. Clawback from merchant.' },
  { id: 'matter_refund_amount',  label: 'Matter Refund Amount',    parent: 'd_revshare', type: 'cost',       desc: 'Original Matter Share × Refund Gross %. Matter\'s share of refund.' },
  { id: 'processing_fees',       label: 'Processing Fees',         parent: 'd_revshare', type: 'cost',       desc: 'Payment processor fees (Stripe / PayPal) per transaction.' },
  // Roll-ups (PRD Section 4c)
  { id: 'gross_platform_sales',  label: 'Gross Platform Sales',    parent: 'd_revshare', type: 'result',     desc: 'Sum of Matter Share Amount across all sales for the period.' },
  { id: 'gross_platform_refunds', label: 'Gross Platform Refunds', parent: 'd_revshare', type: 'cost',       desc: 'Sum of Matter Refund Amount across all refunds for the period.' },
  { id: 'merchant_share_refunds', label: 'Merchant Share Refunds (Clawback)', parent: 'd_revshare', type: 'result', desc: 'Sum of Merchant Refund Amount — adds back to Matter\'s net revenue (clawback from merchant).' },
  { id: 'net_matter_revenue',    label: 'Net Matter Revenue',      parent: 'd_revshare', type: 'result',     desc: 'Final reconciled platform revenue: +Gross Platform Sales − Gross Platform Refunds − Merchant Share + Merchant Share Refunds − Processing Fees. Reconciles against bank deposits.' },

  // === Funnel Variant Performance ===
  { id: 'page_views',            label: 'Page Views',              parent: 'd_funnel', type: 'result',     desc: 'Total Page events across the funnel variant (any page_type).' },
  { id: 'presell_page_views',    label: 'Presell Page Views',      parent: 'd_funnel', type: 'result',     desc: 'Page events where page_type = "presell_page". Optional step (only present in some variants).' },
  { id: 'sales_page_views',      label: 'Sales Page Views',        parent: 'd_funnel', type: 'result',     desc: 'Page events where page_type = "sales_page". Always present in every funnel variant.' },
  { id: 'rpv',                   label: 'Revenue Per Visitor (RPV)', parent: 'd_funnel', type: 'diagnostic', desc: 'Revenue / Page Views. Hero rate metric — Velocity-controlled efficiency of converting visitors into revenue.' },
  { id: 'presell_to_sales_rate', label: 'Presell → Sales Rate',    parent: 'd_funnel', type: 'diagnostic', desc: 'Sales Page Views (from presell) / Presell Page Views. Measures presell CTA effectiveness; navigation drives this implicitly.' },
  { id: 'sales_to_checkout_rate', label: 'Sales → Checkout Rate',  parent: 'd_funnel', type: 'diagnostic', desc: 'Checkout Started / Sales Page Views. Velocity-controlled rate.' },
  { id: 'checkout_to_order_rate', label: 'Checkout → Order Rate',  parent: 'd_funnel', type: 'diagnostic', desc: 'Order Completed / Checkout Started. Velocity-controlled rate (transaction infrastructure + checkout UX).' },

  // === Upsell / Downsell Flow ===
  // Counts (Upsell side)
  { id: 'upsell_page_views',     label: 'Upsell Page Views',       parent: 'd_upsell', type: 'result',     desc: 'Page events where page_type = "upsell_page". Aggregated across all upsell steps in the variant.' },
  { id: 'upsell_offers_shown',   label: 'Upsell Offers Shown',     parent: 'd_upsell', type: 'result',     desc: 'Product List Viewed events on upsell pages — fires when user scrolls to the cart component (proves they saw the offers).' },
  { id: 'upsell_clicks',         label: 'Upsell Clicks',           parent: 'd_upsell', type: 'result',     desc: 'Product Added events on upsell pages — accept-click intent (no cart pattern; click = buy).' },
  { id: 'upsell_orders_contain', label: 'Orders Containing Upsell', parent: 'd_upsell', type: 'result',    desc: 'Distinct orders containing upsell products. Used as ground-truth verification (handles abandonment after click).' },
  // Rates (Upsell side — Option B: split click rate + completion rate)
  { id: 'upsell_view_rate',      label: 'Upsell View Rate',        parent: 'd_upsell', type: 'diagnostic', desc: 'Upsell Page Views / Order Completed. Did orders actually reach the upsell step.' },
  { id: 'upsell_offer_view_rate', label: 'Upsell Offer View Rate', parent: 'd_upsell', type: 'diagnostic', desc: 'Upsell Offers Shown / Upsell Page Views. Did users scroll far enough to see the offer.' },
  { id: 'upsell_click_rate',     label: 'Upsell Click Rate',       parent: 'd_upsell', type: 'diagnostic', desc: 'Upsell Clicks / Upsell Offers Shown. Behavioral click intent on the offer.' },
  { id: 'upsell_completion_rate', label: 'Upsell Completion Rate', parent: 'd_upsell', type: 'diagnostic', desc: 'Orders Containing Upsell / Upsell Clicks. Verifies clicks actually completed (catches post-click abandonment).' },
  { id: 'upsell_take_rate',      label: 'Upsell Take Rate',        parent: 'd_upsell', type: 'diagnostic', desc: 'Orders Containing Upsell / Order Completed. Overall verified take — single rate for merchant-facing reports.' },
  // Counts (Downsell side)
  { id: 'downsell_page_views',   label: 'Downsell Page Views',     parent: 'd_upsell', type: 'result',     desc: 'Page events where page_type = "downsell_page". Aggregated across all downsell steps.' },
  { id: 'downsell_offers_shown', label: 'Downsell Offers Shown',   parent: 'd_upsell', type: 'result',     desc: 'Product List Viewed events on downsell pages.' },
  { id: 'downsell_clicks',       label: 'Downsell Clicks',         parent: 'd_upsell', type: 'result',     desc: 'Product Added events on downsell pages.' },
  { id: 'downsell_orders_contain', label: 'Orders Containing Downsell', parent: 'd_upsell', type: 'result', desc: 'Distinct orders containing downsell products.' },
  // Rates (Downsell side)
  { id: 'downsell_view_rate',    label: 'Downsell View Rate',      parent: 'd_upsell', type: 'diagnostic', desc: 'Downsell Page Views / Upsell rejections. How many users who declined an upsell saw the downsell.' },
  { id: 'downsell_offer_view_rate', label: 'Downsell Offer View Rate', parent: 'd_upsell', type: 'diagnostic', desc: 'Downsell Offers Shown / Downsell Page Views.' },
  { id: 'downsell_click_rate',   label: 'Downsell Click Rate',     parent: 'd_upsell', type: 'diagnostic', desc: 'Downsell Clicks / Downsell Offers Shown.' },
  { id: 'downsell_completion_rate', label: 'Downsell Completion Rate', parent: 'd_upsell', type: 'diagnostic', desc: 'Orders Containing Downsell / Downsell Clicks.' },
  { id: 'downsell_take_rate',    label: 'Downsell Take Rate',      parent: 'd_upsell', type: 'diagnostic', desc: 'Orders Containing Downsell / Upsell rejections. Overall verified take on the downsell branch.' },

  // === Offers ===
  { id: 'offer_take_rate',       label: 'Offer Take Rate',         parent: 'd_offers', type: 'diagnostic', desc: 'Takes / Views per offer across all pages. Headline offer-level metric.' },
  { id: 'main_offer_take_rate',  label: 'Main Offer Take Rate',    parent: 'd_offers', type: 'diagnostic', desc: 'Offer Take Rate scoped to Main offers (offers on sales pages).' },
  { id: 'checkout_offer_take_rate', label: 'Checkout Offer Take Rate', parent: 'd_offers', type: 'diagnostic', desc: 'Checkout offer takes / Checkouts Initiated. Pre-payment add-on take rate.' },
  { id: 'upsell_offer_take_rate', label: 'Upsell Offer Take Rate', parent: 'd_offers', type: 'diagnostic', desc: 'Offer Take Rate scoped to Upsell offers (offers on upsell pages).' },
  { id: 'top_offers',            label: 'Top Offers',              parent: 'd_offers', type: 'result',     desc: 'Offers ranked by purchases / Orders. Surfaces best-performing offers across the variant set.' },
  { id: 'offers_shown_count',    label: 'Offers Shown',            parent: 'd_offers', type: 'result',     desc: 'Count of Product List Viewed events per offer — denominator for offer take rates.' },

  // === Experiments ===
  { id: 'active_variants',       label: 'Active Variants',         parent: 'd_experiment', type: 'result',     desc: 'Count of currently-running variants in the experiment.' },
  { id: 'variants_retired',      label: 'Variants Retired',        parent: 'd_experiment', type: 'result',     desc: 'Count of variants pulled in the period.' },
  { id: 'new_variants',          label: 'New Variants',            parent: 'd_experiment', type: 'result',     desc: 'Count of variants introduced in the period.' },
  { id: 'variant_win_rate',      label: 'Variant Win Rate',        parent: 'd_experiment', type: 'diagnostic', desc: 'Variants beating control / total variants tested.' },
  { id: 'lift',                  label: 'Lift',                    parent: 'd_experiment', type: 'diagnostic', desc: 'Winner CR vs Control CR (relative or absolute).' },
  { id: 'statistical_confidence', label: 'Statistical Confidence', parent: 'd_experiment', type: 'diagnostic', desc: 'Current statistical confidence level per variant.' },
  { id: 'time_to_significance',  label: 'Time to Significance',    parent: 'd_experiment', type: 'diagnostic', desc: 'Days from variant launch to reaching the confidence threshold.' },
  { id: 'gen_strategy_perf',     label: 'Generation Strategy Performance', parent: 'd_experiment', type: 'diagnostic', desc: 'Win rate aggregated by Generation Strategy tag.' },
  { id: 'hero_product_perf',     label: 'Hero Product Performance', parent: 'd_experiment', type: 'diagnostic', desc: 'Win rate aggregated by Hero Product tag.' }
];

export const edges: Edge[] = [
  // === Logistics & Operations ===
  ['inventory_turnover', 'dead_stock'],
  ['dead_stock', 'stock_levels'],
  ['stock_levels', 'carrying_cost'],
  ['fulfillment_accuracy', 'lost_damaged'],
  ['on_time_delivery', 'shipping_costs'],
  ['lost_damaged', 'shipping_costs'],
  ['carrying_cost', 'opex'],
  ['shipping_costs', 'cogs'],

  // === Returns & Refunds ===
  ['return_rate', 'refunds'],
  ['return_rate', 'shipping_costs'],         // PDF: more returns → more logistics spend
  ['return_fraud_rate', 'cost_per_return'],
  ['cost_per_return', 'refunds'],
  ['css_post_return', 'csat'],          // return experience → satisfaction
  ['refunds', 'revenue'],          // refunds reduce revenue (deduction)

  // === Revenue & Profitability spine ===
  ['discounts', 'revenue'],
  ['revenue', 'gross_profit'],
  ['cogs', 'gross_profit'],
  ['gross_profit', 'gross_profit_margin'],
  ['gross_profit', 'net_profit'],
  ['marketing_expenses', 'opex'],
  ['opex', 'net_profit'],
  ['sales_taxes', 'net_profit'],
  ['net_profit', 'net_profit_growth'],
  ['net_profit', 'net_profit_margin'],
  ['net_profit', 'ltv'],
  ['revenue', 'roas'],

  // === Customer Service & Support ===
  ['ticket_resolution_time', 'ticket_resolution_rate'],
  ['ticket_resolution_time', 'csat'],
  ['csat', 'nps'],

  // === Loyalty Program ===
  ['loyalty_active_participation', 'redemption_rate'],
  ['loyalty_active_participation', 'active_customers'], // PDF: loyalty perks → active customers
  ['redemption_rate', 'loyalty_roi'],
  ['redemption_rate', 'discounts'],

  // === Orders ===
  ['placed_orders', 'orders'],
  ['orders', 'conversion_rate'],
  ['orders', 'aov'],
  ['orders', 'revenue'],
  ['pct_cancelled_orders', 'orders'],

  // === Product ===
  ['units_sold', 'avg_units_per_item'],
  ['units_sold', 'total_items'],
  ['avg_items_per_order', 'units_sold'],
  ['avg_items_per_order', 'aov'],            // PDF: more items per order → higher AOV
  ['avg_reviews_per_item', 'avg_item_rating'],
  ['avg_price_per_item', 'avg_margin_per_item'],
  ['avg_cost_per_item', 'avg_margin_per_item'],
  ['avg_price_per_item', 'aov'],
  ['avg_cost_per_item', 'cogs'],

  // === Offline Commerce ===
  ['foot_traffic', 'offline_cr'],
  ['offline_cr', 'offline_sales'],
  ['offline_sales', 'avg_transaction_value'],
  ['staff_efficiency', 'offline_cr'],
  ['offline_sales', 'revenue'],

  // === CRM ===
  ['time_to_first_purchase', 'new_customers'],
  ['new_customers', 'total_customers'],
  ['total_customers', 'active_customers'],
  ['active_customers', 'repeat_customers'],
  ['repeat_purchase_rate', 'repeat_customers'],
  ['marketing_expenses', 'cac'],
  ['new_customers', 'cac'],
  ['revenue', 'arppc'],
  ['total_customers', 'arppc'],

  // === Checkout Process ===
  ['cart_views', 'checkouts'],
  ['cart_views', 'cart_abandonment'],
  ['checkouts', 'placed_orders'],
  ['placed_orders', 'checkout_conversion'],
  ['checkouts', 'checkout_conversion'],
  ['promo_code_applied', 'discounts'],

  // === Marketplace ===
  ['marketplace_sales', 'marketplace_aov'],
  ['marketplace_sales', 'marketplace_commission'],
  ['marketplace_return_rate', 'marketplace_sales'],
  ['marketplace_sales', 'revenue'],

  // === Subscription ===
  ['subscriber_growth_rate', 'mrr'],
  ['churn_rate', 'mrr'],
  ['mrr', 'revenue'],

  // === Referral Program ===
  ['nps', 'referral_rate'],                // PDF: higher NPS → more referral participants
  ['referral_rate', 'referral_conversion_rate'],
  ['referral_conversion_rate', 'new_customers'],
  ['referral_conversion_rate', 'referral_program_roi'],

  // === Affiliate Marketing ===
  ['active_affiliates', 'affiliate_revenue'],
  ['epc', 'affiliate_revenue'],
  ['affiliate_revenue', 'affiliate_roi'],
  ['affiliate_commissions', 'affiliate_roi'],
  ['affiliate_revenue', 'revenue'],
  ['affiliate_commissions', 'marketing_expenses'],

  // === Influence Marketing ===
  ['collaborating_influencers', 'influencer_orders'],
  ['influencer_orders', 'promo_code_applied'],
  ['total_influencer_payments', 'marketing_expenses'],

  // === Content Marketing ===
  ['content_pieces', 'content_engagement_rate'],
  ['content_engagement_rate', 'content_marketing_leads'],
  ['content_marketing_leads', 'content_conversion_rate'],
  ['content_conversion_rate', 'items_viewed'],

  // === Conversions ===
  ['sessions', 'items_viewed'],
  ['sessions', 'add_to_cart'],
  ['sessions', 'bounce_rate'],
  ['add_to_cart', 'add_to_cart_rate'],
  ['sessions', 'engaged_sessions'],  // engaged sessions is a subset of sessions, not the cause
  ['total_app_installs', 'active_users'],
  ['active_users', 'dau'],
  ['dau', 'sessions'],
  ['add_to_cart', 'cart_views'],
  ['sessions', 'conversion_rate'],

  // === Livestream Commerce ===
  ['viewer_count', 'avg_watch_time'],
  ['avg_watch_time', 'livestream_engagement_rate'],
  ['livestream_engagement_rate', 'livestream_leads'],
  ['livestream_leads', 'livestream_cr'],
  ['livestream_leads', 'add_to_cart'],
  ['livestream_cr', 'livestream_roi'],

  // === Amazon Ads ===
  ['amazon_spend', 'amazon_impressions'],
  ['amazon_impressions', 'amazon_clicks'],
  ['amazon_clicks', 'amazon_ctr'],
  ['amazon_clicks', 'amazon_orders'],
  ['amazon_orders', 'amazon_sales'],
  ['amazon_orders', 'new_to_brand_orders'],
  ['amazon_sales', 'amazon_acos'],
  ['amazon_spend', 'amazon_acos'],
  ['amazon_spend', 'marketing_expenses'],
  ['amazon_sales', 'revenue'],

  // === Social Media ===
  ['social_engagement_rate', 'sessions'],
  ['social_media_clicks', 'sessions'],
  ['followers', 'social_engagement_rate'],
  ['share_of_voice', 'followers'],

  // === SEO ===
  ['keywords', 'organic_impressions'],
  ['organic_impressions', 'organic_clicks'],
  ['organic_clicks', 'organic_ctr'],
  ['average_position', 'organic_ctr'],
  ['organic_clicks', 'sessions'],

  // === Email ===
  ['successful_deliveries', 'delivery_rate'],
  ['successful_deliveries', 'opened'],
  ['opened', 'open_rate'],
  ['opened', 'clicked'],
  ['clicked', 'email_click_rate'],
  ['clicked', 'sessions'],

  // === Meta Ads ===
  ['meta_amount_spent', 'meta_impressions'],
  ['meta_impressions', 'meta_cpm'],
  ['meta_impressions', 'meta_clicks'],
  ['meta_clicks', 'meta_ctr'],
  ['meta_clicks', 'meta_cpc'],
  ['meta_clicks', 'sessions'],
  ['meta_amount_spent', 'marketing_expenses'],

  // === Google Ads ===
  ['ga_avg_daily_budget', 'ga_impressions'],
  ['ad_rank', 'ga_impressions'],
  ['ga_impressions', 'ga_clicks'],
  ['ga_impressions', 'ga_cpm'],
  ['ga_clicks', 'ga_ctr'],
  ['ga_clicks', 'ga_cpc'],
  ['ga_clicks', 'sessions'],
  ['ga_avg_daily_budget', 'marketing_expenses'],

  // === TikTok Ads ===
  ['tt_budget', 'tt_impressions'],
  ['tt_impressions', 'tt_clicks'],
  ['tt_clicks', 'tt_ctr'],
  ['tt_clicks', 'tt_cpc'],
  ['video_completion_rate', 'tt_clicks'],
  ['tt_clicks', 'sessions'],
  ['tt_budget', 'marketing_expenses'],

  // === Pinterest Ads ===
  ['pinterest_budget', 'pinterest_impressions'],
  ['pinterest_impressions', 'pinterest_clicks'],
  ['pinterest_clicks', 'pinterest_ctr'],
  ['pinterest_clicks', 'pinterest_cpc'],
  ['pin_saves', 'pinterest_impressions'],
  ['pinterest_clicks', 'sessions'],
  ['pinterest_budget', 'marketing_expenses'],

  // === YouTube Ads ===
  ['youtube_budget', 'youtube_impressions'],
  ['youtube_impressions', 'youtube_clicks'],
  ['youtube_clicks', 'youtube_ctr'],
  ['youtube_clicks', 'youtube_cpc'],
  ['video_view_rate', 'youtube_clicks'],
  ['youtube_clicks', 'sessions'],
  ['youtube_budget', 'marketing_expenses'],

  // ═══════════════════════════════════════════════════════════════════════
  // VELOCITY-SPECIFIC EDGES
  // ═══════════════════════════════════════════════════════════════════════

  // === Returns & Refunds (additions) ===
  ['refunds', 'refund_rate'],
  ['orders', 'refund_rate'],

  // === Revenue Share & Transactions ===
  // Per-transaction primitives chain
  ['total_charged', 'gross_sales_txn'],
  ['total_charged', 'tax_txn'],
  ['gross_sales_txn', 'matter_share_amount'],
  ['matter_share_pct', 'matter_share_amount'],
  ['gross_sales_txn', 'merchant_share_amount'],
  ['matter_share_amount', 'merchant_share_amount'],
  ['merchant_share_amount', 'sent_to_merchant'],
  ['tax_txn', 'sent_to_merchant'],
  ['matter_share_amount', 'sent_to_matter'],
  // Refund chain
  ['refund_total', 'refund_gross'],
  ['refund_total', 'refund_tax'],
  ['refund_gross', 'refund_gross_pct'],
  ['gross_sales_txn', 'refund_gross_pct'],
  ['merchant_share_amount', 'merchant_refund_amount'],
  ['refund_gross_pct', 'merchant_refund_amount'],
  ['matter_share_amount', 'matter_refund_amount'],
  ['refund_gross_pct', 'matter_refund_amount'],
  // Roll-ups → Net Matter Revenue
  ['matter_share_amount', 'gross_platform_sales'],
  ['matter_refund_amount', 'gross_platform_refunds'],
  ['merchant_refund_amount', 'merchant_share_refunds'],
  ['gross_platform_sales', 'net_matter_revenue'],
  ['gross_platform_refunds', 'net_matter_revenue'],
  ['merchant_share_amount', 'net_matter_revenue'],
  ['merchant_share_refunds', 'net_matter_revenue'],
  ['processing_fees', 'net_matter_revenue'],

  // === Funnel Variant Performance ===
  ['presell_page_views', 'page_views'],
  ['sales_page_views', 'page_views'],
  ['presell_page_views', 'presell_to_sales_rate'],
  ['sales_page_views', 'presell_to_sales_rate'],
  ['sales_page_views', 'sales_to_checkout_rate'],
  ['checkouts', 'sales_to_checkout_rate'],         // Checkout Started event = checkouts
  ['checkouts', 'checkout_to_order_rate'],
  ['orders', 'checkout_to_order_rate'],            // Order Completed event = orders
  ['page_views', 'rpv'],
  ['revenue', 'rpv'],

  // === Upsell / Downsell Flow ===
  // Upsell rates derived from counts
  ['upsell_page_views', 'upsell_view_rate'],
  ['orders', 'upsell_view_rate'],
  ['upsell_offers_shown', 'upsell_offer_view_rate'],
  ['upsell_page_views', 'upsell_offer_view_rate'],
  ['upsell_clicks', 'upsell_click_rate'],
  ['upsell_offers_shown', 'upsell_click_rate'],
  ['upsell_orders_contain', 'upsell_completion_rate'],
  ['upsell_clicks', 'upsell_completion_rate'],
  ['upsell_orders_contain', 'upsell_take_rate'],
  ['orders', 'upsell_take_rate'],
  // Downsell rates (mirrored)
  ['downsell_page_views', 'downsell_view_rate'],
  ['downsell_offers_shown', 'downsell_offer_view_rate'],
  ['downsell_page_views', 'downsell_offer_view_rate'],
  ['downsell_clicks', 'downsell_click_rate'],
  ['downsell_offers_shown', 'downsell_click_rate'],
  ['downsell_orders_contain', 'downsell_completion_rate'],
  ['downsell_clicks', 'downsell_completion_rate'],
  ['downsell_orders_contain', 'downsell_take_rate'],

  // === Offers ===
  ['offers_shown_count', 'offer_take_rate'],
  ['offers_shown_count', 'main_offer_take_rate'],
  ['offers_shown_count', 'checkout_offer_take_rate'],
  ['checkouts', 'checkout_offer_take_rate'],
  ['offers_shown_count', 'upsell_offer_take_rate'],
  ['orders', 'top_offers'],

  // === Experiments ===
  ['variant_win_rate', 'lift'],
  ['statistical_confidence', 'time_to_significance'],
  ['active_variants', 'variant_win_rate'],
  ['conversion_rate', 'lift'],            // Lift derives from CR comparison
  ['active_variants', 'gen_strategy_perf'],
  ['active_variants', 'hero_product_perf']
];
