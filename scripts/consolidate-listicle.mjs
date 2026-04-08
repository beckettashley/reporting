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

// Sections 3, 4, 5 are the 3 listicle items — each has one grid
// Merge into one section with 3 grids
const listicleSection = {
  id: `section-listicle-${Date.now()}`,
  label: "Listicle",
  style: {
    contentWidth: "narrow",
    paddingYSize: "s",   // outer breathing room (top of item 1, bottom of item 3)
    gridGap: 48,         // spacing between the 3 grids; tablet=36px, mobile=29px
    backgroundColor: "",
  },
  grids: [
    sections[3].grids[0],
    sections[4].grids[0],
    sections[5].grids[0],
  ],
}

const newSections = [
  sections[0], // Banner
  sections[1], // Article Header
  sections[2], // Comparison
  listicleSection,
  sections[6], // Footer
]

await sql`UPDATE presets SET sections = ${JSON.stringify(newSections)}::jsonb WHERE id = 1`
console.log('Done:', newSections.map((s, i) => `${i}: ${s.label}`).join(', '))
console.log(`Listicle section: ${listicleSection.grids.length} grids, gridGap=48px`)
