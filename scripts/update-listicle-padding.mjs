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

// Sections 3, 4, 5 are the listicle items — change paddingYSize from "m" to "s"
const updated = sections.map((s, i) =>
  i >= 3 && i <= 5 ? { ...s, style: { ...s.style, paddingYSize: "s" } } : s
)

await sql`UPDATE presets SET sections = ${JSON.stringify(updated)}::jsonb WHERE id = 1`
console.log('Done — listicle sections paddingYSize updated to "s"')
console.log('Values: desktop=24px/side, tablet=16px/side, mobile=12px/side')
