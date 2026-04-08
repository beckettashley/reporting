import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sql = neon(env.DATABASE_URL)

// ─── ID factory ───────────────────────────────────────────────────────────────
const BASE = 1775200000000
let c = 0
const nid = prefix => `${prefix}-${BASE + c++}`

// ─── Helpers ──────────────────────────────────────────────────────────────────
const gs0 = { backgroundColor: '', borderRadius: 0, gap: 0 }
const gs16 = { backgroundColor: '', borderRadius: 0, gap: 16 }

const textCell = (paddingX = 24) => ({
  paddingX,
  paddingY: 0,
  borderWidth: 0,
  borderRadius: 0,
  borderStyle: 'solid',
})
const imgCell = () => ({
  paddingX: 0,
  paddingY: 0,
  borderWidth: 0,
  borderRadius: 0,
  borderStyle: 'solid',
})

// ─── Sections ─────────────────────────────────────────────────────────────────

const sections = [

  // ── 1. Banner ───────────────────────────────────────────────────────────────
  {
    id: nid('section-fc-banner'),
    label: 'Banner',
    style: {
      position: 'sticky',
      contentWidth: 'flood',
      backgroundColor: '#3b3270',
      paddingYSize: 'none',
    },
    grids: [{
      cells: [{
        id: nid('cell-fc-banner'),
        width: 100,
        style: imgCell(),
        contents: [{
          id: nid('content-fc-banner'),
          type: 'banner',
          bannerConfig: {
            enabled: true,
            position: 'sticky',
            primary: {
              text: '🇺🇸 Trending',
              textColor: '#ffffff',
              backgroundColor: '#3b3270',
            },
            secondary: { enabled: false, text: '' },
          },
        }],
      }],
      gridStyle: gs0,
    }],
  },

  // ── 2. Article Header ───────────────────────────────────────────────────────
  {
    id: nid('section-fc-header'),
    label: 'Article Header',
    style: {
      contentWidth: 'narrow',
      maxWidth: 800,
      paddingYSize: 's',
    },
    grids: [{
      cells: [
        {
          id: nid('cell-fc-h1'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-h1'),
            type: 'textBox',
            text: `<h1>I Ordered 500 of These Pillows Every Month for a 5-Star Hotel — Now 546,000+ People LOVE Them <span style="background-color:#FFE066">(And They're 66% Off)</span></h1>`,
          }],
        },
        {
          id: nid('cell-fc-subheading'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-subheading'),
            type: 'textBox',
            text: '<p>Stops neck pain, night sweats, even snoring! Sleep like you\'re on vacation every night.</p>',
          }],
        },
        {
          id: nid('cell-fc-hdivider'),
          width: 100,
          style: { ...textCell(24), paddingY: 8 },
          contents: [{
            id: nid('content-fc-hdivider'),
            type: 'divider',
          }],
        },
      ],
      gridStyle: gs16,
    }],
  },

  // ── 3. Hero Image ───────────────────────────────────────────────────────────
  {
    id: nid('section-fc-heroimg'),
    label: 'Hero Image',
    style: {
      contentWidth: 'narrow',
      maxWidth: 800,
      paddingYSize: 'none',
    },
    grids: [{
      cells: [{
        id: nid('cell-fc-heroimg'),
        width: 100,
        style: imgCell(),
        contents: [{
          id: nid('content-fc-heroimg'),
          type: 'image',
          imageUrl: 'https://try.fluff.co/images/hdr-1.avif',
          imageAlt: 'FluffCo hotel pillow',
          imageAspectRatio: 'widescreen',
          imageObjectFit: 'cover',
        }],
      }],
      gridStyle: gs0,
    }],
  },

  // ── 4. Intro Body ───────────────────────────────────────────────────────────
  {
    id: nid('section-fc-intro'),
    label: 'Intro Body',
    style: {
      contentWidth: 'narrow',
      maxWidth: 800,
      paddingYSize: 's',
    },
    grids: [{
      cells: [{
        id: nid('cell-fc-intro'),
        width: 100,
        style: textCell(24),
        contents: [{
          id: nid('content-fc-intro'),
          type: 'textBox',
          text: '<p>For 15 years as a hotel manager, I watched guests fall in love with our pillows - then walk away heartbroken from our $200+ gift shop prices.</p><p>Sure, I had access to these pillows myself through employee perks. But regular people? They were stuck paying luxury prices or settling for inferior pillows.</p><p>Now that I\'ve discovered how <strong>EVERYONE</strong> can get the same pillows for a fraction of that cost, I\'m finally free to share the truth.</p>',
        }],
      }],
      gridStyle: gs0,
    }],
  },

  // ── 5. Content Block 1 — Dear Guests ────────────────────────────────────────
  {
    id: nid('section-fc-cb1'),
    label: 'Dear Guests',
    style: {
      contentWidth: 'narrow',
      maxWidth: 800,
      paddingYSize: 's',
    },
    grids: [{
      cells: [
        {
          id: nid('cell-fc-cb1h'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-cb1h'),
            type: 'textBox',
            text: '<h2 style="color:#3730a8">Dear Guests: I Apologize. I Couldn\'t Say.</h2>',
          }],
        },
        {
          id: nid('cell-fc-cb1img'),
          width: 100,
          style: imgCell(),
          contents: [{
            id: nid('content-fc-cb1img'),
            type: 'image',
            imageUrl: 'https://try.fluff.co/images/Frame-1707479829.avif',
            imageAlt: '',
            imageAspectRatio: 'widescreen',
            imageObjectFit: 'cover',
            imageBorderRadius: 8,
          }],
        },
        {
          id: nid('cell-fc-cb1body'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-cb1body'),
            type: 'textBox',
            text: '<p><em>"Where can I buy these pillows?"</em></p><p>Every. Single. Day.</p><p>Guests would find me at checkout, practically begging for information about our pillows. I\'d direct them to the gift shop, knowing they\'d walk away empty-handed when they saw the $200+ price tag.</p><p>What killed me? I knew these same pillows — the <strong>EXACT</strong> same ones — could be bought for so much less. But I couldn\'t say anything. Not if I wanted to keep my job.</p>',
          }],
        },
      ],
      gridStyle: gs16,
    }],
  },

  // ── 6. Content Block 2 — The Day Everything Changed ─────────────────────────
  {
    id: nid('section-fc-cb2'),
    label: 'The Day Everything Changed',
    style: {
      contentWidth: 'narrow',
      maxWidth: 800,
      paddingYSize: 's',
    },
    grids: [{
      cells: [
        {
          id: nid('cell-fc-cb2h'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-cb2h'),
            type: 'textBox',
            text: '<h2 style="color:#3730a8">The Day Everything Changed</h2>',
          }],
        },
        {
          id: nid('cell-fc-cb2img'),
          width: 100,
          style: imgCell(),
          contents: [{
            id: nid('content-fc-cb2img'),
            type: 'image',
            imageUrl: 'https://try.fluff.co/images/owards.webp',
            imageAlt: '',
            imageAspectRatio: 'widescreen',
            imageObjectFit: 'cover',
            imageBorderRadius: 8,
          }],
        },
        {
          id: nid('cell-fc-cb2body'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-cb2body'),
            type: 'textBox',
            text: '<p>Last spring, I was browsing the internet when I nearly dropped my phone. There it was. OUR pillow. The one I\'d been ordering for the hotel for years.</p><p>But it wasn\'t branded with a hotel logo. It was called <strong>FluffCo.</strong></p><p>And the price? Nearly <strong>70% Less.</strong></p>',
          }],
        },
      ],
      gridStyle: gs16,
    }],
  },

  // ── 7. Content Block 3 — Same Suppliers ─────────────────────────────────────
  {
    id: nid('section-fc-cb3'),
    label: 'Same Suppliers',
    style: {
      contentWidth: 'narrow',
      maxWidth: 800,
      paddingYSize: 's',
    },
    grids: [{
      cells: [
        {
          id: nid('cell-fc-cb3h'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-cb3h'),
            type: 'textBox',
            text: '<h2 style="color:#3730a8">FluffCo Uses the Same Suppliers — But Charges You 66% Less</h2>',
          }],
        },
        {
          id: nid('cell-fc-cb3img'),
          width: 100,
          style: imgCell(),
          contents: [{
            id: nid('content-fc-cb3img'),
            type: 'image',
            imageUrl: 'https://try.fluff.co/images/Frame-1707479911_1.avif',
            imageAlt: '',
            imageAspectRatio: 'widescreen',
            imageObjectFit: 'cover',
            imageBorderRadius: 8,
          }],
        },
        {
          id: nid('cell-fc-cb3body'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-cb3body'),
            type: 'textBox',
            text: '<p>FluffCo works directly with the suppliers who provide pillows to major luxury hotel chains. Not <em>"comparable"</em> suppliers. The <strong>SAME</strong> suppliers.</p><p>But because FluffCo sells directly to you — no hotel markup, no gift shop premium — you pay just <strong>$59 instead of $200+.</strong></p>',
          }],
        },
      ],
      gridStyle: gs16,
    }],
  },

  // ── 8. Features — Why This Pillow ───────────────────────────────────────────
  {
    id: nid('section-fc-features'),
    label: 'Features',
    style: {
      contentWidth: 'narrow',
      maxWidth: 800,
      paddingYSize: 's',
      backgroundColor: '#f8f8ff',
    },
    grids: [{
      cells: [
        {
          id: nid('cell-fc-featuresh'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-featuresh'),
            type: 'textBox',
            text: '<h2 style="color:#3730a8">Why This Pillow Stays Fluffy for Years</h2>',
          }],
        },
        {
          id: nid('cell-fc-featureslist'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-featureslist'),
            type: 'bulletList',
            bulletItems: [
              '✅ 100% Vegan Microfiber Fill — Feels like luxury down but machine washable',
              '✅ 300-Thread Count Cotton Shell — The exact specification used in luxury hotels',
              '✅ Sanforized Treatment — Pre-shrinks materials so your pillow maintains shape for years',
              '✅ Hypoallergenic & Dust Mite Resistant — Critical for hotels, perfect for your home',
            ],
          }],
        },
      ],
      gridStyle: gs16,
    }],
  },

  // ── 9. Reviews ──────────────────────────────────────────────────────────────
  {
    id: nid('section-fc-reviews'),
    label: 'Reviews',
    style: {
      contentWidth: 'narrow',
      maxWidth: 800,
      paddingYSize: 's',
      gridGap: 24,
    },
    grids: [
      // H2
      {
        cells: [{
          id: nid('cell-fc-revh'),
          width: 100,
          style: textCell(24),
          contents: [{
            id: nid('content-fc-revh'),
            type: 'textBox',
            text: '<h2 style="color:#3730a8">546,000+ Customers Say It Feels "Exactly Like Hotel Pillows"</h2>',
          }],
        }],
        gridStyle: gs0,
      },
      // Maria S.
      {
        cells: [
          {
            id: nid('cell-fc-rev1img'),
            width: 30,
            style: { ...imgCell(), alignItems: 'center' },
            contents: [{
              id: nid('content-fc-rev1img'),
              type: 'image',
              imageUrl: 'https://try.fluff.co/images/Rectangle-6197.avif',
              imageAlt: 'Maria S.',
              imageAspectRatio: 'square',
              imageObjectFit: 'cover',
              imageBorderRadius: 100,
            }],
          },
          {
            id: nid('cell-fc-rev1text'),
            width: 70,
            style: { ...textCell(0), alignItems: 'start' },
            contents: [
              {
                id: nid('content-fc-rev1star'),
                type: 'starRating',
                starValue: 5,
                starCount: 5,
                starFillColor: '#f59e0b',
                starSize: 16,
              },
              {
                id: nid('content-fc-rev1text'),
                type: 'textBox',
                text: '<p><strong>Maria S.</strong></p><p>"I thought neck pain was just part of aging. This pillow proved me wrong."</p>',
              },
            ],
          },
        ],
        gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0, columnGap: 16, paddingX: 24 },
      },
      // Jennifer R.
      {
        cells: [
          {
            id: nid('cell-fc-rev2img'),
            width: 30,
            style: { ...imgCell(), alignItems: 'center' },
            contents: [{
              id: nid('content-fc-rev2img'),
              type: 'image',
              imageUrl: 'https://try.fluff.co/images/Rectangle-6197_1.avif',
              imageAlt: 'Jennifer R.',
              imageAspectRatio: 'square',
              imageObjectFit: 'cover',
              imageBorderRadius: 100,
            }],
          },
          {
            id: nid('cell-fc-rev2text'),
            width: 70,
            style: { ...textCell(0), alignItems: 'start' },
            contents: [
              {
                id: nid('content-fc-rev2star'),
                type: 'starRating',
                starValue: 5,
                starCount: 5,
                starFillColor: '#f59e0b',
                starSize: 16,
              },
              {
                id: nid('content-fc-rev2text'),
                type: 'textBox',
                text: '<p><strong>Jennifer R.</strong></p><p>"Feels EXACTLY like my favorite hotel. Checked the tag thinking it must be the same manufacturer. At this price? Insane."</p>',
              },
            ],
          },
        ],
        gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0, columnGap: 16, paddingX: 24 },
      },
      // David L.
      {
        cells: [
          {
            id: nid('cell-fc-rev3img'),
            width: 30,
            style: { ...imgCell(), alignItems: 'center' },
            contents: [{
              id: nid('content-fc-rev3img'),
              type: 'image',
              imageUrl: 'https://try.fluff.co/images/Rectangle-6197_2.avif',
              imageAlt: 'David L.',
              imageAspectRatio: 'square',
              imageObjectFit: 'cover',
              imageBorderRadius: 100,
            }],
          },
          {
            id: nid('cell-fc-rev3text'),
            width: 70,
            style: { ...textCell(0), alignItems: 'start' },
            contents: [
              {
                id: nid('content-fc-rev3star'),
                type: 'starRating',
                starValue: 5,
                starCount: 5,
                starFillColor: '#f59e0b',
                starSize: 16,
              },
              {
                id: nid('content-fc-rev3text'),
                type: 'textBox',
                text: '<p><strong>David L.</strong></p><p>"Bought one. Wife stole it. Bought another. She stole that too. Just ordered 4 more."</p>',
              },
            ],
          },
        ],
        gridStyle: { backgroundColor: '', borderRadius: 0, gap: 0, columnGap: 16, paddingX: 24 },
      },
    ],
  },

  // ── 10. CTA Buy Box ─────────────────────────────────────────────────────────
  {
    id: nid('section-fc-cta'),
    label: 'CTA Buy Box',
    style: {
      contentWidth: 'narrow',
      maxWidth: 800,
      paddingYSize: 'm',
    },
    grids: [{
      cells: [
        // Row 1: star rating
        {
          id: nid('cell-fc-ctastar'),
          width: 100,
          style: { ...textCell(0), alignItems: 'center' },
          contents: [{
            id: nid('content-fc-ctastar'),
            type: 'starRating',
            starValue: 5,
            starCount: 5,
            starFillColor: '#f59e0b',
            starSize: 20,
            starLabel: '4988+ 5 Star Reviews',
            starLabelColor: '#1a1a1a',
          }],
        },
        // Row 2: product image
        {
          id: nid('cell-fc-ctaimg'),
          width: 100,
          style: { ...imgCell(), alignItems: 'center' },
          contents: [{
            id: nid('content-fc-ctaimg'),
            type: 'image',
            imageUrl: 'https://try.fluff.co/images/DownAlt_Pillow3-Photoroom-1.avif',
            imageAlt: 'FluffCo Pillow',
            imageMaxWidth: 66,
            imageAlign: 'center',
          }],
        },
        // Row 3: buy headline
        {
          id: nid('cell-fc-ctatext1'),
          width: 100,
          style: textCell(0),
          contents: [{
            id: nid('content-fc-ctatext1'),
            type: 'textBox',
            text: '<p style="text-align:center"><strong>Buy 5-Star Hotel Pillow &amp;</strong><br><span style="color:#dc2626"><strong>SAVE 66% Today</strong></span> while stock lasts!</p>',
          }],
        },
        // Row 4: trust bullets
        {
          id: nid('cell-fc-ctatext2'),
          width: 100,
          style: textCell(0),
          contents: [{
            id: nid('content-fc-ctatext2'),
            type: 'textBox',
            text: '<p>✅ 30-Day Money Back Guarantee<br>✅ Made in USA<br>✅ Won the Oprah sleep award</p>',
          }],
        },
        // Row 5: CTA button
        {
          id: nid('cell-fc-ctabtn'),
          width: 100,
          style: textCell(0),
          contents: [{
            id: nid('content-fc-ctabtn'),
            type: 'ctaButton',
            ctaText: 'GET 66% OFF FLUFFCO PILLOW NOW',
            ctaUrl: 'https://try.fluff.co/landing',
            ctaBackgroundColor: '#3730a8',
            ctaTextColor: '#ffffff',
            ctaBorderRadius: 8,
            ctaPaddingY: 18,
            ctaFontWeight: 700,
          }],
        },
      ],
      gridStyle: {
        backgroundColor: '#f8f8ff',
        borderRadius: 12,
        paddingX: 24,
        paddingY: 32,
        gap: 16,
      },
    }],
  },

  // ── 11. Footer ──────────────────────────────────────────────────────────────
  {
    id: nid('section-fc-footer'),
    label: 'Footer',
    style: {
      contentWidth: 'flood',
      paddingYSize: 's',
      backgroundColor: '#1a1a1a',
    },
    grids: [{
      cells: [{
        id: nid('cell-fc-footer'),
        width: 100,
        style: textCell(24),
        contents: [{
          id: nid('content-fc-footer'),
          type: 'footer',
          footerDisclaimer: 'THIS IS AN ADVERTISEMENT AND NOT AN ACTUAL NEWS ARTICLE...',
          footerCopyright: '© 2026 FluffCo. All rights reserved.',
          footerLinks: [
            { url: '#', label: 'Terms' },
            { url: '#', label: 'Privacy Policy' },
          ],
          footerTextColor: '#ffffff',
          footerLinkColor: '#ffffff',
        }],
      }],
      gridStyle: gs0,
    }],
  },
]

// ─── Insert ───────────────────────────────────────────────────────────────────
await sql`
  INSERT INTO presets (id, name, sections, created_at, updated_at)
  VALUES (
    4,
    'FluffCo - Sleep Awards Advertorial',
    ${JSON.stringify(sections)}::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        sections = EXCLUDED.sections,
        updated_at = NOW()
`

// ─── Confirm ──────────────────────────────────────────────────────────────────
const [row] = await sql`SELECT id, name, jsonb_array_length(sections) AS section_count FROM presets WHERE id = 4`
console.log(`\nInserted preset id=${row.id}: "${row.name}" — ${row.section_count} sections`)
console.log('Preview: /preview?id=4')
