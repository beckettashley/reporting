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

// ── 1. Update Benefits videos: autoplay, loop, no controls ──────────────────
const benefitsSection = sections.find(s => s.label === 'Benefits')
if (!benefitsSection) throw new Error('Benefits section not found')

benefitsSection.grids.flatMap(g => g.cells).flatMap(c => c.contents)
  .filter(c => c.type === 'video')
  .forEach(v => {
    v.videoAutoplay = true
    v.videoLoop = true
    v.videoControls = false
  })
console.log('\nBenefits videos updated: autoplay=true, loop=true, controls=false')

// ── 2. Insert "How It Works" after Benefits ──────────────────────────────────
const benefitsIdx = sections.findIndex(s => s.label === 'Benefits')
if (benefitsIdx === -1) throw new Error('Benefits section not found')

const now = Date.now()

const videos = [
  {
    url: 'https://vz-318e2430-7a3.b-cdn.net/bd8c49dd-2b0e-47d0-9331-1444c103f455/play_480p.mp4',
    poster: 'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1773148529/1_rl7uzn.png',
    caption: 'Step 1',
    text: '<p style="text-align:center;font-size:15px;color:#1a1a1a">Fill your cup with <strong>8-16 oz</strong> of water or milk.</p>',
  },
  {
    url: 'https://vz-318e2430-7a3.b-cdn.net/f64a251e-5c3f-421c-b355-31766bdf156a/play_480p.mp4',
    poster: 'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1773148502/4_jwtjn5.png',
    caption: 'Step 2',
    text: '<p style="text-align:center;font-size:15px;color:#1a1a1a">Mix in <strong>1-2 scoops</strong> of Javvy\'s protein coffee.</p>',
  },
  {
    url: 'https://vz-318e2430-7a3.b-cdn.net/231aa4cb-2a06-4119-84b7-8bb3ae13d125/play_480p.mp4',
    poster: 'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1773148514/5_abhdr9.png',
    caption: 'Step 3',
    text: '<p style="text-align:center;font-size:15px;color:#1a1a1a">Top with your favorite <strong>creamer, flavoring, or topping.</strong> Enjoy!</p>',
  },
]

const headingCellId = `cell-${now}-h`
const cellIds = [`cell-${now}-1`, `cell-${now}-2`, `cell-${now}-3`]

const makeVideoCell = (id, width, v) => ({
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
    alignItems: 'center',
    contentGap: 16,
  },
  contents: [
    {
      id: `${id}-video`,
      type: 'video',
      videoUrl: v.url,
      videoPoster: v.poster,
      videoAspectRatio: 'standard',
      videoAutoplay: true,
      videoLoop: true,
      videoControls: false,
      imageBorderRadius: 12,
      captionText: v.caption,
      captionBgColor: '#2a2552',
      captionTextColor: '#ffffff',
    },
    {
      id: `${id}-text`,
      type: 'textBox',
      text: v.text,
    },
  ],
})

const howItWorksSection = {
  id: `section-${now}`,
  label: 'How It Works',
  style: {
    backgroundColor: '#faf8f5',
    paddingYSize: 'l',
    contentWidth: 'contained',
  },
  grids: [
    // Grid 1 — heading
    {
      cells: [{
        id: headingCellId,
        width: 100,
        style: { backgroundColor: '', borderWidth: 0, borderRadius: 0, paddingX: 0, paddingY: 0, paddingBottom: 8 },
        contents: [{
          id: `${headingCellId}-text`,
          type: 'textBox',
          text: '<h2 style="font-weight:800;text-align:center;color:#1a1a1a">1-2 Scoops a Day to Build Your Wellness &amp; Confidence</h2><p style="text-align:center;color:#555555;margin-top:8px">Sip your way to your best self and feel incredible from sunrise to sunset*.</p>',
        }],
      }],
      rows: [{ id: `row-${now}-h`, cellIds: [headingCellId], style: { backgroundColor: '', paddingY: 0, gap: 0 } }],
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
    },
    // Grid 2 — 3 columns
    {
      mobileColumns: 1,
      cells: [
        makeVideoCell(cellIds[0], 34, videos[0]),
        makeVideoCell(cellIds[1], 33, videos[1]),
        makeVideoCell(cellIds[2], 33, videos[2]),
      ],
      rows: [{ id: `row-${now}-1`, cellIds, style: { backgroundColor: '', paddingY: 0, gap: 0 } }],
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 24 },
    },
  ],
}

sections.splice(benefitsIdx + 1, 0, howItWorksSection)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
console.log('\nAFTER sections:')
after.sections.forEach((s, i) => console.log(`  ${i}: ${s.label}`))
