/**
 * Audit all CTA buttons in Sales Page Template
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
  const sections = preset.sections

  console.log('=== CTA BUTTON AUDIT - Sales Page Template ===\n')

  let ctaCount = 0

  sections.forEach((section, sectionIdx) => {
    const sectionLabel = section.label || `Section ${sectionIdx + 1}`

    section.grids.forEach((grid, gridIdx) => {
      grid.cells.forEach((cell, cellIdx) => {
        cell.contents.forEach((content, contentIdx) => {
          if (content.type === 'ctaButton' || content.type === 'stickyBottomCta') {
            ctaCount++

            console.log(`${ctaCount}. ${sectionLabel} (Section ${sectionIdx})`)
            console.log(`   Type: ${content.type}`)
            console.log(`   Text: "${content.ctaText || 'NOT SET'}"`)
            console.log(`   URL: ${content.ctaUrl || 'NOT SET'}`)
            console.log(`   Variant: ${content.ctaVariant || 'NOT SET'}`)
            console.log(`   Background: ${content.ctaBackgroundColor || 'NOT SET'}`)
            console.log(`   Text Color: ${content.ctaTextColor || 'NOT SET'}`)
            console.log(`   Border Radius: ${content.ctaBorderRadius ?? 'NOT SET'}px`)
            console.log(`   Font Size: ${content.ctaFontSize ?? 'NOT SET'}px`)
            console.log(`   Font Weight: ${content.ctaFontWeight ?? 'NOT SET'}`)
            console.log(`   Padding Y: ${content.ctaPaddingY ?? 'NOT SET'}px`)
            console.log(`   Letter Spacing: ${content.ctaLetterSpacing || 'NOT SET'}`)

            if (content.ctaGradientFrom || content.ctaGradientTo) {
              console.log(`   Gradient: ${content.ctaGradientFrom} → ${content.ctaGradientTo}`)
              console.log(`   Gradient Direction: ${content.ctaGradientDirection || 'NOT SET'}`)
            }

            if (content.ctaDropShadow) {
              console.log(`   Drop Shadow: YES`)
              console.log(`     Color: ${content.ctaDropShadowColor || 'NOT SET'}`)
              console.log(`     Y Offset: ${content.ctaDropShadowY ?? 'NOT SET'}px`)
              console.log(`     Blur: ${content.ctaDropShadowBlur ?? 'NOT SET'}px`)
            }

            if (content.ctaBorderWidth) {
              console.log(`   Border: ${content.ctaBorderWidth}px ${content.ctaBorderStyle || 'solid'} ${content.ctaBorderColor || 'transparent'}`)
            }

            console.log(`   Location: Section ${sectionIdx} → Grid ${gridIdx} → Cell ${cellIdx} → Content ${contentIdx}`)
            console.log('')
          }
        })
      })
    })
  })

  console.log(`\n✓ Found ${ctaCount} CTA button(s) in Sales Page Template`)

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
