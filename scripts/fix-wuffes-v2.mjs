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

// ─── Section 0: Banner ────────────────────────────────────────────────────────
// Replace non-standard paddingY:0 with paddingYSize:"none", add contentWidth:"flood"
sections[0].style = {
  paddingYSize: 'none',
  position: 'sticky',
  backgroundColor: sections[0].style.backgroundColor ?? '',
}

// Fix banner cell: padding → paddingX/paddingY
for (const cell of sections[0].grids[0].cells) {
  const { padding, ...rest } = cell.style
  cell.style = { ...rest, paddingX: 0, paddingY: 0 }
}

// Remove spurious gridStyle.padding
delete sections[0].grids[0].gridStyle.padding

// ─── Section 1: Wuffes Content ────────────────────────────────────────────────
// Replace all non-standard section style fields with valid ones
// Original paddingY: 48 → paddingYSize: "m" (desktop=48, tablet=32, mobile=24)
sections[1].style = {
  paddingYSize: 'm',
  contentWidth: 'contained',
  backgroundColor: sections[1].style.backgroundColor ?? '',
}

const grid = sections[1].grids[0]

// Remove spurious gridStyle.padding
delete grid.gridStyle.padding

// Fix all cells: padding → paddingX/paddingY
for (const cell of grid.cells) {
  const { padding, ...rest } = cell.style
  const p = padding ?? 0
  cell.style = { ...rest, paddingX: p, paddingY: p }
}

// ─── Fix hardcoded inline styles in textBox content ───────────────────────────
// cw2-text and cw3-text: strip font-size, font-weight, margin from element attributes;
// keep color but move to <span style="color:..."> (Tiptap format)

const leftTextCell = grid.cells.find(c => c.id === 'cell-wuffes-left')
const rightTextCell = grid.cells.find(c => c.id === 'cell-wuffes-right')

const leftText = leftTextCell?.contents.find(c => c.id === 'cw2-text')
if (leftText) {
  leftText.text = '<h3><span style="color: #ffffff;">Wuffes Joint Chews</span></h3><p><span style="color: #ffffff;">Soft chews packed with clinically-proven ingredients</span></p>'
}

const rightText = rightTextCell?.contents.find(c => c.id === 'cw3-text')
if (rightText) {
  rightText.text = '<h3><span style="color: #ffffff;">Credible Vet Insights</span></h3><p><span style="color: #ffffff;">Educational resources from our Vet Advisory Board</span></p>'
}

// ─── Fix images: add imageAspectRatio ─────────────────────────────────────────
const leftImg = leftTextCell?.contents.find(c => c.id === 'cw2-img')
if (leftImg) leftImg.imageAspectRatio = 'square'

const rightImg = rightTextCell?.contents.find(c => c.id === 'cw3-img')
if (rightImg) rightImg.imageAspectRatio = 'square'

// ─── Save ─────────────────────────────────────────────────────────────────────
await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('Done. Summary of changes:')
console.log('  Section 0 (Banner) style:', JSON.stringify(sections[0].style))
console.log('  Section 1 (Wuffes) style:', JSON.stringify(sections[1].style))
console.log('  gridStyle:', JSON.stringify(grid.gridStyle))
console.log('  Cell styles:')
for (const cell of grid.cells) {
  console.log(`    ${cell.id}: paddingX=${cell.style.paddingX} paddingY=${cell.style.paddingY}`)
}
console.log('  cw2-text:', leftText?.text)
console.log('  cw3-text:', rightText?.text)
console.log('  cw2-img aspectRatio:', leftImg?.imageAspectRatio)
console.log('  cw3-img aspectRatio:', rightImg?.imageAspectRatio)
