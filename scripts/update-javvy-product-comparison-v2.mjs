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

// ── Script 1: Product Comparison section ──────────────────────────────────────
const newSection = sections.find(s => s.label === 'Product Comparison')
if (!newSection) throw new Error('Product Comparison section not found')

console.log('=== Script 1 — Product Comparison ===')
console.log('BEFORE paddingYSize:', newSection.style.paddingYSize, '| paddingYOverride:', newSection.style.paddingYOverride, '| gridGap:', newSection.style.gridGap)

newSection.style.paddingYOverride = 48
newSection.style.gridGap = 24
delete newSection.style.paddingYSize

// ── Script 2: Old Comparison section ──────────────────────────────────────────
const oldSection = sections.find(s => s.label === 'Comparison')
if (!oldSection) throw new Error('Comparison section not found')

const compContent = oldSection.grids
  .flatMap(g => g.cells)
  .flatMap(c => c.contents)
  .find(c => c.type === 'productComparison')
if (!compContent) throw new Error('productComparison content not found in Comparison section')

console.log('\n=== Script 2 — Comparison (old) ===')
console.log('BEFORE productComparisonHighlightColor:', compContent.productComparisonHighlightColor ?? '(unset)')

compContent.productComparisonHighlightColor = '#e8f5e9'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const newSectionAfter = after.sections.find(s => s.label === 'Product Comparison')
const compAfter = after.sections.find(s => s.label === 'Comparison')
  .grids.flatMap(g => g.cells).flatMap(c => c.contents).find(c => c.type === 'productComparison')

console.log('\nAFTER paddingYOverride:', newSectionAfter.style.paddingYOverride, '| gridGap:', newSectionAfter.style.gridGap)
console.log('AFTER productComparisonHighlightColor:', compAfter.productComparisonHighlightColor)
