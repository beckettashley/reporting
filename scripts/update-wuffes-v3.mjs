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

// Keep section 0 (Banner) unchanged
// Rewrite section 1 (Wuffes content) to match new spec

const t = Date.now()

const wuffesSection = {
  id: 'section-wuffes',
  label: 'Content',
  style: {
    paddingYSize: 'none',
    contentWidth: 'flood',
    maxWidth: 540,
    backgroundColor: '',
  },
  grids: [
    {
      mobileColumns: 2,
      gridStyle: {
        backgroundColor: '#2D4A35',
        borderRadius: 16,
        gap: 0,
        columnGap: 16,
      },
      rows: [
        {
          id: `row-w-heading-${t}`,
          cellIds: [`cell-w-heading-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 0 },
        },
        {
          id: `row-w-cards-${t}`,
          cellIds: [`cell-w-left-${t}`, `cell-w-right-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 16 },
        },
        {
          id: `row-w-cta-${t}`,
          cellIds: [`cell-w-cta-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 0 },
        },
      ],
      cells: [
        // ── Heading cell (100%) ──────────────────────────────────────────
        {
          id: `cell-w-heading-${t}`,
          width: 100,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 24,
            paddingY: 32,
            textAlign: 'center',
            alignItems: 'center',
          },
          contents: [
            {
              id: `c-w-h1-${t}`,
              type: 'textBox',
              text: '<h1><span style="color: #ffffff;">What do I get with Wuffes?</span></h1>',
            },
            {
              id: `c-w-body-${t}`,
              type: 'textBox',
              text: '<p><span style="color: #ffffff;">Everything you need to support your dog\'s joint health — now, and in the months to come.</span></p>',
            },
          ],
        },
        // ── Left card (50%) ──────────────────────────────────────────────
        {
          id: `cell-w-left-${t}`,
          width: 50,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 12,
            paddingY: 16,
            textAlign: 'center',
            alignItems: 'start',
          },
          contents: [
            {
              id: `c-w-limg-${t}`,
              type: 'image',
              imageUrl: 'https://wuffes.com/cdn/shop/files/offer-hc-benefits-left_160x.png?v=18412045986892816936',
              imageAlt: 'Wuffes Advanced Hip & Joint Support supplement jar',
              imageAspectRatio: 'square',
              imageObjectFit: 'cover',
            },
            {
              id: `c-w-lh4-${t}`,
              type: 'textBox',
              text: '<h4><span style="color: #ffffff;">Wuffes Joint Chews</span></h4>',
            },
            {
              id: `c-w-lbody-${t}`,
              type: 'textBox',
              text: '<p><span style="color: #ffffff;">Soft chews packed with clinically-proven ingredients</span></p>',
            },
          ],
        },
        // ── Right card (50%) ─────────────────────────────────────────────
        {
          id: `cell-w-right-${t}`,
          width: 50,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 12,
            paddingY: 16,
            textAlign: 'center',
            alignItems: 'start',
          },
          contents: [
            {
              id: `c-w-rimg-${t}`,
              type: 'image',
              imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OQ4GXw8NNyd0YbpXm68AWrU3Mvc7Ub.png',
              imageAlt: 'Veterinarian holding two Yorkshire Terriers',
              imageAspectRatio: 'square',
              imageObjectFit: 'cover',
            },
            {
              id: `c-w-rh4-${t}`,
              type: 'textBox',
              text: '<h4><span style="color: #ffffff;">Credible Vet Insights</span></h4>',
            },
            {
              id: `c-w-rbody-${t}`,
              type: 'textBox',
              text: '<p><span style="color: #ffffff;">Educational resources from our Vet Advisory Board</span></p>',
            },
          ],
        },
        // ── CTA cell (100%) ──────────────────────────────────────────────
        {
          id: `cell-w-cta-${t}`,
          width: 100,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 24,
            paddingY: 32,
            textAlign: 'center',
            alignItems: 'center',
          },
          contents: [
            {
              id: `c-w-cta-${t}`,
              type: 'ctaButton',
              ctaText: 'TRY WUFFES',
              ctaUrl: 'https://wuffes.com',
              ctaVariant: 'primary',
              ctaBackgroundColor: '#A8E635',
              ctaTextColor: '#1A1A1A',
              ctaBorderRadius: 100,
              ctaLetterSpacing: '0.05em',
              ctaPaddingY: 18,
            },
          ],
        },
      ],
    },
  ],
}

sections[1] = wuffesSection

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 2`
console.log('Done. Wuffes preset updated to v3 spec.')
console.log('  maxWidth:', wuffesSection.style.maxWidth)
console.log('  mobileColumns:', wuffesSection.grids[0].mobileColumns)
console.log('  cells:', wuffesSection.grids[0].cells.map(c => `${c.id} (${c.width}%)`).join(', '))
