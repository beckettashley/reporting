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

const headingCell = finalCta.grids[0].cells[0]
const imgContent  = finalCta.grids[1].cells[0].contents[0]

console.log('=== BEFORE ===')
console.log('headingCell.style.paddingBottom:', headingCell.style.paddingBottom ?? '(unset)')
console.log('imgContent.imageAspectRatio:    ', imgContent.imageAspectRatio)

// Fix 1: heading row bottom padding
headingCell.style.paddingBottom = 32

// Fix 2: image aspect ratio
imgContent.imageAspectRatio = 'widescreen'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [rowAfter] = await sql`SELECT sections FROM presets WHERE id = 1`
const ctaAfter      = rowAfter.sections.find(s => s.label === 'Final CTA')
const headingAfter  = ctaAfter.grids[0].cells[0]
const imgAfter      = ctaAfter.grids[1].cells[0].contents[0]

console.log('\n=== AFTER (read back from DB) ===')
console.log('headingCell.style.paddingBottom:', headingAfter.style.paddingBottom)
console.log('imgContent.imageAspectRatio:    ', imgAfter.imageAspectRatio)
console.log('\nDone.')
