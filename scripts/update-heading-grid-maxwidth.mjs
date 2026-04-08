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

// A "heading grid" is one where every cell is 100% wide and contains only textBox content.
const isHeadingGrid = (grid) =>
  grid.cells.length >= 1 &&
  grid.cells.every(cell =>
    (cell.width ?? 100) === 100 &&
    cell.contents.length >= 1 &&
    cell.contents.every(c => c.type === 'textBox')
  )

let updated = 0
sections.forEach(section => {
  section.grids.forEach(grid => {
    if (isHeadingGrid(grid)) {
      const before = grid.gridStyle.gridMaxWidth ?? '(unset)'
      grid.gridStyle.gridMaxWidth = 680
      console.log(`[${section.label}] heading grid → gridMaxWidth: ${before} → 680`)
      updated++
    }
  })
})

if (updated === 0) {
  console.log('No heading grids found.')
  process.exit(0)
}

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log(`\nUpdated ${updated} heading grid(s). DB saved.`)
