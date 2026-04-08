/**
 * Check for grid/cell margins in Before & After section
 */

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

try {
  const presets = await sql`SELECT * FROM presets WHERE id = 66`

  if (presets.length === 0) {
    console.log('Sales Page Template (id=66) not found')
    process.exit(1)
  }

  const preset = presets[0]
  const sections = preset.sections

  const beforeAfterSection = sections.find(s => s.label === 'Before & After')

  if (!beforeAfterSection) {
    console.log('Before & After section not found')
    process.exit(1)
  }

  console.log('=== BEFORE & AFTER GRID MARGINS/PADDING ===\n')

  beforeAfterSection.grids.forEach((grid, idx) => {
    console.log(`Grid ${idx}:`)
    console.log(`  gridMarginBottom: ${grid.gridStyle?.gridMarginBottom ?? 'not set'}`)
    console.log(`  gridStyle.paddingY: ${grid.gridStyle?.paddingY ?? 'not set'}`)
    console.log(`  gridStyle.paddingTop: ${grid.gridStyle?.paddingTop ?? 'not set'}`)
    console.log(`  gridStyle.paddingBottom: ${grid.gridStyle?.paddingBottom ?? 'not set'}`)
    console.log(`  gridStyle.gap: ${grid.gridStyle?.gap ?? 'not set'}`)

    grid.cells.forEach((cell, cellIdx) => {
      console.log(`  Cell ${cellIdx}:`)
      console.log(`    paddingY: ${cell.style?.paddingY ?? 'not set'}`)
      console.log(`    paddingTop: ${cell.style?.paddingTop ?? 'not set'}`)
      console.log(`    paddingBottom: ${cell.style?.paddingBottom ?? 'not set'}`)
    })
    console.log('')
  })

  console.log('\nSection bottom padding (xl): 90px')
  console.log('Total bottom spacing = Section padding + Grid margins + Cell padding')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
