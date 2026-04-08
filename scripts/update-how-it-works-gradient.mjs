/**
 * Update How It Works section background to radial gradient (similar to Benefits)
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

  console.log('=== UPDATING HOW IT WORKS SECTION GRADIENT ===\n')

  // Find Benefits section to check gradient settings
  const benefitsSection = sections.find(s => s.label === 'Benefits')

  if (benefitsSection) {
    console.log('Benefits section background settings:')
    console.log(JSON.stringify(benefitsSection.style, null, 2))
    console.log('')
  }

  // Find How It Works section
  const howItWorksSection = sections.find(s => s.label === 'How It Works')

  if (!howItWorksSection) {
    console.log('How It Works section not found')
    process.exit(1)
  }

  console.log('How It Works section - BEFORE:')
  console.log(JSON.stringify(howItWorksSection.style, null, 2))

  // Update to radial gradient (white → beige → white)
  const existingBeige = howItWorksSection.style?.backgroundColor || '#faf8f5'

  if (!howItWorksSection.style) {
    howItWorksSection.style = {}
  }

  // Use same property names as Benefits section
  howItWorksSection.style.backgroundColor = ''  // Clear solid color
  howItWorksSection.style.backgroundGradientType = 'radial'
  howItWorksSection.style.backgroundGradientFrom = '#ffffff'  // white
  howItWorksSection.style.backgroundGradientMid = existingBeige  // existing beige color
  howItWorksSection.style.backgroundGradientTo = '#ffffff'  // white
  howItWorksSection.style.backgroundGradientMidStop = 50
  howItWorksSection.style.backgroundGradientDirection = '50% 50% at 50% 50%'

  console.log('\nHow It Works section - AFTER:')
  console.log(JSON.stringify(howItWorksSection.style, null, 2))

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Updated How It Works section to radial gradient background')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
