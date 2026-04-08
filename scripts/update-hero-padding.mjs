/**
 * Update Hero section padding to "s" (small)
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

  console.log('Before:', hero.style.paddingYSize)

  // Update padding to "s"
  hero.style.paddingYSize = 's'

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 1
  `

  console.log('After:', hero.style.paddingYSize)
  console.log('\n✓ Updated Hero section padding to "s"')
  console.log('  Desktop: 24px top + 24px bottom = 48px total')
  console.log('  Tablet: 16px top + 16px bottom = 32px total')
  console.log('  Mobile: 12px top + 12px bottom = 24px total')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
