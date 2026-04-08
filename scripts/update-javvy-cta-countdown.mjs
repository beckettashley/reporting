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

const cell = sections.find(s => s.label === 'Final CTA')
  .grids.flatMap(g => g.cells).find(c => c.id === 'cell-javvy-cta-offer-1775077292865')
if (!cell) throw new Error('Cell not found')

// Fix 1: update "This limited-time deal..." font size to 13px
const dealText = cell.contents.find(c => c.type === 'textBox' && c.text?.includes('limited-time deal'))
if (!dealText) throw new Error('"limited-time deal" textBox not found')
console.log('BEFORE deal text:', dealText.text)
dealText.text = dealText.text.replace(
  '<p style="text-align:center;color:#1a1a1a;font-weight:500">',
  '<p style="text-align:center;color:#1a1a1a;font-weight:500;font-size:13px">'
)
console.log('AFTER  deal text:', dealText.text)

// Fix 2: replace hardcoded "DEAL ENDING IN" textBox with countdown content type
const timerIdx = cell.contents.findIndex(c => c.type === 'textBox' && c.text?.includes('DEAL ENDING IN'))
if (timerIdx === -1) throw new Error('"DEAL ENDING IN" textBox not found')
console.log('\nReplacing textBox at index', timerIdx, ':', cell.contents[timerIdx].text)

// 10 hours, 3 minutes, 39 seconds = 36219 seconds
cell.contents[timerIdx] = {
  id: `content-countdown-${Date.now()}`,
  type: 'countdown',
  countdownDuration: 36219,
  countdownLabel: 'DEAL ENDING IN:',
  countdownTextColor: '#dc2626',
  countdownFontSize: 13,
}
console.log('Replaced with countdown content:', cell.contents[timerIdx])

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`
console.log('\nDB updated.')
