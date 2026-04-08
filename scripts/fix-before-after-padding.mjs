/**
 * Set Before & After section with independent top/bottom padding
 * Top: 90px (xl) - Bottom: 36px (m)
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
  let sections = preset.sections

  const beforeAfterSection = sections.find(s => s.label === 'Before & After')

  if (!beforeAfterSection) {
    console.log('Before & After section not found')
    process.exit(1)
  }

  console.log('=== SETTING INDEPENDENT TOP/BOTTOM PADDING ===\n')
  console.log('BEFORE:')
  console.log(JSON.stringify(beforeAfterSection.style, null, 2))

  // Remove the paddingYSize since we're using independent overrides
  delete beforeAfterSection.style.paddingYSize

  // Set independent top/bottom padding
  beforeAfterSection.style.paddingTopOverride = 90    // xl top padding
  beforeAfterSection.style.paddingBottomOverride = 36  // m bottom padding

  console.log('\nAFTER:')
  console.log(JSON.stringify(beforeAfterSection.style, null, 2))

  console.log('\nDesktop padding:')
  console.log(`  Top: 90px`)
  console.log(`  Bottom: 36px`)
  console.log('\nTablet padding (auto-scaled to 75%):')
  console.log(`  Top: ${Math.round(90 * 0.75)}px`)
  console.log(`  Bottom: ${Math.round(36 * 0.75)}px`)
  console.log('\nMobile padding (auto-scaled to 60%):')
  console.log(`  Top: ${Math.round(90 * 0.6)}px`)
  console.log(`  Bottom: ${Math.round(36 * 0.6)}px`)

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Updated Before & After section with independent top/bottom padding')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
