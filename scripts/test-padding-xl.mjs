/**
 * Temporarily set Before & After padding to XL to test if padding is rendering at all
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

  console.log('=== TESTING WITH XL PADDING ===\n')
  console.log(`Current padding: ${beforeAfterSection.style?.paddingYSize || 'none'}`)

  beforeAfterSection.style.paddingYSize = 'xl'

  console.log(`New padding: xl`)
  console.log(`  Desktop: 90px top + 90px bottom = 180px total`)
  console.log(`  Tablet:  60px top + 60px bottom = 120px total`)
  console.log(`  Mobile:  42px top + 42px bottom = 84px total`)

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Updated to XL padding for testing')
  console.log('⚠️  Check if you can see the padding now (should be very obvious)')
  console.log('⚠️  REMEMBER TO SET BACK TO "m" AFTER TESTING')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
