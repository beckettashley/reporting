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

// ─── Banner: color updates ───────────────────────────────────────────────────
const bannerPrimary = sections[0].grids[0].cells[0].contents[0].bannerConfig.primary
bannerPrimary.backgroundColor      = '#18443D'
bannerPrimary.textColor            = '#C5FB57'
bannerPrimary.badgeBackgroundColor = '#C5FB57'
bannerPrimary.badgeTextColor       = '#18443D'

const hero = sections[1]

// ─── Grid 0 (heading): padding ──────────────────────────────────────────────
hero.grids[0].cells[0].style.paddingTop    = 24  // was 32
hero.grids[0].cells[0].style.paddingBottom = 8   // was 0

// ─── Grid 1 (stars): padding + colors ───────────────────────────────────────
hero.grids[1].cells[0].style.paddingTop    = 8   // was 20
const starsContent = hero.grids[1].cells[0].contents[0]
starsContent.starFillColor  = '#C5FB57'   // was transparent
starsContent.starEmptyColor = 'transparent'
starsContent.starBorderColor = '#18443D'  // was #6B9E2A
starsContent.starBorderWidth = 2
starsContent.starSize        = 22

// ─── Grid 2 (body): padding ─────────────────────────────────────────────────
hero.grids[2].cells[0].style.paddingTop    = 8   // was 12

// ─── Grid 3 (CTA): padding + colors ─────────────────────────────────────────
hero.grids[3].cells[0].style.paddingTop    = 16  // was 24
hero.grids[3].cells[0].style.paddingX      = 24  // was 20
const ctaContent = hero.grids[3].cells[0].contents[0]
ctaContent.ctaBackgroundColor = '#C5FB57'  // was #A8E635
ctaContent.ctaTextColor       = '#18443D'  // was #1A1A1A
ctaContent.ctaBorderStyle     = 'solid'    // was 'none'
ctaContent.ctaBorderColor     = '#18443D'  // was ''
ctaContent.ctaBorderWidth     = 2          // was 0
ctaContent.ctaBorderRadius    = 100
ctaContent.ctaPaddingY        = 18
ctaContent.ctaFontWeight      = 700
ctaContent.ctaLetterSpacing   = '0.05em'

// ─── Grid 4 (image): already correct — no changes ───────────────────────────
// imageUrl, imageAspectRatio, imageBorderRadius, imageObjectFit,
// paddingX, paddingTop, paddingBottom all confirmed correct in DB

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('Done. v11 applied.')
console.log('\n── Banner ──')
console.log('  backgroundColor:      ', bannerPrimary.backgroundColor)
console.log('  textColor:            ', bannerPrimary.textColor)
console.log('  badgeBackgroundColor: ', bannerPrimary.badgeBackgroundColor)
console.log('  badgeTextColor:       ', bannerPrimary.badgeTextColor)
console.log('\n── Grid 0 (heading) ──')
console.log('  paddingTop:   ', hero.grids[0].cells[0].style.paddingTop)
console.log('  paddingX:     ', hero.grids[0].cells[0].style.paddingX)
console.log('  paddingBottom:', hero.grids[0].cells[0].style.paddingBottom)
console.log('\n── Grid 1 (stars) ──')
console.log('  paddingTop:   ', hero.grids[1].cells[0].style.paddingTop)
console.log('  paddingX:     ', hero.grids[1].cells[0].style.paddingX)
console.log('  paddingBottom:', hero.grids[1].cells[0].style.paddingBottom)
console.log('  starFillColor:  ', starsContent.starFillColor)
console.log('  starEmptyColor: ', starsContent.starEmptyColor)
console.log('  starBorderColor:', starsContent.starBorderColor)
console.log('  starBorderWidth:', starsContent.starBorderWidth)
console.log('  starSize:       ', starsContent.starSize)
console.log('\n── Grid 2 (body) ──')
console.log('  paddingTop:   ', hero.grids[2].cells[0].style.paddingTop)
console.log('  paddingX:     ', hero.grids[2].cells[0].style.paddingX)
console.log('  paddingBottom:', hero.grids[2].cells[0].style.paddingBottom)
console.log('\n── Grid 3 (CTA) ──')
console.log('  paddingTop:        ', hero.grids[3].cells[0].style.paddingTop)
console.log('  paddingX:          ', hero.grids[3].cells[0].style.paddingX)
console.log('  paddingBottom:     ', hero.grids[3].cells[0].style.paddingBottom)
console.log('  ctaBackgroundColor:', ctaContent.ctaBackgroundColor)
console.log('  ctaTextColor:      ', ctaContent.ctaTextColor)
console.log('  ctaBorderStyle:    ', ctaContent.ctaBorderStyle)
console.log('  ctaBorderColor:    ', ctaContent.ctaBorderColor)
console.log('  ctaBorderWidth:    ', ctaContent.ctaBorderWidth)
console.log('  ctaBorderRadius:   ', ctaContent.ctaBorderRadius)
console.log('  ctaPaddingY:       ', ctaContent.ctaPaddingY)
console.log('  ctaFontWeight:     ', ctaContent.ctaFontWeight)
console.log('  ctaLetterSpacing:  ', ctaContent.ctaLetterSpacing)
console.log('\n── Grid 4 (image) — unchanged, confirmed correct ──')
const img = hero.grids[4].cells[0]
console.log('  paddingX:         ', img.style.paddingX)
console.log('  paddingTop:       ', img.style.paddingTop)
console.log('  paddingBottom:    ', img.style.paddingBottom)
console.log('  imageUrl:         ', img.contents[0].imageUrl)
console.log('  imageAspectRatio: ', img.contents[0].imageAspectRatio)
console.log('  imageBorderRadius:', img.contents[0].imageBorderRadius)
console.log('  imageObjectFit:   ', img.contents[0].imageObjectFit)
