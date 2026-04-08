import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const commit = process.argv.includes('--commit')

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const sections = row.sections

const listicle = sections.find(s => s.label && s.label.toLowerCase().includes('listicle'))
if (!listicle) throw new Error('Listicle section not found')

let totalChanged = 0

for (const grid of listicle.grids ?? []) {
  for (const cell of grid.cells ?? []) {
    for (const content of cell.contents ?? []) {
      if (content.type !== 'video' || !content.captionText) continue
      const original = content.captionText
      const updated = original.replace(/<h4/g, '<h3').replace(/<\/h4>/g, '</h3>')
      if (updated !== original) {
        totalChanged++
        console.log('  BEFORE:', original)
        console.log('  AFTER: ', updated)
        if (commit) content.captionText = updated
      }
    }
  }
}

if (totalChanged === 0) {
  console.log('No h4 captions found in Listicle section.')
} else {
  console.log(`\n${totalChanged} caption(s) would be updated.`)
  if (commit) {
    await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
    console.log('Done — committed.')
  } else {
    console.log('Dry run — pass --commit to write.')
  }
}
