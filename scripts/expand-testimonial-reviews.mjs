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
          if (content.type === 'testimonial' && content.testimonialReviews?.length > 0) {
            const originalCount = content.testimonialReviews.length
            console.log(`Found testimonial with ${originalCount} written reviews in preset: ${row.name}`)

            // Clone existing reviews x3
            const review1Set = content.testimonialReviews.map(r => ({ ...r, id: `${r.id}-clone1` }))
            const review2Set = content.testimonialReviews.map(r => ({ ...r, id: `${r.id}-clone2` }))

            content.testimonialReviews.push(...review1Set, ...review2Set)

            // Add an image to the first review to demo optional images
            if (content.testimonialReviews[0]) {
              content.testimonialReviews[0].imageUrl = "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&auto=format&fit=crop&q=80"
            }

            console.log(`Cloned reviews x3. New count: ${content.testimonialReviews.length}`)
            console.log(`Added demo image to first review`)
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
