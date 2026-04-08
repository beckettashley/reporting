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

console.log('=== BEFORE — section labels ===')
sections.forEach((s, i) => console.log(`  [${i}] ${s.label}`))

const now = Date.now()
const cellId  = `cell-javvy-comparison-${now}`
const rowId   = `row-javvy-comparison-${now}`
const textId  = `content-javvy-comparison-text-${now}`
const tableId = `content-javvy-comparison-table-${now}`

const newSection = {
  id: `section-javvy-comparison-${now}`,
  label: "Product Comparison",
  style: {
    backgroundColor: "#fff8f0",
    paddingYSize: "m",
    maxWidth: 946,
    contentWidth: "narrow",
  },
  grids: [
    {
      cells: [
        {
          id: `cell-javvy-comparison-heading-${now}`,
          width: 100,
          contents: [
            {
              id: textId,
              type: "textBox",
              text: '<h2 style="font-weight:800;text-align:center;color:#1a1a1a">Cheaper, Healthier, More Nutritious</h2>',
            },
          ],
          style: {
            backgroundColor: "",
            borderColor: "",
            borderWidth: 0,
            borderRadius: 0,
            borderStyle: "solid",
            paddingX: 0,
            paddingY: 0,
            alignItems: "center",
          },
        },
      ],
      rows: [
        {
          id: `row-javvy-comparison-heading-${now}`,
          cellIds: [`cell-javvy-comparison-heading-${now}`],
          style: { backgroundColor: "", paddingY: 0, gap: 0 },
        },
      ],
      gridStyle: { backgroundColor: "", borderRadius: 0, gap: 16 },
    },
    {
      cells: [
        {
          id: cellId,
          width: 100,
          contents: [
            {
              id: tableId,
              type: "productComparison",
              productComparisonProducts: [
                {
                  logo: "https://assets.javvycoffee.com/673f5ae58cfb1d06dd96a4e3_javvy-blu.svg",
                  name: "Javvy",
                  color: "#e8f4ff",
                  headerTextColor: "#1a1a1a",
                  headerBackgroundColor: "transparent",
                },
                {
                  name: "Grande Coffee*",
                  headerImage: "https://assets.javvycoffee.com/670f510930325ed83a26ae83_grande-coffee.webp",
                  headerImageHeight: 36,
                  headerTextColor: "#1a1a1a",
                  headerBackgroundColor: "transparent",
                },
                {
                  name: "Protein Shake**",
                  headerImage: "https://assets.javvycoffee.com/681a555fcd797cee40fb7a7f_protein-shake.png",
                  headerImageHeight: 36,
                  headerTextColor: "#1a1a1a",
                  headerBackgroundColor: "transparent",
                },
              ],
              productComparisonMetrics: [
                { label: "PRICE PER SERVING", values: ["$1.95", "$8.00", "$5.00"] },
                { label: "CALORIES",          values: ["65 cal", "237cal", "160 cal"] },
                { label: "SUGAR",             values: ["<1g", "30.9g", "1g"] },
                { label: "PROTEIN",           values: ["20g in 2 scoops", "2g", "30g"] },
                { label: "CAFFEINE",          values: ["80mg", "133mg", "0mg"] },
                { label: "PREBIOTICS",        values: ["✅", "❌", "Sometimes"] },
                { label: "MCTs",              values: ["✅", "❌", "❌"] },
              ],
              productComparisonHighlightColor:       "#e8f4ff",
              productComparisonHighlightBorderColor: "#7dd9d9",
              productComparisonValueColorOther:      "#dc2626",
              productComparisonLabelStyle:           "uppercase",
              productComparisonFootnote:             "*based on 16oz Starbucks Iced Caffè Mocha; **based on 11oz Premium Protein chocolate protein shake",
            },
          ],
          style: {
            backgroundColor: "",
            borderColor: "",
            borderWidth: 0,
            borderRadius: 0,
            borderStyle: "solid",
            paddingX: 16,
            paddingY: 16,
            alignItems: "start",
          },
        },
      ],
      rows: [
        {
          id: rowId,
          cellIds: [cellId],
          style: { backgroundColor: "", paddingY: 0, gap: 0 },
        },
      ],
      gridStyle: { backgroundColor: "", borderRadius: 0, gap: 16 },
    },
  ],
}

// Insert after "Article Header" (index 1), before current "Comparison" (index 2)
sections.splice(2, 0, newSection)

await sql`UPDATE presets SET sections = ${JSON.stringify(sections)}::jsonb WHERE id = 1`

const [after] = await sql`SELECT sections FROM presets WHERE id = 1`
console.log('\n=== AFTER — section labels ===')
after.sections.forEach((s, i) => console.log(`  [${i}] ${s.label}`))
console.log('\nDone. Section id:', newSection.id)
