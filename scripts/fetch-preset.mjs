import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map((v, i) => i === 0 ? v.trim() : l.slice(l.indexOf('=') + 1).trim()))
)

const sql = neon(env.DATABASE_URL)
const rows = await sql`SELECT id, name, sections FROM presets ORDER BY id`
for (const row of rows) {
  console.log(`\n=== ${row.id}: ${row.name} ===`)
  const sections = typeof row.sections === 'string' ? JSON.parse(row.sections) : row.sections
  sections?.forEach((s, si) => {
    console.log(`  Section ${si}: label="${s.label}" grids=${s.grids.length}`)
    s.grids.forEach((g, gi) => {
      console.log(`    Grid ${gi}: ${g.cells.length} cells`)
      g.cells.forEach((c, ci) => {
        const content = c.contents?.[0]
        const preview = content?.type === 'textBox' ? (content.text || '').replace(/<[^>]+>/g, '').slice(0, 60)
          : content?.type || '(empty)'
        console.log(`      Cell ${ci}: width=${c.width} rowSpan=${c.rowSpan} mobileOrder=${c.mobileOrder} | ${preview}`)
      })
    })
  })
}
