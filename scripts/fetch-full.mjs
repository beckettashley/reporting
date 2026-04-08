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

// Show listicle section (3) and media+text section (5) in full
const listicle = sections[3]
const mediaText = sections[5]

console.log('=== LISTICLE (section 3) ===')
listicle.grids[0].cells.forEach((c, i) => {
  console.log(`Cell ${i} (width=${c.width}, mobileOrder=${c.mobileOrder}):`)
  c.contents.forEach(ct => {
    if (ct.type === 'textBox') console.log('  textBox:', ct.text)
    else if (ct.type === 'video') console.log('  video:', ct.videoUrl, 'autoplay=', ct.videoAutoplay, 'loop=', ct.videoLoop)
    else console.log(' ', ct.type)
  })
  console.log('  style:', JSON.stringify(c.style))
})

console.log('\n=== MEDIA+TEXT TEMPLATE (section 5) ===')
console.log(JSON.stringify(mediaText, null, 2))
