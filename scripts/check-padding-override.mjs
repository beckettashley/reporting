/**
 * Check for paddingY or paddingYOverride in Before & After section
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

  console.log('=== BEFORE & AFTER PADDING CHECK ===\n')
  console.log('Full section style object:')
  console.log(JSON.stringify(beforeAfterSection.style, null, 2))
  console.log('')

  if (beforeAfterSection.style?.paddingY !== undefined) {
    console.log(`❌ FOUND paddingY OVERRIDE: ${beforeAfterSection.style.paddingY}`)
    console.log('   This will override paddingYSize!')
  }

  if (beforeAfterSection.style?.paddingYOverride !== undefined) {
    console.log(`❌ FOUND paddingYOverride: ${beforeAfterSection.style.paddingYOverride}`)
    console.log('   This will override paddingYSize!')
  }

  if (!beforeAfterSection.style?.paddingY && !beforeAfterSection.style?.paddingYOverride) {
    console.log('✓ No padding overrides found')
    console.log(`  paddingYSize: "${beforeAfterSection.style?.paddingYSize || 'none'}" should work correctly`)
  }

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
