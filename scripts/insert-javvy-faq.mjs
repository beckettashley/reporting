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

const footerIdx = sections.findIndex(s => s.label === 'Footer')
if (footerIdx === -1) throw new Error('Footer section not found')

const now = Date.now()
const cell1Id = `cell-${now}-1`
const cell2Id = `cell-${now}-2`

const faqSection = {
  id: `section-${now}`,
  label: 'FAQ',
  style: {
    backgroundColor: '#ffffff',
    paddingYSize: 'l',
    contentWidth: 'contained',
  },
  grids: [{
    mobileColumns: 1,
    cells: [
      {
        id: cell1Id,
        width: 40,
        style: {
          backgroundColor: '',
          borderWidth: 0,
          borderRadius: 0,
          paddingX: 0,
          paddingTop: 16,
          paddingBottom: 0,
          paddingY: 0,
          alignItems: 'start',
        },
        contents: [{
          id: `${cell1Id}-text`,
          type: 'textBox',
          text: '<h2 style="font-weight:800;color:#1a1a1a;margin-bottom:16px">Frequently Asked Questions</h2><p style="color:#555555;font-size:16px">You got questions. We got answers.</p>',
        }],
      },
      {
        id: cell2Id,
        width: 60,
        style: {
          backgroundColor: '',
          borderWidth: 0,
          borderRadius: 0,
          paddingX: 0,
          paddingY: 0,
          alignItems: 'start',
        },
        contents: [{
          id: `${cell2Id}-accordion`,
          type: 'accordion',
          accordionQuestionTransform: 'uppercase',
          accordionBorderStyle: 'dashed',
          accordionBorderColor: '#cccccc',
          accordionQuestionSize: 13,
          accordionQuestionWeight: 700,
          accordionAnswerSize: 14,
          accordionAnswerColor: '#444444',
          accordionItems: [
            { question: "What is Protein Coffee?", answer: "Our Protein Coffee is quick-to-prepare coffee with added protein. It's the perfect blend to support your daily energy needs and overall wellness. We sourced the most premium instant coffee and matched it with an ultra-clean whey protein through our proprietary blending process.", defaultOpen: true },
            { question: "What are the benefits of whey protein?", answer: "Whey protein supports muscle recovery, helps you feel full longer, and provides essential amino acids your body needs to thrive." },
            { question: "How much caffeine is each serving?", answer: "Each serving contains 80mg of caffeine — the perfect balance to keep you energized without the jitters." },
            { question: "What is the benefit of a prebiotic in protein?", answer: "Prebiotics support a healthy gut microbiome, improve digestion, and help your body absorb nutrients more effectively." },
            { question: "What is goMCT?", answer: "goMCT is our premium medium-chain triglyceride blend that provides fast-acting, clean energy and supports mental clarity and focus." },
            { question: "Is there really no sugar added?", answer: "Correct — Javvy Protein Coffee contains less than 1g of sugar per serving with no added sugars or artificial sweeteners." },
            { question: "Is Protein Coffee dairy free?", answer: "Our standard formula contains whey protein which is derived from milk. We recommend checking the label if you have dairy sensitivities." },
            { question: "What is the shelf life of Protein Coffee?", answer: "Javvy Protein Coffee has a shelf life of 12 months when stored in a cool, dry place." },
            { question: "How many servings are in each bag?", answer: "Each bag contains 20 servings of Javvy Protein Coffee." },
            { question: "How should I prepare Protein Coffee?", answer: "Mix 1-2 scoops into 8-16oz of cold water or milk, stir or shake well, and enjoy. Add your favorite creamer or topping for extra flavor." },
            { question: "Can I drink Protein Coffee before or after a workout?", answer: "You can enjoy our Protein Coffee at any point during your day — whether before a workout or after. It works great either way!" },
            { question: "What if I don't like the taste?", answer: "We offer a 30-day money-back guarantee. If you're not satisfied for any reason, simply reach out and we'll make it right." },
            { question: "Can I make a one-time purchase without subscribing?", answer: "Yes — we offer both one-time purchase and subscription options. Subscribe & Save gives you 53% off your first order." },
            { question: "Do you offer samples?", answer: "Reach out to our support team to ask about sample availability in your region." },
          ],
        }],
      },
    ],
    rows: [{
      id: `row-${now}-1`,
      cellIds: [cell1Id, cell2Id],
      style: { backgroundColor: '', paddingY: 0, gap: 48 },
    }],
    gridStyle: { backgroundColor: '', borderRadius: 0, gap: 48 },
  }],
}

sections.splice(footerIdx, 0, faqSection)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
console.log('\nAFTER sections:')
after.sections.forEach((s, i) => console.log(`  ${i}: ${s.label}`))
