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

// ─── Section style ─────────────────────────────────────────────────────────
hero.style.maxWidth = 480
hero.style.paddingYSize = 'none'

// ─── Grid 0: Heading ────────────────────────────────────────────────────────
const headingCell = hero.grids[0].cells[0]
headingCell.style.paddingTop    = 32
headingCell.style.paddingBottom = 0
headingCell.style.paddingX      = 24
delete headingCell.style.paddingY

const headingContent = headingCell.contents[0]
headingContent.textFontSize   = 48
headingContent.textFontWeight = 900
headingContent.textLineHeight = 1.05

// ─── Grid 1: Star Rating ────────────────────────────────────────────────────
const starsCell = hero.grids[1].cells[0]
starsCell.style.paddingTop    = 20
starsCell.style.paddingBottom = 0
starsCell.style.paddingX      = 24
delete starsCell.style.paddingY

// ─── Grid 2: Body Copy ──────────────────────────────────────────────────────
const bodyCell = hero.grids[2].cells[0]
bodyCell.style.paddingTop    = 12
bodyCell.style.paddingBottom = 0
bodyCell.style.paddingX      = 32
delete bodyCell.style.paddingY

const bodyContent = bodyCell.contents[0]
bodyContent.textFontSize   = 18
bodyContent.textLineHeight = 1.6

// ─── Grid 3: CTA ────────────────────────────────────────────────────────────
const ctaCell = hero.grids[3].cells[0]
ctaCell.style.paddingTop    = 24
ctaCell.style.paddingBottom = 0
ctaCell.style.paddingX      = 24
delete ctaCell.style.paddingY

const ctaContent = ctaCell.contents[0]
ctaContent.ctaPaddingY = 20

// ─── Grid 4: Hero Image ─────────────────────────────────────────────────────
const imgCell = hero.grids[4].cells[0]
imgCell.style.paddingTop    = 24
imgCell.style.paddingBottom = 0
imgCell.style.paddingX      = 0
imgCell.style.borderRadius  = 0
delete imgCell.style.paddingY

const imgContent = imgCell.contents[0]
imgContent.imageAspectRatio = 'portrait'  // 4/5 not in enum; closest is portrait (3/4)
imgContent.imageObjectFit   = 'cover'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('Done. Hero spacing pass applied.')
console.log('  section.maxWidth:', hero.style.maxWidth)
console.log('  section.paddingYSize:', hero.style.paddingYSize)
console.log('  heading: paddingTop=%s paddingX=%s fontSize=%s weight=%s lh=%s',
  headingCell.style.paddingTop, headingCell.style.paddingX,
  headingContent.textFontSize, headingContent.textFontWeight, headingContent.textLineHeight)
console.log('  stars: paddingTop=%s paddingX=%s', starsCell.style.paddingTop, starsCell.style.paddingX)
console.log('  body: paddingTop=%s paddingX=%s fontSize=%s lh=%s',
  bodyCell.style.paddingTop, bodyCell.style.paddingX,
  bodyContent.textFontSize, bodyContent.textLineHeight)
console.log('  cta: paddingTop=%s paddingX=%s ctaPaddingY=%s',
  ctaCell.style.paddingTop, ctaCell.style.paddingX, ctaContent.ctaPaddingY)
console.log('  image: paddingTop=%s paddingX=%s borderRadius=%s ar=%s',
  imgCell.style.paddingTop, imgCell.style.paddingX,
  imgCell.style.borderRadius, imgContent.imageAspectRatio)
