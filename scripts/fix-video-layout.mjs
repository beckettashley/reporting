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

// 1. How It Works — equal cell widths (33.34 × 3 ≈ 100) so fr units are equal
const hiw = sections.find(s => s.label === 'How It Works')
const hiwVideoGrid = hiw.grids.find(g => g.cells.some(c => c.contents.some(x => x.type === 'video')))
console.log('How It Works video cell widths (before):', hiwVideoGrid.cells.map(c => c.width))
hiwVideoGrid.cells.forEach(c => { c.width = 33.34 })
console.log('How It Works video cell widths (after): ', hiwVideoGrid.cells.map(c => c.width))

// 2. Before & After — match column gap to How It Works (columnGap: 24)
const ba = sections.find(s => s.label === 'Before & After')
ba.grids.forEach(g => {
  console.log(`\nBefore & After grid gap (before): gap=${g.gridStyle.gap}, columnGap=${g.gridStyle.columnGap}`)
  g.gridStyle.columnGap = 24
  console.log(`Before & After grid gap (after):  gap=${g.gridStyle.gap}, columnGap=${g.gridStyle.columnGap}`)
})

const updated = Array.isArray(data) ? sections : { ...data, sections }
await sql`UPDATE presets SET sections = ${JSON.stringify(updated)}::jsonb WHERE id = 1`
console.log('\nDone.')
