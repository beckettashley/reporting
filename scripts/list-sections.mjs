/**
 * List all sections with their IDs and labels
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

  console.log('=== SALES PAGE TEMPLATE SECTIONS ===\n')
  console.log(`Total: ${sections.length}\n`)

  sections.forEach((section, idx) => {
    console.log(`${idx}. ${section.label || 'NO LABEL'}`)
    console.log(`   ID: ${section.id}`)
    console.log(`   Padding: ${section.style?.paddingYSize || 'none'}`)
    console.log('')
  })

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
