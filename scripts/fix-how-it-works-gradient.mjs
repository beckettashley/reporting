/**
 * Fix How It Works section - clean gradient (white → beige → white)
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

  console.log('=== FIXING HOW IT WORKS SECTION GRADIENT ===\n')

  // Find How It Works section
  const howItWorksSection = sections.find(s => s.label === 'How It Works')

  if (!howItWorksSection) {
    console.log('How It Works section not found')
    process.exit(1)
  }

  console.log('BEFORE:')
  console.log(JSON.stringify(howItWorksSection.style, null, 2))

  // Clean up and set only correct properties
  const beige = '#faf8f5'  // Original beige color

  howItWorksSection.style = {
    contentWidth: howItWorksSection.style?.contentWidth || 'contained',
    paddingYSize: howItWorksSection.style?.paddingYSize || 'm',
    backgroundColor: '',  // Clear solid color
    backgroundGradientType: 'radial',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientMid: beige,
    backgroundGradientTo: '#ffffff',
    backgroundGradientMidStop: 50,
    backgroundGradientDirection: '50% 50% at 50% 50%'
  }

  console.log('\nAFTER:')
  console.log(JSON.stringify(howItWorksSection.style, null, 2))

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Fixed How It Works section gradient')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
