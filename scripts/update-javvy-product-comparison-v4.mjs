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

const comp = sections.find(s => s.label === 'Product Comparison')
  .grids.flatMap(g => g.cells).flatMap(c => c.contents).find(c => c.type === 'productComparison')

console.log('BEFORE — opacity:', comp.productComparisonHighlightOpacity)
comp.productComparisonHighlightOpacity = 0.125

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const compAfter = after.sections.find(s => s.label === 'Product Comparison')
  .grids.flatMap(g => g.cells).flatMap(c => c.contents).find(c => c.type === 'productComparison')

console.log('AFTER  — opacity:', compAfter.productComparisonHighlightOpacity)
