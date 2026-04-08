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

// ─── Hero section background ─────────────────────────────────────────────────
hero.style.backgroundColor = '#F7ECE1'

// ─── Heading: two-line text via <br> (renderer uses dangerouslySetInnerHTML) ─
const headingContent = hero.grids[0].cells[0].contents[0]
headingContent.text = '<h1 style="font-weight: 900; color: #2D4A35;">50% OFF<br>TODAY ONLY!</h1>'

// ─── Stars: solid filled, no outline ─────────────────────────────────────────
const starsContent = hero.grids[1].cells[0].contents[0]
starsContent.starFillColor   = '#C5FB57'
starsContent.starEmptyColor  = '#e5e7eb'
starsContent.starBorderColor = 'none'
starsContent.starBorderWidth = 0

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('=== AFTER ===')
console.log('hero.style.backgroundColor:', hero.style.backgroundColor)
console.log('heading text:', headingContent.text)
console.log('stars:', JSON.stringify({
  starFillColor:   starsContent.starFillColor,
  starEmptyColor:  starsContent.starEmptyColor,
  starBorderColor: starsContent.starBorderColor,
  starBorderWidth: starsContent.starBorderWidth,
}, null, 2))
