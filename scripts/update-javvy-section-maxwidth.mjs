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

const targets = [
  'section-javvy-article',
  'section-listicle-1774912681320',
]

const found = targets.map(id => {
  const s = sections.find(s => s.id === id)
  if (!s) throw new Error(`Section not found: ${id}`)
  return s
})

console.log('BEFORE:')
found.forEach(s => console.log(`  ${s.id} (${s.label}): maxWidth = ${s.style.maxWidth ?? '(unset)'}`)  )

found.forEach(s => { s.style.maxWidth = 720 })

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const afterFound = targets.map(id => after.sections.find(s => s.id === id))

console.log('AFTER:')
afterFound.forEach(s => console.log(`  ${s.id} (${s.label}): maxWidth = ${s.style.maxWidth}`))
