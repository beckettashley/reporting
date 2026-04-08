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

const hiwIdx = sections.findIndex(s => s.label === 'How It Works')
if (hiwIdx === -1) throw new Error('How It Works section not found')

const now = Date.now()
const cellId = `cell-${now}-1`

const valuePropositionSection = {
  id: `section-${now}`,
  label: 'Value Proposition',
  style: {
    backgroundColor: '#ffffff',
    paddingYSize: 'l',
    contentWidth: 'contained',
  },
  grids: [{
    cells: [{
      id: cellId,
      width: 100,
      style: {
        backgroundColor: '',
        borderWidth: 0,
        borderRadius: 0,
        paddingX: 0,
        paddingY: 0,
        alignItems: 'start',
      },
      contents: [{
        id: `${cellId}-benefits`,
        type: 'benefitsGrid',
        benefitsGridTitle: "Finally a Coffee You Won't Have to Quit",
        benefitsGridCenterImage: 'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1766409035/1_heoxra.png',
        benefitsGridCenterImageBorderRadius: 24,
        benefitsGridItemSize: 48,
        benefitsGridLeftItems: [
          { title: 'Energy & Endurance', body: 'Enhances stamina, reduces fatigue, ideal for athletes.', iconUrl: 'https://cdn.shopify.com/oxygen-v2/25194/9447/19462/3290292/images/assets/energy.svg' },
          { title: 'Muscle Building', body: 'Provides essential amino acids for growth & recovery.', iconUrl: 'https://cdn.shopify.com/oxygen-v2/25194/9447/19462/3290292/images/assets/muscle-gains.svg' },
          { title: 'Strength & Power', body: 'Boosts power after resistance training.', iconUrl: 'https://cdn.shopify.com/oxygen-v2/25194/9447/19462/3290292/images/assets/kettlebell.svg' },
        ],
        benefitsGridRightItems: [
          { title: 'Kickstart Your Day', body: '80mg of caffeine per serving helps you energize your day from the start.', iconUrl: 'https://cdn.shopify.com/oxygen-v2/25194/9447/19462/3290292/images/assets/kickstart.svg' },
          { title: 'Focus and Alertness', body: 'Sharpens focus and improves concentration for hours without the crash.', iconUrl: 'https://cdn.shopify.com/oxygen-v2/25194/9447/19462/3290292/images/assets/mind.svg' },
          { title: 'Stay Full & Fueled', body: 'With 10g of protein, it helps curb mid-morning cravings and keeps you satisfied.', iconUrl: 'https://cdn.shopify.com/oxygen-v2/25194/9447/19462/3290292/images/assets/feelfull.svg' },
        ],
      }],
    }],
    rows: [{
      id: `row-${now}-1`,
      cellIds: [cellId],
      style: { backgroundColor: '', paddingY: 0, gap: 0 },
    }],
    gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
  }],
}

sections.splice(hiwIdx + 1, 0, valuePropositionSection)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
console.log('\nAFTER sections:')
after.sections.forEach((s, i) => console.log(`  ${i}: ${s.label}`))
