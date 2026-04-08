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

const imgCell = sections[1].grids[4].cells[0]
const imgContent = imgCell.contents[0]

// ─── Image content — only these fields ──────────────────────────────────────
imgContent.imageWidth        = 100
imgContent.imageAlign        = 'center'
imgContent.imagePadding      = 0
imgContent.imageAspectRatio  = 'auto'   // valid in type; renderer uses natural image dimensions
imgContent.imageObjectFit    = 'cover'
imgContent.imageBorderRadius = 12
imgContent.imageUrl          = 'https://wuffes.com/cdn/shop/files/offer-hc-hero_686x.png?v=8745781999331312312'

// ─── Grid cell padding — only these fields ───────────────────────────────────
imgCell.style.paddingX      = 16
imgCell.style.paddingTop    = 16
imgCell.style.paddingBottom = 24

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('=== AFTER ===')
console.log('cell.style:', JSON.stringify(imgCell.style, null, 2))
console.log('content:', JSON.stringify(imgContent, null, 2))
