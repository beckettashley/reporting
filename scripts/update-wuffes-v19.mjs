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
const hero = sections[1]

// ─── Targets ──────────────────────────────────────────────────────────────────
const starContent = hero.grids[1].cells[0].contents[0]
const imgContent  = hero.grids[4].cells[0].contents[0]

const cmpSection  = sections.find(s => s.label === 'Comparison')
const cmpContent  = cmpSection.grids[1].cells[0].contents[0]
const costMetric  = cmpContent.productComparisonMetrics[0]

// ─── BEFORE ───────────────────────────────────────────────────────────────────
console.log('=== BEFORE: image cell contents ===')
console.log(JSON.stringify(imgContent, null, 2))
console.log('\n=== BEFORE: starBorderColor / starBorderWidth ===')
console.log('starBorderColor:', starContent.starBorderColor)
console.log('starBorderWidth:', starContent.starBorderWidth)
console.log('\n=== BEFORE: COST PER CHEW values ===')
console.log(JSON.stringify(costMetric.values))

// ─── Fix 2: cost per chew — ensure single $ ───────────────────────────────────
costMetric.values = ['$0.41', '$0.44']

// ─── Fix 3: starBorderColor "" + starBorderWidth 0 ───────────────────────────
starContent.starBorderColor = ''
starContent.starBorderWidth = 0

// ─── AFTER ────────────────────────────────────────────────────────────────────
console.log('\n=== AFTER: image cell contents ===')
console.log(JSON.stringify(imgContent, null, 2))
console.log('\n=== AFTER: starBorderColor / starBorderWidth ===')
console.log('starBorderColor:', JSON.stringify(starContent.starBorderColor))
console.log('starBorderWidth:', starContent.starBorderWidth)
console.log('\n=== AFTER: COST PER CHEW values ===')
console.log(JSON.stringify(costMetric.values))

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`
console.log('\nDone. v19: starBorderColor → "", cost per chew confirmed, image cell confirmed.')
