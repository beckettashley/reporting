import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const data = row.sections
const sections = Array.isArray(data) ? data : data.sections

const benefits = sections.find(s => s.label === 'Benefits')
if (!benefits) throw new Error('Benefits section not found')

// Grab the title from the existing benefitsGrid content
const benefitsGridContent = benefits.grids[0].cells[0].contents.find(c => c.type === 'benefitsGrid')
const title = benefitsGridContent?.benefitsGridTitle ?? ''
console.log('Heading to extract:', title)

// Build the heading grid (same structure as How It Works grid[0])
const now = Date.now()
const cellId = `cell-${now}`
const headingGrid = {
  cells: [{
    id: cellId,
    width: 100,
    style: {
      paddingX: 0,
      paddingY: 0,
      paddingBottom: 8,
      borderWidth: 0,
      borderRadius: 0,
      backgroundColor: '',
    },
    contents: [{
      id: `${cellId}-text`,
      type: 'textBox',
      text: `<h1 style="font-weight:800;text-align:center;color:#1a1a1a">${title}</h1>`,
    }],
  }],
  rows: [{
    id: `row-${now}`,
    cellIds: [cellId],
    style: { backgroundColor: '', paddingY: 0, gap: 0 },
  }],
  gridStyle: {
    gap: 0,
    borderRadius: 0,
    backgroundColor: '',
    gridMaxWidth: 680,
    gridMarginBottom: 24,
  },
}

// Prepend heading grid; clear title from benefitsGrid content
benefits.grids.unshift(headingGrid)
if (benefitsGridContent) {
  delete benefitsGridContent.benefitsGridTitle
}

console.log('Benefits grids after:', benefits.grids.length, 'grids')

const updated = Array.isArray(data) ? sections : { ...data, sections }
await sql`UPDATE presets SET sections = ${JSON.stringify(updated)}::jsonb WHERE id = 1`
console.log('Done.')
