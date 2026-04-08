import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const sections = JSON.parse(JSON.stringify(row.sections))

// Section 3 is the restructured Listicle (3 grids)
// Each grid: cells[0]=video, cells[1]=title, cells[2]=desc
for (const grid of sections[3].grids) {
  const [videoCell, titleCell, descCell] = grid.cells

  // Fix video: square aspect ratio, 55% width
  videoCell.width = 55
  for (const c of videoCell.contents) {
    if (c.type === 'video') c.videoAspectRatio = 'square'
  }

  // Fix text cells: 45% width
  titleCell.width = 45
  descCell.width = 45

  // Update row cellIds to stay consistent (ids haven't changed, just confirming)
  console.log(`Grid: video=${videoCell.width}% title=${titleCell.width}% desc=${descCell.width}%`)
  console.log(`  Video AR: ${videoCell.contents[0].videoAspectRatio}`)
}

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('Done.')
