/**
 * Audit all sections and update paddingYSize to "s"
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

  console.log('=== SECTION PADDING AUDIT ===\n')

  const SECTION_PAD_Y = {
    none: { desktop: 0, tablet: 0, mobile: 0 },
    s: { desktop: 24, tablet: 16, mobile: 12 },
    m: { desktop: 48, tablet: 32, mobile: 24 },
    l: { desktop: 80, tablet: 56, mobile: 40 },
    xl: { desktop: 120, tablet: 80, mobile: 56 },
  }

  let updated = 0

  sections.forEach((section, idx) => {
    const currentPadding = section.style.paddingYSize || 'none'
    const label = section.label || `Section ${idx + 1}`
    const hasOverride = section.style.paddingYOverride !== undefined

    console.log(`${idx}. ${label}`)
    console.log(`   ID: ${section.id}`)
    console.log(`   Current: paddingYSize="${currentPadding}"`)

    if (hasOverride) {
      console.log(`   Override: paddingYOverride=${section.style.paddingYOverride}px`)
      console.log(`   → SKIPPING (has override)`)
    } else {
      const values = SECTION_PAD_Y[currentPadding]
      console.log(`   Desktop: ${values.desktop}px top + ${values.desktop}px bottom`)

      if (currentPadding !== 's') {
        section.style.paddingYSize = 's'
        updated++
        console.log(`   ✓ UPDATED to "s" (24px top/bottom desktop)`)
      } else {
        console.log(`   → Already "s"`)
      }
    }
    console.log('')
  })

  if (updated > 0) {
    // Update the database
    await sql`
      UPDATE presets
      SET sections = ${JSON.stringify(sections)}
      WHERE id = 1
    `
    console.log(`\n✓ Updated ${updated} section(s) to paddingYSize="s"`)
  } else {
    console.log('\n✓ All sections already using "s" or have overrides')
  }

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
