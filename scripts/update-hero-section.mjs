/**
 * Update Hero section: Add CTA guarantee badge + update text content
 */

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

// SVG shield icon as data URL
const shieldIconDataURL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTI1IDMuMTI1TDYuMjUgMTAuNDE3VjIzLjk1OEM2LjI1IDM0LjM3NSAxMi41IDQzLjc1IDI1IDQ2Ljg3NUMzNy41IDQzLjc1IDQzLjc1IDM0LjM3NSA0My43NSAyMy45NThWMTAuNDE3TDI1IDMuMTI1Wk0yMi41NjI1IDMwLjczOTZMMTUuMTA0MiAyMy4yODEyTDEyLjUgMjUuODk1OEwyMi41NjI1IDM1Ljk1ODNMMzcuNSAyMS4wMjA4TDM0Ljg5NTggMTguNDE2N0wyMi41NjI1IDMwLjczOTZaIiBmaWxsPSIjMDBCQTg4Ii8+PC9zdmc+'

try {
  // Fetch Sales Page Template (id=66)
  const presets = await sql`SELECT * FROM presets WHERE id = 66`

  if (presets.length === 0) {
    console.log('Sales Page Template (id=66) not found')
    process.exit(1)
  }

  const preset = presets[0]
  let sections = preset.sections

  console.log('=== UPDATING HERO SECTION ===\n')

  // Find Hero section
  const heroSection = sections.find(s => s.id === 'section-hero-1775590718389')

  if (!heroSection) {
    console.log('Hero section not found')
    process.exit(1)
  }

  console.log(`Found Hero section: ${heroSection.label || heroSection.id}`)

  // Navigate the grids structure
  const cells = heroSection.grids?.[0]?.cells || []
  const allContents = cells.flatMap(cell => cell.contents || [])

  // 1. Add guarantee badge to CTA button
  const ctaButton = allContents.find(c => c.type === 'ctaButton')
  let ctaUpdated = false

  if (ctaButton) {
    console.log('\n✓ Found CTA button, adding guarantee badge')

    ctaButton.ctaGuarantees = [
      {
        iconUrl: shieldIconDataURL,
        text: "Try it risk-free for 30 days. If you're not totally in love with the product, we will refund you 100%.",
        iconSize: 32
      }
    ]
    ctaButton.ctaGuaranteesFontSize = 13
    ctaButton.ctaGuaranteesGap = 12

    ctaUpdated = true
  } else {
    console.log('ERROR: CTA button not found in Hero section')
    process.exit(1)
  }

  // 2. Update text content
  const textBox = allContents.find(c => c.type === 'textBox' && c.text)
  let textUpdated = false

  if (textBox && textBox.text) {
    if (textBox.text.includes("With Today's Subscribe") || textBox.text.includes("With Toay's Subscribe")) {
      console.log('\n✓ Found target text, updating content')

      const newText = "Experience ultimate convenience with our indulgent, premium iced Protein Coffee. Perfect for customizing your favorite iced coffee and helping you meet your protein goals!"

      // Replace the paragraph while preserving HTML structure
      textBox.text = textBox.text.replace(
        /<p[^>]*>.*?With (?:Today's|Toay's) Subscribe[^<]*<\/p>/i,
        `<p>${newText}</p>`
      )

      textUpdated = true
    }
  }

  if (!textUpdated) {
    console.log('WARNING: Target text "With Today\'s Subscribe & Save Offer" not found')
  }

  // 3. Update iconGrid label size by 2pt and set to medium weight
  const iconGrid = allContents.find(c => c.type === 'iconGrid')
  let iconGridUpdated = false

  if (iconGrid) {
    console.log('\n✓ Found icon grid (bullets), updating font size and weight')

    // Increase font size by 2pt (current is 14px, so new would be 16px)
    const currentSize = iconGrid.iconGridLabelSize || 14
    iconGrid.iconGridLabelSize = currentSize + 2

    // Set to medium weight (500) - already set, but ensure it's 500
    iconGrid.iconGridLabelWeight = 500

    console.log(`  Font size: ${currentSize}px → ${currentSize + 2}px`)
    console.log(`  Font weight: ${iconGrid.iconGridLabelWeight} (medium)`)

    iconGridUpdated = true
  }

  if (!iconGridUpdated) {
    console.log('WARNING: Icon grid not found in Hero section')
  }

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n=== UPDATE COMPLETE ===')
  if (ctaUpdated) console.log('✓ Added guarantee badge to Hero CTA button')
  if (textUpdated) console.log('✓ Updated Hero section text content')
  if (iconGridUpdated) console.log('✓ Updated icon grid font size and weight')
  console.log('\nSales Page Template has been updated.')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
