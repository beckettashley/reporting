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

const grid = finalCta.grids[1]  // 2-col offer grid
const cell1 = grid.cells[0]     // image cell (55%)
const cell2 = grid.cells[1]     // offer copy cell (45%)
const imgContent = cell1.contents[0]

console.log('=== BEFORE ===')
console.log('gridStyle:', JSON.stringify(grid.gridStyle))
console.log('cell1.style.backgroundColor:', cell1.style.backgroundColor)
console.log('cell1.style.borderRadius:   ', cell1.style.borderRadius)
console.log('cell2.style.backgroundColor:', cell2.style.backgroundColor)
console.log('cell2.style.borderRadius:   ', cell2.style.borderRadius)
console.log('imgContent.imageAspectRatio:', imgContent.imageAspectRatio)

// Fix: move background/radius from cells to gridStyle
grid.gridStyle.backgroundColor = '#e8e4f7'
grid.gridStyle.borderRadius    = 16

delete cell1.style.backgroundColor
delete cell1.style.borderRadius
delete cell2.style.backgroundColor
delete cell2.style.borderRadius

// Fix: image aspect ratio
imgContent.imageAspectRatio = 'auto'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [rowAfter] = await sql`SELECT sections FROM presets WHERE id = 1`
const ctaAfter  = rowAfter.sections.find(s => s.label === 'Final CTA')
const gridAfter = ctaAfter.grids[1]
const c1After   = gridAfter.cells[0]
const c2After   = gridAfter.cells[1]
const imgAfter  = c1After.contents[0]

console.log('\n=== AFTER (read back from DB) ===')
console.log('gridStyle:', JSON.stringify(gridAfter.gridStyle))
console.log('cell1.style.backgroundColor:', c1After.style.backgroundColor ?? '(removed)')
console.log('cell1.style.borderRadius:   ', c1After.style.borderRadius ?? '(removed)')
console.log('cell2.style.backgroundColor:', c2After.style.backgroundColor ?? '(removed)')
console.log('cell2.style.borderRadius:   ', c2After.style.borderRadius ?? '(removed)')
console.log('imgContent.imageAspectRatio:', imgAfter.imageAspectRatio)
console.log('\nDone.')
