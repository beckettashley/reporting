import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const rows = await sql`SELECT id, name, sections FROM presets ORDER BY id`

for (const row of rows) {
  const sections = row.sections
  let changed = false

  for (const section of sections) {
    for (const grid of section.grids ?? []) {
      for (const cell of grid.cells ?? []) {
        for (const content of cell.contents ?? []) {
          if (content.type === 'video' && content.captionText) {
            const updated = content.captionText
              .replace(/<h3/g, '<h4')
              .replace(/<\/h3>/g, '</h4>')
            if (updated !== content.captionText) {
              console.log(`  Updated caption in preset "${row.name}": ${content.captionText.slice(0, 60)}`)
              content.captionText = updated
              changed = true
            }
          }
        }
      }
    }
  }

  if (changed) {
    await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = ${row.id}`
    console.log(`Saved preset "${row.name}" (id=${row.id})`)
  } else {
    console.log(`No changes for preset "${row.name}" (id=${row.id})`)
  }
}

console.log('Done.')
