import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const data = row.sections
const sections = Array.isArray(data) ? data : data.sections

sections.forEach((s, i) => {
  if (s.label === 'Benefits') {
    console.log(`[${i}] "Benefits" → "Before & After"`)
    s.label = 'Before & After'
  } else if (s.label === 'Value Proposition') {
    console.log(`[${i}] "Value Proposition" → "Benefits"`)
    s.label = 'Benefits'
  }
})

const updated = Array.isArray(data) ? sections : { ...data, sections }
await sql`UPDATE presets SET sections = ${JSON.stringify(updated)}::jsonb WHERE id = 1`

console.log('\nFinal sections:')
sections.forEach((s, i) => console.log(`  ${i}: ${s.label}`))
