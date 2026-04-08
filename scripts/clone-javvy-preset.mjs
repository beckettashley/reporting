/**
 * Clone Javvy preset to create "Sales Page Template"
 */

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

try {
  // Fetch the Javvy preset (id=1)
  const presets = await sql`SELECT * FROM presets WHERE id = 1`

  if (presets.length === 0) {
    console.log('Javvy preset (id=1) not found')
    process.exit(1)
  }

  const javvyPreset = presets[0]

  console.log('Found Javvy preset:')
  console.log(`  ID: ${javvyPreset.id}`)
  console.log(`  Name: ${javvyPreset.name}`)
  console.log(`  Sections: ${javvyPreset.sections.length}`)

  // Create the cloned preset
  const newPreset = {
    name: 'Sales Page Template',
    sections: JSON.parse(JSON.stringify(javvyPreset.sections)) // Deep clone
  }

  console.log('\nCreating new preset:')
  console.log(`  Name: ${newPreset.name}`)
  console.log(`  Sections: ${newPreset.sections.length} (cloned)`)

  // Insert the new preset
  const result = await sql`
    INSERT INTO presets (name, sections, created_at, updated_at)
    VALUES (
      ${newPreset.name},
      ${JSON.stringify(newPreset.sections)},
      NOW(),
      NOW()
    )
    RETURNING id, name
  `

  console.log('\n✓ Created new preset:')
  console.log(`  ID: ${result[0].id}`)
  console.log(`  Name: ${result[0].name}`)
  console.log('\nOriginal Javvy preset (id=1) remains unchanged.')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
