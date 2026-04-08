/**
 * Fix section padding: Set excluded sections back to original values, keep others at "m"
 */

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

// Section-specific padding overrides
const paddingOverrides = {
  'section-javvy-navbar': 'none',              // NavBar
  'section-javvy-banner-section': 's',         // Banner
  'section-hero-1775590718389': 's',           // Hero
  'section-1774824673276': 's'                 // Footer
}

try {
  // Fetch Sales Page Template (id=66)
  const presets = await sql`SELECT * FROM presets WHERE id = 66`

  if (presets.length === 0) {
    console.log('Sales Page Template (id=66) not found')
    process.exit(1)
  }

  const preset = presets[0]
  let sections = preset.sections

  console.log('=== FIXING SECTION PADDING ===\n')

  sections.forEach((section, idx) => {
    const label = section.label || `Section ${idx}`

    if (!section.style) {
      section.style = {}
    }

    if (paddingOverrides[section.id]) {
      section.style.paddingYSize = paddingOverrides[section.id]
      console.log(`  ${idx}. ${label} — set to "${paddingOverrides[section.id]}" (excluded)`)
    } else {
      section.style.paddingYSize = 'm'
      console.log(`  ${idx}. ${label} — keeping "m"`)
    }
  })

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Section padding corrected')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
