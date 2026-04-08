import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const section = row.sections.find(s => s.label === 'Product Comparison')
if (!section) throw new Error('Product Comparison section not found')

for (const [gIdx, grid] of section.grids.entries()) {
  for (const cell of grid.cells) {
    const types = cell.contents.map(c => c.type)
    console.log(`Grid ${gIdx} | cell ${cell.id} | types: [${types}] | style:`, JSON.stringify(cell.style))
  }
}
