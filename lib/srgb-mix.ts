// Pure-math sRGB linear mix (CSS `color-mix(in srgb, ...)` equivalent).
// Channels interpolate in 8-bit gamma-encoded sRGB space — same as the
// browser's default color-mix when "in srgb" is specified.
//
// Used for gradients.subtle.midStopHex derivation:
//   midStopHex = srgbMix(brandSubtle, 70, background)  (light surface)
//   midStopHex = srgbMix(brandSubtleDark, 70, backgroundDark)  (dark surface)
//
// Verified bit-equal vs Javvy + Solstice shipped midStopHex values. Diverges
// from colorjs.io by ≤1 byte at floating-point rounding boundaries (e.g.,
// when the linear mix lands at exactly N.5 in our integer math vs N.4999…
// in their 0..1-normalized math). Imperceptible visually; ship values are
// the source of truth. See scripts/_verify-srgb-mix.mjs.

/**
 * Mix two sRGB hex colors by linear interpolation in 8-bit gamma-encoded
 * channels.
 *
 *   percentA: weight of hexA in [0..100]. hexB gets the remainder.
 *
 * Examples (verified against shipped midStopHex):
 *   srgbMix('#E8E4F7', 70, '#FFFFFF') → '#EFECF9'  (Javvy)
 *   srgbMix('#FAEBE0', 70, '#FFFFFF') → '#FCF1E9'  (Solstice)
 */
export function srgbMix(
  hexA: string,
  percentA: number,
  hexB: string
): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };
  const [ra, ga, ba] = parse(hexA);
  const [rb, gb, bb] = parse(hexB);
  const t = percentA / 100;
  const r = Math.round(ra * t + rb * (1 - t));
  const g = Math.round(ga * t + gb * (1 - t));
  const b = Math.round(ba * t + bb * (1 - t));
  const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
