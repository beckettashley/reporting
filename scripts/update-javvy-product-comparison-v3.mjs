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

const section = sections.find(s => s.label === 'Product Comparison')
if (!section) throw new Error('Product Comparison section not found')

const comp = section.grids.flatMap(g => g.cells).flatMap(c => c.contents).find(c => c.type === 'productComparison')
if (!comp) throw new Error('productComparison content not found')

console.log('BEFORE:')
console.log('  productComparisonHighlightColor:    ', comp.productComparisonHighlightColor)
console.log('  productComparisonHighlightColorEnd: ', comp.productComparisonHighlightColorEnd ?? '(unset)')
console.log('  productComparisonHighlightOpacity:  ', comp.productComparisonHighlightOpacity ?? '(unset)')

comp.productComparisonHighlightColor    = '#14F5FF'
comp.productComparisonHighlightColorEnd = '#998FFF'
comp.productComparisonHighlightOpacity  = 0.5

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const compAfter = after.sections.find(s => s.label === 'Product Comparison')
  .grids.flatMap(g => g.cells).flatMap(c => c.contents).find(c => c.type === 'productComparison')

console.log('\nAFTER:')
console.log('  productComparisonHighlightColor:    ', compAfter.productComparisonHighlightColor)
console.log('  productComparisonHighlightColorEnd: ', compAfter.productComparisonHighlightColorEnd)
console.log('  productComparisonHighlightOpacity:  ', compAfter.productComparisonHighlightOpacity)
