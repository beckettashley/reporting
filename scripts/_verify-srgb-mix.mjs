// Verification: srgbMix (our pure-math implementation) vs colorjs.io reference
// AND vs shipped midStopHex values from Javvy + Solstice.
//
// Mirrors lib/srgb-mix.ts byte-for-byte (inline copy). Tests the gradient
// midStopHex derivation formula: srgb-mix(brandSubtle 70%, background 30%).
//
// Usage: node scripts/_verify-srgb-mix.mjs
// Requires: colorjs.io (devDependency).

import Color from "colorjs.io";

// ─── Inline mirror of lib/srgb-mix.ts (must match byte-for-byte) ────────────

function srgbMix(hexA, percentA, hexB) {
  const parse = (hex) => {
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
  const toHex = (n) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ─── Reference: colorjs.io ──────────────────────────────────────────────────

function srgbMixRef(hexA, percentA, hexB) {
  // colorjs.io: a.mix(b, ratio) — ratio = proportion of b. For percentA% of
  // hexA, ratio of hexB is (1 - percentA/100).
  const mixed = new Color(hexA).mix(hexB, 1 - percentA / 100, {
    space: "srgb",
  });
  return mixed.toString({ format: "hex" }).toUpperCase();
}

// ─── Comparison helpers ─────────────────────────────────────────────────────

const parseHex = (h) => {
  const x = h.replace("#", "");
  return [
    parseInt(x.slice(0, 2), 16),
    parseInt(x.slice(2, 4), 16),
    parseInt(x.slice(4, 6), 16),
  ];
};
const rgbDelta = (a, b) => {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return [ar - br, ag - bg, ab - bb];
};
const maxAbs = (arr) => Math.max(...arr.map(Math.abs));
const pad = (s, w) => String(s).padEnd(w);

// ─── Test cases — gradient midStopHex per brand ────────────────────────────

const cases = [
  // Light surface — ship values exist
  {
    label: "Javvy midStopHex",
    formula: "srgb-mix(brandSubtle 70%, background 30%)",
    inputs: ["#E8E4F7", 70, "#FFFFFF"],
    ship: "#EFECF9",
  },
  {
    label: "Solstice midStopHex",
    formula: "srgb-mix(brandSubtle 70%, background 30%)",
    inputs: ["#FAEBE0", 70, "#FFFFFF"],
    ship: "#FCF1E9",
  },
  // Dark surface — new field midStopHexDark; no shipped value yet
  {
    label: "Javvy midStopHexDark",
    formula: "srgb-mix(brandSubtleDark 70%, backgroundDark 30%)",
    inputs: ["#E8E4F7", 70, "#2A2552"],
    ship: null,
  },
  {
    label: "Solstice midStopHexDark",
    formula: "srgb-mix(brandSubtleDark 70%, backgroundDark 30%)",
    inputs: ["#FAEBE0", 70, "#5C1A1A"],
    ship: null,
  },
];

console.log("# sRGB mix verification — gradient midStopHex derivation\n");
console.log(
  pad("Case", 24) +
    pad("Formula", 46) +
    pad("Ours", 10) +
    pad("colorjs.io", 12) +
    pad("Ship", 10) +
    pad("Δ ours-ref", 14) +
    "Δ ours-ship"
);
console.log("-".repeat(128));

let maxOursVsRef = 0;
let maxOursVsShip = 0;
let allShipBitEqual = true;

for (const c of cases) {
  const ours = srgbMix(c.inputs[0], c.inputs[1], c.inputs[2]);
  const theirs = srgbMixRef(c.inputs[0], c.inputs[1], c.inputs[2]);
  const dRef = rgbDelta(ours, theirs);
  maxOursVsRef = Math.max(maxOursVsRef, maxAbs(dRef));

  let shipDisplay = "n/a";
  let dShipDisplay = "n/a";
  if (c.ship) {
    const dShip = rgbDelta(ours, c.ship);
    maxOursVsShip = Math.max(maxOursVsShip, maxAbs(dShip));
    if (ours !== c.ship) allShipBitEqual = false;
    shipDisplay = c.ship;
    dShipDisplay = dShip.join(",");
  }

  console.log(
    pad(c.label, 24) +
      pad(c.formula, 46) +
      pad(ours, 10) +
      pad(theirs, 12) +
      pad(shipDisplay, 10) +
      pad(dRef.join(","), 14) +
      dShipDisplay
  );
}

console.log("\n# Summary\n");
console.log(`  Max abs RGB delta vs colorjs.io: ${maxOursVsRef}`);
console.log(`  Max abs RGB delta vs shipped:    ${maxOursVsShip}`);
console.log(
  `  Bit-equality vs shipped:         ${allShipBitEqual ? "ALL PASS" : "MISMATCH"}`
);
console.log(
  `  Bit-equality vs colorjs.io:      ${maxOursVsRef === 0 ? "ALL PASS" : "MISMATCH"}`
);
