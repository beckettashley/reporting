// Verification: deepen (our pure-math implementation) vs colorjs.io reference.
//
// Mirrors lib/oklab-deepen.ts byte-for-byte (inline copy). Tests cta-family
// derivations under the "10% deeper" formula for Javvy + Solstice, including
// the chained ctaBorderHover (which goes through hex round-trip at each step,
// matching the runtime cascade through React state).
//
// Usage: node scripts/_verify-derivations.mjs
// Requires: colorjs.io (devDependency).

import Color from "colorjs.io";

// ─── Inline mirror of lib/oklab-deepen.ts (must match byte-for-byte) ────────

function hexToOklab(hex) {
  let h = hex.toLowerCase().replace(/^#/, "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length === 8) h = h.slice(0, 6);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLin = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const rl = toLin(r), gl = toLin(g), bl = toLin(b);
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
  const lp = Math.cbrt(l), mp = Math.cbrt(m), sp = Math.cbrt(s);
  const L = 0.2104542553 * lp + 0.7936177850 * mp - 0.0040720468 * sp;
  const aa = 1.9779984951 * lp - 2.4285922050 * mp + 0.4505937099 * sp;
  const bb = 0.0259040371 * lp + 0.7827717662 * mp - 0.8086757660 * sp;
  return [L, aa, bb];
}

function oklabToHex([L, a, b]) {
  const lp = L + 0.3963377774 * a + 0.2158037573 * b;
  const mp = L - 0.1055613458 * a - 0.0638541728 * b;
  const sp = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = lp * lp * lp;
  const m = mp * mp * mp;
  const s = sp * sp * sp;
  const rl = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gl = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  const toSrgb = (c) => {
    const clamped = Math.max(0, Math.min(1, c));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };
  const r = Math.round(toSrgb(rl) * 255);
  const g = Math.round(toSrgb(gl) * 255);
  const bb = Math.round(toSrgb(bl) * 255);
  const toHex = (n) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(bb)}`;
}

function deepen(hex, delta) {
  const [L, a, b] = hexToOklab(hex);
  return oklabToHex([L - delta, a, b]);
}

// ─── Reference: colorjs.io ──────────────────────────────────────────────────

function deepenRef(hex, delta) {
  const c = new Color(hex).to("oklab");
  const newColor = new Color("oklab", [
    c.coords[0] - delta,
    c.coords[1],
    c.coords[2],
  ]);
  // toString({ format: 'hex' }) returns lowercase #rrggbb with channel
  // clipping (matches our oklabToHex behavior).
  return newColor.toString({ format: "hex" }).toUpperCase();
}

// ─── Comparison helpers ─────────────────────────────────────────────────────

function parseHex(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbDelta(hexA, hexB) {
  const [ra, ga, ba] = parseHex(hexA);
  const [rb, gb, bb] = parseHex(hexB);
  return [ra - rb, ga - gb, ba - bb];
}

const maxAbs = (arr) => Math.max(...arr.map(Math.abs));
const pad = (s, w) => String(s).padEnd(w);

// ─── cta family chains (mirrors runtime useEffect cascade) ─────────────────

console.log("# CTA family derivations — deepen(δ=0.1) formula\n");
console.log("Each chain walks: cta → ctaBorder (== ctaHover) → ctaBorderHover");
console.log("via hex round-trip at each step (matches runtime React state).\n");

const chains = [
  {
    brand: "Javvy",
    cta: "#FFD61E",
    oldCtaBorder: "#DEBA19",
    oldCtaHover: "#FAD21D",
  },
  {
    brand: "Solstice",
    cta: "#FFB347",
    oldCtaBorder: "#DE9B3D",
    oldCtaHover: "#FAAF45",
  },
];

console.log(
  pad("Brand", 10) +
    pad("Step", 16) +
    pad("Ours", 10) +
    pad("colorjs.io", 12) +
    pad("Δ ours-ref", 12) +
    pad("Old ship", 10) +
    "Δ ours-old"
);
console.log("-".repeat(90));

let maxOursVsRef = 0;
let allRefBitEqual = true;
const computedValues = {};

for (const chain of chains) {
  // Step 1: ctaBorder = deepen(cta, 0.1). ctaHover uses the same formula → equal hex.
  const ctaBorder = deepen(chain.cta, 0.1);
  const ctaBorderRef = deepenRef(chain.cta, 0.1);
  const dRef1 = rgbDelta(ctaBorder, ctaBorderRef);
  maxOursVsRef = Math.max(maxOursVsRef, maxAbs(dRef1));
  if (ctaBorder !== ctaBorderRef) allRefBitEqual = false;
  const dOldBorder = rgbDelta(ctaBorder, chain.oldCtaBorder);
  const dOldHover = rgbDelta(ctaBorder, chain.oldCtaHover);

  // Step 2: ctaBorderHover = deepen(ctaHover, 0.1). Since ctaHover === ctaBorder,
  // chain through ctaBorder's hex. Each side uses its OWN intermediate to test
  // independent bit-equality at step 2.
  const ctaBorderHover = deepen(ctaBorder, 0.1);
  const ctaBorderHoverRef = deepenRef(ctaBorderRef, 0.1);
  const dRef2 = rgbDelta(ctaBorderHover, ctaBorderHoverRef);
  maxOursVsRef = Math.max(maxOursVsRef, maxAbs(dRef2));
  if (ctaBorderHover !== ctaBorderHoverRef) allRefBitEqual = false;

  // Rows
  console.log(
    pad(chain.brand, 10) +
      pad("ctaBorder", 16) +
      pad(ctaBorder, 10) +
      pad(ctaBorderRef, 12) +
      pad(dRef1.join(","), 12) +
      pad(chain.oldCtaBorder, 10) +
      dOldBorder.join(",")
  );
  console.log(
    pad(chain.brand, 10) +
      pad("ctaHover", 16) +
      pad(ctaBorder, 10) +
      pad(ctaBorderRef, 12) +
      pad(dRef1.join(","), 12) +
      pad(chain.oldCtaHover, 10) +
      dOldHover.join(",") +
      "   (= ctaBorder by formula)"
  );
  console.log(
    pad(chain.brand, 10) +
      pad("ctaBorderHover", 16) +
      pad(ctaBorderHover, 10) +
      pad(ctaBorderHoverRef, 12) +
      pad(dRef2.join(","), 12) +
      pad("n/a", 10) +
      "n/a       (new role)"
  );
  console.log("");

  computedValues[chain.brand] = {
    cta: chain.cta,
    ctaBorder,
    ctaHover: ctaBorder, // by formula
    ctaBorderHover,
  };
}

// ─── Transparency check: deepen Solstice primary (#D97A3E) ─────────────────

console.log("# Transparency check: deepen(#D97A3E, 0.1)\n");
console.log("(Per your earlier message — #D97A3E is Solstice primary, not its cta.");
console.log("This confirms it's a different chain entirely from #FFB347 → ctaBorder.)\n");
const solsticePrim = "#D97A3E";
const solsticePrimDeep = deepen(solsticePrim, 0.1);
const solsticePrimDeepRef = deepenRef(solsticePrim, 0.1);
const dPrim = rgbDelta(solsticePrimDeep, solsticePrimDeepRef);
maxOursVsRef = Math.max(maxOursVsRef, maxAbs(dPrim));
if (solsticePrimDeep !== solsticePrimDeepRef) allRefBitEqual = false;
console.log(
  `  deepen(${solsticePrim}, 0.1):  ours=${solsticePrimDeep}  colorjs.io=${solsticePrimDeepRef}  Δ=${dPrim.join(",")}`
);
console.log(
  `  Δ vs Solstice old ctaBorder (#DE9B3D):  ${rgbDelta(solsticePrimDeep, "#DE9B3D").join(",")}  (expected non-zero — different source color)`
);

// ─── Summary ────────────────────────────────────────────────────────────────

console.log("\n# Summary\n");
console.log(`  Max abs RGB delta vs colorjs.io: ${maxOursVsRef}`);
console.log(
  `  Bit-equality vs colorjs.io:      ${allRefBitEqual ? "ALL PASS" : "MISMATCH"}`
);

console.log("\n# Computed values for JSON update (pending sign-off)\n");
for (const [brand, vals] of Object.entries(computedValues)) {
  console.log(`  ${brand}:`);
  console.log(`    cta:            ${vals.cta}     (unchanged)`);
  console.log(`    ctaBorder:      ${vals.ctaBorder}`);
  console.log(`    ctaHover:       ${vals.ctaHover}     (= ctaBorder)`);
  console.log(`    ctaBorderHover: ${vals.ctaBorderHover}     (new role)`);
  console.log("");
}
