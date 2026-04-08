/**
 * Set How It Works to 100% opacity beige #FCF3DF
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

  console.log('=== SETTING BEIGE COLOR TO #FCF3DF ===\n')
  console.log('BEFORE:')
  console.log(`  Mid color: ${howItWorksSection.style.backgroundGradientMid}`)

  // Update to the new beige color
  howItWorksSection.style.backgroundGradientMid = '#FCF3DF'

  console.log('\nAFTER:')
  console.log(`  Mid color: ${howItWorksSection.style.backgroundGradientMid}`)
  console.log('\n  This is a more vibrant, warmer beige that should be much more visible')

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Updated How It Works gradient with new beige color #FCF3DF')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
