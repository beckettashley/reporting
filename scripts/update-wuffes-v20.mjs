import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 2`
const sections = row.sections

// ─── Targets ──────────────────────────────────────────────────────────────────
const hero       = sections[1]
const imgContent = hero.grids[4].cells[0].contents[0]

const cmpSection = sections.find(s => s.id === 'section-cmp-1775056856507')
const cmpContent = cmpSection.grids[1].cells[0].contents[0]
const costMetric = cmpContent.productComparisonMetrics[0]

// ─── BEFORE ───────────────────────────────────────────────────────────────────
console.log('=== BEFORE: hero image content ===')
console.log(JSON.stringify(imgContent, null, 2))

console.log('\n=== BEFORE: COST PER CHEW metric ===')
console.log(JSON.stringify(costMetric, null, 2))

// ─── Fix 2: cost per chew — single $ ─────────────────────────────────────────
costMetric.values = ['$0.41', '$0.44']

// ─── Fix 4: hero image — add aspect ratio for crop ────────────────────────────
imgContent.imageAspectRatio     = 'standard'
imgContent.imageObjectFit       = 'cover'
imgContent.imageObjectPosition  = 'center 60%'

// ─── Write ────────────────────────────────────────────────────────────────────
await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

// ─── Read back from DB to confirm persistence ────────────────────────────────
const [rowAfter] = await sql`SELECT sections FROM presets WHERE id = 2`
const heroAfter       = rowAfter.sections[1]
const imgAfter        = heroAfter.grids[4].cells[0].contents[0]
const cmpSectionAfter = rowAfter.sections.find(s => s.id === 'section-cmp-1775056856507')
const costAfter       = cmpSectionAfter.grids[1].cells[0].contents[0].productComparisonMetrics[0]

console.log('\n=== AFTER (read back from DB): hero image content ===')
console.log(JSON.stringify(imgAfter, null, 2))

console.log('\n=== AFTER (read back from DB): COST PER CHEW metric ===')
console.log(JSON.stringify(costAfter, null, 2))

console.log('\nDone. v20: imageAspectRatio→standard, imageObjectPosition→center 60%, cost per chew confirmed.')
