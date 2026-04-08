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

const section = sections.find(s => s.label === 'Final CTA')
if (!section) throw new Error('Final CTA section not found')

console.log('BEFORE:', JSON.stringify({
  backgroundColor: section.style.backgroundColor,
  backgroundGradientFrom: section.style.backgroundGradientFrom,
  backgroundGradientTo: section.style.backgroundGradientTo,
}))

section.style.backgroundGradientFrom = 'rgba(20, 245, 255, 0.125)'
section.style.backgroundGradientTo   = 'rgba(153, 143, 255, 0.125)'
section.style.backgroundGradientDirection = 'to bottom'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const s = after.sections.find(s => s.label === 'Final CTA')

console.log('AFTER:', JSON.stringify({
  backgroundGradientFrom: s.style.backgroundGradientFrom,
  backgroundGradientTo: s.style.backgroundGradientTo,
  backgroundGradientDirection: s.style.backgroundGradientDirection,
}))
