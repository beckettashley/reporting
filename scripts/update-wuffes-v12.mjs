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

// ─── Image content fields ────────────────────────────────────────────────────
imgContent.imageUrl          = 'https://wuffes.com/cdn/shop/files/offer-hc-hero_686x.png?v=8745781999331312312'
imgContent.imageAspectRatio  = 'portrait-tall'
imgContent.imageObjectFit    = 'cover'
imgContent.imageBorderRadius = 12
imgContent.imageWidth        = 88
imgContent.imageAlign        = 'center'
imgContent.imagePadding      = 0

// ─── Image grid cell padding ─────────────────────────────────────────────────
imgCell.style.paddingX      = 16   // was 24
imgCell.style.paddingTop    = 16   // unchanged
imgCell.style.paddingBottom = 24   // unchanged

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('Done. v12: hero image fields + grid padding.')
console.log('  imageUrl:         ', imgContent.imageUrl)
console.log('  imageAspectRatio: ', imgContent.imageAspectRatio)
console.log('  imageObjectFit:   ', imgContent.imageObjectFit)
console.log('  imageBorderRadius:', imgContent.imageBorderRadius)
console.log('  imageWidth:       ', imgContent.imageWidth)
console.log('  imageAlign:       ', imgContent.imageAlign)
console.log('  imagePadding:     ', imgContent.imagePadding)
console.log('  cell paddingX:    ', imgCell.style.paddingX)
console.log('  cell paddingTop:  ', imgCell.style.paddingTop)
console.log('  cell paddingBottom:', imgCell.style.paddingBottom)
