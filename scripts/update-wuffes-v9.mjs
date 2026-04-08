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

const t = Date.now()

// ─── Fix 1: Banner — replace 2-cell grid with banner content type ────────────
// BannerPreview now renders badge + text inline (flex-row, no wrap)
sections[0] = {
  id: `section-banner-${t}`,
  label: 'Banner',
  style: {
    position: 'sticky',
    paddingYSize: 'none',
    contentWidth: 'flood',
    backgroundColor: '#2D4A35',
  },
  grids: [{
    gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
    rows: [{
      id: `row-banner-${t}`,
      cellIds: [`cell-banner-${t}`],
      style: { backgroundColor: '', paddingY: 0, gap: 0 },
    }],
    cells: [{
      id: `cell-banner-${t}`,
      width: 100,
      style: {
        backgroundColor: '',
        borderColor: '',
        borderWidth: 0,
        borderRadius: 0,
        paddingX: 0,
        paddingY: 0,
        alignItems: 'center',
      },
      contents: [{
        id: `content-banner-${t}`,
        type: 'banner',
        bannerConfig: {
          enabled: true,
          position: 'static',  // section handles sticky
          primary: {
            backgroundColor: '#2D4A35',
            textColor: '#ffffff',
            text: 'WHILE STOCKS LAST',
            badgeText: '50% OFF',
            badgeBackgroundColor: '#A8E635',
            badgeTextColor: '#1A1A1A',
          },
          secondary: { enabled: false, text: '' },
        },
      }],
    }],
  }],
}

const hero = sections[1]

// ─── Fix 2: Hero image — restore inset card treatment ───────────────────────
const imgCell = hero.grids[4].cells[0]
imgCell.style.paddingX      = 24
imgCell.style.paddingTop    = 16
imgCell.style.paddingBottom = 24
imgCell.style.borderRadius  = 0   // cell stays flat — radius on image element

const imgContent = imgCell.contents[0]
imgContent.imageAspectRatio  = 'portrait-tall'
imgContent.imageObjectFit    = 'cover'
imgContent.imageBorderRadius = 12  // rounds the <img>/<div> element itself

// ─── Fix 3: CTA — solid fill, no border ─────────────────────────────────────
const ctaContent = hero.grids[3].cells[0].contents[0]
ctaContent.ctaBorderStyle       = 'none'
ctaContent.ctaBorderWidth       = 0
ctaContent.ctaBorderColor       = ''
ctaContent.ctaBackgroundColor   = '#A8E635'
ctaContent.ctaPaddingY          = 18
ctaContent.ctaBorderRadius      = 100
ctaContent.ctaFontSize          = 16
ctaContent.ctaFontWeight        = 700
ctaContent.ctaLetterSpacing     = '0.05em'
ctaContent.ctaTextColor         = '#1A1A1A'
ctaContent.ctaDropShadow        = false

// ─── Fix 4: Stars — outline only, muted olive-green stroke ──────────────────
const starsContent = hero.grids[1].cells[0].contents[0]
starsContent.starFillColor   = 'transparent'
starsContent.starEmptyColor  = 'transparent'
starsContent.starBorderColor = '#8DB73E'
starsContent.starSize        = 22
// starLabelColor and starLabelSize unchanged from v7

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('Done. Wuffes v9: banner, image, CTA, stars.')
console.log('  banner: type=banner badgeText=%s text=%s', sections[0].grids[0].cells[0].contents[0].bannerConfig.primary.badgeText, sections[0].grids[0].cells[0].contents[0].bannerConfig.primary.text)
console.log('  image:  paddingX=%s paddingTop=%s paddingBottom=%s ar=%s radius=%s',
  imgCell.style.paddingX, imgCell.style.paddingTop, imgCell.style.paddingBottom,
  imgContent.imageAspectRatio, imgContent.imageBorderRadius)
console.log('  cta:    bg=%s borderStyle=%s paddingY=%s radius=%s fontWeight=%s',
  ctaContent.ctaBackgroundColor, ctaContent.ctaBorderStyle,
  ctaContent.ctaPaddingY, ctaContent.ctaBorderRadius, ctaContent.ctaFontWeight)
console.log('  stars:  fill=%s empty=%s border=%s size=%s',
  starsContent.starFillColor, starsContent.starEmptyColor,
  starsContent.starBorderColor, starsContent.starSize)
