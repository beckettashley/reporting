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

const finalCta = sections.find(s => s.label === 'Final CTA')
if (!finalCta) throw new Error('Final CTA section not found')

const grid  = finalCta.grids[1]
const cell1 = grid.cells[0]  // image cell (55%)
const cell2 = grid.cells[1]  // offer copy cell (45%)

// Find the urgency textBox — the one containing "Sell-Out Risk"
const urgencyContent = cell2.contents.find(c => c.text?.includes('Sell-Out Risk'))
if (!urgencyContent) throw new Error('Urgency textBox not found')

console.log('=== BEFORE ===')
console.log('gridStyle.backgroundColor:', JSON.stringify(grid.gridStyle.backgroundColor))
console.log('gridStyle.borderStyle:    ', JSON.stringify(grid.gridStyle.borderStyle ?? '(unset)'))
console.log('gridStyle.borderWidth:    ', JSON.stringify(grid.gridStyle.borderWidth ?? '(unset)'))
console.log('gridStyle.borderColor:    ', JSON.stringify(grid.gridStyle.borderColor ?? '(unset)'))
console.log('gridBadge.fontSize:       ', grid.gridBadge?.fontSize ?? '(unset)')
console.log('gridBadge.paddingX:       ', grid.gridBadge?.paddingX ?? '(unset)')
console.log('gridBadge.paddingY:       ', grid.gridBadge?.paddingY ?? '(unset)')
console.log('cell1.style.backgroundColor:', JSON.stringify(cell1.style.backgroundColor ?? '(unset)'))
console.log('cell2.style.backgroundColor:', JSON.stringify(cell2.style.backgroundColor ?? '(unset)'))
console.log('urgency text:', urgencyContent.text)

// ── Fix 1: cell backgrounds + clear gridStyle background ─────────────────────
cell1.style.backgroundColor  = '#e8e4f7'
cell2.style.backgroundColor  = '#ffffff'
grid.gridStyle.backgroundColor = ''

// ── Fix 2: gridStyle border ───────────────────────────────────────────────────
grid.gridStyle.borderStyle = 'dashed'
grid.gridStyle.borderWidth = 1
grid.gridStyle.borderColor = '#c4b5fd'

// ── Fix 3: gridBadge size ─────────────────────────────────────────────────────
grid.gridBadge.fontSize  = 16
grid.gridBadge.paddingX  = 24
grid.gridBadge.paddingY  = 10

// ── Fix 4: urgency textBox ────────────────────────────────────────────────────
urgencyContent.text = '<p style="text-align:center;font-size:13px;background-color:#fef9c3;padding:8px 16px;border-radius:8px">Sell-Out Risk: <strong style="color:#dc2626">High</strong> &nbsp;|&nbsp; <strong>FAST</strong> shipping</p>'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [rowAfter] = await sql`SELECT sections FROM presets WHERE id = 1`
const ctaAfter  = rowAfter.sections.find(s => s.label === 'Final CTA')
const gAfter    = ctaAfter.grids[1]
const c1After   = gAfter.cells[0]
const c2After   = gAfter.cells[1]
const urgAfter  = c2After.contents.find(c => c.text?.includes('Sell-Out Risk'))

console.log('\n=== AFTER (read back from DB) ===')
console.log('gridStyle.backgroundColor:', JSON.stringify(gAfter.gridStyle.backgroundColor))
console.log('gridStyle.borderStyle:    ', JSON.stringify(gAfter.gridStyle.borderStyle))
console.log('gridStyle.borderWidth:    ', gAfter.gridStyle.borderWidth)
console.log('gridStyle.borderColor:    ', JSON.stringify(gAfter.gridStyle.borderColor))
console.log('gridBadge.fontSize:       ', gAfter.gridBadge.fontSize)
console.log('gridBadge.paddingX:       ', gAfter.gridBadge.paddingX)
console.log('gridBadge.paddingY:       ', gAfter.gridBadge.paddingY)
console.log('cell1.style.backgroundColor:', JSON.stringify(c1After.style.backgroundColor))
console.log('cell2.style.backgroundColor:', JSON.stringify(c2After.style.backgroundColor))
console.log('urgency text:', urgAfter.text)
console.log('\nDone.')
