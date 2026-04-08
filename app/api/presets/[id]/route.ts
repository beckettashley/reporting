import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    await sql`DELETE FROM presets WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete preset" }, { status: 500 })
  }
}
