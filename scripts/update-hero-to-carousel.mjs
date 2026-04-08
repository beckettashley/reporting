/**
 * Update Hero section to use carousel instead of image
 */

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

try {
  // Fetch preset ID 1
  const presets = await sql`SELECT * FROM presets WHERE id = 1`

  if (presets.length === 0) {
    console.log('No preset found with id=1')
    process.exit(1)
  }

  const preset = presets[0]
  let sections = preset.sections

  // Find Hero section
  const heroIndex = sections.findIndex(s => s.id === 'section-hero-1775590718389')

  if (heroIndex === -1) {
    console.log('Hero section not found')
    process.exit(1)
  }

  const hero = sections[heroIndex]

  // Find the image content in cell 0
  const cell0 = hero.grids[0]?.cells[0]
  if (!cell0) {
    console.log('Cell 0 not found in Hero section')
    process.exit(1)
  }

  const imageContent = cell0.contents.find(c => c.type === 'image')
  if (!imageContent) {
    console.log('Image content not found in Hero cell 0')
    process.exit(1)
  }

  console.log('Current image URL:', imageContent.imageUrl)

  // Convert to carousel
  const carouselContent = {
    id: imageContent.id,
    type: 'carousel',
    carouselImages: [
      {
        url: imageContent.imageUrl || 'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1765976438/pc-pdp1_j5fxpw.png',
        alt: imageContent.imageAlt || 'Javvy Protein Coffee',
      },
      {
        url: 'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1765976438/pc-pdp1_j5fxpw.png',
        alt: 'Javvy Protein Coffee - Slide 2',
      },
      {
        url: 'https://res.cloudinary.com/dqxw76yvk/image/upload/q_auto,f_auto/v1765976438/pc-pdp1_j5fxpw.png',
        alt: 'Javvy Protein Coffee - Slide 3',
      },
    ],
    carouselBorderRadius: 6,
    carouselShowThumbnails: true,
    carouselAutoplay: false,
    carouselAutoplayInterval: 5000,
    carouselThumbnailSize: 60,
    carouselThumbnailGap: 8,
  }

  // Replace image content with carousel content
  const imageIndex = cell0.contents.findIndex(c => c.type === 'image')
  cell0.contents[imageIndex] = carouselContent

  // Update the database
  await sql`
    UPDATE presets
    SET sections = ${JSON.stringify(sections)}
    WHERE id = 1
  `

  console.log('\n✓ Updated Hero section to use carousel')
  console.log('  - Border radius: 6px')
  console.log('  - Thumbnails: enabled')
  console.log('  - Number of slides:', carouselContent.carouselImages.length)

} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
