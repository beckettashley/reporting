/**
 * 1. Set NavBar section to "none" padding in Sales Page Template
 * 2. Display new padding preset values (25% reduction)
 */

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

try {
  // Fetch Sales Page Template (id=66)
  const presets = await sql`SELECT * FROM presets WHERE id = 66`

  if (presets.length === 0) {
    console.log('Sales Page Template (id=66) not found')
    process.exit(1)
  }

  const preset = presets[0]
  let sections = preset.sections

  // Find NavBar section
  const navbarSection = sections.find(s => s.id === 'section-javvy-navbar')

  if (!navbarSection) {
    console.log('NavBar section not found')
    process.exit(1)
  }

  console.log('=== NAVBAR PADDING UPDATE ===\n')
  console.log('Before:', navbarSection.style.paddingYSize)

  navbarSection.style.paddingYSize = 'none'

  console.log('After:', navbarSection.style.paddingYSize)

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Updated NavBar section to "none" padding in Sales Page Template')

  console.log('\n=== NEW PADDING PRESET VALUES (25% reduction) ===\n')
  console.log('These values will be applied in section-renderer.tsx:\n')

  const newPresets = {
    none: { desktop: 0, tablet: 0, mobile: 0 },
    s: { desktop: 18, tablet: 12, mobile: 9 },
    m: { desktop: 36, tablet: 24, mobile: 18 },
    l: { desktop: 60, tablet: 42, mobile: 30 },
    xl: { desktop: 90, tablet: 60, mobile: 42 },
  }

  Object.entries(newPresets).forEach(([key, values]) => {
    console.log(`${key}:`)
    console.log(`  Desktop: ${values.desktop}px top + ${values.desktop}px bottom = ${values.desktop * 2}px total`)
    console.log(`  Tablet:  ${values.tablet}px top + ${values.tablet}px bottom = ${values.tablet * 2}px total`)
    console.log(`  Mobile:  ${values.mobile}px top + ${values.mobile}px bottom = ${values.mobile * 2}px total`)
    console.log('')
  })

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
