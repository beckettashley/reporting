import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map((v, i) => i === 0 ? v.trim() : l.slice(l.indexOf('=') + 1).trim()))
)

const sql = neon(env.DATABASE_URL)

// Fetch all presets
const rows = await sql`SELECT id, name, sections FROM presets ORDER BY id`

for (const row of rows) {
  const sections = typeof row.sections === 'string' ? JSON.parse(row.sections) : row.sections
  let modified = false

  sections?.forEach((section) => {
    section.grids.forEach((grid) => {
      grid.cells.forEach((cell) => {
        cell.contents.forEach((content) => {
          if (content.type === 'testimonial' && content.testimonialVideos?.length >= 4) {
            console.log(`Found testimonial with ${content.testimonialVideos.length} videos in preset: ${row.name}`)

            // Duplicate first 4 videos (push them to the end)
            const video1 = { ...content.testimonialVideos[0] }
            const video2 = { ...content.testimonialVideos[1] }
            const video3 = { ...content.testimonialVideos[2] }
            const video4 = { ...content.testimonialVideos[3] }
            content.testimonialVideos.push(video1, video2, video3, video4)

            console.log(`Added 4 duplicate videos. New count: ${content.testimonialVideos.length}`)
            modified = true
          }
        })
      })
    })
  })

  if (modified) {
    await sql`UPDATE presets SET sections = ${JSON.stringify(sections)} WHERE id = ${row.id}`
    console.log(`✓ Updated preset: ${row.name}`)
  }
}

console.log('\n✓ Done')
