import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const data = row.sections
const sections = Array.isArray(data) ? data : data.sections

const hiw = sections.find(s => s.label === 'How It Works')
const ba = sections.find(s => s.label === 'Before & After')

function inspectSection(s) {
  console.log(`\n=== ${s.label} ===`)
  console.log('style:', JSON.stringify(s.style))
  s.grids.forEach((g, gi) => {
    console.log(`  grid ${gi} gridStyle:`, JSON.stringify(g.gridStyle))
    g.rows?.forEach((r, ri) => {
      console.log(`    row ${ri} style:`, JSON.stringify(r.style))
    })
    g.cells.forEach((c, ci) => {
      const video = c.contents.find(x => x.type === 'video')
      if (video) {
        console.log(`    cell ${ci} (w=${c.width}%): videoAspectRatio=${video.videoAspectRatio}, captionBelow=${video.captionBelow}`)
        console.log(`      cell style:`, JSON.stringify(c.style))
      }
    })
  })
}

inspectSection(hiw)
inspectSection(ba)
