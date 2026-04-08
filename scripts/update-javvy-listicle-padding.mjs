import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const sections = row.sections

const listicle = sections.find(s => s.label === 'Listicle')
if (!listicle) throw new Error('Listicle section not found')

console.log('=== BEFORE ===')
for (const [gIdx, grid] of listicle.grids.entries()) {
  for (const cell of grid.cells) {
    const textBoxes = cell.contents.filter(c => c.type === 'textBox')
    const summary = textBoxes.map(c => `textFontSize=${c.textFontSize ?? '(unset)'}`).join(', ')
    console.log(`Grid ${gIdx} | ${cell.id} | paddingX=${cell.style.paddingX ?? '(unset)'} paddingY=${cell.style.paddingY ?? '(unset)'} paddingTop=${cell.style.paddingTop ?? '(unset)'} paddingBottom=${cell.style.paddingBottom ?? '(unset)'} | textBoxes: [${summary}]`)
  }
}

const changes = []

for (const grid of listicle.grids) {
  for (const cell of grid.cells) {
    // Fix 1: remove paddingX: 24
    if (cell.style.paddingX === 24) {
      changes.push(`${cell.id}: paddingX 24 → 0`)
      cell.style.paddingX = 0
    }

    for (const c of cell.contents) {
      if (c.type !== 'textBox') continue
      const isHeading = cell.id.includes('heading') || cell.id.includes('clone') && cell.id.endsWith('-1-0')
      const isBody = cell.id.includes('desc') || (!isHeading && cell.contents.some(ct => ct.type === 'textBox'))

      // Fix 2: heading textBoxes — textFontSize set below 20 → 20
      if (isHeading && c.textFontSize !== undefined && c.textFontSize < 20) {
        changes.push(`${cell.id}: heading textFontSize ${c.textFontSize} → 20`)
        c.textFontSize = 20
      }

      // Fix 3: body textBoxes — textFontSize set below 16 → 16
      if (!isHeading && c.textFontSize !== undefined && c.textFontSize < 16) {
        changes.push(`${cell.id}: body textFontSize ${c.textFontSize} → 16`)
        c.textFontSize = 16
      }
    }
  }
}

if (changes.length === 0) {
  console.log('\nNo changes needed.')
  process.exit(0)
}

console.log('\n=== CHANGES ===')
changes.forEach(c => console.log(' ', c))

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const listicleAfter = after.sections.find(s => s.label === 'Listicle')

console.log('\n=== AFTER ===')
for (const [gIdx, grid] of listicleAfter.grids.entries()) {
  for (const cell of grid.cells) {
    const textBoxes = cell.contents.filter(c => c.type === 'textBox')
    const summary = textBoxes.map(c => `textFontSize=${c.textFontSize ?? '(unset)'}`).join(', ')
    console.log(`Grid ${gIdx} | ${cell.id} | paddingX=${cell.style.paddingX ?? '(unset)'} paddingY=${cell.style.paddingY ?? '(unset)'} paddingTop=${cell.style.paddingTop ?? '(unset)'} paddingBottom=${cell.style.paddingBottom ?? '(unset)'} | textBoxes: [${summary}]`)
  }
}
