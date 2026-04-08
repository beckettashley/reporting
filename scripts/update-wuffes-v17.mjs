import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 2`
const sections = row.sections

const t = Date.now()

const baseCell = (overrides = {}) => ({
  backgroundColor: '',
  borderColor: '',
  borderWidth: 0,
  borderRadius: 0,
  ...overrides,
})

// ─── New "Comparison" section ────────────────────────────────────────────────
const newSection = {
  id: `section-cmp-${t}`,
  label: 'Comparison',
  style: {
    backgroundColor: '#F7ECE1',
    paddingYSize: 'm',
    maxWidth: 480,
    contentWidth: 'narrow',
  },
  grids: [
    // Grid 1: Heading
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [{
        id: `row-cmp-h-${t}`,
        cellIds: [`cell-cmp-h-${t}`],
        style: { backgroundColor: '', paddingY: 0, gap: 0 },
      }],
      cells: [{
        id: `cell-cmp-h-${t}`,
        width: 100,
        style: baseCell({
          paddingX: 24,
          paddingTop: 0,
          paddingBottom: 16,
          textAlign: 'center',
          alignItems: 'center',
        }),
        contents: [{
          id: `c-cmp-h-${t}`,
          type: 'textBox',
          text: '<h2 style="font-weight: 700; color: #1A1A1A;">Why pet parents are switching to Wuffes</h2>',
        }],
      }],
    },
    // Grid 2: Comparison table
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [{
        id: `row-cmp-t-${t}`,
        cellIds: [`cell-cmp-t-${t}`],
        style: { backgroundColor: '', paddingY: 0, gap: 0 },
      }],
      cells: [{
        id: `cell-cmp-t-${t}`,
        width: 100,
        style: baseCell({
          paddingX: 16,
          paddingTop: 0,
          paddingBottom: 24,
          alignItems: 'start',
        }),
        contents: [{
          id: `c-cmp-t-${t}`,
          type: 'productComparison',
          productComparisonHighlightBorderColor: '#18443D',
          productComparisonProducts: [
            {
              name: 'Wuffes',
              logo: 'https://wuffes.com/cdn/shop/files/offer-hc-benefits-left_160x.png?v=18412045986892816936',
              color: '#E8F5E9',
              headerTextColor: '#18443D',
              headerBackgroundColor: 'transparent',
            },
            {
              name: 'OTHERS',
              headerBackgroundColor: '#fee2e2',
              headerTextColor: '#dc2626',
            },
          ],
          productComparisonMetrics: [
            {
              emoji: '💰',
              label: 'COST PER CHEW',
              values: ['$0.41', '$0.44'],
            },
            {
              emoji: '🔬',
              label: 'CLINICALLY STUDIED',
              values: [
                '⏳ In the final stages of our clinical study',
                '❌ No other brand has publicly available studies',
              ],
            },
            {
              emoji: '✅',
              label: 'NASC PARTNER',
              values: [
                '✅',
                '❌ Very few brands pass the rigorous NASC standards',
              ],
            },
            {
              emoji: '💪',
              label: 'TOTAL ACTIVE INGREDIENTS PER SERVING',
              values: ['💪 4,096mg', '👎 2,661mg'],
            },
          ],
        }],
      }],
    },
    // Grid 3: CTA
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [{
        id: `row-cmp-cta-${t}`,
        cellIds: [`cell-cmp-cta-${t}`],
        style: { backgroundColor: '', paddingY: 0, gap: 0 },
      }],
      cells: [{
        id: `cell-cmp-cta-${t}`,
        width: 100,
        style: baseCell({
          paddingX: 24,
          paddingTop: 16,
          paddingBottom: 8,
          textAlign: 'center',
          alignItems: 'center',
        }),
        contents: [{
          id: `c-cmp-cta-${t}`,
          type: 'ctaButton',
          ctaText: 'TRY WUFFES FOR 50% OFF',
          ctaUrl: '',
          ctaBackgroundColor: '#C5FB57',
          ctaTextColor: '#18443D',
          ctaBorderRadius: 100,
          ctaPaddingY: 18,
          ctaFontWeight: 700,
          ctaLetterSpacing: '0.05em',
          ctaBorderStyle: 'solid',
          ctaBorderColor: '#18443D',
          ctaBorderWidth: 2,
        }],
      }],
    },
  ],
}

console.log('=== BEFORE: sections ===')
sections.forEach((s, i) => console.log(`  sections[${i}]: ${s.label} (${s.id})`))

// Insert at index 3 (after "As Seen In" at [2])
sections.splice(3, 0, newSection)

console.log('\n=== AFTER: sections ===')
sections.forEach((s, i) => console.log(`  sections[${i}]: ${s.label} (${s.id})`))

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`
console.log('\nDone. v17: "Comparison" section inserted at sections[3].')
