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

const finalCta = sections.find(s => s.label === 'Final CTA')
if (!finalCta) throw new Error('Final CTA section not found')

const grid  = finalCta.grids[1]
const cell1 = grid.cells[0]
const cell2 = grid.cells[1]
const img   = cell1.contents[0]
const h1    = cell2.contents.find(c => c.text?.includes('UP TO 58% OFF'))
if (!h1) throw new Error('H1 textBox not found')

console.log('=== BEFORE ===')
console.log('gridBadge.backgroundColor:', grid.gridBadge.backgroundColor)
console.log('gridBadge.fontSize:       ', grid.gridBadge.fontSize)
console.log('gridBadge.paddingX:       ', grid.gridBadge.paddingX)
console.log('gridBadge.paddingY:       ', grid.gridBadge.paddingY)
console.log('h1.text:                  ', h1.text)
console.log('cell2.style.paddingTop:   ', cell2.style.paddingTop ?? '(unset)')
console.log('cell2.style.paddingBottom:', cell2.style.paddingBottom ?? '(unset)')
console.log('cell2.style.paddingX:     ', cell2.style.paddingX ?? '(unset)')
console.log('gridStyle.gap:            ', grid.gridStyle.gap)
console.log('img.imageMaxWidth:        ', img.imageMaxWidth ?? '(unset)')
console.log('img.imageAlign:           ', img.imageAlign ?? '(unset)')
console.log('cell1.style.paddingX:     ', cell1.style.paddingX ?? '(unset)')
console.log('cell1.style.paddingY:     ', cell1.style.paddingY ?? '(unset)')

// Fix 1: badge
grid.gridBadge.backgroundColor = '#5b21b6'
grid.gridBadge.fontSize         = 18
grid.gridBadge.paddingX         = 28
grid.gridBadge.paddingY         = 12

// Fix 2: H1 text
h1.text = '<h1 style="text-align:center;font-weight:900;font-size:22px"><span style="color:#dc2626">UP TO 58% OFF</span> <span style="color:#1a1a1a">FOR A LIMITED TIME ONLY!</span></h1>'

// Fix 3: cell2 padding
cell2.style.paddingTop    = 16
cell2.style.paddingBottom = 20
cell2.style.paddingX      = 20

// Fix 4: gridStyle gap
grid.gridStyle.gap = 8

// Fix 5: image + cell1 style
img.imageMaxWidth   = 85
img.imageAlign      = 'center'
cell1.style.paddingX = 12
cell1.style.paddingY = 16

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [rowAfter] = await sql`SELECT sections FROM presets WHERE id = 1`
const ctaAfter  = rowAfter.sections.find(s => s.label === 'Final CTA')
const gA        = ctaAfter.grids[1]
const c1A       = gA.cells[0]
const c2A       = gA.cells[1]
const imgA      = c1A.contents[0]
const h1A       = c2A.contents.find(c => c.text?.includes('UP TO 58% OFF'))

console.log('\n=== AFTER (read back from DB) ===')
console.log('gridBadge.backgroundColor:', gA.gridBadge.backgroundColor)
console.log('gridBadge.fontSize:       ', gA.gridBadge.fontSize)
console.log('gridBadge.paddingX:       ', gA.gridBadge.paddingX)
console.log('gridBadge.paddingY:       ', gA.gridBadge.paddingY)
console.log('h1.text:                  ', h1A.text)
console.log('cell2.style.paddingTop:   ', c2A.style.paddingTop)
console.log('cell2.style.paddingBottom:', c2A.style.paddingBottom)
console.log('cell2.style.paddingX:     ', c2A.style.paddingX)
console.log('gridStyle.gap:            ', gA.gridStyle.gap)
console.log('img.imageMaxWidth:        ', imgA.imageMaxWidth)
console.log('img.imageAlign:           ', imgA.imageAlign)
console.log('cell1.style.paddingX:     ', c1A.style.paddingX)
console.log('cell1.style.paddingY:     ', c1A.style.paddingY)
console.log('\nDone.')
