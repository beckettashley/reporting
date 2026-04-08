import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const sections = row.sections

console.log('=== BEFORE ===')
sections.forEach((s, i) => console.log(`[${i}] "${s.label}"`))

// ─── ID factory ───────────────────────────────────────────────────────────────
const BASE = Date.now()
let c = 0
const nid = prefix => `${prefix}-${BASE + c++}`

// ─── New section ──────────────────────────────────────────────────────────────
const finalCta = {
  id: nid('section-javvy-final-cta'),
  label: 'Final CTA',
  style: {
    backgroundColor: '#fafaf0',
    paddingYSize: 'm',
    maxWidth: 900,
    contentWidth: 'narrow',
  },
  grids: [
    {
      // Row 1 — heading, full width center
      cells: [
        {
          id: nid('cell-javvy-cta-heading'),
          width: 100,
          style: {
            paddingX: 24,
            paddingY: 0,
            alignItems: 'center',
            textAlign: 'center',
            borderWidth: 0,
            borderRadius: 0,
            borderStyle: 'solid',
          },
          contents: [
            {
              id: nid('content-javvy-cta-h2'),
              type: 'textBox',
              text: '<h2 style="font-weight:800;color:#1a1a1a;text-align:center">Reaching #11 means one thing: you\'re truly serious about a better morning coffee routine.</h2>',
            },
            {
              id: nid('content-javvy-cta-sub'),
              type: 'textBox',
              text: '<p style="text-align:center;color:#555555">✨ We don\'t hand these out every day… consider this an exclusive Javvy hookup, just for you.</p>',
            },
          ],
        },
      ],
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
    },
    {
      // Row 2 — 2-col offer grid with badge
      cells: [
        {
          // Left: product image (55%)
          id: nid('cell-javvy-cta-img'),
          width: 55,
          mobileOrder: 0,
          style: {
            paddingX: 0,
            paddingY: 0,
            backgroundColor: '#e8e4f7',
            borderRadius: 12,
            borderWidth: 0,
            borderStyle: 'solid',
          },
          contents: [
            {
              id: nid('content-javvy-cta-img'),
              type: 'image',
              imageUrl: 'https://assets.javvycoffee.com/68470eec6dd64134a92d3453_9b5f16eb10a1546abe03c5cf5ed424f8_v3-pc-bundle-img.webp',
              imageAspectRatio: 'square',
              imageObjectFit: 'cover',
              imageBorderRadius: 12,
            },
          ],
        },
        {
          // Right: offer copy + CTA (45%)
          id: nid('cell-javvy-cta-offer'),
          width: 45,
          mobileOrder: 1,
          style: {
            paddingX: 24,
            paddingY: 32,
            backgroundColor: '#e8e4f7',
            borderRadius: 12,
            borderWidth: 0,
            borderStyle: 'solid',
            alignItems: 'center',
          },
          contents: [
            {
              id: nid('content-javvy-cta-eyebrow'),
              type: 'textBox',
              text: '<p style="text-align:center;font-size:12px;font-weight:600;letter-spacing:0.1em;color:#555">🎁 FREE GIFTS WITH YOUR ORDER</p>',
            },
            {
              id: nid('content-javvy-cta-headline'),
              type: 'textBox',
              text: '<h1 style="text-align:center;font-weight:900"><span style="color:#dc2626">UP TO 58% OFF</span> <span style="color:#1a1a1a">FOR A LIMITED TIME ONLY!</span></h1>',
            },
            {
              id: nid('content-javvy-cta-body'),
              type: 'textBox',
              text: '<p style="text-align:center;color:#555555">This limited-time deal is in high demand and stock keeps selling out.</p>',
            },
            {
              id: nid('content-javvy-cta-btn'),
              type: 'ctaButton',
              ctaText: 'GET 58% OFF →',
              ctaUrl: 'https://try.javvycoffee.com/pc84',
              ctaBackgroundColor: '#2a2552',
              ctaTextColor: '#ffffff',
              ctaBorderRadius: 8,
              ctaPaddingY: 18,
              ctaFontWeight: 700,
            },
            {
              id: nid('content-javvy-cta-timer'),
              type: 'textBox',
              text: '<p style="text-align:center;font-size:13px"><strong>DEAL ENDING IN:</strong> <span style="color:#dc2626">10:03:39</span></p>',
            },
            {
              id: nid('content-javvy-cta-risk'),
              type: 'textBox',
              text: '<p style="text-align:center;font-size:13px;color:#555">Sell-Out Risk: <strong style="color:#dc2626">High</strong> &nbsp;|&nbsp; <strong>FAST</strong> shipping</p>',
            },
            {
              id: nid('content-javvy-cta-guarantee'),
              type: 'textBox',
              text: '<p style="text-align:center;font-size:12px;color:#888">Try it today with a 30-Day Money-Back Guarantee!</p>',
            },
          ],
        },
      ],
      mobileColumns: 1,
      gridStyle: {
        backgroundColor: '',
        borderRadius: 16,
        gap: 16,
        columnGap: 0,
      },
      gridBadge: {
        text: '🌼 SPRING SPECIAL 🌸',
        backgroundColor: '#3730a8',
        textColor: '#ffffff',
        fontSize: 14,
        paddingX: 20,
        paddingY: 8,
        borderRadius: 100,
        animated: true,
        position: 'top-center',
      },
    },
  ],
}

// Insert before Footer (last section)
sections.splice(sections.length - 1, 0, finalCta)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [rowAfter] = await sql`SELECT sections FROM presets WHERE id = 1`

console.log('\n=== AFTER ===')
rowAfter.sections.forEach((s, i) => console.log(`[${i}] "${s.label}"`))
console.log('\nDone. Final CTA inserted at index', sections.length - 2)
