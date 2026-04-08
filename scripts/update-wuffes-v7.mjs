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
// font-weight:900 must be inline on <h1> itself — PROSE_STYLES [&_h1]:font-bold
// overrides inherited fontWeight from wrapper div (class beats cascade)
const headingContent = hero.grids[0].cells[0].contents[0]
headingContent.text           = '<h1 style="font-weight: 900; color: #2D4A35;">50% OFF TODAY ONLY!</h1>'
headingContent.textFontSize   = 48
headingContent.textLineHeight = 1.05
delete headingContent.textFontWeight  // handled via inline style on h1

// ─── Grid 1: Star Rating ────────────────────────────────────────────────────
const starsContent = hero.grids[1].cells[0].contents[0]
starsContent.starFillColor  = '#A8E635'
starsContent.starEmptyColor = '#e5e7eb'
starsContent.starBorderColor = '#8BC820'
starsContent.starSize        = 24
starsContent.starLabelColor  = '#555555'
starsContent.starLabelSize   = 15

// ─── Grid 2: Body Copy ──────────────────────────────────────────────────────
const bodyContent = hero.grids[2].cells[0].contents[0]
bodyContent.text          = '<p><span style="color: #333333;">Powerful joint chews filled with clinically-proven ingredients, now with an unbeatable offer.</span></p>'
bodyContent.textFontSize  = 18
bodyContent.textLineHeight = 1.6

// ─── Grid 3: CTA ────────────────────────────────────────────────────────────
const ctaContent = hero.grids[3].cells[0].contents[0]
ctaContent.ctaBorderStyle  = 'solid'
ctaContent.ctaBorderColor  = '#8BC820'
ctaContent.ctaBorderWidth  = 2
ctaContent.ctaDropShadow   = false
ctaContent.ctaFontSize     = 16
ctaContent.ctaFontWeight   = 700

// ─── Grid 4: Hero Image ─────────────────────────────────────────────────────
const imgContent = hero.grids[4].cells[0].contents[0]
imgContent.imageAspectRatio = 'portrait-tall'  // 4/5 — added to enum in this session

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('Done. Hero style pass (v7) applied.')
console.log('  heading text:', headingContent.text.slice(0, 60))
console.log('  heading: fontSize=%s lineHeight=%s textFontWeight=%s',
  headingContent.textFontSize, headingContent.textLineHeight, headingContent.textFontWeight)
console.log('  stars: fill=%s empty=%s border=%s size=%s labelColor=%s labelSize=%s',
  starsContent.starFillColor, starsContent.starEmptyColor, starsContent.starBorderColor,
  starsContent.starSize, starsContent.starLabelColor, starsContent.starLabelSize)
console.log('  body: fontSize=%s lineHeight=%s', bodyContent.textFontSize, bodyContent.textLineHeight)
console.log('  cta: borderStyle=%s borderColor=%s borderWidth=%s dropShadow=%s fontSize=%s fontWeight=%s',
  ctaContent.ctaBorderStyle, ctaContent.ctaBorderColor, ctaContent.ctaBorderWidth,
  ctaContent.ctaDropShadow, ctaContent.ctaFontSize, ctaContent.ctaFontWeight)
console.log('  image: aspectRatio=%s', imgContent.imageAspectRatio)
