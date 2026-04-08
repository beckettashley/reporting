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

console.log('BEFORE sections:')
sections.forEach((s, i) => console.log(`  ${i}: ${s.label}`))

const iconGridIdx = sections.findIndex(s => s.label === 'Icon Grid')
if (iconGridIdx === -1) throw new Error('Icon Grid section not found')

const now = Date.now()

const makeCell = (id, width, videoUrl, videoPoster, text) => ({
  id,
  width,
  style: {
    backgroundColor: '',
    borderColor: '',
    borderWidth: 0,
    borderRadius: 0,
    borderStyle: 'solid',
    paddingX: 0,
    paddingY: 0,
    alignItems: 'start',
    contentGap: 16,
  },
  contents: [
    {
      id: `${id}-video`,
      type: 'video',
      videoUrl,
      videoPoster,
      videoAspectRatio: 'square',
      videoAutoplay: false,
      videoLoop: false,
      videoControls: true,
      imageBorderRadius: 12,
    },
    {
      id: `${id}-text`,
      type: 'textBox',
      text,
    },
  ],
})

const cell1Id = `cell-${now}-1`
const cell2Id = `cell-${now}-2`
const cell3Id = `cell-${now}-3`
const rowId = `row-${now}`

const benefitsSection = {
  id: `section-${now}`,
  label: 'Benefits',
  style: {
    backgroundColor: '#faf8f5',
    paddingYSize: 'l',
    contentWidth: 'contained',
  },
  grids: [{
    mobileColumns: 1,
    cells: [
      makeCell(
        cell1Id, 34,
        'https://vz-318e2430-7a3.b-cdn.net/bd8c49dd-2b0e-47d0-9331-1444c103f455/play_480p.mp4',
        'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1773148529/1_rl7uzn.png',
        '<h3 style="font-weight:700;margin-bottom:8px">Feel Your Best &amp; Build Strength 🔥</h3><p style="color:#555555;font-size:15px">Power up with 20g of premium whey protein in every two scoops. Own your routine, feel your best, and fuel the strength to thrive.</p>'
      ),
      makeCell(
        cell2Id, 33,
        'https://vz-318e2430-7a3.b-cdn.net/f64a251e-5c3f-421c-b355-31766bdf156a/play_480p.mp4',
        'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1773148502/4_jwtjn5.png',
        '<h3 style="font-weight:700;margin-bottom:8px">Keep the Flavor, Skip the Sugar 🍩</h3><p style="color:#555555;font-size:15px">Treat yourself to guilt-free sweetness with premium protein that has no added sugar, helping you feel full throughout the day.</p>'
      ),
      makeCell(
        cell3Id, 33,
        'https://vz-318e2430-7a3.b-cdn.net/231aa4cb-2a06-4119-84b7-8bb3ae13d125/play_480p.mp4',
        'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1773148514/5_abhdr9.png',
        '<h3 style="font-weight:700;margin-bottom:8px">Stay Focused &amp; Energized 🎯</h3><p style="color:#555555;font-size:15px">80mg of caffeine per serving delivers the perfect balance to keep you in the zone and energized, without the jitter.</p>'
      ),
    ],
    rows: [{
      id: rowId,
      cellIds: [cell1Id, cell2Id, cell3Id],
      style: { backgroundColor: '', paddingY: 0, gap: 0 },
    }],
    gridStyle: { backgroundColor: '', borderRadius: 0, gap: 32 },
  }],
}

sections.splice(iconGridIdx + 1, 0, benefitsSection)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
console.log('\nAFTER sections:')
after.sections.forEach((s, i) => console.log(`  ${i}: ${s.label}`))
