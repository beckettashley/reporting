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

// ─── Target cells ─────────────────────────────────────────────────────────────
const headingCell    = hero.grids[0].cells[0]
const bodyContent    = hero.grids[2].cells[0].contents[0]
const imgContent     = hero.grids[4].cells[0].contents[0]

console.log('=== BEFORE: image cell contents ===')
console.log(JSON.stringify(imgContent, null, 2))

// 1. Body copy font size: 18 → 16
bodyContent.textFontSize = 16

// 2. Image objectPosition
imgContent.imageObjectPosition = 'center 70%'

// 3. Heading paddingTop: → 20
headingCell.style.paddingTop = 20

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('\n=== AFTER: image cell contents ===')
console.log(JSON.stringify(imgContent, null, 2))
console.log('\n=== Other changes ===')
console.log('bodyContent.textFontSize:', bodyContent.textFontSize)
console.log('headingCell.style.paddingTop:', headingCell.style.paddingTop)
console.log('\nDone. v18: body copy 16px, imageObjectPosition center 70%, heading paddingTop 20.')
