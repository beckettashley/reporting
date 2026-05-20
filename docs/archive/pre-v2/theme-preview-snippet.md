# Brand Theme — Live Preview Tile

A compact, self-contained HTML/CSS snippet that demonstrates **every brand-collected theme token in context** — meant to live in the portal next to the theme settings so a brand owner sees, in real time, what their colors / fonts / logo / image will look like on a real page.

Not a full page replica — but it includes one of each major page surface (navbar, banner, image, hero with headline/body/bullets/CTA, secondary tinted strip, footer) so every theme token has somewhere visible to land.

## Token → where it appears

| Token | Where in the tile |
|---|---|
| `logo` | Navbar (top), footer (bottom) |
| `font.display` | Hero H1 |
| `font.body` | Hero body, bullet labels, footer copy |
| `font.ui` | Banner, navbar links, CTA, badge, footer links |
| `font.condensed` | Urgency callout under H1 ("LIMITED TIME") |
| `base-font-size` | Scales the whole tile proportionally |
| `brand.primary` | Headline accent word, bullet checks, link color |
| `brand.primary-dark` | CTA button background, footer background |
| `brand.primary-subtle` | "Starter Bundle" card background |
| `brand.accent` | Sticky urgency banner |
| `accent.tint-1` | Hero radial gradient |
| `accent.tint-2` | "AS SEEN ON" strip background |
| `accent.tint-3` | Secondary callout strip |
| `accent.tint-4 / tint-5` | Pre-footer gradient band |
| `text.primary` | All body / headline text on light surfaces |
| `text.inverse` | CTA label, banner text, footer text |
| `surface.default` | Page card background |
| `border.subtle` | Navbar + footer dividers |
| `danger` | Strikethrough compare-at price |
| `image (product)` | Hero image |

The point: change one token in the portal → see its role light up in the tile. Should *feel* like a real page snippet (not a swatch grid) so the brand owner trusts the preview.

Frame: **320 × ~880px** — sits in a portal sidebar, scrolls only if the column is shorter than the tile.

---

## The snippet

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Theme Preview</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Geist:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Barlow:wght@700;900&display=swap" rel="stylesheet">

<style>
:root {
  /* === BRAND-COLLECTED — 18 fields ===
     Replace these to preview a different brand. */

  /* Colors (9) */
  --brand-primary:    #3d348b;
  --brand-accent:     #ffd61f;
  --text-primary:     #1a1a1a;
  --background:       #ffffff;
  --gradient-tint-1:  #faf8f6;
  --gradient-tint-2:  #fcf3df;
  --gradient-tint-3:  #e1f3ff;
  --gradient-tint-4:  rgba(20,245,255,0.125);
  --gradient-tint-5:  rgba(153,143,255,0.125);

  /* Typography (5) */
  --font-display:     "Libre Baskerville", serif;
  --font-body:        "DM Sans", sans-serif;
  --font-ui:          "Geist", sans-serif;
  --font-condensed:   "Barlow", sans-serif;
  --base-font-size:   16px;

  /* Images (4) — logo + a representative product image */
  --logo-url:         url("https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1773148514/javvy-wordmark.png");
  --product-image-url: url("https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1765976438/pc-pdp1_j5fxpw.png");

  /* === DERIVED — auto from collected === */
  --brand-primary-dark:    #2a2552;
  --brand-primary-subtle:  #e8e4f7;
  --text-inverse:          #ffffff;
  --border-subtle:         rgba(26,26,26,0.10);
  --danger:                #dc2626;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: #f3f4f6;
  display: flex;
  justify-content: center;
  padding: 24px;
  font-family: var(--font-body);
  font-size: var(--base-font-size);
}

.preview {
  width: 320px;
  background: var(--background);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
}

/* ── 1. URGENCY BANNER — accent + condensed ──────────────────── */
.banner {
  background: var(--brand-accent);
  color: var(--text-primary);
  font-family: var(--font-condensed);
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 6px 12px;
  text-align: center;
}

/* ── 2. NAVBAR — logo + ui font ──────────────────────────────── */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-subtle);
}
.nav .logo {
  width: 80px;
  height: 22px;
  background: var(--logo-url) left center / contain no-repeat;
}
.nav .links {
  display: flex;
  gap: 12px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

/* ── 3. HERO — image + display H1 + body + bullets + CTA ─────── */
.hero {
  padding: 16px;
  background: radial-gradient(circle at 50% 0%, #fff 0%, var(--gradient-tint-1) 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hero .image {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  background: var(--product-image-url) center / cover no-repeat, var(--brand-primary-subtle);
}
.hero .urgency {
  font-family: var(--font-condensed);
  font-weight: 900;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.hero h1 {
  font-family: var(--font-display);
  font-size: 22px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.4px;
  margin: 0;
}
.hero h1 em {
  color: var(--brand-primary);
  font-style: normal;
}
.hero p {
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
  margin: 0;
}
.bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  font-family: var(--font-body);
}
.bullets li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bullets li::before {
  content: "✓";
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--brand-primary-subtle);
  color: var(--brand-primary);
  font-family: var(--font-ui);
  font-weight: 700;
  font-size: 11px;
  flex-shrink: 0;
}
.cta {
  margin-top: 4px;
  background: var(--brand-primary-dark);
  color: var(--text-inverse);
  font-family: var(--font-ui);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  border: 0;
  cursor: pointer;
}

/* ── 4. AS-SEEN-ON STRIP — tint-2 ─────────────────────────────── */
.seen-on {
  background: var(--gradient-tint-2);
  padding: 10px 16px;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
  color: var(--text-primary);
}

/* ── 5. PRICE CARD — primary-subtle + danger ──────────────────── */
.card {
  margin: 16px;
  background: var(--brand-primary-subtle);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.card .label {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
}
.card .label small {
  display: block;
  font-weight: 500;
  font-size: 11px;
  opacity: 0.75;
}
.card .price {
  font-family: var(--font-ui);
  font-weight: 700;
  font-size: 16px;
  color: var(--brand-primary);
  text-align: right;
}
.card .price s {
  display: block;
  color: var(--danger);
  font-weight: 500;
  font-size: 12px;
  text-decoration: line-through;
}

/* ── 6. CALLOUT STRIP — tint-3 ────────────────────────────────── */
.callout {
  background: var(--gradient-tint-3);
  padding: 12px 16px;
  font-family: var(--font-body);
  font-size: 12px;
  text-align: center;
  color: var(--text-primary);
}

/* ── 7. PRE-FOOTER GRADIENT — tint-4 + tint-5 ─────────────────── */
.gradient-band {
  height: 32px;
  background: linear-gradient(var(--gradient-tint-4) 0%, var(--gradient-tint-5) 100%);
}

/* ── 8. FOOTER — primary-dark + logo + ui font + inverse text ─── */
.footer {
  background: var(--brand-primary-dark);
  color: var(--text-inverse);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer .logo {
  width: 90px;
  height: 22px;
  background: var(--logo-url) left center / contain no-repeat;
  filter: brightness(0) invert(1); /* logo on dark — assumes brand mark renders well as a silhouette */
}
.footer .links {
  display: flex;
  gap: 14px;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.footer .copy {
  font-family: var(--font-body);
  font-size: 11px;
  opacity: 0.75;
}
</style>
</head>
<body>

<div class="preview">

  <!-- 1. accent + condensed -->
  <div class="banner">⚡ Spring sale — up to 58% off today</div>

  <!-- 2. logo + ui font -->
  <div class="nav">
    <div class="logo" role="img" aria-label="Brand logo"></div>
    <div class="links"><span>Shop</span><span>FAQ</span></div>
  </div>

  <!-- 3. image + display + body + ui (CTA) + bullets + brand colors -->
  <section class="hero">
    <div class="image" role="img" aria-label="Product"></div>
    <div class="urgency">Limited time · Free shipping</div>
    <h1>Better mornings, <em>brewed for you</em>.</h1>
    <p>The smoother, smarter way to start your day — packed with what your body actually needs.</p>
    <ul class="bullets">
      <li>Real ingredients, no shortcuts</li>
      <li>Loved by 18,000+ customers</li>
      <li>30-day money-back guarantee</li>
    </ul>
    <button class="cta">CLAIM YOUR DISCOUNT →</button>
  </section>

  <!-- 4. tint-2 -->
  <div class="seen-on">As seen on · Forbes · Vogue · GQ</div>

  <!-- 5. primary-subtle + danger -->
  <div class="card">
    <div class="label">Starter Bundle<small>3 bags + free shaker</small></div>
    <div class="price">$39<s>$92</s></div>
  </div>

  <!-- 6. tint-3 -->
  <div class="callout">Free shipping over $40 · 30-day refund guarantee</div>

  <!-- 7. tint-4 + tint-5 -->
  <div class="gradient-band"></div>

  <!-- 8. primary-dark + logo + inverse text + ui font -->
  <footer class="footer">
    <div class="logo" role="img" aria-label="Brand logo"></div>
    <div class="links"><span>Privacy</span><span>Terms</span><span>Contact</span></div>
    <div class="copy">© 2026 — All rights reserved.</div>
  </footer>

</div>

</body>
</html>
```

---

## Notes for the other CC instance

- **Only the `:root` block under `BRAND-COLLECTED` and `DERIVED` should change between brands.** The HTML structure and all other CSS are fixed.
- **Derived values** are computed from the 9 collected colors per the rules in `public/brand-theme-schema.md` (e.g. `brand-primary-dark` = darken brand-primary 20%). The portal generates them; brands don't supply them.
- **Fonts:** the `<link>` tag pulls Google Fonts for the four families used in the example. If a brand uses a non-Google font, the portal must inject its own font-loading rule — the snippet just declares the family names.
- **Footer logo on dark surface:** the snippet uses `filter: brightness(0) invert(1)` to render the brand mark in white on the dark footer. Works when the logo is a single-color silhouette (most are). For full-color logos that need a separate inverse asset, replace the filter with a second logo URL field.
- **Don't add labels** ("This is your display font" etc.) on the tile itself. The point is for it to look like a real product page so the owner sees the actual feel — labels live next to the corresponding portal field, not in the preview.
- **Frame size 320px** is sized for a portal sidebar. To preview at full mobile (375px) or desktop (1200px), change `.preview { width: ... }` and adjust paddings.
