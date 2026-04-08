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

const cell2 = finalCta.grids[1].cells[1]
const body = cell2.contents.find(c => c.id === 'content-javvy-cta-body-1775077292868')
if (!body) throw new Error('Body textBox not found')

body.text = '<p style="text-align:center;color:#1a1a1a;font-weight:500">This limited-time deal is in high demand and stock keeps selling out.</p>'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('Done. Body text updated to black / medium weight.')
