/**
 * Fix Hero section grid gap
 * Remove explicit columnGap if it's set to 0, let it inherit from gap
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

  console.log('Current Hero gridStyle:')
  hero.grids.forEach((grid, idx) => {
    console.log(`Grid ${idx}:`, JSON.stringify(grid.gridStyle, null, 2))
  })

  // Fix: Remove columnGap if it's 0, or set it to match gap
  let updated = false
  hero.grids.forEach((grid, idx) => {
    if (grid.gridStyle) {
      if (grid.gridStyle.columnGap === 0 || grid.gridStyle.columnGap === null) {
        console.log(`\nRemoving columnGap: ${grid.gridStyle.columnGap} from grid ${idx}`)
        delete grid.gridStyle.columnGap
        updated = true
      }

      // Also ensure gap is set
      if (!grid.gridStyle.gap) {
        console.log(`\nSetting gap to 48 for grid ${idx}`)
        grid.gridStyle.gap = 48
        updated = true
      }
    }
  })

  if (updated) {
    // Update the database
    await sql`
      UPDATE presets
      SET sections = ${JSON.stringify(sections)}
      WHERE id = 1
    `
    console.log('\n✓ Updated Hero section gap configuration')

    console.log('\nNew Hero gridStyle:')
    hero.grids.forEach((grid, idx) => {
      console.log(`Grid ${idx}:`, JSON.stringify(grid.gridStyle, null, 2))
    })
  } else {
    console.log('\nNo changes needed')
  }

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
