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

const bannerContent = sections
  .find(s => s.label === 'Banner')
  ?.grids.flatMap(g => g.cells)
  .find(c => c.contents?.some(ct => ct.type === 'banner'))
  ?.contents.find(ct => ct.type === 'banner')

if (!bannerContent) throw new Error('Banner content not found')

console.log('BEFORE primary.backgroundColor:', bannerContent.bannerConfig.primary.backgroundColor)
console.log('BEFORE secondary.backgroundColor:', bannerContent.bannerConfig.secondary.backgroundColor)

bannerContent.bannerConfig.primary.backgroundColor = '#3D358B'
bannerContent.bannerConfig.secondary.backgroundColor = '#41388A'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
const afterContent = after.sections
  .find(s => s.label === 'Banner')
  ?.grids.flatMap(g => g.cells)
  .find(c => c.contents?.some(ct => ct.type === 'banner'))
  ?.contents.find(ct => ct.type === 'banner')

console.log('AFTER primary.backgroundColor:', afterContent.bannerConfig.primary.backgroundColor)
console.log('AFTER secondary.backgroundColor:', afterContent.bannerConfig.secondary.backgroundColor)
