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
  textPrimary: string,
  background: string
): DerivedColor[] {
  const bgLum = luminance(background);
  const isLightBg = bgLum > 0.5;

  const brandPrimaryLum = luminance(brandPrimary);
  const brandPrimaryDark =
    brandPrimaryLum < 0.05
      ? brandPrimary
      : darkenHex(brandPrimary, 20);

  const brandPrimarySubtle = hexWithOpacity(brandPrimary, 0.1, background);
  const accentSubtle = hexWithOpacity(accent, 0.15, background);

  const surfaceSubtle = isLightBg
    ? darkenHex(background, 3)
    : lightenHex(background, 5);

  const borderSource = isLightBg ? textPrimary : "#ffffff";
  const borderDefault = hexWithOpacity(borderSource, 0.2, background);
  const borderSubtle = hexWithOpacity(borderSource, 0.1, background);

  return [
    { name: "Brand Primary Dark", value: brandPrimaryDark },
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
      <label
        className="w-10 h-10 rounded border border-border flex-shrink-0 cursor-pointer block relative overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
      <div className="flex flex-col gap-1 flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm h-8"
          placeholder="#000000"
        />
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
  customFont,
  onCustomFontUpload,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
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
    <div className="flex flex-col gap-1.5" ref={dropdownRef}>
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="relative">
        <button
          type="button"
          onClick={() => { setOpen(!open); setSearch(""); }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-colors bg-background hover:bg-muted text-left h-9"
          style={{ fontFamily: value === "Custom" ? undefined : value }}
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
                  style={{ fontFamily: font === "Custom" ? undefined : font }}
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-12 h-10 flex-shrink-0 border rounded flex items-center justify-center bg-muted relative overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-contain"
          />
        ) : (
          <ImageIcon className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <Label className="text-sm font-medium">{label}</Label>
        {helper && (
          <p className="text-xs text-muted-foreground">{helper}</p>
        )}
        <Input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="cursor-pointer h-9"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ThemePage() {
  // Section 1: Brand Colors
  const [brandPrimary, setBrandPrimary] = useState("#3d348b");
  const [accent, setAccent] = useState("#ffd61f");
  const [textPrimary, setTextPrimary] = useState("#1a1a1a");
  const [background, setBackground] = useState("#ffffff");

  // Section 2: Gradient Tints
  // Section 2: Alternate Backgrounds
  interface AltBackground {
    type: "solid" | "gradient";
    color: string;
    opacity: number; // 0-100
    color2?: string; // for gradient second stop
    opacity2?: number;
  }
  const [altBackgrounds, setAltBackgrounds] = useState<AltBackground[]>([
    { type: "solid", color: "#faf8f6", opacity: 100 },
    { type: "solid", color: "#fcf3df", opacity: 100 },
  ]);
  const updateAltBg = (index: number, updates: Partial<AltBackground>) => {
    setAltBackgrounds((prev) => prev.map((bg, i) => i === index ? { ...bg, ...updates } : bg));
  };
  const addAltBg = () => {
    setAltBackgrounds((prev) => [...prev, { type: "solid", color: "#f0f0f0", opacity: 80 }]);
  };
  const removeAltBg = (index: number) => {
    if (altBackgrounds.length <= 2) return;
    setAltBackgrounds((prev) => prev.filter((_, i) => i !== index));
  };

  // Section 3: Typography
  const [displayFont, setDisplayFont] = useState("Libre Baskerville");
  const [bodyFont, setBodyFont] = useState("DM Sans");
  const [uiFont, setUiFont] = useState("Geist");
  const [condensedFont, setCondensedFont] = useState("Barlow");
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [customFonts, setCustomFonts] = useState<Record<string, string | null>>({
    display: null, body: null, ui: null, condensed: null,
  });

  // Section 4: Images
  const [logo, setLogo] = useState<string | null>(null);
  const [logoDark, setLogoDark] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [logoLink, setLogoLink] = useState("https://javvy.com");

  // Derived colors (computed reactively)
  const derivedColors = useMemo(
    () => computeDerivedColors(brandPrimary, accent, textPrimary, background),
    [brandPrimary, accent, textPrimary, background]
  );

  const brandPrimaryDark = derivedColors[0].value;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Theme{" "}
            <span className="text-sm font-normal text-muted-foreground">
              — placeholder, not connected to backend
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-24">
          {/* ============================================================= */}
          {/* LEFT COLUMN: All input sections */}
          {/* ============================================================= */}
          <div className="flex flex-col gap-6">
            {/* ------ Section 1: Brand Colors ------ */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Brand Colors</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <ColorField
                  label="Brand Primary"
                  value={brandPrimary}
                  onChange={setBrandPrimary}
                />
                <ColorField
                  label="Accent"
                  value={accent}
                  onChange={setAccent}
                />
                <ColorField
                  label="Text Primary"
                  value={textPrimary}
                  onChange={setTextPrimary}
                />
                <ColorField
                  label="Background"
                  value={background}
                  onChange={setBackground}
                />
              </CardContent>
            </Card>

            {/* ------ Section 2: Alternate Backgrounds ------ */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Alternate Backgrounds</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Section backgrounds that alternate with the base background. Minimum 2 required — sections distribute automatically.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {altBackgrounds.map((bg, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Alternate {i + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateAltBg(i, { type: bg.type === "solid" ? "gradient" : "solid" })}
                          className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                        >
                          {bg.type === "solid" ? "Solid" : "Gradient"}
                        </button>
                        {altBackgrounds.length > 2 && (
                          <button type="button" onClick={() => removeAltBg(i)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Remove</button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="w-8 h-8 rounded border border-border flex-shrink-0 cursor-pointer block relative overflow-hidden" style={{ backgroundColor: bg.color }}>
                        <input type="color" value={bg.color} onChange={(e) => updateAltBg(i, { color: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </label>
                      <Input value={bg.color} onChange={(e) => updateAltBg(i, { color: e.target.value })} className="font-mono text-sm h-8 w-24" />
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-xs text-muted-foreground w-6 text-right">{bg.opacity}%</span>
                        <input type="range" min={0} max={100} value={bg.opacity} onChange={(e) => updateAltBg(i, { opacity: Number(e.target.value) })} className="flex-1 h-1.5 accent-foreground" />
                      </div>
                    </div>
                    {bg.type === "gradient" && (
                      <div className="flex items-center gap-3">
                        <label className="w-8 h-8 rounded border border-border flex-shrink-0 cursor-pointer block relative overflow-hidden" style={{ backgroundColor: bg.color2 || "#ffffff" }}>
                          <input type="color" value={bg.color2 || "#ffffff"} onChange={(e) => updateAltBg(i, { color2: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </label>
                        <Input value={bg.color2 || "#ffffff"} onChange={(e) => updateAltBg(i, { color2: e.target.value })} className="font-mono text-sm h-8 w-24" />
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className="text-xs text-muted-foreground w-6 text-right">{bg.opacity2 ?? 100}%</span>
                          <input type="range" min={0} max={100} value={bg.opacity2 ?? 100} onChange={(e) => updateAltBg(i, { opacity2: Number(e.target.value) })} className="flex-1 h-1.5 accent-foreground" />
                        </div>
                      </div>
                    )}
                    {/* Preview strip */}
                    <div className="h-6 rounded" style={{
                      background: bg.type === "solid"
                        ? `rgba(${hexToRgb(bg.color).r}, ${hexToRgb(bg.color).g}, ${hexToRgb(bg.color).b}, ${bg.opacity / 100})`
                        : `linear-gradient(90deg, rgba(${hexToRgb(bg.color).r}, ${hexToRgb(bg.color).g}, ${hexToRgb(bg.color).b}, ${bg.opacity / 100}), rgba(${hexToRgb(bg.color2 || "#ffffff").r}, ${hexToRgb(bg.color2 || "#ffffff").g}, ${hexToRgb(bg.color2 || "#ffffff").b}, ${(bg.opacity2 ?? 100) / 100}))`
                    }} />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addAltBg} className="w-full">
                  + Add alternate background
                </Button>
              </CardContent>
            </Card>

            {/* ------ Section 3: Typography ------ */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <Type className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Typography</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <FontSelect
                  label="Display Font"
                  description="Hero headlines, section display text"
                  value={displayFont}
                  onChange={setDisplayFont}
                  customFont={customFonts.display}
                  onCustomFontUpload={(name) => setCustomFonts((p) => ({ ...p, display: name }))}
                />
                <FontSelect
                  label="Body Font"
                  description="Paragraphs, descriptions"
                  value={bodyFont}
                  onChange={setBodyFont}
                  customFont={customFonts.body}
                  onCustomFontUpload={(name) => setCustomFonts((p) => ({ ...p, body: name }))}
                />
                <FontSelect
                  label="UI Font"
                  description="Buttons, tables, badges, nav"
                  value={uiFont}
                  onChange={setUiFont}
                  customFont={customFonts.ui}
                  onCustomFontUpload={(name) => setCustomFonts((p) => ({ ...p, ui: name }))}
                />
                <FontSelect
                  label="Condensed Font"
                  description="Urgency banners"
                  value={condensedFont}
                  onChange={setCondensedFont}
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

            {/* ------ Section 4: Images ------ */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Images</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <ImageUploadField
                  label="Logo"
                  preview={logo}
                  onUpload={setLogo}
                />
                <ImageUploadField
                  label="Logo Dark Variant"
                  helper="For dark backgrounds. Falls back to primary logo."
                  preview={logoDark}
                  onUpload={setLogoDark}
                />
                <ImageUploadField
                  label="Favicon"
                  preview={favicon}
                  onUpload={setFavicon}
                />
                <ImageUploadField
                  label="OG Image"
                  preview={ogImage}
                  onUpload={setOgImage}
                />
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium">Logo Link</Label>
                  <Input
                    type="url"
                    value={logoLink}
                    onChange={(e) => setLogoLink(e.target.value)}
                    placeholder="https://brand.com"
                    className="h-9"
                  />
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
              <CardContent>
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{ backgroundColor: background }}
                >
                  {/* Navbar mockup */}
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: derivedColors[7].value }}
                  >
                    <div
                      className="text-sm font-semibold"
                      style={{
                        color: textPrimary,
                        fontFamily: uiFont,
                      }}
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt="Logo"
                          className="h-6 object-contain"
                        />
                      ) : (
                        "Brand Logo"
                      )}
                    </div>
                    <div
                      className="flex gap-3 text-xs"
                      style={{
                        color: textPrimary,
                        fontFamily: uiFont,
                      }}
                    >
                      <span>Shop</span>
                      <span>About</span>
                      <span>Contact</span>
                    </div>
                  </div>

                  {/* Hero section */}
                  <div className="px-6 py-8">
                    <h2
                      className="text-xl font-bold mb-2"
                      style={{
                        color: textPrimary,
                        fontFamily: displayFont,
                        fontSize: `${baseFontSize * 1.5}px`,
                      }}
                    >
                      Your Brand Headline
                    </h2>
                    <p
                      className="mb-4 leading-relaxed"
                      style={{
                        color: textPrimary,
                        fontFamily: bodyFont,
                        fontSize: `${baseFontSize}px`,
                        opacity: 0.8,
                      }}
                    >
                      This is body text rendered in your chosen Body Font. It
                      shows how paragraphs and descriptions will appear across
                      your pages.
                    </p>
                    <button
                      className="px-5 py-2.5 rounded-md text-sm font-semibold transition-colors"
                      style={{
                        backgroundColor: brandPrimaryDark,
                        color: "#ffffff",
                        fontFamily: uiFont,
                        fontSize: `${baseFontSize * 1.125}px`,
                      }}
                    >
                      Shop Now
                    </button>
                  </div>

                  {/* Alternate backgrounds preview strip */}
                  <div className="flex h-6">
                    {altBackgrounds.map((bg, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{
                          background: bg.type === "solid"
                            ? `rgba(${hexToRgb(bg.color).r}, ${hexToRgb(bg.color).g}, ${hexToRgb(bg.color).b}, ${bg.opacity / 100})`
                            : `linear-gradient(90deg, rgba(${hexToRgb(bg.color).r}, ${hexToRgb(bg.color).g}, ${hexToRgb(bg.color).b}, ${bg.opacity / 100}), rgba(${hexToRgb(bg.color2 || "#ffffff").r}, ${hexToRgb(bg.color2 || "#ffffff").g}, ${hexToRgb(bg.color2 || "#ffffff").b}, ${(bg.opacity2 ?? 100) / 100}))`
                        }}
                      />
                    ))}
                  </div>

                  {/* Urgency banner mockup */}
                  <div
                    className="px-4 py-2 text-center text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: accent,
                      color: textPrimary,
                      fontFamily: condensedFont,
                    }}
                  >
                    Limited Time — Up to 40% Off
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
