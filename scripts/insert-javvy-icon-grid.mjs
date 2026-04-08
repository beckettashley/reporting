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

console.log('BEFORE sections:')
sections.forEach((s, i) => console.log(`  ${i}: ${s.label}`))

const comparisonIdx = sections.findIndex(s => s.label === 'Product Comparison')
if (comparisonIdx === -1) throw new Error('Product Comparison section not found')

const now = Date.now()
const cellId = `cell-${now}`
const rowId = `row-${now}`

const iconGridSection = {
  id: `section-${now}`,
  label: 'Icon Grid',
  style: {
    backgroundColor: '#ffffff',
    paddingYSize: 'm',
    contentWidth: 'contained',
  },
  grids: [{
    cells: [{
      id: cellId,
      width: 100,
      style: {
        backgroundColor: '',
        borderColor: '',
        borderWidth: 0,
        borderRadius: 0,
        borderStyle: 'solid',
        paddingX: 0,
        paddingY: 0,
        alignItems: 'center',
      },
      contents: [{
        id: `content-${now}`,
        type: 'iconGrid',
        iconGridColumns: 4,
        iconGridColumnsMobile: 2,
        iconGridGap: 32,
        iconGridLabelSize: 14,
        iconGridLabelWeight: 600,
        iconGridLabelColor: '#1a1a1a',
        iconGridItems: [
          {
            iconUrl: 'https://assets.javvycoffee.com/673f62a5e3a27e3e6d3bbfa8_no-sugar-icon.svg',
            label: 'No Added Sugar',
            iconSize: 52,
          },
          {
            iconUrl: 'https://assets.javvycoffee.com/673f62a5e3a27e3e6d3bbfaa_real-coffee-icon.svg',
            label: 'Real Coffee',
            iconSize: 52,
          },
          {
            iconUrl: 'https://assets.javvycoffee.com/673f62a5e3a27e3e6d3bbfac_clean-label-icon.svg',
            label: 'Clean Label',
            iconSize: 52,
          },
          {
            iconUrl: 'https://assets.javvycoffee.com/673f62a5e3a27e3e6d3bbfae_waistline-icon.svg',
            label: 'Waistline-Friendly',
            iconSize: 52,
          },
        ],
      }],
    }],
    rows: [{
      id: rowId,
      cellIds: [cellId],
      style: { backgroundColor: '', paddingY: 0, gap: 0 },
    }],
    gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
  }],
}

sections.splice(comparisonIdx + 1, 0, iconGridSection)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
console.log('\nAFTER sections:')
after.sections.forEach((s, i) => console.log(`  ${i}: ${s.label}`))
