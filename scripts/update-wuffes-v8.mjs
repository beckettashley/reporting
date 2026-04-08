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

// ─── Grid 0: Heading ────────────────────────────────────────────────────────
const headingCell = hero.grids[0].cells[0]
headingCell.style.textAlign = 'left'
headingCell.style.paddingX  = 24  // already 24; confirm

// ─── Grid 1: Star Rating ────────────────────────────────────────────────────
// Renderer now puts stars + label inline (flex-row). textAlign left.
const starsCell = hero.grids[1].cells[0]
starsCell.style.textAlign = 'left'

// ─── Grid 2: Body Copy ──────────────────────────────────────────────────────
const bodyCell = hero.grids[2].cells[0]
bodyCell.style.textAlign = 'left'
bodyCell.style.paddingX  = 24  // was 32

// ─── Grid 3: CTA ────────────────────────────────────────────────────────────
const ctaCell = hero.grids[3].cells[0]
ctaCell.style.paddingX = 20  // was 24

// ─── Grid 4: Hero Image ─────────────────────────────────────────────────────
const imgCell = hero.grids[4].cells[0]
imgCell.style.paddingX     = 24  // restore (was 0)
// borderRadius on the cell itself is not needed — borderRadius goes on the image element
imgCell.style.borderRadius = 0   // keep cell flat

const imgContent = imgCell.contents[0]
imgContent.imageBorderRadius = 12  // rounds the <img> element via new prop

// ─── Section: paddingX already 0 ────────────────────────────────────────────
// hero.style.maxWidth = 480 triggers { maxWidth: 480, margin: auto } in the renderer
// — no horizontal gutters are applied. No change needed.

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('Done. Hero alignment + image pass (v8) applied.')
console.log('  heading: textAlign=%s paddingX=%s', headingCell.style.textAlign, headingCell.style.paddingX)
console.log('  stars:   textAlign=%s', starsCell.style.textAlign)
console.log('  body:    textAlign=%s paddingX=%s', bodyCell.style.textAlign, bodyCell.style.paddingX)
console.log('  cta:     paddingX=%s', ctaCell.style.paddingX)
console.log('  image:   paddingX=%s borderRadius(cell)=%s imageBorderRadius=%s',
  imgCell.style.paddingX, imgCell.style.borderRadius, imgContent.imageBorderRadius)
