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

const beforeAfter = sections.find(s => s.label === 'Before & After')
if (!beforeAfter) throw new Error('Before & After section not found')

console.log('Before & After grids before:', beforeAfter.grids.length)

const now = Date.now()
const cellId = `cell-${now}`

// Ticker grid — full-width flood cell (no padding) so the strip runs edge-to-edge
const tickerGrid = {
  cells: [{
    id: cellId,
    width: 100,
    style: {
      paddingX: 0,
      paddingY: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderWidth: 0,
      borderRadius: 0,
      backgroundColor: '',
    },
    contents: [{
      id: `${cellId}-ticker`,
      type: 'ticker',
      tickerItems: ['No Added Sugar', 'Real Coffee', 'Clean Label', 'Waistline-Friendly'],
      tickerSpeed: 18,
      tickerSeparator: '·',
      tickerFontSize: 15,
      tickerFontWeight: 600,
      tickerPaddingY: 14,
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
    gridMaxWidth: null,
    gridMarginBottom: 0,
  },
}

// Insert after grid[0] (heading) and before grid[1] (videos)
beforeAfter.grids.splice(1, 0, tickerGrid)

console.log('Before & After grids after:', beforeAfter.grids.length)

const updated = Array.isArray(data) ? sections : { ...data, sections }
await sql`UPDATE presets SET sections = ${JSON.stringify(updated)}::jsonb WHERE id = 1`
console.log('Done.')
