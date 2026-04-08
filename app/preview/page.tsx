import { neon } from "@neondatabase/serverless"
import { Section } from "@/types/grid"
import { PreviewCanvas } from "@/components/preview-canvas"

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  if (!id) return <div style={{ fontFamily: "sans-serif", padding: 24 }}>No preset ID provided</div>

  const sql = neon(process.env.DATABASE_URL!)
  const rows = await sql`SELECT name, sections FROM presets WHERE id = ${id}`
  if (!rows.length) return <div style={{ fontFamily: "sans-serif", padding: 24 }}>Preset not found</div>

  const { name, sections } = rows[0]

  return (
    <>
      <title>{name}</title>
      <style>{`body { background-color: #ffffff !important; }`}</style>
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
        <PreviewCanvas sections={sections as Section[]} />
      </div>
    </>
  )
}
