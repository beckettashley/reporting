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

console.log('BEFORE — gridStyle.gap:', grid.gridStyle.gap, '| cell1 paddingTop/Bottom:', cell1.style.paddingTop, '/', cell1.style.paddingBottom)

// More vertical breathing room on cell1
cell1.style.paddingTop    = 40
cell1.style.paddingBottom = 40

// Remove row gap so stacked cells on mobile sit flush against each other
// (gap between transparent flex items lets the section background bleed through)
grid.gridStyle.gap = 0

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const gA  = after.sections.find(s => s.label === 'Final CTA').grids[1]
const c1A = gA.cells[0]
console.log('AFTER  — gridStyle.gap:', gA.gridStyle.gap, '| cell1 paddingTop/Bottom:', c1A.style.paddingTop, '/', c1A.style.paddingBottom)
