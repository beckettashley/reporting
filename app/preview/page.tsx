import type { Metadata } from "next"
import { neon } from "@neondatabase/serverless"
import { Section, PageStyle } from "@/types/grid"
import { PreviewCanvas } from "@/components/preview-canvas"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}): Promise<Metadata> {
  const { id } = await searchParams
  if (!id) return { title: "Preview" }

  const sql = neon(process.env.DATABASE_URL!)
  const rows = await sql`SELECT name FROM presets WHERE id = ${id}`
  if (!rows.length) return { title: "Preset not found" }

  return { title: rows[0].name }
}

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

  const raw = rows[0]
  const isLegacy = Array.isArray(raw.sections)
  const sections = isLegacy ? raw.sections : (raw.sections as { sections: unknown[] }).sections ?? []
  const pageStyle = isLegacy ? undefined : (raw.sections as { pageStyle?: PageStyle }).pageStyle ?? undefined

  return (
    <>
      <style>{`body { background-color: #ffffff !important; }`}</style>
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
        <PreviewCanvas sections={sections as Section[]} pageStyle={pageStyle} />
      </div>
    </>
  )
}
