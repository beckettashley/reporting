/**
 * Add temporary debug background to Before & After section to verify padding
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

  const beforeAfterSection = sections.find(s => s.label === 'Before & After')

  if (!beforeAfterSection) {
    console.log('Before & After section not found')
    process.exit(1)
  }

  console.log('=== ADDING DEBUG BACKGROUND ===\n')
  console.log('BEFORE:')
  console.log(JSON.stringify(beforeAfterSection.style, null, 2))

  // Temporarily replace gradient with solid high-contrast color
  beforeAfterSection.style.backgroundColor = '#FF0000'  // Bright red
  beforeAfterSection.style.backgroundGradientType = undefined
  beforeAfterSection.style.backgroundGradientFrom = undefined
  beforeAfterSection.style.backgroundGradientMid = undefined
  beforeAfterSection.style.backgroundGradientTo = undefined
  beforeAfterSection.style.backgroundGradientMidStop = undefined
  beforeAfterSection.style.backgroundGradientDirection = undefined

  console.log('\nAFTER (DEBUG MODE - RED BACKGROUND):')
  console.log(JSON.stringify(beforeAfterSection.style, null, 2))

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Added debug background - check if you can see red padding at top/bottom')
  console.log('⚠️  REMEMBER TO REMOVE THIS DEBUG BACKGROUND AFTER TESTING')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
