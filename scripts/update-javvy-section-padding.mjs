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

const article = sections.find(s => s.label === 'Article Header')
const comparison = sections.find(s => s.label === 'Product Comparison')
if (!article) throw new Error('Article Header not found')
if (!comparison) throw new Error('Product Comparison not found')

console.log('BEFORE:')
console.log(`  Article Header: paddingYSize=${article.style.paddingYSize ?? '(unset)'} paddingYOverride=${article.style.paddingYOverride ?? '(unset)'}`)
console.log(`  Product Comparison: paddingYOverride=${comparison.style.paddingYOverride ?? '(unset)'}`)

article.style.paddingYOverride = 16
delete article.style.paddingYSize
comparison.style.paddingYOverride = 24

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const a = after.sections.find(s => s.label === 'Article Header')
const c = after.sections.find(s => s.label === 'Product Comparison')

console.log('\nAFTER:')
console.log(`  Article Header: paddingYSize=${a.style.paddingYSize ?? '(unset)'} paddingYOverride=${a.style.paddingYOverride}`)
console.log(`  Product Comparison: paddingYOverride=${c.style.paddingYOverride}`)
