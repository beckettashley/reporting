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
if (!listicle) throw new Error('Listicle not found')

const descCells = listicle.grids
  .flatMap(g => g.cells)
  .filter(c => c.id.includes('desc'))

console.log('BEFORE:')
descCells.forEach(c => console.log(`  ${c.id}: paddingTop=${c.style.paddingTop ?? '(unset)'}`))

descCells.forEach(c => { c.style.paddingTop = 8 })

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const listicleAfter = after.sections.find(s => s.label === 'Listicle')
const descAfter = listicleAfter.grids.flatMap(g => g.cells).filter(c => c.id.includes('desc'))

console.log('AFTER:')
descAfter.forEach(c => console.log(`  ${c.id}: paddingTop=${c.style.paddingTop}`))
