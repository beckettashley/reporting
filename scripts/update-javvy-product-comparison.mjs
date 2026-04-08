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

console.log('BEFORE — backgroundColor:', section.style.backgroundColor)

section.style.backgroundColor = '#ffffff'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const sectionAfter = after.sections.find(s => s.label === 'Product Comparison')
console.log('AFTER  — backgroundColor:', sectionAfter.style.backgroundColor)
