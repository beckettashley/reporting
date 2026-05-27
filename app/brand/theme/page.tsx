"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, Type, Palette, X, Download } from "lucide-react";
import type {
  ColorTokens,
  PageStyle,
  SemanticRoleName,
  TextRoleStyle,
  TypographyMap,
} from "@/lib/theme-schema/theme-schema";
import javvySeed from "@/lib/theme-schema/themes/javvy.json";
import solsticeSeed from "@/lib/theme-schema/themes/solstice.json";
import { deepen } from "@/lib/oklab-deepen";
import { hexToOklch } from "@/lib/hex-to-oklch";

// ---------------------------------------------------------------------------
// Preset registry — themes the brand author can load as a starting point.
// ---------------------------------------------------------------------------

const PRESETS = {
  javvy: javvySeed as PageStyle,
  solstice: solsticeSeed as PageStyle,
} as const;
type PresetName = keyof typeof PRESETS;
const PRESET_LABELS: Record<PresetName, string> = {
  javvy: "Javvy",
  solstice: "Solstice",
};

// ---------------------------------------------------------------------------
// Color utility functions
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Darken a hex color by a percentage (0-100). */
function darkenHex(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - percent / 100;
  return rgbToHex(r * factor, g * factor, b * factor);
}

/** Blend a hex color at a given opacity onto a background hex, return the resulting hex. */
function hexWithOpacity(hex: string, opacity: number, bgHex: string): string {
  const fg = hexToRgb(hex);
  const bg = hexToRgb(bgHex);
  const a = opacity;
  return rgbToHex(
    fg.r * a + bg.r * (1 - a),
    fg.g * a + bg.g * (1 - a),
    fg.b * a + bg.b * (1 - a)
  );
}

/** Relative luminance of a hex color (0-1). */
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Return black or white text depending on background luminance. */
function contrastText(bgHex: string): string {
  return luminance(bgHex) > 0.45 ? "#000000" : "#ffffff";
}

/** Lighten a hex color by a percentage (0-100). */
function lightenHex(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;
  return rgbToHex(
    r + (255 - r) * factor,
    g + (255 - g) * factor,
    b + (255 - b) * factor
  );
}

// ---------------------------------------------------------------------------
// Font weight synthesis guard. Static-font weights must match the family's
// shipped face set, else the browser synthesizes a degraded weight at paint.
//
// Registry covers all 19 fonts in FONT_OPTIONS plus Archivo (used by the
// Solstice seed even though Solstice's family isn't currently in the picker
// dropdown). Data sourced from Google Fonts' shipped weight sets per family
// — variable fonts mark the full 100-900 range available; static fonts list
// only the discrete weights that ship as separate face files. When the user
// picks an unshipped weight on a static font, isWeightSupported surfaces an
// inline warning per role.
//
// Future commit may swap this hardcoded catalogue for the Google Fonts
// Developer API at edit time. Not in scope here.
// ---------------------------------------------------------------------------

const FONT_SHIPPED_WEIGHTS: Record<string, { static: number[]; variable: boolean }> = {
  "Archivo":           { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
  "Barlow":            { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: false },
  "Bebas Neue":        { static: [400], variable: false },
  "Crimson Text":      { static: [400, 600, 700], variable: false },
  "DM Sans":           { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
  "Geist":             { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
  "Inter":             { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
  "Lato":              { static: [100, 300, 400, 700, 900], variable: false },
  "Libre Baskerville": { static: [400, 700], variable: false },
  "Merriweather":      { static: [300, 400, 700, 900], variable: false },
  "Montserrat":        { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
  "Nunito":            { static: [200, 300, 400, 500, 600, 700, 800, 900], variable: true },
  "Open Sans":         { static: [300, 400, 500, 600, 700, 800], variable: true },
  "Oswald":            { static: [200, 300, 400, 500, 600, 700], variable: true },
  "Playfair Display":  { static: [400, 500, 600, 700, 800, 900], variable: true },
  "Poppins":           { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: false },
  "PT Sans":           { static: [400, 700], variable: false },
  "Raleway":           { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
  "Roboto":            { static: [100, 300, 400, 500, 700, 900], variable: true },
  "Ubuntu":            { static: [300, 400, 500, 700], variable: false },
};

function familyKey(family: string): string {
  return family.replace(/['"]/g, "").split(",")[0].trim();
}

function isWeightSupported(family: string, weight: number): {
  supported: boolean;
  reason: string;
} {
  const key = familyKey(family);
  const meta = FONT_SHIPPED_WEIGHTS[key];
  if (!meta) return { supported: true, reason: `unverified font: ${key}` };
  if (meta.variable) return { supported: true, reason: "variable font" };
  if (meta.static.includes(weight)) return { supported: true, reason: `shipped at ${weight}` };
  return {
    supported: false,
    reason: `weight ${weight} not shipped for ${key}; available: ${meta.static.join(", ")}`,
  };
}

// ---------------------------------------------------------------------------
// Font options
// ---------------------------------------------------------------------------

const FONT_OPTIONS = [
  "Barlow",
  "Bebas Neue",
  "Crimson Text",
  "DM Sans",
  "Geist",
  "Inter",
  "Lato",
  "Libre Baskerville",
  "Merriweather",
  "Montserrat",
  "Nunito",
  "Open Sans",
  "Oswald",
  "Playfair Display",
  "Poppins",
  "PT Sans",
  "Raleway",
  "Roboto",
  "Ubuntu",
];

const WEIGHT_LABELS: Record<number, string> = {
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi Bold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
};

// ---------------------------------------------------------------------------
// Google Fonts dynamic loader. Lazy-loads a font's CSS stylesheet by injecting
// a <link> into document.head on first use. Subsequent calls for the same
// family are no-ops (deduped via loadedGoogleFonts).
//
// URL pattern chosen per FONT_SHIPPED_WEIGHTS:
//   - Variable fonts ship a single file covering 100..900 → wght@100..900
//   - Static-weight fonts → wght@{weight1};{weight2};…
//
// Generic family keywords (sans-serif, serif, monospace) and unregistered
// names are skipped. SSR-safe via the typeof document guard.
// ---------------------------------------------------------------------------

const loadedGoogleFonts = new Set<string>();

function loadGoogleFont(family: string): void {
  if (typeof document === "undefined") return;
  if (!family) return;

  // Extract the primary family name from a CSS font-family stack:
  //   "'DM Sans', sans-serif"  → "DM Sans"
  //   "'Geist', 'Geist Fallback', sans-serif" → "Geist"
  const match = family.match(/^\s*['"]?([^'",]+?)['"]?\s*(?:,|$)/);
  if (!match) return;
  const fontName = match[1].trim();

  if (loadedGoogleFonts.has(fontName)) return;
  if (
    fontName === "sans-serif" ||
    fontName === "serif" ||
    fontName === "monospace" ||
    fontName === "Custom"
  )
    return;
  if (!(fontName in FONT_SHIPPED_WEIGHTS)) return;

  const spec = FONT_SHIPPED_WEIGHTS[fontName];
  const familyParam = fontName.replace(/ /g, "+");
  const weightParam = spec.variable
    ? "wght@100..900"
    : `wght@${spec.static.join(";")}`;
  const href = `https://fonts.googleapis.com/css2?family=${familyParam}:${weightParam}&display=swap`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-font", fontName);
  document.head.appendChild(link);

  loadedGoogleFonts.add(fontName);
}

// ---------------------------------------------------------------------------
// v2 validators. The JSON Schema enforces these patterns at emission time;
// the UI enforces them at edit time so dangling refs surface immediately.
// ---------------------------------------------------------------------------

const isValidHex = (hex: string) =>
  /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3}([0-9A-Fa-f]{2})?)?$/.test(hex);

// Per Q5 (typography phase): integer in [100, 900]. Schema permits any
// integer in range; variable fonts may render legitimate non-multiples
// (350, 425, 550, etc.). The editor UI defaults to multiples-of-100 for
// UX, but the validator does NOT require it.
const isValidWeight = (n: unknown): boolean =>
  typeof n === "number" && Number.isInteger(n) && n >= 100 && n <= 900;

// Accepts "0", "normal", or a signed numeric value with em/px/rem unit
// (e.g., "-0.025em", "0.5px", "0.01rem"). Unitless non-zero is invalid
// per CSS spec.
const isValidLetterSpacing = (s: unknown): boolean =>
  typeof s === "string" && /^(normal|0|-?\d*\.?\d+(em|px|rem))$/.test(s);

// ---------------------------------------------------------------------------
// Canonical 19-role v2 vocabulary. Mirrors the SemanticRoleName union in
// lib/theme-schema/theme-schema.ts. The readonly annotation lets TypeScript
// reject any entry that isn't a SemanticRoleName.
// ---------------------------------------------------------------------------

const SEMANTIC_ROLES: readonly SemanticRoleName[] = [
  "background",
  "foreground",
  "muted",
  "mutedForeground",
  "primary",
  "primaryForeground",
  "brandSubtle",
  "brandSubtleForeground",
  "warning",
  "warningForeground",
  "textBrand",
  "link",
  "textAlert",
  "border",
  "ring",
  "cta",
  "ctaForeground",
  "ctaBorder",
  "ctaHover",
  "ctaBorderHover",
];

// Derived roles cascade from cta via deepen(δ=0.1).
//   ctaBorder      = deepen(cta, 0.1)
//   ctaHover       = deepen(cta, 0.1)        (= ctaBorder by design)
//   ctaBorderHover = deepen(ctaHover, 0.1)
const DERIVED_ROLES: ReadonlySet<SemanticRoleName> = new Set([
  "ctaBorder",
  "ctaHover",
  "ctaBorderHover",
]);

const ROLE_DESCRIPTIONS: Record<SemanticRoleName, string> = {
  background: "Default page surface.",
  foreground: "Default body text color, paired with background.",
  muted: "Neutral muted surface — hover states, disabled UI.",
  mutedForeground: "Text/icon color paired with muted.",
  primary: "Brand-color surface (cardHeader bands, accent cells). Carries dual semantic per P15 — action emphasis (flips across surfaces) and brand-surface accent (wants to stay). Brands where action ≠ brand-surface (e.g., Javvy: action=yellow, surface=purple) may need primitive refs for accent cells on dark.",
  primaryForeground: "Text/icon color paired with primary.",
  brandSubtle: "Brand-tinted subtle section wash. Same primitive serves gradients.subtle.",
  brandSubtleForeground: "Text/icon color paired with brandSubtle.",
  warning: "Warning-state surface.",
  warningForeground: "Text/icon color paired with warning.",
  textBrand: "Brand-tinted text in body content — accents, inline emphasis.",
  link: "Link text. May share a primitive with textBrand on light; usually flips on dark.",
  textAlert: "Urgency/emphasis text (countdown timers, limited-time copy).",
  border: "Default border color.",
  ring: "Focus ring color.",
  cta: "Action-button background. Distinct from primary (the brand surface).",
  ctaForeground: "Text/icon color on the CTA.",
  ctaBorder: "CTA border color (deepen of cta).",
  ctaHover: "CTA hover-state background (deepen of cta; equals ctaBorder by design).",
  ctaBorderHover: "CTA border on hover (deepen of ctaHover).",
};

// ---------------------------------------------------------------------------
// Typography vocabulary. Mirrors TypographyMap in theme-schema.ts, sans the
// `muted` role: muted carries only a color reference (MutedRoleStyle), not a
// full TextRoleStyle, so the Typography editor surfaces it separately via a
// footer note pointing back to the Semantic Roles card.
//
// Single source of truth: TYPOGRAPHY_ROLES is the array, TypographyRoleName
// the derived literal union. `satisfies` keeps both honest against the
// schema's TypographyMap keys.
// ---------------------------------------------------------------------------

const TYPOGRAPHY_ROLES = [
  "title",
  "h1",
  "h2",
  "h3",
  "h4",
  "body",
  "ui",
  "meta",
] as const satisfies readonly (keyof TypographyMap)[];

type TypographyRoleName = (typeof TYPOGRAPHY_ROLES)[number];

const TYPOGRAPHY_ROLE_DESCRIPTIONS: Record<TypographyRoleName, string> = {
  title: "Page-level display heading (above-the-fold).",
  h1: "Section primary heading (editorial register).",
  h2: "Section secondary heading.",
  h3: "Subsection heading.",
  h4: "Card/icon-label heading (compact). Also canonical home for accordion-trigger headings since the A3 cleanup.",
  body: "Long-form prose.",
  ui: "Interactive labels (CTA button text, etc.).",
  meta: "Fine-print prose register — footer attribution, disclaimers, captions.",
};

// Per-row inline preview content. Sample text rendered at a representative
// size for the role so the brand author can judge family/weight/lineHeight
// choices without leaving the Typography card. Sizes here are preview-only —
// the production renderer uses --fs-{role} multipliers off baseFontSize.
const TYPOGRAPHY_SAMPLES: Record<
  TypographyRoleName,
  { text: string; size: string }
> = {
  title: { text: "Page Title", size: "40px" },
  h1: { text: "Heading 1", size: "32px" },
  h2: { text: "Heading 2", size: "26px" },
  h3: { text: "Heading 3", size: "20px" },
  h4: { text: "Heading 4", size: "17px" },
  body: { text: "Body text — long-form prose for reading.", size: "16px" },
  ui: { text: "Button Label", size: "14px" },
  meta: { text: "Footer attribution, fine-print disclaimer.", size: "12px" },
};

// ---------------------------------------------------------------------------
// Derived color computation. UX-convenience pattern: given an input primitive,
// derive related values that update in lockstep. Wired up to ctaBorder /
// ctaHover / midStopHex in a later commit per the generalized pattern.
// ---------------------------------------------------------------------------

interface DerivedColor {
  name: string;
  value: string;
  isRgba?: boolean;
}

function computeDerivedColors(
  brandPrimary: string,
  accent: string,
  text: string,
  background: string
): DerivedColor[] {
  const bgLum = luminance(background);
  const isLightBg = bgLum > 0.5;

  const brandPrimaryLum = luminance(brandPrimary);
  const primaryDark =
    brandPrimaryLum < 0.05
      ? brandPrimary
      : darkenHex(brandPrimary, 20);

  const brandPrimarySubtle = hexWithOpacity(brandPrimary, 0.1, background);
  const accentSubtle = hexWithOpacity(accent, 0.15, background);

  const surfaceSubtle = isLightBg
    ? darkenHex(background, 3)
    : lightenHex(background, 5);

  const borderSource = isLightBg ? text : "#ffffff";
  const borderDefault = hexWithOpacity(borderSource, 0.2, background);
  const borderSubtle = hexWithOpacity(borderSource, 0.1, background);

  return [
    { name: "Brand Primary Dark", value: primaryDark },
    { name: "Brand Primary Subtle", value: brandPrimarySubtle },
    { name: "Accent Subtle", value: accentSubtle },
    { name: "Text Inverse", value: "#ffffff" },
    { name: "Surface Subtle", value: surfaceSubtle },
    { name: "Surface Inverse", value: "#000000" },
    { name: "Surface Scrim", value: "rgba(255,255,255,0.9)", isRgba: true },
    { name: "Border Default", value: borderDefault },
    { name: "Border Subtle", value: borderSubtle },
    { name: "Border Contrast", value: "#000000" },
    {
      name: "Border Muted Inverse",
      value: "rgba(255,255,255,0.3)",
      isRgba: true,
    },
    { name: "Negative", value: "#dc2626" },
    { name: "Positive", value: "#11b990" },
    { name: "Star Rating", value: "#f59e0b" },
  ];
}

// ---------------------------------------------------------------------------
// validateThemeForExport — defense-in-depth check before JSON export.
//
// The vendored JSON Schema is intentionally permissive (ColorPrimitives takes
// any pattern-matched key; SemanticMap values are plain strings). Path A is
// stricter: closed vocab, identity-mapped semantic, both gradient midStops
// present. By construction the UI never violates these invariants, but this
// validator catches manual JSON edits or future bulk-import paths.
// ---------------------------------------------------------------------------

function validateThemeForExport(t: PageStyle): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const primitives = (t.colors?.primitives ?? {}) as Record<string, string>;
  const semLight = (t.colors?.semantic?.light ?? {}) as Record<string, string>;
  const semDark = (t.colors?.semantic?.dark ?? {}) as Record<string, string>;
  const primNames = new Set(Object.keys(primitives));
  const ALLOWED = new Set<string>([
    ...SEMANTIC_ROLES,
    ...SEMANTIC_ROLES.map((r) => `${r}Dark`),
  ]);

  // 1. All hex values valid
  for (const [name, hex] of Object.entries(primitives)) {
    if (!isValidHex(hex))
      errors.push(`primitives.${name}: invalid hex "${hex}"`);
  }
  // 2. All 20 light + 20 dark primitives present
  for (const role of SEMANTIC_ROLES) {
    if (!primNames.has(role)) errors.push(`primitives.${role}: missing`);
    if (!primNames.has(`${role}Dark`))
      errors.push(`primitives.${role}Dark: missing`);
  }
  // 3. No primitive names outside closed vocab
  for (const name of primNames) {
    if (!ALLOWED.has(name))
      errors.push(`primitives.${name}: not in closed vocabulary`);
  }
  // 4. semantic.light and semantic.dark identity-map all 20 roles
  for (const role of SEMANTIC_ROLES) {
    if (semLight[role] !== role)
      errors.push(
        `semantic.light.${role}: must be "${role}" (got "${semLight[role] ?? "missing"}")`
      );
    const darkExpected = `${role}Dark`;
    if (semDark[role] !== darkExpected)
      errors.push(
        `semantic.dark.${role}: must be "${darkExpected}" (got "${semDark[role] ?? "missing"}")`
      );
  }
  // 5. All semantic refs resolve to existing primitives
  for (const [role, ref] of Object.entries(semLight))
    if (!primNames.has(ref))
      errors.push(`semantic.light.${role} → "${ref}": dangling primitive ref`);
  for (const [role, ref] of Object.entries(semDark))
    if (!primNames.has(ref))
      errors.push(`semantic.dark.${role} → "${ref}": dangling primitive ref`);
  // 6. Gradient midStops present + valid
  const mLight = t.colors?.gradients?.subtle?.midStopHex;
  const mDark = t.colors?.gradients?.subtle?.midStopHexDark;
  if (!mLight) errors.push("gradients.subtle.midStopHex: missing");
  else if (!isValidHex(mLight))
    errors.push(`gradients.subtle.midStopHex: invalid hex "${mLight}"`);
  if (!mDark) errors.push("gradients.subtle.midStopHexDark: missing");
  else if (!isValidHex(mDark))
    errors.push(`gradients.subtle.midStopHexDark: invalid hex "${mDark}"`);

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Component: RoleHexInput — compact swatch + hex input used by Semantic Roles
// rows. Optional onClear renders an X button (only the dark cell uses it).
// ---------------------------------------------------------------------------

function RoleHexInput({
  hex,
  onChange,
  onClear,
}: {
  hex: string | undefined;
  onChange: (hex: string) => void;
  onClear?: () => void;
}) {
  const hexValid = hex !== undefined && isValidHex(hex);
  return (
    <div className="flex items-center gap-1 min-w-0">
      <label
        className="w-7 h-7 rounded-md border border-border flex-shrink-0 cursor-pointer block relative overflow-hidden"
        style={{ backgroundColor: hexValid && hex ? hex : "transparent" }}
      >
        <input
          type="color"
          value={hexValid && hex ? hex : "#CCCCCC"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
      <Input
        value={hex ? hex.toUpperCase() : ""}
        onChange={(e) => onChange(e.target.value)}
        className={`font-mono text-xs h-7 flex-1 min-w-0 ${hex && !hexValid ? "border-destructive" : ""}`}
        placeholder="#000000"
      />
      {onClear && (
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 flex-shrink-0"
          onClick={onClear}
          aria-label="Clear"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: ColorField
// ---------------------------------------------------------------------------

function ColorField({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {helper && <p className="text-[10px] text-muted-foreground">{helper}</p>}
        <div className="flex items-center gap-2 mt-0.5">
          <label
            className="w-8 h-8 rounded-md border border-border flex-shrink-0 cursor-pointer block relative overflow-hidden"
            style={{ backgroundColor: value }}
          >
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
          <Input
            value={value.toUpperCase()}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm h-8"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: FontSelect
// ---------------------------------------------------------------------------

function FontSelect({
  label,
  description,
  value,
  onChange,
  color,
  onColorChange,
  weight,
  onWeightChange,
  lineHeight,
  onLineHeightChange,
  letterSpacing,
  onLetterSpacingChange,
  customFont,
  onCustomFontUpload,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
  onColorChange: (v: string) => void;
  weight: string;
  onWeightChange: (v: string) => void;
  lineHeight: string;
  onLineHeightChange: (v: string) => void;
  letterSpacing: string;
  onLetterSpacingChange: (v: string) => void;
  customFont?: string | null;
  onCustomFontUpload?: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const allFonts = customFont ? ["Custom", ...FONT_OPTIONS] : FONT_OPTIONS;
  const filtered = search
    ? allFonts.filter((f) => f.toLowerCase().includes(search.toLowerCase()))
    : allFonts;

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.[^.]+$/, "");
    onCustomFontUpload?.(name);
    onChange("Custom");
    setOpen(false);
  };

  const displayValue = value === "Custom" && customFont ? `Custom (${customFont})` : value;

  return (
    <div className="flex flex-col gap-1" ref={dropdownRef}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
      <div className="flex items-end gap-2">
        <div className="flex flex-col shrink-0">
          <Label className="text-[10px] font-medium text-muted-foreground">Color</Label>
          <label
            className="w-9 h-9 mt-0.5 rounded border border-border cursor-pointer block relative overflow-hidden"
            style={{ backgroundColor: color }}
          >
            <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
        </div>
        <div className="flex flex-col flex-[2_1_0%] min-w-0">
          <Label className="text-[10px] font-medium text-muted-foreground">Family</Label>
          <div className="relative mt-0.5">
          <button
            type="button"
            onClick={() => { setOpen(!open); setSearch(""); }}
            className="w-full flex items-center justify-between pl-3 pr-4 py-2 rounded-md border text-sm transition-colors bg-background hover:bg-muted text-left h-9"
          >
          <span className="truncate">{displayValue}</span>
          <svg className="w-4 h-4 text-muted-foreground shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} /></svg>
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-background border rounded-lg shadow-lg overflow-hidden" style={{ zIndex: 99999 }}>
            <div className="px-2 pt-2 pb-1">
              <input
                type="text"
                placeholder="Search fonts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm px-2.5 py-1.5 rounded-md border bg-background outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => { onChange(font); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-muted ${value === font ? "bg-muted font-medium" : ""}`}
                >
                  {font === "Custom" && customFont ? `Custom (${customFont})` : font}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">No fonts match</p>
              )}
            </div>
            <div className="border-t px-3 py-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <input
                  type="file"
                  accept=".woff,.woff2,.ttf,.otf"
                  onChange={handleCustomUpload}
                  className="hidden"
                />
                Upload custom font...
              </label>
            </div>
          </div>
        )}
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <Label className="text-[10px] font-medium text-muted-foreground">Weight</Label>
          <select
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            className="mt-0.5 w-full h-9 rounded-md border bg-background text-sm pl-2 pr-7 cursor-pointer"
          >
            {(() => {
              const meta = FONT_SHIPPED_WEIGHTS[familyKey(value)];
              const weights = meta && !meta.variable ? meta.static : [100, 200, 300, 400, 500, 600, 700, 800, 900];
              return weights.map((w) => (
                <option key={w} value={String(w)}>{WEIGHT_LABELS[w] ?? String(w)}</option>
              ));
            })()}
          </select>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <Label className="text-[10px] font-medium text-muted-foreground">Line height</Label>
          <Input
            type="number"
            step="0.05"
            min="0"
            value={lineHeight}
            onChange={(e) => onLineHeightChange(e.target.value)}
            placeholder="1.4"
            className="mt-0.5 h-9 w-full text-sm font-mono"
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <Label className="text-[10px] font-medium text-muted-foreground">Letter spacing</Label>
          <div className="relative mt-0.5">
            <Input
              type="number"
              step="0.005"
              value={letterSpacing.replace(/em$/, "")}
              onChange={(e) => {
                const n = e.target.value;
                onLetterSpacingChange(n === "" || Number(n) === 0 ? "0" : `${n}em`);
              }}
              placeholder="0"
              className="h-9 w-full text-sm font-mono pr-9"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              em
            </span>
          </div>
        </div>
      </div>
      {(() => {
        const result = isWeightSupported(value, Number(weight));
        if (result.supported) return null;
        return (
          <p className="text-[10px] text-destructive flex items-center gap-1.5 mt-0.5">
            <span aria-hidden>⚠</span> {result.reason}
          </p>
        );
      })()}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: ImageUploadField
// ---------------------------------------------------------------------------

function ImageUploadField({
  label,
  helper,
  preview,
  onUpload,
  accept = "image/*",
}: {
  label: string;
  helper?: string;
  preview: string | null;
  onUpload: (dataUrl: string) => void;
  accept?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {helper && <p className="text-[10px] text-muted-foreground mt-0.5">{helper}</p>}
      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          onClick={() => preview && setModalOpen(true)}
          className={`w-8 h-8 flex-shrink-0 border rounded-md flex items-center justify-center bg-muted relative overflow-hidden transition-all ${preview ? "cursor-pointer hover:ring-1 hover:ring-ring" : "cursor-default"}`}
        >
          {preview ? (
            <img src={preview} alt={label} className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <Input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="cursor-pointer h-8 text-sm"
        />
      </div>

      {modalOpen && preview && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[99998]" onClick={() => setModalOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] bg-background border rounded-xl shadow-2xl p-4 max-w-md w-[90vw]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">{label}</p>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-md hover:bg-muted transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <img src={preview} alt={label} className="w-full object-contain rounded border max-h-[60vh]" />
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: PreviewSurface — renders a 150px-wide preview tile against one
// surface (light or dark). Mirrors the production renderer's emission:
//   - Primitives emit as `--c-{name}: oklch(L C H)` via hexToOklch
//   - Roles emit as `--{role}: var(--c-{primitiveName})` per the surface's
//     semantic map (no [data-surface="dark"] cascade needed — each pane
//     fixes its surface)
//   - Section bgs use `var(--c-{primitive})` directly (Step 6.5 cascade fix),
//     not `var(--{role})`. Text and borders use role vars.
//   - Subtle gradient uses the surface's midStopHex / midStopHexDark
//     from gradients.subtle.
// Production parity is by construction: same hexToOklch port, same emission
// pattern. Re-renders on every theme change (compute is microseconds).
// ---------------------------------------------------------------------------

function PreviewSurface({
  theme,
  surface,
}: {
  theme: PageStyle;
  surface: "light" | "dark";
}) {
  const primitives = theme.colors?.primitives || {};
  const semantic = theme.colors?.semantic?.[surface] || {};

  const primOklch = (primName: string | undefined): string => {
    if (!primName) return "transparent";
    const hex = primitives[primName];
    return hex && isValidHex(hex) ? hexToOklch(hex) : "transparent";
  };

  // CSS variables — primitive vars (--c-name) plus role vars (--role)
  // resolving to primitives at this surface.
  const cssVars: Record<string, string> = {};
  for (const role of SEMANTIC_ROLES) {
    const primName = semantic[role];
    if (!primName) continue;
    cssVars[`--c-${primName}`] = primOklch(primName);
    cssVars[`--${role}`] = `var(--c-${primName})`;
  }

  // Step 6.5: bg uses primitive var directly (immune to cascade rebinding).
  const bgPrim = (role: SemanticRoleName): string => {
    const primName = semantic[role];
    return primName ? `var(--c-${primName})` : "transparent";
  };

  const midStop =
    surface === "light"
      ? theme.colors?.gradients?.subtle?.midStopHex
      : theme.colors?.gradients?.subtle?.midStopHexDark;
  const midStopOklch =
    midStop && isValidHex(midStop) ? hexToOklch(midStop) : "transparent";

  const wrapperStyle = {
    ...cssVars,
    backgroundColor: bgPrim("background"),
    color: "var(--foreground)",
    width: "150px",
  } as React.CSSProperties;

  return (
    <div
      style={wrapperStyle}
      className="rounded border border-border overflow-hidden text-[9px] font-sans flex flex-col flex-shrink-0"
    >
      <div
        className="px-2 py-1 text-[8px] uppercase tracking-wide font-semibold"
        style={{
          background: bgPrim("muted"),
          color: "var(--mutedForeground)",
        }}
      >
        {surface} surface
      </div>

      <div
        className="p-2 flex flex-col gap-1"
        style={{ background: bgPrim("background") }}
      >
        <h3
          style={{
            color: "var(--textBrand)",
            fontWeight: 700,
            fontSize: "11px",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Brand Heading
        </h3>
        <p style={{ margin: 0, lineHeight: 1.4 }}>Lorem ipsum dolor sit.</p>
      </div>

      <div
        className="px-2 py-1.5"
        style={{
          background: bgPrim("primary"),
          color: "var(--primaryForeground)",
        }}
      >
        <span style={{ fontWeight: 700 }}>Primary surface</span>
      </div>

      <div
        className="px-2 py-1.5"
        style={{
          background: bgPrim("brandSubtle"),
          color: "var(--brandSubtleForeground)",
        }}
      >
        Brand subtle wash
      </div>

      <div
        className="px-2 py-1.5"
        style={{
          background: bgPrim("warning"),
          color: "var(--warningForeground)",
        }}
      >
        Warning
      </div>

      <div
        className="p-2 flex flex-col gap-1"
        style={{ background: bgPrim("background") }}
      >
        <button
          style={{
            background: bgPrim("cta"),
            color: "var(--ctaForeground)",
            border: "1px solid var(--ctaBorder)",
            padding: "4px 8px",
            borderRadius: 3,
            fontSize: "9px",
            fontWeight: 700,
            width: "100%",
          }}
        >
          CTA Button
        </button>
        <button
          style={{
            background: bgPrim("ctaHover"),
            color: "var(--ctaForeground)",
            border: "1px solid var(--ctaBorderHover)",
            padding: "4px 8px",
            borderRadius: 3,
            fontSize: "9px",
            fontWeight: 700,
            width: "100%",
          }}
        >
          Hover state
        </button>
      </div>

      <div
        className="px-2 py-2 text-center"
        style={{
          background: `linear-gradient(to bottom, ${bgPrim("background")} 0%, ${midStopOklch} 25%, ${midStopOklch} 75%, ${bgPrim("background")} 100%)`,
          color: "var(--foreground)",
        }}
      >
        Gradient
      </div>

      <div
        className="px-2 py-1.5 text-[8px] flex items-center gap-1.5"
        style={{ background: bgPrim("muted"), color: "var(--mutedForeground)" }}
      >
        <span>Footer</span>
        <span aria-hidden>·</span>
        <a href="#" style={{ color: "var(--link)" }}>
          link
        </a>
        <span aria-hidden>·</span>
        <span style={{ color: "var(--textAlert)", fontWeight: 700 }}>
          alert
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ThemePage() {
  // v2 theme state — seeded from the Javvy reference instance.
  const [theme, setTheme] = useState<PageStyle>(javvySeed as PageStyle);
  // Active preset — drives the preset menu's current value and the export
  // filename. Updated by loadPreset; never derived from theme content.
  const [activePreset, setActivePreset] = useState<PresetName>("javvy");
  // Snapshot of the initial theme — used by X-button reset on every cell.
  // Non-derived cells revert to their initial JSON value; derived cells
  // recompute from current upstream via resetDerivedRow. loadPreset
  // re-captures this snapshot so X-reset tracks the active preset.
  const initialThemeRef = useRef<PageStyle>(javvySeed as PageStyle);

  // ─── Preset switching + Export ──────────────────────────────────────────

  // Load a preset by name. Immediate replace, no confirmation — selecting
  // the current preset reloads the seed (intentional reset affordance).
  const loadPreset = (name: PresetName) => {
    const seed = PRESETS[name];
    setTheme(seed);
    initialThemeRef.current = seed;
    setActivePreset(name);
  };

  // Validate the current theme and download as JSON. On validation failure,
  // alert the brand author with the first 5 errors and skip the download.
  const handleExport = () => {
    const result = validateThemeForExport(theme);
    if (!result.valid) {
      const preview = result.errors.slice(0, 5).join("\n");
      const more =
        result.errors.length > 5
          ? `\n…and ${result.errors.length - 5} more`
          : "";
      alert(`Cannot export — validation failed:\n\n${preview}${more}`);
      return;
    }
    const blob = new Blob([JSON.stringify(theme, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `theme-${activePreset}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─── Setters ────────────────────────────────────────────────────────────

  // Write a hex for a role on the given surface. Closed-vocab + identity:
  // primitives[role|roleDark] = hex, semantic[surface][role] = canonical name,
  // pairs[canonical] = luminance-inferred. Passing null/empty clears the
  // binding (meaningful only for dark — clearing light leaves a role unset).
  const setRoleHex = (
    role: SemanticRoleName,
    surface: "light" | "dark",
    hex: string | null
  ) => {
    const canonical = surface === "light" ? role : `${role}Dark`;
    setTheme((t) => {
      const primitives = { ...t.colors!.primitives };
      const pairs = { ...(t.colors!.pairs || {}) };
      const semantic = { ...t.colors!.semantic };
      const surfaceMap = { ...(semantic[surface] || {}) };
      if (!hex || hex === "") {
        delete primitives[canonical];
        delete pairs[canonical];
        delete surfaceMap[role];
      } else {
        primitives[canonical] = hex;
        pairs[canonical] = {
          onSurface: luminance(hex) > 0.5 ? "light" : "dark",
        };
        surfaceMap[role] = canonical;
      }
      semantic[surface] = surfaceMap;
      return {
        ...t,
        colors: { ...t.colors!, primitives, pairs, semantic },
      };
    });
  };

  const setTypographyRole = (
    role: keyof TypographyMap,
    partial: Partial<TextRoleStyle>
  ) => {
    setTheme((t) => ({
      ...t,
      typography: {
        ...t.typography,
        [role]: { ...(t.typography?.[role] || {}), ...partial },
      },
    }));
  };

  const setBaseFontSize = (n: number) =>
    setTheme((t) => ({ ...t, baseFontSize: n }));

  // ─── Derivation effects ──────────────────────────────────────────────────
  // Three cta-family derivations cascade through (cta → ctaBorder, cta →
  // ctaHover, ctaHover → ctaBorderHover) on each surface independently.
  // Each effect's deps include only its IMMEDIATE upstream — so a user-
  // override on a derived role pauses re-derivation for that role until
  // upstream changes again (last write wins). Editing cta cascades fully.
  //
  // ctaBorder == ctaHover by design (both = deepen(cta, 0.1)) — the hover
  // fill matches the resting border on hover, producing a tight border/fill
  // relationship.

  const ctaHex = theme.colors?.primitives?.cta;
  const ctaDarkHex = theme.colors?.primitives?.ctaDark;
  const ctaHoverHex = theme.colors?.primitives?.ctaHover;
  const ctaHoverDarkHex = theme.colors?.primitives?.ctaHoverDark;

  // backgroundAlternate — stored in gradients.subtle.midStopHex /
  // midStopHexDark for canonical schema compatibility. Treated as a
  // non-derived role in the UI: editable per surface, decoupled from
  // brandSubtle. The renderer's gradient treatment is downstream of
  // authoring; the brand author picks a color, render technique handles
  // the rest.
  const backgroundAlternateHex =
    theme.colors?.gradients?.subtle?.midStopHex;
  const backgroundAlternateDarkHex =
    theme.colors?.gradients?.subtle?.midStopHexDark;

  // Generic single-step derivation writer: derive(sourceHex) and write to
  // the named primitive + identity-semantic + luminance-inferred pair.
  const writeDerived = (
    primName: string,
    role: SemanticRoleName,
    surface: "light" | "dark",
    derivedHex: string,
    primitives: Record<string, string>,
    pairs: Record<string, { onSurface: "light" | "dark" }>,
    semantic: ColorTokens["semantic"]
  ): { changed: boolean; semantic: ColorTokens["semantic"] } => {
    let changed = false;
    if (primitives[primName] !== derivedHex) {
      primitives[primName] = derivedHex;
      const onSurface = (luminance(derivedHex) > 0.5 ? "light" : "dark") as
        | "light"
        | "dark";
      if (pairs[primName]?.onSurface !== onSurface) {
        pairs[primName] = { onSurface };
      }
      changed = true;
    }
    const surfaceMap = semantic[surface] || {};
    if (surfaceMap[role] !== primName) {
      semantic = {
        ...semantic,
        [surface]: { ...surfaceMap, [role]: primName },
      };
      changed = true;
    }
    return { changed, semantic };
  };

  // ctaBorder derivation: deepen(cta, 0.1) for each surface.
  useEffect(() => {
    setTheme((t) => {
      const primitives = { ...t.colors!.primitives };
      const pairs = { ...(t.colors!.pairs || {}) };
      let semantic = t.colors!.semantic;
      let changed = false;
      if (ctaHex && isValidHex(ctaHex)) {
        const out = writeDerived(
          "ctaBorder",
          "ctaBorder",
          "light",
          deepen(ctaHex, 0.1),
          primitives,
          pairs,
          semantic
        );
        if (out.changed) changed = true;
        semantic = out.semantic;
      }
      if (ctaDarkHex && isValidHex(ctaDarkHex)) {
        const out = writeDerived(
          "ctaBorderDark",
          "ctaBorder",
          "dark",
          deepen(ctaDarkHex, 0.1),
          primitives,
          pairs,
          semantic
        );
        if (out.changed) changed = true;
        semantic = out.semantic;
      }
      if (!changed) return t;
      return { ...t, colors: { ...t.colors!, primitives, pairs, semantic } };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctaHex, ctaDarkHex]);

  // ctaHover derivation: deepen(cta, 0.1) for each surface (same formula as
  // ctaBorder — produces equal hex by design).
  useEffect(() => {
    setTheme((t) => {
      const primitives = { ...t.colors!.primitives };
      const pairs = { ...(t.colors!.pairs || {}) };
      let semantic = t.colors!.semantic;
      let changed = false;
      if (ctaHex && isValidHex(ctaHex)) {
        const out = writeDerived(
          "ctaHover",
          "ctaHover",
          "light",
          deepen(ctaHex, 0.1),
          primitives,
          pairs,
          semantic
        );
        if (out.changed) changed = true;
        semantic = out.semantic;
      }
      if (ctaDarkHex && isValidHex(ctaDarkHex)) {
        const out = writeDerived(
          "ctaHoverDark",
          "ctaHover",
          "dark",
          deepen(ctaDarkHex, 0.1),
          primitives,
          pairs,
          semantic
        );
        if (out.changed) changed = true;
        semantic = out.semantic;
      }
      if (!changed) return t;
      return { ...t, colors: { ...t.colors!, primitives, pairs, semantic } };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctaHex, ctaDarkHex]);

  // ctaBorderHover derivation: deepen(ctaHover, 0.1) for each surface.
  // Depends on the CURRENT ctaHover value (manual or auto), making overrides
  // surgical — overriding ctaHover propagates through to ctaBorderHover.
  useEffect(() => {
    setTheme((t) => {
      const primitives = { ...t.colors!.primitives };
      const pairs = { ...(t.colors!.pairs || {}) };
      let semantic = t.colors!.semantic;
      let changed = false;
      if (ctaHoverHex && isValidHex(ctaHoverHex)) {
        const out = writeDerived(
          "ctaBorderHover",
          "ctaBorderHover",
          "light",
          deepen(ctaHoverHex, 0.1),
          primitives,
          pairs,
          semantic
        );
        if (out.changed) changed = true;
        semantic = out.semantic;
      }
      if (ctaHoverDarkHex && isValidHex(ctaHoverDarkHex)) {
        const out = writeDerived(
          "ctaBorderHoverDark",
          "ctaBorderHover",
          "dark",
          deepen(ctaHoverDarkHex, 0.1),
          primitives,
          pairs,
          semantic
        );
        if (out.changed) changed = true;
        semantic = out.semantic;
      }
      if (!changed) return t;
      return { ...t, colors: { ...t.colors!, primitives, pairs, semantic } };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctaHoverHex, ctaHoverDarkHex]);

  // X-button handler for derived rows: compute the derived value from the
  // current upstream and write it. Same math as the useEffects, just
  // triggered explicitly when the user clicks X.
  const resetDerivedRow = (
    role: SemanticRoleName,
    surface: "light" | "dark"
  ) => {
    let sourceHex: string | undefined;
    if (role === "ctaBorder" || role === "ctaHover") {
      sourceHex =
        surface === "light"
          ? theme.colors?.primitives?.cta
          : theme.colors?.primitives?.ctaDark;
    } else if (role === "ctaBorderHover") {
      sourceHex =
        surface === "light"
          ? theme.colors?.primitives?.ctaHover
          : theme.colors?.primitives?.ctaHoverDark;
    }
    if (!sourceHex || !isValidHex(sourceHex)) return;
    setRoleHex(role, surface, deepen(sourceHex, 0.1));
  };

  // ─── backgroundAlternate setter ─────────────────────────────────────────
  // Writes to gradients.subtle.midStopHex (light) or .midStopHexDark (dark).
  // Treated as a non-derived role: editable per surface, decoupled from
  // brandSubtle. Default values seed once at theme creation via srgbMix
  // (currently shipped in Javvy/Solstice JSON; one-time seeding will land
  // when preset/import work is built).

  // Look up the initial hex for a (role, surface) from the captured
  // initialThemeRef. Used by X-button reset on non-derived cells.
  const getInitialHex = (
    role: SemanticRoleName,
    surface: "light" | "dark"
  ): string | undefined => {
    const initial = initialThemeRef.current;
    const primName = initial.colors?.semantic?.[surface]?.[role];
    return primName ? initial.colors?.primitives?.[primName] : undefined;
  };

  const setBackgroundAlternate = (
    surface: "light" | "dark",
    hex: string | null
  ) => {
    setTheme((t) => {
      const current = t.colors!.gradients?.subtle || { surface: "light" };
      const next = { ...current };
      if (hex === null || hex === "") {
        if (surface === "dark") delete next.midStopHexDark;
        // Light has no X-clear path (light is source of truth), so no
        // light-clear branch here.
      } else if (surface === "light") {
        next.midStopHex = hex;
      } else {
        next.midStopHexDark = hex;
      }
      return {
        ...t,
        colors: {
          ...t.colors!,
          gradients: { ...t.colors!.gradients, subtle: next },
        },
      };
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-foreground">Theme</h1>
          <div className="flex items-center gap-2">
            <Select value={activePreset} onValueChange={(v) => loadPreset(v as PresetName)}>
              <SelectTrigger className="w-[180px]" aria-label="Preset">
                <SelectValue placeholder="Preset" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRESETS) as PresetName[]).map((name) => (
                  <SelectItem key={name} value={name}>
                    {PRESET_LABELS[name]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} className="gap-1.5">
              <Download className="w-4 h-4" />
              Export JSON
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[5fr_3fr] gap-6 mb-24">
          {/* Left column — input cards. Bodies are built in subsequent commits. */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Brand Assets</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Semantic Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-[12rem_1fr] gap-2 pb-1">
                  <span></span>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Light
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Dark
                    </span>
                  </div>
                </div>
                {SEMANTIC_ROLES.map((role) => {
                  const isDerived = DERIVED_ROLES.has(role);
                  const lightPrim = theme.colors?.semantic?.light?.[role];
                  const darkPrim = theme.colors?.semantic?.dark?.[role];
                  const lightHex = lightPrim
                    ? theme.colors?.primitives?.[lightPrim]
                    : undefined;
                  const darkHex = darkPrim
                    ? theme.colors?.primitives?.[darkPrim]
                    : undefined;

                  // X-button handlers — uniform rule: every cell has an X
                  // that reverts to the cell's "default" value.
                  // - Non-derived: revert to initial JSON value at theme load
                  //   (captured in initialThemeRef; preserves intentional
                  //   light/dark divergence)
                  // - Derived: re-run derivation formula against current
                  //   upstream
                  const onClearLight = isDerived
                    ? () => resetDerivedRow(role, "light")
                    : () =>
                        setRoleHex(
                          role,
                          "light",
                          getInitialHex(role, "light") || "#CCCCCC"
                        );
                  const onClearDark = isDerived
                    ? () => resetDerivedRow(role, "dark")
                    : () =>
                        setRoleHex(
                          role,
                          "dark",
                          getInitialHex(role, "dark") || "#CCCCCC"
                        );

                  // P17 inline warning — dark.foreground should be a
                  // paper-class primitive (very light off-white or pure
                  // white). Below the threshold, text on brand-surface
                  // backgrounds (where dark cascade activates) may render
                  // with off-spec contrast. Luminance > 0.85 marks the
                  // paper-class cutoff (off-whites and pure white pass;
                  // mid-light grays and below trigger).
                  const isP17Warning =
                    role === "foreground" &&
                    darkHex !== undefined &&
                    isValidHex(darkHex) &&
                    luminance(darkHex) <= 0.85;

                  return (
                    <div key={role}>
                      <div className="grid grid-cols-[12rem_1fr] gap-2 items-center py-1">
                        <span
                          title={ROLE_DESCRIPTIONS[role]}
                          className="text-xs font-mono cursor-help truncate"
                        >
                          {role}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <RoleHexInput
                            hex={lightHex}
                            onChange={(h) => setRoleHex(role, "light", h)}
                            onClear={onClearLight}
                          />
                          <RoleHexInput
                            hex={darkHex}
                            onChange={(h) => setRoleHex(role, "dark", h)}
                            onClear={onClearDark}
                          />
                        </div>
                      </div>
                      {isP17Warning && (
                        <p className="text-[10px] text-destructive flex items-start gap-1.5 pl-[12.5rem] pb-1">
                          <span aria-hidden>⚠</span>
                          <span>
                            dark.foreground should be a paper-class primitive
                            (very light off-white or white) per P17. Off-spec
                            values may cause text on brand-surface backgrounds
                            to render with poor contrast.
                          </span>
                        </p>
                      )}
                    </div>
                  );
                })}
                {/* backgroundAlternate — non-derived role-equivalent row.
                    Data binds to gradients.subtle.midStopHex (light) and
                    .midStopHexDark (dark) for canonical schema compatibility,
                    but behaves like any other non-derived role: light is
                    source of truth (no X), dark X resets to match light. */}
                <div
                  key="backgroundAlternate"
                  className="grid grid-cols-[12rem_1fr] gap-2 items-center py-1"
                >
                  <span
                    title="Alternate section background color. Used for sections that should diverge from the default background."
                    className="text-xs font-mono cursor-help truncate"
                  >
                    backgroundAlternate
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <RoleHexInput
                      hex={backgroundAlternateHex}
                      onChange={(h) => setBackgroundAlternate("light", h)}
                      onClear={() =>
                        setBackgroundAlternate(
                          "light",
                          initialThemeRef.current.colors?.gradients?.subtle
                            ?.midStopHex || "#CCCCCC"
                        )
                      }
                    />
                    <RoleHexInput
                      hex={backgroundAlternateDarkHex}
                      onChange={(h) => setBackgroundAlternate("dark", h)}
                      onClear={() =>
                        setBackgroundAlternate(
                          "dark",
                          initialThemeRef.current.colors?.gradients?.subtle
                            ?.midStopHexDark || "#CCCCCC"
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Type className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Typography</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Right column — sticky preview, side-by-side light + dark. */}
          <div className="lg:sticky lg:top-8 lg:self-start flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-2">
                  <PreviewSurface theme={theme} surface="light" />
                  <PreviewSurface theme={theme} surface="dark" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
