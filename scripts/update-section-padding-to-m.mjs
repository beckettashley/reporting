/**
 * Update all sections to "M" padding except NavBar, Banner, Hero, and Footer
 */

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

// Sections to exclude from padding update
const excludedSectionIds = [
  'section-navbar-1775321981535',           // NavBar
  'section-banner-1775321981534',           // Banner
  'section-1775152290702',                  // Hero
  'section-footer-1775321981537'            // Footer
]

try {
  // Fetch Sales Page Template (id=66)
  const presets = await sql`SELECT * FROM presets WHERE id = 66`

  if (presets.length === 0) {
    console.log('Sales Page Template (id=66) not found')
    process.exit(1)
  }

  const preset = presets[0]
  let sections = preset.sections

  console.log('=== UPDATING SECTION PADDING TO "M" ===\n')
  console.log(`Total sections: ${sections.length}\n`)

  let updatedCount = 0
  let excludedCount = 0

  sections.forEach((section, idx) => {
    const label = section.label || `Section ${idx + 1}`
    const currentPadding = section.style?.paddingYSize || 'none'

    if (excludedSectionIds.includes(section.id)) {
      console.log(`  ${idx}. ${label} — EXCLUDED (keeping "${currentPadding}")`)
      excludedCount++
    } else {
      if (!section.style) {
        section.style = {}
      }
      section.style.paddingYSize = 'm'
      console.log(`  ${idx}. ${label} — updated from "${currentPadding}" to "m"`)
      updatedCount++
    }
  })

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n=== UPDATE COMPLETE ===')
  console.log(`✓ Updated ${updatedCount} sections to "m" padding`)
  console.log(`✓ Excluded ${excludedCount} sections (NavBar, Banner, Hero, Footer)`)

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
