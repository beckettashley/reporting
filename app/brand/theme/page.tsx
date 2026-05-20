"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageIcon, Type, Palette, X } from "lucide-react";
import type {
  PageStyle,
  SemanticRoleName,
  TextRoleStyle,
  TypographyMap,
} from "@/lib/theme-schema/theme-schema";
import javvySeed from "@/lib/theme-schema/themes/javvy.json";
import { oklabMix } from "@/lib/oklab-mix";

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
// Registry expands to cover all 19 FONT_OPTIONS in a later commit.
// ---------------------------------------------------------------------------

const FONT_SHIPPED_WEIGHTS: Record<string, { static: number[]; variable: boolean }> = {
  "DM Sans":           { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
  "Lato":              { static: [100, 300, 400, 700, 900], variable: false },
  "Archivo":           { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
  "Libre Baskerville": { static: [400, 700], variable: false },
  "Barlow":            { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: false },
  "Geist":             { static: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
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
// v2 validators. The JSON Schema enforces these patterns at emission time;
// the UI enforces them at edit time so dangling refs surface immediately.
// ---------------------------------------------------------------------------

const isValidHex = (hex: string) =>
  /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3}([0-9A-Fa-f]{2})?)?$/.test(hex);

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
];

const ROLE_DESCRIPTIONS: Record<SemanticRoleName, string> = {
  background: "Default page surface.",
  foreground: "Default body text color, paired with background.",
  muted: "Neutral muted surface — hover states, disabled UI.",
  mutedForeground: "Text/icon color paired with muted.",
  primary: "Brand-color surface (accent bands, brand-colored badges).",
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
  ctaBorder: "CTA border color.",
  ctaHover: "CTA hover-state background.",
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
// Main page
// ---------------------------------------------------------------------------

export default function ThemePage() {
  // v2 theme state — seeded from the Javvy reference instance.
  const [theme, setTheme] = useState<PageStyle>(javvySeed as PageStyle);
  // Manual-override toggles for the cta-family derivations. Default OFF —
  // the primitive bound to ctaBorder / ctaHover auto-tracks cta. Toggling ON
  // unlocks the hex input for hand-tuning; toggling back OFF overwrites the
  // manual value with the recomputed derivation.
  const [ctaBorderOverride, setCtaBorderOverride] = useState(false);
  const [ctaHoverOverride, setCtaHoverOverride] = useState(false);

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
  // ctaBorder + ctaHover primitives auto-update from cta when overrides are
  // OFF. Each effect also clears any manual dark variant — dark derivation
  // for the cta family lands in a follow-up commit.

  const ctaHex = theme.colors?.primitives?.cta;
  const ctaBorderHex = theme.colors?.primitives?.ctaBorder;

  useEffect(() => {
    if (ctaBorderOverride) return;
    if (!ctaHex || !isValidHex(ctaHex)) return;
    const derived = oklabMix(ctaHex, 90, "#000000");
    setTheme((t) => {
      const primitives = { ...t.colors!.primitives };
      const pairs = { ...(t.colors!.pairs || {}) };
      const semantic = { ...t.colors!.semantic };
      let changed = false;
      if (primitives.ctaBorder !== derived) {
        primitives.ctaBorder = derived;
        const onSurface = (luminance(derived) > 0.5 ? "light" : "dark") as
          | "light"
          | "dark";
        if (pairs.ctaBorder?.onSurface !== onSurface) {
          pairs.ctaBorder = { onSurface };
        }
        changed = true;
      }
      if (semantic.light.ctaBorder !== "ctaBorder") {
        semantic.light = { ...semantic.light, ctaBorder: "ctaBorder" };
        changed = true;
      }
      if (
        primitives.ctaBorderDark !== undefined ||
        pairs.ctaBorderDark !== undefined ||
        semantic.dark?.ctaBorder !== undefined
      ) {
        delete primitives.ctaBorderDark;
        delete pairs.ctaBorderDark;
        const darkMap = { ...(semantic.dark || {}) };
        delete darkMap.ctaBorder;
        semantic.dark = darkMap;
        changed = true;
      }
      if (!changed) return t;
      return { ...t, colors: { ...t.colors!, primitives, pairs, semantic } };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctaBorderOverride, ctaHex]);

  useEffect(() => {
    if (ctaHoverOverride) return;
    if (
      !ctaHex ||
      !isValidHex(ctaHex) ||
      !ctaBorderHex ||
      !isValidHex(ctaBorderHex)
    )
      return;
    const derived = oklabMix(ctaHex, 85, ctaBorderHex);
    setTheme((t) => {
      const primitives = { ...t.colors!.primitives };
      const pairs = { ...(t.colors!.pairs || {}) };
      const semantic = { ...t.colors!.semantic };
      let changed = false;
      if (primitives.ctaHover !== derived) {
        primitives.ctaHover = derived;
        const onSurface = (luminance(derived) > 0.5 ? "light" : "dark") as
          | "light"
          | "dark";
        if (pairs.ctaHover?.onSurface !== onSurface) {
          pairs.ctaHover = { onSurface };
        }
        changed = true;
      }
      if (semantic.light.ctaHover !== "ctaHover") {
        semantic.light = { ...semantic.light, ctaHover: "ctaHover" };
        changed = true;
      }
      if (
        primitives.ctaHoverDark !== undefined ||
        pairs.ctaHoverDark !== undefined ||
        semantic.dark?.ctaHover !== undefined
      ) {
        delete primitives.ctaHoverDark;
        delete pairs.ctaHoverDark;
        const darkMap = { ...(semantic.dark || {}) };
        delete darkMap.ctaHover;
        semantic.dark = darkMap;
        changed = true;
      }
      if (!changed) return t;
      return { ...t, colors: { ...t.colors!, primitives, pairs, semantic } };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctaHoverOverride, ctaHex, ctaBorderHex]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Theme</h1>
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
                <div className="grid grid-cols-[8rem_1fr] gap-2 pb-1">
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
                  const isDerivedCtaBorder = role === "ctaBorder";
                  const isDerivedCtaHover = role === "ctaHover";
                  const isDerived = isDerivedCtaBorder || isDerivedCtaHover;
                  const override = isDerivedCtaBorder
                    ? ctaBorderOverride
                    : isDerivedCtaHover
                      ? ctaHoverOverride
                      : false;
                  const setOverride = isDerivedCtaBorder
                    ? setCtaBorderOverride
                    : isDerivedCtaHover
                      ? setCtaHoverOverride
                      : null;
                  const formula = isDerivedCtaBorder
                    ? "oklab-mix(cta 90%, black 10%)"
                    : isDerivedCtaHover
                      ? "oklab-mix(cta 85%, ctaBorder 15%)"
                      : null;

                  const lightPrim = theme.colors?.semantic?.light?.[role];
                  const darkPrim = theme.colors?.semantic?.dark?.[role];
                  const lightHex = lightPrim
                    ? theme.colors?.primitives?.[lightPrim]
                    : undefined;
                  const darkHex = darkPrim
                    ? theme.colors?.primitives?.[darkPrim]
                    : undefined;

                  return (
                    <div
                      key={role}
                      className="grid grid-cols-[8rem_1fr] gap-2 items-center py-1"
                    >
                      <span
                        title={ROLE_DESCRIPTIONS[role]}
                        className="text-xs font-mono cursor-help truncate"
                      >
                        {role}
                      </span>
                      {isDerived && !override ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10.5px] text-muted-foreground italic font-mono truncate">
                            Derived: {formula}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOverride && setOverride(true)}
                            className="px-2 py-0.5 rounded border border-border text-[10.5px] hover:bg-muted transition-colors flex-shrink-0"
                            title="Unlock manual hex editing"
                          >
                            Override
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
                            <RoleHexInput
                              hex={lightHex}
                              onChange={(h) => setRoleHex(role, "light", h)}
                            />
                            {darkHex !== undefined ? (
                              <RoleHexInput
                                hex={darkHex}
                                onChange={(h) => setRoleHex(role, "dark", h)}
                                onClear={() => setRoleHex(role, "dark", null)}
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setRoleHex(
                                    role,
                                    "dark",
                                    lightHex || "#CCCCCC"
                                  )
                                }
                                className="text-[10.5px] text-muted-foreground border border-dashed border-border rounded h-8 px-2 hover:bg-muted/30 hover:text-foreground transition-colors text-left"
                                title="Add a dark-surface variant"
                              >
                                + add dark variant
                              </button>
                            )}
                          </div>
                          {isDerived && override && setOverride && (
                            <button
                              type="button"
                              onClick={() => setOverride(false)}
                              className="px-2 py-0.5 rounded border border-border text-[10.5px] hover:bg-muted transition-colors flex-shrink-0"
                              title="Switching back to derived overwrites the manual values and clears the dark variant"
                            >
                              Use derived
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Gradient: Subtle</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Type className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Typography</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Right column — sticky preview. Cascade rebuild lives in a later commit. */}
          <div className="lg:sticky lg:top-8 lg:self-start flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
