import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 2`
const sections = JSON.parse(JSON.stringify(row.sections)) // deep clone

const content = sections[1].grids[0]

// ── 1. Fix cell padding: `padding` → `paddingX` + `paddingY` ──────────────────
for (const cell of content.cells) {
  if (cell.style?.padding !== undefined) {
    const p = cell.style.padding
    cell.style.paddingX = p
    cell.style.paddingY = p
    delete cell.style.padding
  }
}

// ── 2. Fix image aspect ratios & objectFit ────────────────────────────────────
for (const cell of content.cells) {
  for (const c of cell.contents) {
    if (c.id === 'cw2-img') {
      // Product/supplement jar — square, contain so full product is visible
      c.imageAspectRatio = 'square'
      c.imageObjectFit = 'contain'
    }
    if (c.id === 'cw3-img') {
      // Vet lifestyle photo — standard 4:3, cover
      c.imageAspectRatio = 'standard'
      c.imageObjectFit = 'cover'
    }
  }
}

// ── 3. Clean inline styles in textBox content ─────────────────────────────────
// Keep color (white needed on dark bg), remove hardcoded font-size/weight/margin
for (const cell of content.cells) {
  for (const c of cell.contents) {
    if (c.type === 'textBox' && c.text) {
      // Strip style attributes but preserve color-only inline styles
      c.text = c.text
        // Remove full inline style attrs from h3/p, preserving only color
        .replace(/style='color:(#[a-fA-F0-9]+);[^']*'/g, 'style="color:$1"')
        .replace(/style="color:(#[a-fA-F0-9]+);[^"]*"/g, 'style="color:$1"')
        // Remove trailing empty block tags
        .replace(/(<p><\/p>|<h[1-6]><\/h[1-6]>)+$/g, '')
        .trim()
    }
  }
}

// ── 4. Fix gridStyle: remove `padding`, add explicit `columnGap` ──────────────
if (content.gridStyle?.padding !== undefined) {
  delete content.gridStyle.padding
}
content.gridStyle.columnGap = 24

// ── 5. Fix section style: remove non-standard fields, add paddingYSize ────────
const sectionStyle = sections[1].style
const { maxWidth, paddingX, paddingY, paddingXMobile, paddingXTablet, paddingYMobile, paddingYTablet, ...cleanStyle } = sectionStyle
sections[1].style = {
  ...cleanStyle,
  contentWidth: 'contained',
  paddingYSize: 'm',   // 48px desktop / 32px tablet / 24px mobile — matches original intent
}

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`
console.log('Done. Fixes applied:')
console.log('  ✓ Cell padding: padding → paddingX/paddingY on all 4 cells')
console.log('  ✓ Images: aspect ratios + objectFit set (cw2-img=square/contain, cw3-img=standard/cover)')
console.log('  ✓ TextBox inline styles: stripped to color-only')
console.log('  ✓ Empty trailing tags removed from text content')
console.log('  ✓ gridStyle.padding removed, columnGap: 24 added')
console.log('  ✓ Section style: non-standard fields removed, paddingYSize: "m" added')
