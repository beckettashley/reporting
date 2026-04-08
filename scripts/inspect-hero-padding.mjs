/**
 * Inspect Hero section padding settings
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

  console.log('=== HERO SECTION PADDING CONFIGURATION ===\n')
  console.log('Section style:')
  console.log('  paddingYSize:', hero.style.paddingYSize || 'not set')
  console.log('  paddingYOverride:', hero.style.paddingYOverride || 'not set')
  console.log('  backgroundColor:', hero.style.backgroundColor || 'not set')
  console.log('  contentWidth:', hero.style.contentWidth || 'not set')

  console.log('\nPadding values per viewport (from section-renderer.tsx):')
  const SECTION_PAD_Y = {
    none: { desktop: 0, tablet: 0, mobile: 0 },
    s: { desktop: 24, tablet: 16, mobile: 12 },
    m: { desktop: 48, tablet: 32, mobile: 24 },
    l: { desktop: 80, tablet: 56, mobile: 40 },
    xl: { desktop: 120, tablet: 80, mobile: 56 },
  }

  const paddingYSize = hero.style.paddingYSize || 'none'
  const values = SECTION_PAD_Y[paddingYSize]

  console.log(`  Current setting: "${paddingYSize}"`)
  console.log(`    Desktop: ${values.desktop}px top + ${values.desktop}px bottom`)
  console.log(`    Tablet: ${values.tablet}px top + ${values.tablet}px bottom`)
  console.log(`    Mobile: ${values.mobile}px top + ${values.mobile}px bottom`)

  console.log('\nGrid padding:')
  const gridStyle = hero.grids[0]?.gridStyle || {}
  console.log('  paddingX:', gridStyle.paddingX || 0)
  console.log('  paddingY:', gridStyle.paddingY || 0)
  console.log('  paddingTop:', gridStyle.paddingTop || 'not set')
  console.log('  paddingBottom:', gridStyle.paddingBottom || 'not set')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
