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

// ─── Target: Comparison section, first grid ───────────────────────────────────
const cmpSection = sections.find(s => s.label === 'Comparison')
if (!cmpSection) throw new Error('Comparison section not found')
const grid = cmpSection.grids[0]

console.log('=== BEFORE ===')
console.log('gridBadge:', JSON.stringify(grid.gridBadge ?? null, null, 2))

grid.gridBadge = {
  text: '🌼 SPRING SPECIAL 🌸',
  backgroundColor: '#3730a8',
  textColor: '#ffffff',
  fontSize: 14,
  paddingX: 20,
  paddingY: 8,
  borderRadius: 100,
  animated: true,
  position: 'top-center',
}

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [rowAfter] = await sql`SELECT sections FROM presets WHERE id = 1`
const gridAfter = rowAfter.sections.find(s => s.label === 'Comparison').grids[0]

console.log('\n=== AFTER (read back from DB) ===')
console.log('gridBadge:', JSON.stringify(gridAfter.gridBadge, null, 2))
console.log('\nDone.')
