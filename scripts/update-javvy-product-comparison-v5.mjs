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

const section = sections.find(s => s.label === 'Product Comparison')
if (!section) throw new Error('Product Comparison section not found')

const compGrid = section.grids[1]
if (!compGrid) throw new Error('Comparison grid (index 1) not found')

const compCell = compGrid.cells.find(c => c.contents.some(ct => ct.type === 'productComparison'))
if (!compCell) throw new Error('productComparison cell not found')

console.log('BEFORE:', JSON.stringify({ paddingX: compCell.style.paddingX, paddingY: compCell.style.paddingY }))

compCell.style.paddingX = 0

console.log('AFTER: ', JSON.stringify({ paddingX: compCell.style.paddingX, paddingY: compCell.style.paddingY }))

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('DB updated.')
