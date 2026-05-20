// Pure-math OKLab color-mix utility. No DOM, no canvas — runs identically in
// browser, server, and Node script. Reference: Björn Ottosson's OKLab formula
// and matrix coefficients (https://bottosson.github.io/posts/oklab/).
//
// Verified bit-for-bit against colorjs.io for Javvy + Solstice cta-family
// derivations. See scripts/_verify-oklab-mix.mjs.

type Oklab = readonly [L: number, a: number, b: number];

/** sRGB hex (3/6/8-digit, # optional) → OKLab tuple. Alpha is silently stripped. */
function hexToOklab(hex: string): Oklab {
  let h = hex.toLowerCase().replace(/^#/, "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length === 8) h = h.slice(0, 6);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  // sRGB → linear sRGB (gamma decode).
  const toLin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const rl = toLin(r), gl = toLin(g), bl = toLin(b);
  // Linear sRGB → LMS (Ottosson matrix).
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
  // LMS → cube root.
  const lp = Math.cbrt(l), mp = Math.cbrt(m), sp = Math.cbrt(s);
  // LMS cube root → OKLab.
  const L = 0.2104542553 * lp + 0.7936177850 * mp - 0.0040720468 * sp;
  const aa = 1.9779984951 * lp - 2.4285922050 * mp + 0.4505937099 * sp;
  const bb = 0.0259040371 * lp + 0.7827717662 * mp - 0.8086757660 * sp;
  return [L, aa, bb];
}

/** OKLab tuple → sRGB hex. Channels clamped to [0,1] before gamma encode. */
function oklabToHex([L, a, b]: Oklab): string {
  // OKLab → LMS cube root (inverse Ottosson matrix).
  const lp = L + 0.3963377774 * a + 0.2158037573 * b;
  const mp = L - 0.1055613458 * a - 0.0638541728 * b;
  const sp = L - 0.0894841775 * a - 1.2914855480 * b;
  // Cube to undo the cube root.
  const l = lp * lp * lp;
  const m = mp * mp * mp;
  const s = sp * sp * sp;
  // LMS → linear sRGB (inverse LMS matrix).
  const rl = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gl = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  // Linear sRGB → sRGB (gamma encode). Clamp before encoding to stay in gamut.
  const toSrgb = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };
  const r = Math.round(toSrgb(rl) * 255);
  const g = Math.round(toSrgb(gl) * 255);
  const bb = Math.round(toSrgb(bl) * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(bb)}`;
}

/**
 * Mix two sRGB hex colors in OKLab space.
 *
 * Equivalent to CSS `color-mix(in oklab, hexA percentA%, hexB)`.
 *   - percentA: weight of hexA in [0..100]
 *   - hexB weight is (100 - percentA)
 *
 * Examples:
 *   oklabMix('#FFD61E', 90, '#000000') → Javvy ctaBorder = '#DEBA19'
 *   oklabMix('#FFD61E', 85, '#DEBA19') → Javvy ctaHover  = '#FAD21D'
 */
export function oklabMix(
  hexA: string,
  percentA: number,
  hexB: string
): string {
  const [La, aa, ba] = hexToOklab(hexA);
  const [Lb, ab, bb] = hexToOklab(hexB);
  const t = percentA / 100;
  return oklabToHex([
    La * t + Lb * (1 - t),
    aa * t + ab * (1 - t),
    ba * t + bb * (1 - t),
  ]);
}
