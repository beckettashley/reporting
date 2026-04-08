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

const cell = sections.find(s => s.label === 'Final CTA')
  .grids.flatMap(g => g.cells).find(c => c.id === 'cell-javvy-cta-offer-1775077292865')
if (!cell) throw new Error('Cell not found')

console.log('BEFORE:', cell.style.fontWeight)
cell.style.fontWeight = 900
console.log('AFTER: ', cell.style.fontWeight)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('DB updated.')
