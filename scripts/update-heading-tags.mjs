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

const updateText = (content, fn) => {
  if (content.type === 'textBox' && content.text) {
    const before = content.text
    content.text = fn(content.text)
    if (content.text !== before) return true
  }
  return false
}

// h2 → h1 for standalone section headings
const h2ToH1 = text => text
  .replace(/<h2(\b[^>]*)>/g, '<h1$1>')
  .replace(/<\/h2>/g, '</h1>')

// Add class="text-title" to the article header h1
const addTitleClass = text => text
  .replace(/<h1(?!\s*class)([^>]*)>/g, '<h1 class="text-title"$1>')

const sectionOps = {
  'Article Header':      { gridIdx: 0, fn: addTitleClass },
  'Product Comparison':  { gridIdx: 0, fn: h2ToH1 },
  'How It Works':        { gridIdx: 0, fn: h2ToH1 },
  'FAQ':                 { gridIdx: 0, fn: h2ToH1 },
  'Final CTA':           { gridIdx: 0, fn: h2ToH1 },
}

sections.forEach(section => {
  const op = sectionOps[section.label]
  if (!op) return
  const grid = section.grids[op.gridIdx]
  if (!grid) return
  grid.cells.forEach(cell => {
    cell.contents.forEach(content => {
      const changed = updateText(content, op.fn)
      if (changed) console.log(`[${section.label}] grid[${op.gridIdx}] updated`)
    })
  })
})

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('\nDB updated.')
