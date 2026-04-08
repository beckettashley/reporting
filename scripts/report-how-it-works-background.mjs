/**
 * Report How It Works section background color/gradient settings
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
  const sections = preset.sections

  const howItWorksSection = sections.find(s => s.label === 'How It Works')

  if (!howItWorksSection) {
    console.log('How It Works section not found')
    process.exit(1)
  }

  console.log('=== HOW IT WORKS SECTION BACKGROUND ===\n')

  const style = howItWorksSection.style

  console.log('Background Color:', style.backgroundColor || '(empty/transparent)')
  console.log('\nGradient Settings:')
  console.log('  Type:', style.backgroundGradientType || 'not set')
  console.log('  From (start):', style.backgroundGradientFrom || 'not set')
  console.log('  Mid (middle):', style.backgroundGradientMid || 'not set')
  console.log('  To (end):', style.backgroundGradientTo || 'not set')
  console.log('  Mid Stop:', style.backgroundGradientMidStop ? `${style.backgroundGradientMidStop}%` : 'not set')
  console.log('  Direction:', style.backgroundGradientDirection || 'not set')

  console.log('\n=== FULL STYLE OBJECT ===')
  console.log(JSON.stringify(style, null, 2))

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
