/**
 * Inspect Before & After section structure for padding conflicts
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

  const beforeAfterSection = sections.find(s => s.label === 'Before & After')

  if (!beforeAfterSection) {
    console.log('Before & After section not found')
    process.exit(1)
  }

  console.log('=== BEFORE & AFTER SECTION FULL STRUCTURE ===\n')
  console.log(JSON.stringify(beforeAfterSection, null, 2))

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
