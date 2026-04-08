/**
 * Inspect Hero section structure
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

  const heroSection = sections.find(s => s.id === 'section-hero-1775590718389')

  if (!heroSection) {
    console.log('Hero section not found')
    process.exit(1)
  }

  console.log('=== HERO SECTION STRUCTURE ===\n')
  console.log(JSON.stringify(heroSection, null, 2))

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
