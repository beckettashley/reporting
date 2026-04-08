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

// Build a Media+Text clone for each listicle item
function makeItem(n, videoUrl, titleHtml, descHtml) {
  const t = Date.now() + n
  return {
    id: `section-listicle-${n}-${t}`,
    label: `Listicle Item ${n}`,
    style: { contentWidth: "narrow", paddingYSize: "m", backgroundColor: "" },
    grids: [{
      rows: [
        { id: `row1-${t}`, style: { gap: 24, paddingY: 0, backgroundColor: "" }, cellIds: [`cell-video-${t}`, `cell-title-${t}`] },
        { id: `row2-${t}`, style: { gap: 0,  paddingY: 0, backgroundColor: "" }, cellIds: [`cell-desc-${t}`] },
      ],
      cells: [
        {
          id: `cell-video-${t}`,
          width: 50, rowSpan: 2, mobileOrder: 1,
          style: { paddingX: 0, paddingY: 0, alignItems: "center", borderColor: "", borderStyle: "solid", borderWidth: 0, borderRadius: 12, shadowEnabled: false, backgroundColor: "" },
          contents: [{ id: `cnt-video-${t}`, type: "video", videoUrl, videoLoop: true, videoAutoplay: true, videoControls: false, videoAspectRatio: "square" }],
        },
        {
          id: `cell-title-${t}`,
          width: 50, mobileOrder: 0,
          style: { paddingX: 24, paddingY: 0, alignItems: "end", borderColor: "", borderStyle: "solid", borderWidth: 0, borderRadius: 0, shadowEnabled: false, backgroundColor: "" },
          contents: [{ id: `cnt-title-${t}`, type: "textBox", text: titleHtml }],
        },
        {
          id: `cell-desc-${t}`,
          width: 50, mobileOrder: 2,
          style: { paddingX: 24, paddingY: 0, alignItems: "start", borderColor: "", borderStyle: "solid", borderWidth: 0, borderRadius: 0, shadowEnabled: false, backgroundColor: "" },
          contents: [{ id: `cnt-desc-${t}`, type: "textBox", text: descHtml }],
        },
      ],
      gridStyle: { gap: 0, borderRadius: 0, backgroundColor: "" },
    }],
  }
}

const item1 = makeItem(1,
  "https://vz-318e2430-7a3.b-cdn.net/6bdd6b94-d2e7-4a48-b249-0f744f657a62/play_480p.mp4",
  "<h2>1. NEW innovative guilt-free formula designed to kick your body into shape</h2>",
  "<p>Javvy created the perfect iced Coffee that works for your body instead of against it. The combination of protein, coffee, and these key functional ingredients are essential to feeling your best, recovering faster, and boosting your youthfulness.*</p>"
)

const item2 = makeItem(2,
  "https://vz-318e2430-7a3.b-cdn.net/f4e9573e-2b2d-4839-a104-70a9c0b291f9/play_480p.mp4",
  "<h2>2. Beats the sugar cravings to keep you feeling satisfied</h2>",
  "<p>The balanced blend of protein and caffeine works to stabilize blood sugar and energy levels, preventing the sugar crashes that lead to cravings and overeating.</p>"
)

const item3 = makeItem(3,
  "https://vz-318e2430-7a3.b-cdn.net/04f846de-ddb0-49fe-a550-bb722e9a0c24/play_480p.mp4",
  "<h2><strong>3. It\u2019s your gut\u2019s new best friend thanks to prebiotics inside</strong></h2>",
  "<p>Support your gut health with this coffee crafted for wellness. The high protein, lack of artificial ingredients and <strong>added prebiotics</strong>, promote smoother digestion and a happy, healthy gut. It\u2019s a delicious way to show your digestive system some love.*<br><br></p><p><strong>\uD83D\uDC49 </strong><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" class=\"text-primary underline listicle-link\" href=\"https://try.javvycoffee.com/pc84\"><strong><u>Better Digestion Support Starts Here</u></strong></a></p>"
)

// New sections order:
// 0: Banner, 1: Article Header, 2: Comparison
// 3-5: new listicle items
// 6: Footer
// Drop old Listicle (section 3), old Footer (section 4), old Media+Text (section 5)
const newSections = [
  sections[0], // Banner
  sections[1], // Article Header
  sections[2], // Comparison
  item1,
  item2,
  item3,
  sections[4], // Footer
]

await sql`UPDATE presets SET sections = ${JSON.stringify(newSections)}::jsonb WHERE id = 1`
console.log('Done — sections updated:', newSections.map((s, i) => `${i}: ${s.label}`).join(', '))
