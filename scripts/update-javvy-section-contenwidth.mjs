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

const skip = ['Banner', 'Footer']
const targets = sections.filter(s => !skip.includes(s.label))

console.log('BEFORE:')
targets.forEach(s => console.log(
  `  ${s.id} (${s.label}): contentWidth=${s.style.contentWidth ?? '(unset)'} maxWidth=${s.style.maxWidth ?? '(unset)'}`
))

targets.forEach(s => {
  s.style.contentWidth = 'contained'
  delete s.style.maxWidth
  delete s.style.paddingX
  delete s.style.paddingXMobile
  delete s.style.paddingXTablet
})

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const afterTargets = after.sections.filter(s => !skip.includes(s.label))

console.log('\nAFTER:')
afterTargets.forEach(s => console.log(
  `  ${s.id} (${s.label}): contentWidth=${s.style.contentWidth ?? '(unset)'} maxWidth=${s.style.maxWidth ?? '(unset)'}`
))
