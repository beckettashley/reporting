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

// Grid 1 = heading, Grid 2 = 3-col video grid
const videoGrid = hiwSection.grids[1]
if (!videoGrid) throw new Error('Video grid not found')

const stepCaptions = [
  'Fill your cup with <strong>8-16 oz</strong> of water or milk.',
  "Mix in <strong>1-2 scoops</strong> of Javvy's protein coffee.",
  'Top with your favorite <strong>creamer, flavoring, or topping.</strong> Enjoy!',
]

videoGrid.cells.forEach((cell, i) => {
  const video = cell.contents.find(c => c.type === 'video')
  if (!video) return
  console.log(`Cell ${i + 1} BEFORE: badge="${video.videoBadgeText ?? '(none)'}", caption="${video.captionText ?? '(none)'}"`)

  video.videoBadgeText = `Step ${i + 1}`
  video.videoBadgeBackground = '#2a2552'
  video.videoBadgeColor = '#ffffff'
  video.captionText = stepCaptions[i]
  video.captionBgColor = '#ffffff'
  video.captionTextColor = '#1a1a1a'

  console.log(`Cell ${i + 1} AFTER:  badge="${video.videoBadgeText}", caption="${video.captionText}"`)
})

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('\nDB updated.')
