/**
 * Update Hero section heading text
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

  console.log('=== UPDATING HERO HEADING ===\n')

  const heroSection = sections.find(s => s.id === 'section-hero-1775590718389')

  if (!heroSection) {
    console.log('Hero section not found')
    process.exit(1)
  }

  const cells = heroSection.grids?.[0]?.cells || []
  const allContents = cells.flatMap(cell => cell.contents || [])

  // Find the heading textBox
  const headingTextBox = allContents.find(c =>
    c.type === 'textBox' &&
    c.text &&
    (c.text.includes('Save Up To 58%') || c.text.includes('<h1>'))
  )

  if (!headingTextBox) {
    console.log('ERROR: Heading text box not found')
    process.exit(1)
  }

  console.log('BEFORE:')
  console.log(headingTextBox.text)

  // Replace the H1 content while preserving the paragraph
  const newText = headingTextBox.text.replace(
    /<h1>.*?<\/h1>/i,
    '<h1>The Ultimate Iced Coffee for Your Health</h1>'
  )

  headingTextBox.text = newText

  console.log('\nAFTER:')
  console.log(headingTextBox.text)

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 66
  `

  console.log('\n✓ Updated Hero heading text')

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
