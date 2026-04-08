/**
 * Adjust How It Works gradient to make beige more prevalent
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

  console.log('=== ADJUSTING HOW IT WORKS GRADIENT ===\n')
  console.log('BEFORE:')
  console.log(`  From: ${howItWorksSection.style.backgroundGradientFrom}`)
  console.log(`  Mid: ${howItWorksSection.style.backgroundGradientMid} at ${howItWorksSection.style.backgroundGradientMidStop}%`)
  console.log(`  To: ${howItWorksSection.style.backgroundGradientTo}`)

  // Adjust to make beige more prevalent:
  // Option 1: Extend the mid stop to 70% (beige dominates more of the gradient)
  // Option 2: Change from white to beige (start with beige instead of white)

  // Going with extending the mid stop to make beige more dominant
  howItWorksSection.style.backgroundGradientMidStop = 70

  console.log('\nAFTER:')
  console.log(`  From: ${howItWorksSection.style.backgroundGradientFrom}`)
  console.log(`  Mid: ${howItWorksSection.style.backgroundGradientMid} at ${howItWorksSection.style.backgroundGradientMidStop}%`)
  console.log(`  To: ${howItWorksSection.style.backgroundGradientTo}`)
  console.log('\n  Effect: Beige color now extends to 70% of the gradient before fading to white')

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Updated How It Works gradient - beige is now more prevalent')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
