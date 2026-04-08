import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 1`
const sections = JSON.parse(JSON.stringify(row.sections))

// Original flat cells: [video1, text1, video2, text2, video3, text3]
const [vid1, txt1, vid2, txt2, vid3, txt3] = sections[3].grids[0].cells

// Build a grid for one listicle item.
// - Copies the existing video/text cells exactly, only updates layout properties.
// - Splits the text cell's two content blocks into separate title + desc cells.
function makeGrid(videoCell, textCell) {
  const t = Date.now() + Math.floor(Math.random() * 1000)

  // Copy video cell — fix legacy `padding` field, apply Media+Text layout props
  const { padding: _vp, ...videoStyle } = videoCell.style
  const video = {
    ...videoCell,
    width: 50,
    rowSpan: 2,
    mobileOrder: 1,
    style: { ...videoStyle, paddingX: 0, paddingY: 0 },
    contents: videoCell.contents.map(c => ({
      ...c,
      // Clean trailing empty tags from caption
      captionText: c.captionText?.replace(/(<p><\/p>)+$/g, '').trim() ?? c.captionText,
    })),
  }

  // Split text cell into title (row 1) and desc (row 2)
  const [titleContent, descContent] = textCell.contents
  const { padding: _tp, ...textBaseStyle } = textCell.style

  const titleCell = {
    ...textCell,
    id: `${textCell.id}-title-${t}`,
    width: 50,
    rowSpan: undefined,
    mobileOrder: 0,
    style: { ...textBaseStyle, paddingX: 24, paddingY: 0, alignItems: 'end' },
    contents: [titleContent],
  }

  const descCell = {
    ...textCell,
    id: `${textCell.id}-desc-${t}`,
    width: 50,
    rowSpan: undefined,
    mobileOrder: 2,
    style: { ...textBaseStyle, paddingX: 24, paddingY: 0, alignItems: 'start' },
    contents: [descContent],
  }

  return {
    cells: [video, titleCell, descCell],
    rows: [
      { id: `row1-${t}`, style: { gap: 24, paddingY: 0, backgroundColor: '' }, cellIds: [video.id, titleCell.id] },
      { id: `row2-${t}`, style: { gap: 0,  paddingY: 0, backgroundColor: '' }, cellIds: [descCell.id] },
    ],
    gridStyle: { gap: 0, columnGap: 24, borderRadius: 0, backgroundColor: '' },
  }
}

const listicleSection = {
  id: `section-listicle-${Date.now()}`,
  label: 'Listicle',
  style: {
    contentWidth: 'narrow',
    paddingYSize: 's',
    gridGap: 48,
    backgroundColor: '',
  },
  grids: [
    makeGrid(vid1, txt1),
    makeGrid(vid2, txt2),
    makeGrid(vid3, txt3),
  ],
}

const newSections = [
  sections[0], // Banner
  sections[1], // Article Header
  sections[2], // Comparison
  listicleSection,
  sections[4], // Footer
  // Section 5 (Media+Text demo) intentionally removed — served its purpose
]

await sql`UPDATE presets SET sections = ${JSON.stringify(newSections)}::jsonb WHERE id = 1`
console.log('Done:', newSections.map((s, i) => `${i}: ${s.label}`).join(', '))
listicleSection.grids.forEach((g, i) => {
  const vid = g.cells[0].contents[0]
  console.log(`  Grid ${i+1}: caption="${vid.captionText}" | cells=${g.cells.length}`)
})
