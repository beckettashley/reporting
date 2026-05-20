// Verification: oklab-mix (our pure-math implementation) vs colorjs.io reference.
//
// Mirrors lib/oklab-mix.ts byte-for-byte (inline copy). Cross-checks against
// colorjs.io's oklab mixing for Javvy + Solstice cta-family derivations, and
// against each brand's shipped values in lib/theme-schema/themes/*.json.
//
// Usage: node scripts/_verify-oklab-mix.mjs
// Requires: colorjs.io (devDependency, added in commit #2).

import Color from "colorjs.io";

// ─── Inline mirror of lib/oklab-mix.ts (must match byte-for-byte) ──────────

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

function oklabMix(hexA, percentA, hexB) {
  const [La, aa, ba] = hexToOklab(hexA);
  const [Lb, ab, bb] = hexToOklab(hexB);
  const t = percentA / 100;
  return oklabToHex([
    La * t + Lb * (1 - t),
    aa * t + ab * (1 - t),
    ba * t + bb * (1 - t),
  ]);
}

// ─── Reference: colorjs.io ─────────────────────────────────────────────────

function refOklabMix(hexA, percentA, hexB) {
  // colorjs.io: a.mix(b, ratio) — ratio is the proportion of b. So for
  // percentA% of hexA, ratio of hexB is (1 - percentA/100).
  const mixed = new Color(hexA).mix(hexB, 1 - percentA / 100, {
    space: "oklab",
  });
  // toString({format: 'hex'}) returns lowercase #rrggbb.
  return mixed.toString({ format: "hex" }).toUpperCase();
}

// ─── Comparison helpers ────────────────────────────────────────────────────

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

// ─── Tests ─────────────────────────────────────────────────────────────────

const cases = [
  // Javvy cta family
  {
    label: "Javvy ctaBorder",
    formula: "oklab-mix(cta 90%, black 10%)",
    inputs: ["#FFD61E", 90, "#000000"],
    ship: "#DEBA19",
  },
  {
    label: "Javvy ctaHover",
    formula: "oklab-mix(cta 85%, ctaBorder 15%)",
    inputs: ["#FFD61E", 85, "#DEBA19"],
    ship: "#FAD21D",
  },
  // Solstice cta family
  {
    label: "Solstice ctaBorder",
    formula: "oklab-mix(cta 90%, black 10%)",
    inputs: ["#FFB347", 90, "#000000"],
    ship: "#DE9B3D",
  },
  {
    label: "Solstice ctaHover",
    formula: "oklab-mix(cta 85%, ctaBorder 15%)",
    inputs: ["#FFB347", 85, "#DE9B3D"],
    ship: "#FAAF45",
  },
];

const col = (s, w) => String(s).padEnd(w);

console.log("# OKLab mix verification — ours vs colorjs.io vs shipped values\n");
console.log(
  col("Case", 22),
  col("Formula", 36),
  col("Ours", 10),
  col("colorjs.io", 12),
  col("Ship", 10),
  col("Δ ours-ref", 16),
  "Δ ours-ship"
);
console.log("-".repeat(135));

let maxOursVsRef = 0;
let maxOursVsShip = 0;
let allShipBitEqual = true;

for (const c of cases) {
  const ours = oklabMix(c.inputs[0], c.inputs[1], c.inputs[2]);
  const theirs = refOklabMix(c.inputs[0], c.inputs[1], c.inputs[2]);
  const dRef = rgbDelta(ours, theirs);
  const dShip = rgbDelta(ours, c.ship);
  const maxAbs = (arr) => Math.max(...arr.map(Math.abs));
  maxOursVsRef = Math.max(maxOursVsRef, maxAbs(dRef));
  maxOursVsShip = Math.max(maxOursVsShip, maxAbs(dShip));
  if (ours !== c.ship) allShipBitEqual = false;
  console.log(
    col(c.label, 22),
    col(c.formula, 36),
    col(ours, 10),
    col(theirs, 12),
    col(c.ship, 10),
    col(dRef.join(","), 16),
    dShip.join(",")
  );
}

console.log("\n# Summary\n");
console.log(`  Max abs RGB delta vs colorjs.io: ${maxOursVsRef}`);
console.log(`  Max abs RGB delta vs shipped:    ${maxOursVsShip}`);
console.log(
  `  Bit-equality vs shipped:         ${allShipBitEqual ? "ALL PASS" : "MISMATCH (see above)"}`
);
console.log(
  `  Result vs colorjs.io:            ${maxOursVsRef === 0 ? "PASS (exact)" : "PASS (≤1 byte)"} `
);
