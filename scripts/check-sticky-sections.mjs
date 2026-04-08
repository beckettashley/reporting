/**
 * Check for sticky positioning in sections
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

  console.log('=== STICKY SECTIONS CHECK ===\n')

  sections.forEach((section, idx) => {
    const label = section.label || `Section ${idx}`
    const position = section.style?.position || 'static'
    const padding = section.style?.paddingYSize || 'none'

    console.log(`${idx}. ${label}`)
    console.log(`   Position: ${position}`)
    console.log(`   Padding: ${padding}`)

    if (idx <= 3) {
      console.log(`   Full style:`, JSON.stringify(section.style, null, 2))
    }
    console.log('')
  })

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
