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

// ─── Fix 1: Restore hero image URL (ONLY this field) ────────────────────────
const imgContent = hero.grids[4].cells[0].contents[0]
imgContent.imageUrl = 'https://wuffes.com/cdn/shop/files/offer-hc-hero_686x.png?v=8745781999331312312'

// ─── Fix 2: Star border — darker color, width 2 ────────────────────────────
const starsContent = hero.grids[1].cells[0].contents[0]
starsContent.starBorderColor = '#6B9E2A'
starsContent.starBorderWidth = 2

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('Done. v10: imageUrl restored + star border updated.')
console.log('  imageUrl:', imgContent.imageUrl)
console.log('  starBorderColor:', starsContent.starBorderColor)
console.log('  starBorderWidth:', starsContent.starBorderWidth)
