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

console.log('Section style:', JSON.stringify(finalCta.style, null, 2))
console.log('\nNumber of grids:', finalCta.grids.length)
finalCta.grids.forEach((g, i) => {
  console.log(`\n--- grid[${i}] gridStyle:`, JSON.stringify(g.gridStyle, null, 2))
  console.log(`grid[${i}] gridBadge:`, JSON.stringify(g.gridBadge, null, 2))
  g.cells.forEach((c, j) => {
    console.log(`  cell[${j}] id=${c.id} width=${c.width} style:`, JSON.stringify(c.style, null, 2))
  })
})
