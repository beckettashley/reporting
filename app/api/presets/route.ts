import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Normalize stored data: legacy format is Section[], new format is { pageStyle?, sections }
function normalizePreset(row: Record<string, unknown>) {
  const raw = row.sections
  const isLegacy = Array.isArray(raw)
  return {
    ...row,
    sections: isLegacy ? raw : (raw as { sections: unknown[] }).sections ?? [],
    pageStyle: isLegacy ? undefined : (raw as { pageStyle?: unknown }).pageStyle ?? undefined,
  }
}

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const rows = await sql`SELECT id, name, sections, created_at, updated_at FROM presets ORDER BY created_at ASC`
    return NextResponse.json(rows.map(normalizePreset))
  } catch (err) {
    return NextResponse.json({ error: "Failed to load presets" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, sections, pageStyle } = await req.json()
    if (!name || !sections) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    const sql = neon(process.env.DATABASE_URL!)
    const payload = pageStyle ? { pageStyle, sections } : sections
    const rows = await sql`
      INSERT INTO presets (name, sections)
      VALUES (${name}, ${JSON.stringify(payload)})
      ON CONFLICT (name) DO UPDATE SET sections = EXCLUDED.sections, updated_at = NOW()
      RETURNING *
    `
    return NextResponse.json(normalizePreset(rows[0]))
  } catch (err) {
    return NextResponse.json({ error: "Failed to save preset" }, { status: 500 })
  }
}
