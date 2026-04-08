/**
 * Strips `font-weight` from inline style attributes on h1/h2/h3 elements
 * in all textBox content items across the Javvy preset (id=1).
 *
 * After this migration, heading weights come from the CSS token system
 * (--fw-h1: 800, --fw-h2: 900, --fw-h3: 600) rather than inline overrides,
 * so future token changes propagate automatically.
 *
 * Dry-run by default — prints a diff without writing.
 * Pass --commit to persist changes to the DB.
 *
 * Usage:
 *   node scripts/fix-textbox-heading-styles.mjs
 *   node scripts/fix-textbox-heading-styles.mjs --commit
 */

import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const commit = process.argv.includes('--commit')

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const data = row.sections
const sections = Array.isArray(data) ? data : data.sections

// Removes font-weight from an inline style string.
// e.g. "font-weight:800;text-align:center" -> "text-align:center"
function stripFontWeight(styleStr) {
  return styleStr
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.toLowerCase().startsWith('font-weight'))
    .join(';')
}

// Strips font-weight from all h1/h2/h3 inline style attributes in an HTML string.
function fixHeadingStyles(html) {
  return html.replace(
    /<(h[123])([^>]*?)>/gi,
    (match, tag, attrs) => {
      const fixed = attrs.replace(
        /\bstyle="([^"]*)"/i,
        (_, styleVal) => {
          const cleaned = stripFontWeight(styleVal)
          // If style is now empty, drop the attribute entirely
          return cleaned ? `style="${cleaned}"` : ''
        }
      )
      return `<${tag}${fixed}>`
    }
  )
}

let totalChanged = 0

for (const section of sections) {
  for (const grid of section.grids ?? []) {
    for (const cell of grid.cells ?? []) {
      for (const content of cell.contents ?? []) {
        if (content.type !== 'textBox' || !content.text) continue

        const original = content.text
        const fixed = fixHeadingStyles(original)

        if (fixed !== original) {
          totalChanged++
          console.log(`\n[Section: ${section.label}]`)
          console.log('  BEFORE:', original.slice(0, 200))
          console.log('  AFTER: ', fixed.slice(0, 200))
          if (commit) {
            content.text = fixed
          }
        }
      }
    }
  }
}

if (totalChanged === 0) {
  console.log('No textBox headings with inline font-weight found. Nothing to change.')
} else {
  console.log(`\n${totalChanged} textBox content item(s) would be updated.`)

  if (commit) {
    const updated = Array.isArray(data) ? sections : { ...data, sections }
    await sql`UPDATE presets SET sections = ${JSON.stringify(updated)}::jsonb WHERE id = 1`
    console.log('Done — changes committed to DB.')
  } else {
    console.log('Dry run — pass --commit to write changes.')
  }
}
