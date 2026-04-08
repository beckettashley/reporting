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

const finalCta = sections.find(s => s.label === 'Final CTA')
if (!finalCta) throw new Error('Final CTA section not found')

const cell1 = finalCta.grids[1].cells[0]

console.log('BEFORE — cell1 paddingX/Top/Bottom:', cell1.style.paddingX, '/', cell1.style.paddingTop, '/', cell1.style.paddingBottom)

// paddingX: 12 → 20 (mobile 60% scale: 7px → 12px)
// paddingTop/Bottom: 24 → 32 (mobile 60% scale: 14px → 19px)
cell1.style.paddingX      = 20
cell1.style.paddingTop    = 32
cell1.style.paddingBottom = 32

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const c1 = after.sections.find(s => s.label === 'Final CTA').grids[1].cells[0]
console.log('AFTER  — cell1 paddingX/Top/Bottom:', c1.style.paddingX, '/', c1.style.paddingTop, '/', c1.style.paddingBottom)
