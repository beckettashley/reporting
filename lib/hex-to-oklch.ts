// MIRRORED from github.com/beckettashley/component-demo/lib/color-tokens.ts
// lines 52-94 as of commit 1b73a46 (2026-05-19). Sync rule: if the source
// implementation changes, update here and re-run
// scripts/_verify-hex-to-oklch.mjs to confirm continued bit-for-bit parity
// against colorjs.io.

/**
 * Convert sRGB hex color to OKLCH string format.
 *
 * Input forms accepted:
 *   - 6-digit hex: '#FFD61E' / 'FFD61E' / 'ffd61e'
 *   - 3-digit hex (expanded internally): '#F00' / 'f00'
 *   - 8-digit hex with alpha: '#FFD61EFF' (alpha stripped; warns if not FF)
 *   - oklch(...) already (idempotent pass-through)
 *
 * Output: `oklch(L C H)` string. Precision: 3 decimals for L and C, up to 3
 * for H. Neutral grays (C ≈ 0) emit `oklch(L 0 0)` with H = 0 (shadcn pattern).
 *
 * Throws on invalid input — fail loudly at theme-emission boundary, not
 * silently produce invalid CSS.
 *
 * Verified bit-for-bit against colorjs.io across Javvy + Solstice primitives
 * (32 colors). See scripts/_verify-hex-to-oklch.mjs.
 */
export function hexToOklch(hex: string): string {
  if (!hex || typeof hex !== 'string') {
    throw new Error(`hexToOklch: invalid input (expected non-empty string, got ${typeof hex})`)
  }
  const trimmed = hex.trim()
  if (trimmed.toLowerCase().startsWith('oklch(')) return trimmed
  let h = trimmed.toLowerCase().replace(/^#/, '')
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  }
  if (h.length === 8) {
    if (h.slice(6) !== 'ff') {
      console.warn(`hexToOklch: stripping non-opaque alpha (0x${h.slice(6)}) from '${hex}'`)
    }
    h = h.slice(0, 6)
  }
  if (!/^[0-9a-f]{6}$/.test(h)) {
    throw new Error(`hexToOklch: invalid hex input '${hex}'`)
  }
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  // sRGB gamma decode → linear sRGB.
  const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const rl = toLin(r), gl = toLin(g), bl = toLin(b)
  // Linear sRGB → OKLab. Matrix per Björn Ottosson's published OKLab formula
  // (https://bottosson.github.io/posts/oklab/).
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl
  const lp = Math.cbrt(l), mp = Math.cbrt(m), sp = Math.cbrt(s)
  const L = 0.2104542553 * lp + 0.7936177850 * mp - 0.0040720468 * sp
  const aa = 1.9779984951 * lp - 2.4285922050 * mp + 0.4505937099 * sp
  const bb = 0.0259040371 * lp + 0.7827717662 * mp - 0.8086757660 * sp
  const C = Math.sqrt(aa * aa + bb * bb)
  let H = Math.atan2(bb, aa) * 180 / Math.PI
  if (H < 0) H += 360
  const fmt = (n: number, d = 3) => Number(n.toFixed(d)).toString()
  if (C < 0.0001) {
    return `oklch(${fmt(L)} 0 0)`
  }
  return `oklch(${fmt(L)} ${fmt(C)} ${fmt(H)})`
}
