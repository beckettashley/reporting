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

sections.forEach((s, i) => {
  if (s.label === 'Benefits' || s.label === 'Value Proposition') {
    console.log(`\n[${i}] ${s.label}`)
    s.grids.forEach((g, gi) => {
      console.log(`  grid ${gi}: ${g.cells.length} cell(s)`)
      g.cells.forEach((c, ci) => {
        console.log(`    cell ${ci} (w=${c.width}%): ${c.contents.map(x => x.type).join(', ')}`)
      })
    })
  }
})
