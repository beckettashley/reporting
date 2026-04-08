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

const idx = sections.findIndex(s => s.label === 'Comparison')
if (idx === -1) throw new Error('Comparison section not found')

console.log(`Removing section at index ${idx}: "${sections[idx].label}"`)
sections.splice(idx, 1)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
console.log('Remaining sections:', after.sections.map(s => s.label))
