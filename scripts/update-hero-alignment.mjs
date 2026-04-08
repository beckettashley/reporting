/**
 * Update Hero section grid alignment to top (start)
 */

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

try {
  // Fetch preset ID 1
  const presets = await sql`SELECT * FROM presets WHERE id = 1`

  if (presets.length === 0) {
    console.log('No preset found with id=1')
    process.exit(1)
  }

  const preset = presets[0]
  let sections = preset.sections

  // Find Hero section
  const heroIndex = sections.findIndex(s => s.id === 'section-hero-1775590718389')

  if (heroIndex === -1) {
    console.log('Hero section not found')
    process.exit(1)
  }

  const hero = sections[heroIndex]

  console.log('Current Hero grid alignItems:', hero.grids[0]?.gridStyle?.alignItems)

  // Update grid alignment to "start" (top)
  if (hero.grids[0]) {
    if (!hero.grids[0].gridStyle) {
      hero.grids[0].gridStyle = {}
    }
    hero.grids[0].gridStyle.alignItems = 'start'
  }

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 1
  `

  console.log('\n✓ Updated Hero section grid alignment to "start" (top)')
  console.log('  Grid alignItems:', hero.grids[0].gridStyle.alignItems)

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
