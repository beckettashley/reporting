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

const faqSection = sections.find(s => s.label === 'FAQ')
if (!faqSection) throw new Error('FAQ section not found')

// FAQ grid has 2 cells: left (heading) ~40%, right (accordion) ~60%
// Reduce right by 15 percentage points → right=45%, left=55%
const grid = faqSection.grids[0]
const cells = grid.cells

console.log('BEFORE cell widths:', cells.map(c => `${c.width}%`).join(', '))

cells[0].width = 55  // heading (left)
cells[1].width = 45  // accordion (right)

// Update row if it has widths defined (row structure doesn't store widths, cells do)
console.log('AFTER cell widths:', cells.map(c => `${c.width}%`).join(', '))

const updated = Array.isArray(data) ? sections : { ...data, sections }
await sql`UPDATE presets SET sections = ${JSON.stringify(updated)}::jsonb WHERE id = 1`
console.log('Done.')
