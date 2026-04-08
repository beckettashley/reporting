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

const content = sections.find(s => s.label === 'Final CTA')
  .grids.flatMap(g => g.cells).flatMap(c => c.contents)
  .find(c => c.type === 'textBox' && c.text?.includes('58% OFF'))
if (!content) throw new Error('58% OFF textBox not found')

console.log('BEFORE:', content.text)

content.text = content.text.replace(
  /font-family:[^;"]+;?/,
  "font-family:'Archivo Condensed','Barlow Condensed',sans-serif;"
)

console.log('AFTER: ', content.text)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('DB updated.')
