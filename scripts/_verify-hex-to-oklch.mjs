// Verification: hexToOklch (our inline implementation) vs colorjs.io reference.
//
// Runs both implementations over Javvy + Solstice primitives and prints a table
// of (hex, ours, theirs, deltas).
//
// MIRRORED from github.com/beckettashley/component-demo/scripts/_verify-hex-to-oklch.mjs
// as of commit 1b73a46 (2026-05-19). Theme-load paths updated for this repo's
// vendored schema layout (lib/theme-schema/themes/). The inline hexToOklch
// implementation here must stay in lockstep with lib/hex-to-oklch.ts — if
// either changes, sync the other and re-run this verification.
//
// Usage: node scripts/_verify-hex-to-oklch.mjs
// Requires: colorjs.io (devDependency).

import Color from 'colorjs.io'
import { readFileSync } from 'fs'

// ─── hexToOklch (inline; must match lib/hex-to-oklch.ts byte-for-byte) ──────

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
 */
export function hexToOklch(hex) {
  if (!hex || typeof hex !== 'string') {
    throw new Error(`hexToOklch: invalid input (expected non-empty string, got ${typeof hex})`)
  }
  const trimmed = hex.trim()
  // Idempotent pass-through if already oklch.
  if (trimmed.toLowerCase().startsWith('oklch(')) return trimmed
  let h = trimmed.toLowerCase().replace(/^#/, '')
  // Expand 3-digit shorthand.
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  }
  // Strip alpha if present.
  if (h.length === 8) {
    if (h.slice(6) !== 'ff') {
      console.warn(`hexToOklch: stripping non-opaque alpha (0x${h.slice(6)}) from '${hex}'`)
    }
    h = h.slice(0, 6)
  }
  if (!/^[0-9a-f]{6}$/.test(h)) {
    throw new Error(`hexToOklch: invalid hex input '${hex}'`)
  }
  // sRGB hex → normalized [0,1].
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  // sRGB gamma decode → linear sRGB.
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const rl = toLin(r), gl = toLin(g), bl = toLin(b)
  // Linear sRGB → OKLab. Matrix coefficients per Björn Ottosson's published
  // OKLab formula (https://bottosson.github.io/posts/oklab/).
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl
  const lp = Math.cbrt(l), mp = Math.cbrt(m), sp = Math.cbrt(s)
  const L = 0.2104542553 * lp + 0.7936177850 * mp - 0.0040720468 * sp
  const aa = 1.9779984951 * lp - 2.4285922050 * mp + 0.4505937099 * sp
  const bb = 0.0259040371 * lp + 0.7827717662 * mp - 0.8086757660 * sp
  // OKLab → OKLCH (Cartesian → polar).
  const C = Math.sqrt(aa * aa + bb * bb)
  let H = Math.atan2(bb, aa) * 180 / Math.PI
  if (H < 0) H += 360
  // Format. Trim trailing zeros via Number() round-trip.
  const fmt = (n, d = 3) => Number(n.toFixed(d)).toString()
  // Treat near-zero chroma as gray (H is undefined for neutrals — shadcn
  // pattern uses 0 in that slot).
  if (C < 0.0001) {
    return `oklch(${fmt(L)} 0 0)`
  }
  return `oklch(${fmt(L)} ${fmt(C)} ${fmt(H)})`
}

// ─── Reference: colorjs.io ───────────────────────────────────────────────────

function refOklch(hex) {
  // colorjs.io's `to('oklch')` returns coords [L, C, H]. H is NaN for neutrals.
  const c = new Color(hex.startsWith('#') ? hex : '#' + hex).to('oklch')
  const [L, C, H] = c.coords
  const fmt = (n, d = 3) => Number(n.toFixed(d)).toString()
  // Match our formatter's neutral handling.
  if (!Number.isFinite(H) || C < 0.0001) {
    return `oklch(${fmt(L)} 0 0)`
  }
  // Normalize H to [0, 360).
  const Hnorm = ((H % 360) + 360) % 360
  return `oklch(${fmt(L)} ${fmt(C)} ${fmt(Hnorm)})`
}

// ─── Load theme primitives ──────────────────────────────────────────────────

function loadPrimitives(themePath) {
  const json = JSON.parse(readFileSync(themePath, 'utf8'))
  return json.colors?.primitives ?? {}
}

const javvy = loadPrimitives('lib/theme-schema/themes/javvy.json')
const solstice = loadPrimitives('lib/theme-schema/themes/solstice.json')

// ─── Cross-check ─────────────────────────────────────────────────────────────

function parseOklch(str) {
  const m = str.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function delta(ours, theirs) {
  const a = parseOklch(ours)
  const b = parseOklch(theirs)
  if (!a || !b) return { L: 'n/a', C: 'n/a', H: 'n/a' }
  return {
    L: (a[0] - b[0]).toFixed(4),
    C: (a[1] - b[1]).toFixed(4),
    H: (a[2] - b[2]).toFixed(2),
  }
}

function audit(themeName, primitives) {
  console.log(`\n# ${themeName} primitives — ours vs colorjs.io\n`)
  const rows = []
  let maxDeltaL = 0, maxDeltaC = 0, maxDeltaH = 0
  for (const [name, hex] of Object.entries(primitives)) {
    const ours = hexToOklch(hex)
    const theirs = refOklch(hex)
    const d = delta(ours, theirs)
    maxDeltaL = Math.max(maxDeltaL, Math.abs(Number(d.L) || 0))
    maxDeltaC = Math.max(maxDeltaC, Math.abs(Number(d.C) || 0))
    maxDeltaH = Math.max(maxDeltaH, Math.abs(Number(d.H) || 0))
    rows.push({ name, hex, ours, theirs, dL: d.L, dC: d.C, dH: d.H })
  }
  const col = (s, w) => String(s).padEnd(w)
  console.log(col('Primitive', 22), col('Hex', 9), col('Ours', 32), col('colorjs.io', 32), col('ΔL', 9), col('ΔC', 9), 'ΔH')
  console.log('-'.repeat(135))
  for (const r of rows) {
    console.log(col(r.name, 22), col(r.hex, 9), col(r.ours, 32), col(r.theirs, 32), col(r.dL, 9), col(r.dC, 9), r.dH)
  }
  console.log(`\nMax abs deltas: ΔL=${maxDeltaL.toFixed(4)}, ΔC=${maxDeltaC.toFixed(4)}, ΔH=${maxDeltaH.toFixed(2)}°`)
  // Tolerance: 3 decimal places of precision means deltas should be < 0.0005 for L/C
  // (last rounded digit) and < 0.5° for H. Stricter tolerance fails the audit.
  const passL = maxDeltaL < 0.001
  const passC = maxDeltaC < 0.001
  const passH = maxDeltaH < 0.5
  console.log(`Result: ΔL ${passL ? 'PASS' : 'FAIL'} (< 0.001), ΔC ${passC ? 'PASS' : 'FAIL'} (< 0.001), ΔH ${passH ? 'PASS' : 'FAIL'} (< 0.5°)`)
}

// ─── Sanity anchors ──────────────────────────────────────────────────────────

console.log('# Sanity anchors\n')
const anchors = [
  ['#FFFFFF', 'white (paper)'],
  ['#000000', 'black'],
  ['#808080', 'mid-grey'],
]
for (const [hex, label] of anchors) {
  console.log(`  ${hex} (${label}): ours=${hexToOklch(hex)}  theirs=${refOklch(hex)}`)
}

audit('Javvy', javvy)
audit('Solstice', solstice)

// Test edge cases
console.log('\n# Edge case tests\n')
const tests = [
  ['#F00', 'oklch(...)', '3-digit expansion'],
  ['F00', 'oklch(...)', '3-digit without #'],
  ['#ffd61e', 'oklch(...)', 'lowercase'],
  ['#FFD61EFF', 'oklch(...)', '8-digit with FF alpha'],
  ['oklch(0.5 0.1 50)', 'oklch(0.5 0.1 50)', 'idempotent pass-through'],
]
for (const [input, expectPattern, desc] of tests) {
  try {
    const out = hexToOklch(input)
    const matches = expectPattern === 'oklch(...)' ? out.startsWith('oklch(') : out === expectPattern
    console.log(`  ${desc}: input='${input}' → '${out}' [${matches ? 'PASS' : 'FAIL'}]`)
  } catch (e) {
    console.log(`  ${desc}: input='${input}' → THROW: ${e.message}`)
  }
}

console.log('\n# Throw tests (should throw)\n')
const throwTests = [
  ['', 'empty string'],
  [null, 'null'],
  [undefined, 'undefined'],
  ['#XYZ123', 'invalid hex characters'],
  ['#12', 'too short'],
]
for (const [input, desc] of throwTests) {
  try {
    const out = hexToOklch(input)
    console.log(`  ${desc}: input=${JSON.stringify(input)} → '${out}' [FAIL — should have thrown]`)
  } catch (e) {
    console.log(`  ${desc}: input=${JSON.stringify(input)} → THROW [PASS]: ${e.message}`)
  }
}
