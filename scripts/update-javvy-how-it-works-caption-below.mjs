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

const hiwSection = sections.find(s => s.label === 'How It Works')
if (!hiwSection) throw new Error('How It Works section not found')

const videoGrid = hiwSection.grids[1]
if (!videoGrid) throw new Error('Video grid not found')

videoGrid.cells.forEach((cell, i) => {
  const video = cell.contents.find(c => c.type === 'video')
  if (!video) return
  console.log(`Cell ${i + 1}: captionBelow ${video.captionBelow ?? '(unset)'} → true`)
  video.captionBelow = true
})

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('\nDB updated.')
