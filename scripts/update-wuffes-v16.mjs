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

// ─── Helper: base cell style ─────────────────────────────────────────────────
const baseCell = (overrides = {}) => ({
  backgroundColor: '',
  borderColor: '',
  borderWidth: 0,
  borderRadius: 0,
  ...overrides,
})

// ─── Logo image content ──────────────────────────────────────────────────────
const logoImg = (imageUrl, idSuffix) => ({
  id: `c-asi-${idSuffix}-img-${t}`,
  type: 'image',
  imageUrl,
  imageAspectRatio: 'auto',
  imageObjectFit: 'contain',
  imageWidth: 100,
  imagePadding: 8,
  imageAlign: 'center',
})

// ─── Logo quote text content ─────────────────────────────────────────────────
const logoText = (quote, idSuffix) => ({
  id: `c-asi-${idSuffix}-txt-${t}`,
  type: 'textBox',
  text: `<p style="color: #333333;">${quote}</p>`,
  textFontSize: 14,
})

// ─── Logo cell ───────────────────────────────────────────────────────────────
const logoCell = (id, imageUrl, quote, idSuffix) => ({
  id,
  width: 50,
  style: baseCell({ paddingX: 0, paddingY: 0, textAlign: 'center', alignItems: 'start' }),
  contents: [
    logoImg(imageUrl, idSuffix),
    logoText(quote, idSuffix),
  ],
})

// ─── New "As Seen In" section ────────────────────────────────────────────────
const newSection = {
  id: `section-asi-${t}`,
  label: 'As Seen In',
  style: {
    backgroundColor: '#FFFFFF',
    paddingYSize: 'm',
    maxWidth: 480,
    contentWidth: 'narrow',
  },
  grids: [
    // Grid 1: Heading
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [{
        id: `row-asi-h-${t}`,
        cellIds: [`cell-asi-h-${t}`],
        style: { backgroundColor: '', paddingY: 0, gap: 0 },
      }],
      cells: [{
        id: `cell-asi-h-${t}`,
        width: 100,
        style: baseCell({
          paddingX: 24,
          paddingTop: 0,
          paddingBottom: 8,
          textAlign: 'center',
          alignItems: 'center',
        }),
        contents: [{
          id: `c-asi-h-${t}`,
          type: 'textBox',
          text: '<h2 style="font-weight: 700; color: #1A1A1A;">As Seen In</h2>',
        }],
      }],
    },
    // Grid 2: Logo grid (2×2)
    {
      gridStyle: {
        backgroundColor: '',
        borderRadius: 0,
        gap: 32,        // rowGap
        columnGap: 16,  // columnGap
        paddingX: 24,   // outer horizontal inset (rendered via gridStyle padding support)
        paddingTop: 16,
        paddingBottom: 32,
      },
      mobileColumns: 2,
      rows: [
        {
          id: `row-asi-l1-${t}`,
          cellIds: [`cell-asi-l1-${t}`, `cell-asi-l2-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 16 },
        },
        {
          id: `row-asi-l2-${t}`,
          cellIds: [`cell-asi-l3-${t}`, `cell-asi-l4-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 16 },
        },
      ],
      cells: [
        logoCell(
          `cell-asi-l1-${t}`,
          'https://wuffes.com/cdn/shop/files/offer-hc-logo-1.svg?v=10703696882525714310',
          '"Such a difference in his joint mobility"',
          'l1'
        ),
        logoCell(
          `cell-asi-l2-${t}`,
          'https://wuffes.com/cdn/shop/files/offer-hc-logo-2_138x.png?v=15687753449173169201',
          '"Wuffes takes the guesswork out"',
          'l2'
        ),
        logoCell(
          `cell-asi-l3-${t}`,
          'https://wuffes.com/cdn/shop/files/offer-hc-logo-3_172x.png?v=9709354378124362847',
          '"After our testing, we recommend this"',
          'l3'
        ),
        logoCell(
          `cell-asi-l4-${t}`,
          'https://wuffes.com/cdn/shop/files/offer-hc-logo-4_150x.png?v=3930439638900921161',
          '"The joint care dog brand you never knew you so desperately needed"',
          'l4'
        ),
      ],
    },
  ],
}

console.log('=== BEFORE: sections ===')
sections.forEach((s, i) => console.log(`  sections[${i}]: ${s.label} (${s.id})`))

console.log('\n=== NEW SECTION JSON ===')
console.log(JSON.stringify(newSection, null, 2))

// Insert at index 2 (between Hero and Content)
sections.splice(2, 0, newSection)

console.log('\n=== AFTER: sections ===')
sections.forEach((s, i) => console.log(`  sections[${i}]: ${s.label} (${s.id})`))

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`
console.log('\nDone. v16: "As Seen In" section inserted at sections[2].')
