/**
 * Fix Hero section cell-level alignment to top
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
  const cells = hero.grids[0]?.cells || []

  console.log('Current Hero cells:')
  cells.forEach((cell, idx) => {
    console.log(`  Cell ${idx}: alignItems = ${cell.style?.alignItems || 'not set'}`)
  })

  // Remove alignItems from both cells (or set to 'start')
  cells.forEach((cell, idx) => {
    if (!cell.style) {
      cell.style = {}
    }
    // Remove alignItems entirely so it inherits from grid
    delete cell.style.alignItems
    console.log(`  Updated Cell ${idx}: removed alignItems`)
  })

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 1
  `

  console.log('\n✓ Updated Hero section cells - removed alignItems to use grid-level alignment')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
