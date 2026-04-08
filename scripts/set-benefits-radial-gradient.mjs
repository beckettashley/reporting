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

// Set radial gradient: white → #E1F3FF (50%) → white
// backgroundColor cleared so gradient takes precedence
benefits.style = {
  ...benefits.style,
  backgroundColor: '',
  backgroundGradientType: 'radial',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientMid: '#E1F3FF',
  backgroundGradientMidStop: 50,
  backgroundGradientTo: '#ffffff',
  backgroundGradientDirection: 'center',
}

// Update benefitsGridItemSize to 86 (desktop circle diameter) so the prop
// reflects the actual size instead of the legacy icon-size value of 48
benefits.grids.forEach(g => {
  g.cells.forEach(c => {
    c.contents.forEach(ct => {
      if (ct.type === 'benefitsGrid') {
        ct.benefitsGridItemSize = 86
        console.log('Updated benefitsGridItemSize to 86')
      }
    })
  })
})

console.log('Benefits section style:', JSON.stringify(benefits.style, null, 2))

const updated = Array.isArray(data) ? sections : { ...data, sections }
await sql`UPDATE presets SET sections = ${JSON.stringify(updated)}::jsonb WHERE id = 1`
console.log('Done.')
