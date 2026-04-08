import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const presets = await sql`SELECT * FROM presets WHERE id = 1`
const sections = presets[0].sections
const hero = sections.find(s => s.id === 'section-hero-1775590718389')

console.log('Hero section found:', hero ? 'YES' : 'NO')
if (hero) {
  console.log('\nGrids:', hero.grids.length)
  hero.grids.forEach((grid, idx) => {
    console.log(`\nGrid ${idx}:`)
    console.log('  gridStyle:', JSON.stringify(grid.gridStyle, null, 2))
  })
}
