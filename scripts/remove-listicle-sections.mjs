/**
 * Remove listicle sections from Sales Page Template
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

  console.log('=== REMOVING LISTICLE SECTIONS ===\n')
  console.log(`Total sections before: ${sections.length}\n`)

  // Find sections to remove
  const articleHeaderIndex = sections.findIndex(s => s.id === 'section-javvy-article')
  const listicleIndex = sections.findIndex(s => s.id === 'section-listicle-1774912681320')

  if (articleHeaderIndex !== -1) {
    const section = sections[articleHeaderIndex]
    console.log(`Removing Article Header section (index ${articleHeaderIndex}):`)
    console.log(`  ID: ${section.id}`)
    console.log(`  Label: ${section.label || 'NOT SET'}`)
    sections.splice(articleHeaderIndex, 1)
  } else {
    console.log('Article Header section not found')
  }

  // Re-find listicle index after first removal (indices shift)
  const listicleIndexAfter = sections.findIndex(s => s.id === 'section-listicle-1774912681320')

  if (listicleIndexAfter !== -1) {
    const section = sections[listicleIndexAfter]
    console.log(`\nRemoving Listicle section (index ${listicleIndexAfter}):`)
    console.log(`  ID: ${section.id}`)
    console.log(`  Label: ${section.label || 'NOT SET'}`)
    sections.splice(listicleIndexAfter, 1)
  } else {
    console.log('\nListicle section not found')
  }

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log(`\n✓ Updated Sales Page Template`)
  console.log(`Total sections after: ${sections.length}`)
  console.log(`Sections removed: ${preset.sections.length - sections.length}`)

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
