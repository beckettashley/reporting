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

const iconGridIdx  = sections.findIndex(s => s.label === 'Icon Grid')
const beforeAfterIdx = sections.findIndex(s => s.label === 'Before & After')
if (iconGridIdx === -1) throw new Error('Icon Grid section not found')
if (beforeAfterIdx === -1) throw new Error('Before & After section not found')

const iconGridSection = sections[iconGridIdx]
const beforeAfter     = sections[beforeAfterIdx]

console.log('Icon Grid grids:', iconGridSection.grids.length)
console.log('Before & After grids before:', beforeAfter.grids.map((g, i) => `[${i}] ${g.cells.map(c => c.contents.map(ct => ct.type).join(',')).join(' | ')}`))

// Remove any ticker grids that were wrongly inserted
beforeAfter.grids = beforeAfter.grids.filter(g =>
  !g.cells.some(c => c.contents.some(ct => ct.type === 'ticker'))
)

// Insert the iconGrid section's grids after grid[0] (heading) and before the videos
const [heading, ...rest] = beforeAfter.grids
beforeAfter.grids = [heading, ...iconGridSection.grids, ...rest]

// Remove the now-empty Icon Grid section
sections.splice(iconGridIdx, 1)

console.log('Before & After grids after:', beforeAfter.grids.map((g, i) => `[${i}] ${g.cells.map(c => c.contents.map(ct => ct.type).join(',')).join(' | ')}`))
console.log('Sections remaining:', sections.map(s => s.label))

const updated = Array.isArray(data) ? sections : { ...data, sections }
await sql`UPDATE presets SET sections = ${JSON.stringify(updated)}::jsonb WHERE id = 1`
console.log('Done.')
