/**
 * Move Product Comparison section to after Benefits section
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

  console.log('=== MOVING PRODUCT COMPARISON SECTION ===\n')

  // Find sections
  const comparisonIndex = sections.findIndex(s => s.id === 'section-javvy-comparison-1775152290704')
  const benefitsIndex = sections.findIndex(s => s.id === 'section-1775321981536')

  if (comparisonIndex === -1) {
    console.log('Product Comparison section not found')
    process.exit(1)
  }

  if (benefitsIndex === -1) {
    console.log('Benefits section not found')
    process.exit(1)
  }

  console.log('Current order:')
  sections.forEach((s, idx) => {
    const label = s.label || `Section ${idx + 1}`
    if (idx === comparisonIndex) console.log(`  ${idx}. ${label} ← Product Comparison (MOVING)`)
    else if (idx === benefitsIndex) console.log(`  ${idx}. ${label} ← Benefits (ANCHOR)`)
    else console.log(`  ${idx}. ${label}`)
  })

  // Remove comparison from current position
  const [comparisonSection] = sections.splice(comparisonIndex, 1)

  // Re-find benefits index (may have shifted if comparison was before it)
  const newBenefitsIndex = sections.findIndex(s => s.id === 'section-1775321981536')

  // Insert comparison after benefits
  sections.splice(newBenefitsIndex + 1, 0, comparisonSection)

  console.log('\nNew order:')
  sections.forEach((s, idx) => {
    const label = s.label || `Section ${idx + 1}`
    if (s.id === 'section-javvy-comparison-1775152290704') console.log(`  ${idx}. ${label} ← Product Comparison (NEW POSITION)`)
    else if (s.id === 'section-1775321981536') console.log(`  ${idx}. ${label} ← Benefits`)
    else console.log(`  ${idx}. ${label}`)
  })

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Moved Product Comparison to after Benefits section')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
