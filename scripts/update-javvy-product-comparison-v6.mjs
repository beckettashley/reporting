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
if (!comp) throw new Error('productComparison content not found')

console.log('BEFORE:', comp.productComparisonHighlightBorderColor)
comp.productComparisonHighlightBorderColor = 'transparent'
console.log('AFTER: ', comp.productComparisonHighlightBorderColor)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('DB updated.')
