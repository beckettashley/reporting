/**
 * Set How It Works section with 4-stop gradient: white → beige → beige → white
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
  let sections = preset.sections

  const howItWorksSection = sections.find(s => s.label === 'How It Works')

  if (!howItWorksSection) {
    console.log('How It Works section not found')
    process.exit(1)
  }

  console.log('=== SETTING 4-STOP GRADIENT ===\n')
  console.log('BEFORE:')
  console.log(JSON.stringify(howItWorksSection.style, null, 2))

  // Remove old gradient properties
  delete howItWorksSection.style.backgroundGradientFrom
  delete howItWorksSection.style.backgroundGradientMid
  delete howItWorksSection.style.backgroundGradientMidStop
  delete howItWorksSection.style.backgroundGradientTo

  // Set 4-stop gradient: white → beige → beige → white
  howItWorksSection.style.backgroundGradientStops = [
    { color: '#ffffff', position: 0 },    // white at edges
    { color: '#FCF3DF', position: 30 },   // beige starts
    { color: '#FCF3DF', position: 70 },   // beige extends
    { color: '#ffffff', position: 100 }   // white at far edges
  ]
  howItWorksSection.style.backgroundGradientType = 'radial'
  howItWorksSection.style.backgroundGradientDirection = '50% 50% at 50% 50%'

  console.log('\nAFTER:')
  console.log(JSON.stringify(howItWorksSection.style, null, 2))

  console.log('\nGradient visualization:')
  console.log('  Center (0%):   white (#ffffff)')
  console.log('  30%:           beige (#FCF3DF)')
  console.log('  70%:           beige (#FCF3DF)')
  console.log('  Edges (100%):  white (#ffffff)')
  console.log('\n  Effect: Strong beige center extending 40% of the radius, white only at edges')

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Updated How It Works section with 4-stop radial gradient')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
