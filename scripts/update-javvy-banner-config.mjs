import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const sections = row.sections

const bannerSection = sections.find(s => s.label === 'Banner')
if (!bannerSection) throw new Error('Banner section not found')

const bannerCell = bannerSection.grids.flatMap(g => g.cells).find(c =>
  c.contents?.some(ct => ct.type === 'banner')
)
if (!bannerCell) throw new Error('Banner cell not found')

const bannerContent = bannerCell.contents.find(ct => ct.type === 'banner')
if (!bannerContent) throw new Error('Banner content not found')

console.log('BEFORE:', JSON.stringify(bannerContent.bannerConfig, null, 2))

bannerContent.bannerConfig = {
  enabled: true,
  position: "sticky",
  primary: {
    backgroundColor: "#2a2552",
    badgeText: "🌼 SPRING SPECIAL 🌸",
    badgeBackgroundColor: null,
    badgeTextColor: "#ffffff",
    text: "UP TO 58% OFF WITH FREE GIFTS",
    textColor: "#ffffff",
    countdown: { durationSeconds: 11169 },
    cta: {
      text: "Shop Now",
      url: "https://try.javvycoffee.com/pc84",
      backgroundColor: "#ffffff",
      textColor: "#2a2552"
    }
  },
  secondary: {
    enabled: true,
    text: "Save up to 55% off plus FREE gifts",
    backgroundColor: "#351979",
    textColor: "#ffffff"
  }
}

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const afterBanner = after.sections
  .find(s => s.label === 'Banner')
  ?.grids.flatMap(g => g.cells)
  .find(c => c.contents?.some(ct => ct.type === 'banner'))
  ?.contents.find(ct => ct.type === 'banner')

console.log('AFTER:', JSON.stringify(afterBanner?.bannerConfig, null, 2))
