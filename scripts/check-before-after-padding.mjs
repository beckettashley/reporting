/**
 * Check Before & After section padding
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

  console.log('=== BEFORE & AFTER SECTION PADDING ===\n')
  console.log(`paddingYSize: "${beforeAfterSection.style?.paddingYSize || 'none'}"\n`)

  // Show what this translates to in pixels
  const SECTION_PAD_Y = {
    none: { desktop: 0, tablet: 0, mobile: 0 },
    s: { desktop: 18, tablet: 12, mobile: 9 },
    m: { desktop: 36, tablet: 24, mobile: 18 },
    l: { desktop: 60, tablet: 42, mobile: 30 },
    xl: { desktop: 90, tablet: 60, mobile: 42 },
  }

  const paddingSize = beforeAfterSection.style?.paddingYSize || 'none'
  const padding = SECTION_PAD_Y[paddingSize]

  console.log('Actual padding values:')
  console.log(`  Desktop: ${padding.desktop}px top + ${padding.desktop}px bottom = ${padding.desktop * 2}px total`)
  console.log(`  Tablet:  ${padding.tablet}px top + ${padding.tablet}px bottom = ${padding.tablet * 2}px total`)
  console.log(`  Mobile:  ${padding.mobile}px top + ${padding.mobile}px bottom = ${padding.mobile * 2}px total`)

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
