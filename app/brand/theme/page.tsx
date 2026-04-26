"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageIcon, Type, Palette, Info } from "lucide-react";

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

// ---------------------------------------------------------------------------
// Derived color computation
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
    { name: "Danger", value: "#dc2626" },
  ];
}

// ---------------------------------------------------------------------------
// Component: ColorField
// ---------------------------------------------------------------------------

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
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
      <div className="flex items-center gap-2">
        <label
          className="w-8 h-8 rounded border border-border flex-shrink-0 cursor-pointer block relative overflow-hidden"
          style={{ backgroundColor: color }}
        >
          <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
        </label>
        <div className="relative flex-1 min-w-0">
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
        <select
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          className="w-36 h-9 rounded-md border bg-background text-sm pl-3 pr-8 cursor-pointer"
        >
          <option value="200">Extra Light</option>
          <option value="300">Light</option>
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">Semi Bold</option>
          <option value="700">Bold</option>
          <option value="800">Extra Bold</option>
          <option value="900">Black</option>
        </select>
      </div>
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

      {/* Preview modal */}
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
  // Section 4: Images

  // Section 1: Color Palette — matching PDF reference exactly
  // Primary
  const [primary, setPrimary] = useState("#3D358B");
  const [primaryDark, setPrimaryDark] = useState("#312A6F");
  // Accents
  const [accent1, setAccent1] = useState("#E2F4FF");
  const [accent2, setAccent2] = useState("#FDF4DF");
  const [accent3, setAccent3] = useState("#ECEBF4");
  // Buttons
  const [backgroundPrimary, setBackgroundPrimary] = useState("#FFFFFF");
  const [buttonPrimary, setButtonPrimary] = useState("#312A6F");
  const [buttonPrimaryText, setButtonPrimaryText] = useState("#FFFFFF");
  const [buttonSecondary, setButtonSecondary] = useState("#FFD61E");
  const [buttonSecondaryText, setButtonSecondaryText] = useState("#000000");
  // UI Elements
  const [borderDefault, setBorderDefault] = useState("#D1D1D1");
  const [borderSubtle, setBorderSubtle] = useState("#D1D1D1");
  const [surfaceSubtle, setSurfaceSubtle] = useState("#F7F7F7");
  const [surfaceInverse, setSurfaceInverse] = useState("#D1D1D1");
  const [danger, setDanger] = useState("#DC2627");


  // Section 3: Typography
  // Headings (H1-H6 each with own family + weight + color)
  interface HeadingConfig { font: string; weight: string; color: string }
  const [headings, setHeadings] = useState<Record<string, HeadingConfig>>({
    H1: { font: "Libre Baskerville", weight: "800", color: "#3d348b" },
    H2: { font: "Libre Baskerville", weight: "700", color: "#1a1a1a" },
    H3: { font: "DM Sans", weight: "700", color: "#1a1a1a" },
    H4: { font: "DM Sans", weight: "600", color: "#1a1a1a" },
    H5: { font: "DM Sans", weight: "600", color: "#1a1a1a" },
    H6: { font: "DM Sans", weight: "600", color: "#1a1a1a" },
  });
  const updateHeading = (level: string, updates: Partial<HeadingConfig>) => {
    setHeadings((prev) => ({ ...prev, [level]: { ...prev[level], ...updates } }));
  };
  // Body / UI / Condensed
  const [bodyFont, setBodyFont] = useState("DM Sans");
  const [bodyWeight, setBodyWeight] = useState("500");
  const [bodyColor, setBodyColor] = useState("#1a1a1a");
  const [uiFont, setUiFont] = useState("Geist");
  const [uiWeight, setUiWeight] = useState("700");
  const [uiColor, setUiColor] = useState("#1a1a1a");
  const [condensedFont, setCondensedFont] = useState("Barlow");
  const [condensedWeight, setCondensedWeight] = useState("900");
  const [condensedColor, setCondensedColor] = useState("#1a1a1a");
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [customFonts, setCustomFonts] = useState<Record<string, string | null>>({
    H1: null, H2: null, H3: null, H4: null, H5: null, H6: null, body: null, ui: null, condensed: null,
  });
  // Convenience aliases for preview
  const displayFont = headings.H1.font;
  const displayWeight = headings.H1.weight;
  const displayColor = headings.H1.color;

  const [logo, setLogo] = useState<string | null>(null);
  const [logoDark, setLogoDark] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);

  // Dynamically load Google Fonts for preview
  React.useEffect(() => {
    const fonts = [displayFont, bodyFont, uiFont, condensedFont].filter((f) => f !== "Custom" && f !== "Geist")
    if (fonts.length === 0) return
    const families = fonts.map((f) => f.replace(/ /g, "+") + ":wght@200;300;400;500;600;700;800;900").join("&family=")
    const href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`
    const id = "theme-preview-fonts"
    let link = document.getElementById(id) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement("link")
      link.id = id
      link.rel = "stylesheet"
      document.head.appendChild(link)
    }
    link.href = href
  }, [displayFont, bodyFont, uiFont, condensedFont])

  // Scale factor for preview — all sizes proportional to base font size
  const s = (px: number) => `${(px * baseFontSize / 16).toFixed(1)}px`

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Theme</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-24">
          {/* ============================================================= */}
          {/* LEFT COLUMN: All input sections */}
          {/* ============================================================= */}
          <div className="flex flex-col gap-6">
            {/* ------ Images ------ */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Images</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <ImageUploadField label="Logo" preview={logo} onUpload={setLogo} />
                <ImageUploadField label="Logo Dark Variant" preview={logoDark} onUpload={setLogoDark} />
                <ImageUploadField label="Favicon" preview={favicon} onUpload={setFavicon} />
              </CardContent>
            </Card>

            {/* ------ Color Palette ------ */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Color Palette</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary */}
                <div>
                  <div className="space-y-2.5">
                    <ColorField label="Primary" value={primary} onChange={setPrimary} />
                    <ColorField label="Primary Dark" value={primaryDark} onChange={setPrimaryDark} />
                  </div>
                </div>

                {/* Accents */}
                <div>
                  <div className="space-y-2.5">
                    <ColorField label="Accent 1" value={accent1} onChange={setAccent1} />
                    <ColorField label="Accent 2" value={accent2} onChange={setAccent2} />
                    <ColorField label="Accent 3" value={accent3} onChange={setAccent3} />
                  </div>
                </div>

                {/* Buttons */}
                <div>
                  <div className="space-y-2.5">
                    <ColorField label="Button Primary" value={buttonPrimary} onChange={setButtonPrimary} />
                    <ColorField label="Button Primary Text" value={buttonPrimaryText} onChange={setButtonPrimaryText} />
                    <ColorField label="Button Secondary" value={buttonSecondary} onChange={setButtonSecondary} />
                    <ColorField label="Button Secondary Text" value={buttonSecondaryText} onChange={setButtonSecondaryText} />
                  </div>
                </div>

                {/* UI Elements */}
                <div>
                  <div className="space-y-2.5">
                    <ColorField label="Background Primary" value={backgroundPrimary} onChange={setBackgroundPrimary} />
                    <ColorField label="Border Default" value={borderDefault} onChange={setBorderDefault} />
                    <ColorField label="Border Subtle" value={borderSubtle} onChange={setBorderSubtle} />
                    <ColorField label="Surface Subtle" value={surfaceSubtle} onChange={setSurfaceSubtle} />
                    <ColorField label="Surface Inverse" value={surfaceInverse} onChange={setSurfaceInverse} />
                    <ColorField label="Danger" value={danger} onChange={setDanger} />
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* ------ Section 3: Typography ------ */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Type className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Typography</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {/* Headings H1-H6 */}
                <div>
                  <div className="flex flex-col gap-2">
                    {(["H1", "H2", "H3", "H4", "H5", "H6"] as const).map((level) => (
                      <FontSelect
                        key={level}
                        label={`Heading ${level.slice(1)}`}
                        description=""
                        value={headings[level].font}
                        onChange={(v) => updateHeading(level, { font: v })}
                        color={headings[level].color}
                        onColorChange={(v) => updateHeading(level, { color: v })}
                        weight={headings[level].weight}
                        onWeightChange={(v) => updateHeading(level, { weight: v })}
                        customFont={customFonts[level]}
                        onCustomFontUpload={(name) => setCustomFonts((p) => ({ ...p, [level]: name }))}
                      />
                    ))}
                  </div>
                </div>
                <FontSelect
                  label="Regular Font"
                  description=""
                  value={bodyFont}
                  onChange={setBodyFont}
                  color={bodyColor}
                  onColorChange={setBodyColor}
                  weight={bodyWeight}
                  onWeightChange={setBodyWeight}
                  customFont={customFonts.body}
                  onCustomFontUpload={(name) => setCustomFonts((p) => ({ ...p, body: name }))}
                />
                <FontSelect
                  label="UI Font"
                  description=""
                  value={uiFont}
                  onChange={setUiFont}
                  color={uiColor}
                  onColorChange={setUiColor}
                  weight={uiWeight}
                  onWeightChange={setUiWeight}
                  customFont={customFonts.ui}
                  onCustomFontUpload={(name) => setCustomFonts((p) => ({ ...p, ui: name }))}
                />
                <FontSelect
                  label="Condensed Font"
                  description=""
                  value={condensedFont}
                  onChange={setCondensedFont}
                  color={condensedColor}
                  onColorChange={setCondensedColor}
                  weight={condensedWeight}
                  onWeightChange={setCondensedWeight}
                  customFont={customFonts.condensed}
                  onCustomFontUpload={(name) => setCustomFonts((p) => ({ ...p, condensed: name }))}
                />
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium">Base Font Size</Label>
                  <p className="text-xs text-muted-foreground">
                    Scales the entire type ladder proportionally
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={10}
                      max={24}
                      value={baseFontSize}
                      onChange={(e) =>
                        setBaseFontSize(Number(e.target.value) || 16)
                      }
                      className="h-9 w-24 font-mono"
                    />
                    <span className="text-sm text-muted-foreground">px</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ============================================================= */}
          {/* RIGHT COLUMN: Sticky preview panel */}
          {/* ============================================================= */}
          <div className="lg:sticky lg:top-8 lg:self-start flex flex-col gap-6">
            {/* ------ Mini page mockup ------ */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="rounded-lg overflow-hidden shadow-xl mx-auto border-2" style={{ backgroundColor: backgroundPrimary, color: bodyColor, fontFamily: bodyFont, fontSize: `${baseFontSize}px`, maxWidth: "320px", borderColor: borderDefault }}>

                  {/* 1a. Urgency banner — primary dark + condensed */}
                  <div className="text-center uppercase tracking-wider" style={{ backgroundColor: primaryDark, color: contrastText(primaryDark), fontFamily: condensedFont, fontWeight: 900, fontSize: s(12), letterSpacing: "0.04em", padding: "6px 12px" }}>
                    ⚡ Spring sale — up to 58% off today
                  </div>

                  {/* 1b. Secondary banner — primary */}
                  <div className="text-center" style={{ backgroundColor: primary, color: contrastText(primary), fontFamily: uiFont, fontWeight: 600, fontSize: s(11), letterSpacing: "0.02em", padding: "5px 12px" }}>
                    Free shipping on orders over $40
                  </div>

                  {/* 2. Navbar — logo auto-switches based on bg contrast */}
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${borderSubtle}` }}>
                    {logo ? (
                      <img
                        src={luminance(backgroundPrimary) < 0.45 ? (logoDark || logo) : logo}
                        alt="Logo"
                        className="h-5 max-w-[80px] object-contain"
                        style={luminance(backgroundPrimary) < 0.45 && !logoDark ? { filter: "brightness(0) invert(1)" } : undefined}
                      />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-muted flex items-center justify-center"><ImageIcon className="w-3 h-3 text-muted-foreground" /></div>
                        <span className="text-xs text-muted-foreground" style={{ fontFamily: uiFont }}>Logo</span>
                      </div>
                    )}
                    <svg className="w-5 h-5" style={{ color: bodyColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </div>

                  {/* 3. Hero — image + display + body + bullets + CTA */}
                  <div className="p-4 flex flex-col gap-3" style={{ backgroundColor: backgroundPrimary }}>
                    {/* Product image placeholder */}
                    <div className="w-full aspect-square rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f0f0f0" }}>
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>
                        ))}
                      </div>
                      <span style={{ fontSize: s(12), fontFamily: bodyFont, color: bodyColor }}>18,623 reviews</span>
                    </div>
                    <h2 style={{ fontFamily: displayFont, fontSize: s(22), lineHeight: 1.15, fontWeight: displayWeight, letterSpacing: "-0.4px", margin: 0, color: displayColor }}>
                      Better mornings, brewed for you.
                    </h2>
                    <p style={{ fontFamily: bodyFont, fontSize: s(14), lineHeight: 1.5, fontWeight: bodyWeight, margin: 0, color: bodyColor }}>
                      The smoother, smarter way to start your day — packed with what your body actually needs.
                    </p>
                    <hr style={{ border: "none", borderTop: `1px solid ${borderSubtle}`, margin: 0 }} />
                    <ul className="flex flex-col gap-2" style={{ fontSize: s(14), fontFamily: bodyFont, fontWeight: bodyWeight }}>
                      {["Real ingredients, no shortcuts", "Loved by 18,000+ customers", "30-day money-back guarantee"].map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ backgroundColor: `${primary}20`, color: primary, fontFamily: uiFont }}>✓</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full rounded-lg border-0 cursor-pointer shadow-sm" style={{ backgroundColor: buttonPrimary, color: contrastText(buttonPrimary), fontFamily: uiFont, fontWeight: uiWeight, fontSize: "14px", letterSpacing: "0.04em", textAlign: "center" as const, padding: "12px" }}>
                      BUTTON PRIMARY →
                    </button>
                  </div>

                  {/* 4. Placeholder section 1 — accent 1 */}
                  <div className="p-4 flex flex-col gap-3" style={{ background: `linear-gradient(180deg, #ffffff 0%, #ffffff 15%, ${accent1} 50%, #ffffff 85%, #ffffff 100%)` }}>
                    <div style={{ fontFamily: headings.H1.font, fontWeight: headings.H1.weight, fontSize: s(22), lineHeight: 1.15, letterSpacing: "-0.4px", color: headings.H1.color }}>Heading 1</div>
                    <div style={{ fontFamily: headings.H2.font, fontWeight: headings.H2.weight, fontSize: s(18), lineHeight: 1.2, color: headings.H2.color }}>Heading 2</div>
                    <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, fontSize: s(14), lineHeight: 1.5, margin: 0, color: bodyColor, opacity: 0.8 }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <div className="w-full aspect-video rounded-md relative overflow-hidden" style={{ backgroundColor: "#f0f0f0" }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5" style={{ backgroundColor: primary, color: contrastText(primary), fontFamily: uiFont, fontSize: s(10), fontWeight: 600 }}>
                        Image caption
                      </div>
                    </div>
                  </div>

                  {/* 5. Placeholder section 2 — accent 2 (clone of section 1) */}
                  <div className="p-4 flex flex-col gap-3" style={{ background: `linear-gradient(180deg, #ffffff 0%, #ffffff 15%, ${accent2} 50%, #ffffff 85%, #ffffff 100%)` }}>
                    <div style={{ fontFamily: headings.H1.font, fontWeight: headings.H1.weight, fontSize: s(22), lineHeight: 1.15, letterSpacing: "-0.4px", color: headings.H1.color }}>Heading 1</div>
                    <div style={{ fontFamily: headings.H2.font, fontWeight: headings.H2.weight, fontSize: s(18), lineHeight: 1.2, color: headings.H2.color }}>Heading 2</div>
                    <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, fontSize: s(14), lineHeight: 1.5, margin: 0, color: bodyColor, opacity: 0.8 }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <div className="w-full aspect-video rounded-md relative overflow-hidden" style={{ backgroundColor: "#f0f0f0" }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5" style={{ backgroundColor: primary, color: contrastText(primary), fontFamily: uiFont, fontSize: s(10), fontWeight: 600 }}>
                        Image caption
                      </div>
                    </div>
                  </div>

                  {/* CTA section — button secondary */}
                  <div className="px-4 py-3" style={{ backgroundColor: "#ffffff" }}>
                    <button className="w-full rounded-lg border-0 cursor-pointer shadow-sm" style={{ backgroundColor: buttonSecondary, color: contrastText(buttonSecondary), fontFamily: uiFont, fontWeight: uiWeight, fontSize: "14px", letterSpacing: "0.04em", textAlign: "center" as const, padding: "14px" }}>
                      BUTTON SECONDARY →
                    </button>
                  </div>

                  {/* 6. Placeholder section 3 — accent 3, all heading levels */}
                  <div className="p-4 flex flex-col gap-2" style={{ background: `linear-gradient(180deg, #ffffff 0%, #ffffff 15%, ${accent3} 50%, #ffffff 85%, #ffffff 100%)` }}>
                    <div style={{ fontFamily: headings.H1.font, fontWeight: headings.H1.weight, fontSize: s(22), lineHeight: 1.15, letterSpacing: "-0.4px", color: headings.H1.color }}>Heading 1</div>
                    <div style={{ fontFamily: headings.H2.font, fontWeight: headings.H2.weight, fontSize: s(18), lineHeight: 1.2, color: headings.H2.color }}>Heading 2</div>
                    <div style={{ fontFamily: headings.H3.font, fontWeight: headings.H3.weight, fontSize: s(16), lineHeight: 1.25, color: headings.H3.color }}>Heading 3</div>
                    <div style={{ fontFamily: headings.H4.font, fontWeight: headings.H4.weight, fontSize: s(14), lineHeight: 1.3, color: headings.H4.color }}>Heading 4</div>
                    <div style={{ fontFamily: headings.H5.font, fontWeight: headings.H5.weight, fontSize: s(13), lineHeight: 1.3, color: headings.H5.color }}>Heading 5</div>
                    <div style={{ fontFamily: headings.H6.font, fontWeight: headings.H6.weight, fontSize: s(12), lineHeight: 1.3, color: headings.H6.color }}>Heading 6</div>
                    <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight, fontSize: s(14), lineHeight: 1.5, margin: 0, color: bodyColor, opacity: 0.8 }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                    <div className="w-full aspect-video rounded-md relative overflow-hidden" style={{ backgroundColor: "#f0f0f0" }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5" style={{ backgroundColor: primary, color: contrastText(primary), fontFamily: uiFont, fontSize: s(10), fontWeight: 600 }}>
                        Image caption
                      </div>
                    </div>
                  </div>

                  {/* 8. Footer — primary dark + inverse text */}
                  <div className="flex flex-col gap-2.5 p-4" style={{ backgroundColor: primaryDark, color: contrastText(primaryDark) }}>
                    {logo ? (
                      <img
                        src={luminance(primaryDark) < 0.45 ? (logoDark || logo) : logo}
                        alt="Logo"
                        className="h-5 max-w-[90px] object-contain"
                        style={luminance(primaryDark) < 0.45 && !logoDark ? { filter: "brightness(0) invert(1)" } : undefined}
                      />
                    ) : (
                      <span className="text-xs opacity-75" style={{ fontFamily: uiFont }}>Brand Logo</span>
                    )}
                    <div className="flex gap-3.5 uppercase" style={{ fontFamily: uiFont, fontSize: s(11), fontWeight: 600, letterSpacing: "0.04em" }}>
                      <span>Privacy</span><span>Terms</span><span>Contact</span>
                    </div>
                    <div style={{ fontFamily: bodyFont, fontSize: s(11), opacity: 0.75 }}>
                      © 2026 — All rights reserved.
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
