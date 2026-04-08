/**
 * Set Hero section with independent top/bottom padding
 * Top: 18px (s) - Bottom: 60px (l)
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

  const heroSection = sections.find(s => s.id === 'section-hero-1775590718389')

  if (!heroSection) {
    console.log('Hero section not found')
    process.exit(1)
  }

  console.log('=== SETTING HERO INDEPENDENT TOP/BOTTOM PADDING ===\n')
  console.log('BEFORE:')
  console.log(JSON.stringify(heroSection.style, null, 2))

  // Remove the paddingYSize since we're using independent overrides
  delete heroSection.style.paddingYSize

  // Set independent top/bottom padding
  heroSection.style.paddingTopOverride = 18    // s top padding (minimal)
  heroSection.style.paddingBottomOverride = 60  // l bottom padding (generous spacing before next section)

  console.log('\nAFTER:')
  console.log(JSON.stringify(heroSection.style, null, 2))

  console.log('\nDesktop padding:')
  console.log(`  Top: 18px (s)`)
  console.log(`  Bottom: 60px (l)`)
  console.log('\nTablet padding (auto-scaled to 75%):')
  console.log(`  Top: ${Math.round(18 * 0.75)}px`)
  console.log(`  Bottom: ${Math.round(60 * 0.75)}px`)
  console.log('\nMobile padding (auto-scaled to 60%):')
  console.log(`  Top: ${Math.round(18 * 0.6)}px`)
  console.log(`  Bottom: ${Math.round(60 * 0.6)}px`)

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Updated Hero section with independent top/bottom padding')
  console.log('✓ This creates better visual rhythm: minimal top, generous bottom spacing')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
