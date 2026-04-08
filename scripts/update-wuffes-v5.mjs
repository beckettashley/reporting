import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)
const [row] = await sql`SELECT sections FROM presets WHERE id = 2`
const sections = row.sections

const t = Date.now()

// ─── Section 0: Banner — 2-cell grid (badge + text) ───────────────────────
sections[0] = {
  id: `section-banner-${t}`,
  label: 'Banner',
  style: {
    position: 'sticky',
    paddingYSize: 'none',
    contentWidth: 'flood',
    backgroundColor: '#2D4A35',
  },
  grids: [
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0, columnGap: 8 },
      rows: [
        {
          id: `row-banner-${t}`,
          cellIds: [`cell-banner-badge-${t}`, `cell-banner-text-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 8 },
        },
      ],
      cells: [
        // Left cell — "50% OFF" pill badge
        {
          id: `cell-banner-badge-${t}`,
          width: 33,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 16,
            paddingY: 10,
            textAlign: 'right',
            alignItems: 'center',
          },
          contents: [
            {
              id: `content-banner-badge-${t}`,
              type: 'badge',
              text: '50% OFF',
              badgeBackgroundColor: '#A8E635',
              badgeTextColor: '#1A1A1A',
            },
          ],
        },
        // Right cell — "WHILE STOCKS LAST" text
        {
          id: `cell-banner-text-${t}`,
          width: 67,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 0,
            paddingY: 10,
            textAlign: 'left',
            alignItems: 'center',
          },
          contents: [
            {
              id: `content-banner-text-${t}`,
              type: 'textBox',
              text: '<p><strong><span style="color: #ffffff;">WHILE STOCKS LAST</span></strong></p>',
            },
          ],
        },
      ],
    },
  ],
}

// ─── Section 1: Hero — remove backgroundImage, set cream background ────────
delete sections[1].style.backgroundImage
delete sections[1].style.backgroundSize
delete sections[1].style.backgroundPosition
delete sections[1].style.backgroundRepeat
delete sections[1].style.backgroundOverlay
delete sections[1].style.backgroundOverlayColor
sections[1].style.backgroundColor = '#F5F0E8'

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`

console.log('Done. Wuffes preset updated to v5.')
console.log(`  sections[0]: ${sections[0].label} — 2-cell grid (badge + text)`)
console.log(`  sections[1]: ${sections[1].label} — backgroundColor: ${sections[1].style.backgroundColor}, backgroundImage removed`)
console.log(`  sections[2]: ${sections[2].label} — unchanged`)
