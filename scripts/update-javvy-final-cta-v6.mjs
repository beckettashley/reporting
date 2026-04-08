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
const cell1 = grid.cells[0]
const cell2 = grid.cells[1]

console.log('=== BEFORE ===')
console.log('gridStyle.borderColor:    ', grid.gridStyle.borderColor)
console.log('gridBadge.backgroundColor:', grid.gridBadge.backgroundColor)
console.log('cell1 paddingTop/Bottom:  ', cell1.style.paddingTop, '/', cell1.style.paddingBottom)
console.log('cell2 paddingTop/Bottom:  ', cell2.style.paddingTop, '/', cell2.style.paddingBottom)

// Border: black dashed
grid.gridStyle.borderColor = '#000000'

// Badge background
grid.gridBadge.backgroundColor = '#351979'

// More vertical padding on both cells
cell1.style.paddingTop    = 24
cell1.style.paddingBottom = 24
cell2.style.paddingTop    = 24
cell2.style.paddingBottom = 24

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [rowAfter] = await sql`SELECT sections FROM presets WHERE id = 1`
const gA  = rowAfter.sections.find(s => s.label === 'Final CTA').grids[1]
const c1A = gA.cells[0]
const c2A = gA.cells[1]

console.log('\n=== AFTER (read back from DB) ===')
console.log('gridStyle.borderColor:    ', gA.gridStyle.borderColor)
console.log('gridBadge.backgroundColor:', gA.gridBadge.backgroundColor)
console.log('cell1 paddingTop/Bottom:  ', c1A.style.paddingTop, '/', c1A.style.paddingBottom)
console.log('cell2 paddingTop/Bottom:  ', c2A.style.paddingTop, '/', c2A.style.paddingBottom)
console.log('\nDone.')
