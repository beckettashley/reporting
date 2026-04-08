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

// ─── Section 0: New Banner ─────────────────────────────────────────────────
const bannerSection = {
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
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [
        {
          id: `row-banner-${t}`,
          cellIds: [`cell-banner-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 0 },
        },
      ],
      cells: [
        {
          id: `cell-banner-${t}`,
          width: 100,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            borderStyle: 'solid',
            paddingX: 0,
            paddingY: 0,
            alignItems: 'center',
            shadowEnabled: false,
          },
          contents: [
            {
              id: `content-banner-${t}`,
              type: 'banner',
              bannerConfig: {
                enabled: true,
                position: 'sticky',
                primary: {
                  text: '⚡ 50% OFF TODAY ONLY — Claim Your Exclusive Deal',
                  backgroundColor: '#A8E635',
                  textColor: '#1A1A1A',
                },
                secondary: {
                  enabled: false,
                  text: '',
                  backgroundColor: '#2D4A35',
                  textColor: '#ffffff',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}

// ─── Section 1: New Hero ───────────────────────────────────────────────────
const heroSection = {
  id: `section-hero-${t}`,
  label: 'Hero',
  style: {
    paddingYSize: 'm',
    contentWidth: 'contained',
    maxWidth: 540,
    backgroundColor: '',
  },
  grids: [
    // Grid 1 — Heading
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [
        {
          id: `row-h-heading-${t}`,
          cellIds: [`cell-h-heading-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 0 },
        },
      ],
      cells: [
        {
          id: `cell-h-heading-${t}`,
          width: 100,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 0,
            paddingY: 16,
            textAlign: 'center',
            alignItems: 'center',
          },
          contents: [
            {
              id: `c-h-h1-${t}`,
              type: 'textBox',
              text: '<h1><span style="color: #2D4A35;">50% OFF TODAY ONLY!</span></h1>',
            },
          ],
        },
      ],
    },
    // Grid 2 — Star Rating
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [
        {
          id: `row-h-stars-${t}`,
          cellIds: [`cell-h-stars-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 0 },
        },
      ],
      cells: [
        {
          id: `cell-h-stars-${t}`,
          width: 100,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 0,
            paddingY: 8,
            textAlign: 'center',
            alignItems: 'center',
          },
          contents: [
            {
              id: `c-h-stars-${t}`,
              type: 'starRating',
              starCount: 5,
              starValue: 5,
              starColor: '#A8E635',
              starLabel: 'Over 5 Million Tubs Delivered',
            },
          ],
        },
      ],
    },
    // Grid 3 — Body Copy
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [
        {
          id: `row-h-body-${t}`,
          cellIds: [`cell-h-body-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 0 },
        },
      ],
      cells: [
        {
          id: `cell-h-body-${t}`,
          width: 100,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 0,
            paddingY: 8,
            textAlign: 'center',
            alignItems: 'center',
          },
          contents: [
            {
              id: `c-h-body-${t}`,
              type: 'textBox',
              text: '<p><span style="color: #333333;">Support your dog\'s joints with clinically-proven ingredients. Trusted by over 5 million dog owners worldwide.</span></p>',
            },
          ],
        },
      ],
    },
    // Grid 4 — CTA Button
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [
        {
          id: `row-h-cta-${t}`,
          cellIds: [`cell-h-cta-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 0 },
        },
      ],
      cells: [
        {
          id: `cell-h-cta-${t}`,
          width: 100,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 0,
            paddingX: 0,
            paddingY: 16,
            textAlign: 'center',
            alignItems: 'center',
          },
          contents: [
            {
              id: `c-h-cta-${t}`,
              type: 'ctaButton',
              ctaText: 'CLAIM EXCLUSIVE DEAL',
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
    // Grid 5 — Hero Image
    {
      gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0 },
      rows: [
        {
          id: `row-h-img-${t}`,
          cellIds: [`cell-h-img-${t}`],
          style: { backgroundColor: '', paddingY: 0, gap: 0 },
        },
      ],
      cells: [
        {
          id: `cell-h-img-${t}`,
          width: 100,
          style: {
            backgroundColor: '',
            borderColor: '',
            borderWidth: 0,
            borderRadius: 12,
            paddingX: 0,
            paddingY: 0,
            alignItems: 'center',
          },
          contents: [
            {
              id: `c-h-img-${t}`,
              type: 'image',
              imageUrl: '',
              imageAlt: 'Wuffes product hero image',
              imageAspectRatio: 'portrait',
              imageObjectFit: 'cover',
            },
          ],
        },
      ],
    },
  ],
}

// ─── Rebuild sections: [banner, hero, existing-what-do-i-get] ─────────────
const newSections = [bannerSection, heroSection, sections[1]]

await sql`UPDATE presets SET sections = ${JSON.stringify(newSections)}::jsonb WHERE id = 2`

console.log('Done. Wuffes preset updated to v4.')
console.log(`  sections[0]: ${newSections[0].label} (${newSections[0].id})`)
console.log(`  sections[1]: ${newSections[1].label} (${newSections[1].id}) — ${newSections[1].grids.length} grids`)
console.log(`  sections[2]: ${newSections[2].label} (${newSections[2].id}) — unchanged`)
