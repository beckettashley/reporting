"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ImageIcon, Type, Plus, Minus } from "lucide-react";

interface GradientStop {
  position: number; // 0-100
  color: string;
  opacity: number; // 0-100
}

interface ColorValue {
  type: "solid" | "gradient";
  // For solid
  color: string;
  opacity: number; // 0-100
  // For gradient
  gradientType?: "linear" | "radial";
  gradientAngle?: number; // 0-360 for linear
  stops?: GradientStop[];
}

interface ThemeColors {
  primary: ColorValue;
  secondary: ColorValue;
  accent: ColorValue;
  background: ColorValue;
  foreground: ColorValue;
  muted: ColorValue;
  border: ColorValue;
}

// Helper to create a solid color
const solidColor = (hex: string, opacity = 100): ColorValue => ({
  type: "solid",
  color: hex,
  opacity,
});

// Helper to create a gradient
const gradientColor = (stops: GradientStop[], gradientType: "linear" | "radial" = "linear", angle = 90): ColorValue => ({
  type: "gradient",
  color: stops[0]?.color || "#000000",
  opacity: 100,
  gradientType,
  gradientAngle: angle,
  stops,
});

// Convert ColorValue to CSS
const colorToCSS = (cv: ColorValue): string => {
  if (cv.type === "solid") {
    if (cv.opacity < 100) {
      const r = parseInt(cv.color.slice(1, 3), 16);
      const g = parseInt(cv.color.slice(3, 5), 16);
      const b = parseInt(cv.color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${cv.opacity / 100})`;
    }
    return cv.color;
  }
  // Gradient
  const stops = cv.stops?.map(s => {
    const r = parseInt(s.color.slice(1, 3), 16);
    const g = parseInt(s.color.slice(3, 5), 16);
    const b = parseInt(s.color.slice(5, 7), 16);
    const rgba = s.opacity < 100 ? `rgba(${r}, ${g}, ${b}, ${s.opacity / 100})` : s.color;
    return `${rgba} ${s.position}%`;
  }).join(", ");
  if (cv.gradientType === "radial") {
    return `radial-gradient(circle, ${stops})`;
  }
  return `linear-gradient(${cv.gradientAngle}deg, ${stops})`;
};

interface FontConfig {
  family: string;
  weight: string;
  style: string;
  lineHeight: string;
}

interface ThemeFonts {
  titleText: FontConfig;
  headingText: FontConfig;
  subheadingText: FontConfig;
  regularText: FontConfig;
  accentText: FontConfig;
}

const DEFAULT_COLORS: ThemeColors = {
  primary: solidColor("#000000"),
  secondary: solidColor("#6b7280"),
  accent: solidColor("#3b82f6"),
  background: solidColor("#ffffff"),
  foreground: solidColor("#0a0a0a"),
  muted: solidColor("#f5f5f5"),
  border: solidColor("#e5e5e5"),
};

const DEFAULT_FONTS: ThemeFonts = {
  titleText: { family: "Inter", weight: "700", style: "normal", lineHeight: "1.2" },
  headingText: { family: "Inter", weight: "600", style: "normal", lineHeight: "1.3" },
  subheadingText: { family: "Inter", weight: "500", style: "normal", lineHeight: "1.4" },
  regularText: { family: "Inter", weight: "400", style: "normal", lineHeight: "1.5" },
  accentText: { family: "Inter", weight: "400", style: "italic", lineHeight: "1.5" },
};

// Popular Google Fonts (alphabetically sorted)
const GOOGLE_FONTS = [
  "Bebas Neue",
  "Crimson Text",
  "Inter",
  "Lato",
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
].sort();

// Combined weight and style options like Figma
const FONT_WEIGHT_STYLES = [
  { value: "100-normal", weight: "100", style: "normal", label: "Thin" },
  { value: "200-normal", weight: "200", style: "normal", label: "ExtraLight" },
  { value: "300-normal", weight: "300", style: "normal", label: "Light" },
  { value: "400-normal", weight: "400", style: "normal", label: "Regular" },
  { value: "500-normal", weight: "500", style: "normal", label: "Medium" },
  { value: "600-normal", weight: "600", style: "normal", label: "SemiBold" },
  { value: "700-normal", weight: "700", style: "normal", label: "Bold" },
  { value: "800-normal", weight: "800", style: "normal", label: "ExtraBold" },
  { value: "900-normal", weight: "900", style: "normal", label: "Black" },
  { value: "100-italic", weight: "100", style: "italic", label: "Thin Italic" },
  { value: "200-italic", weight: "200", style: "italic", label: "ExtraLight Italic" },
  { value: "300-italic", weight: "300", style: "italic", label: "Light Italic" },
  { value: "400-italic", weight: "400", style: "italic", label: "Italic" },
  { value: "500-italic", weight: "500", style: "italic", label: "Medium Italic" },
  { value: "600-italic", weight: "600", style: "italic", label: "SemiBold Italic" },
  { value: "700-italic", weight: "700", style: "italic", label: "Bold Italic" },
  { value: "800-italic", weight: "800", style: "italic", label: "ExtraBold Italic" },
  { value: "900-italic", weight: "900", style: "italic", label: "Black Italic" },
];

const LINE_HEIGHTS = [
  { value: "1", label: "100%" },
  { value: "1.15", label: "115%" },
  { value: "1.25", label: "125%" },
  { value: "1.3", label: "130%" },
  { value: "1.4", label: "140%" },
  { value: "1.5", label: "150%" },
  { value: "1.6", label: "160%" },
  { value: "1.75", label: "175%" },
  { value: "2", label: "200%" },
];

export default function ThemePage() {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [fonts, setFonts] = useState<ThemeFonts>(DEFAULT_FONTS);
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [activeFontType, setActiveFontType] = useState<keyof ThemeFonts | null>(null);
  const [tempFont, setTempFont] = useState<FontConfig>({ family: "Inter", weight: "400", style: "normal", lineHeight: "1.3" });
  
  // Color picker state
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [activeColorKey, setActiveColorKey] = useState<keyof ThemeColors | null>(null);
  const [tempColor, setTempColor] = useState<ColorValue>(solidColor("#000000"));

  const updateColor = (key: keyof ThemeColors, colorValue: ColorValue) => {
    setColors((prev) => ({ ...prev, [key]: colorValue }));
  };

  const openColorPicker = (key: keyof ThemeColors) => {
    setActiveColorKey(key);
    setTempColor({ ...colors[key] });
    setColorPickerOpen(true);
  };

  const applyColor = () => {
    if (activeColorKey) {
      updateColor(activeColorKey, tempColor);
    }
    setColorPickerOpen(false);
  };

  const addGradientStop = () => {
    if (tempColor.type === "gradient" && tempColor.stops) {
      const newStops = [...tempColor.stops];
      const lastPos = newStops[newStops.length - 1]?.position || 0;
      newStops.push({ position: Math.min(lastPos + 25, 100), color: "#666666", opacity: 100 });
      setTempColor({ ...tempColor, stops: newStops });
    }
  };

  const removeGradientStop = (index: number) => {
    if (tempColor.type === "gradient" && tempColor.stops && tempColor.stops.length > 2) {
      const newStops = tempColor.stops.filter((_, i) => i !== index);
      setTempColor({ ...tempColor, stops: newStops });
    }
  };

  const updateGradientStop = (index: number, updates: Partial<GradientStop>) => {
    if (tempColor.type === "gradient" && tempColor.stops) {
      const newStops = tempColor.stops.map((stop, i) => 
        i === index ? { ...stop, ...updates } : stop
      );
      setTempColor({ ...tempColor, stops: newStops });
    }
  };

  const switchColorType = (type: "solid" | "gradient") => {
    if (type === "solid") {
      setTempColor({
        type: "solid",
        color: tempColor.color,
        opacity: tempColor.opacity,
      });
    } else {
      setTempColor({
        type: "gradient",
        color: tempColor.color,
        opacity: 100,
        gradientType: "linear",
        gradientAngle: 90,
        stops: [
          { position: 0, color: tempColor.color, opacity: 100 },
          { position: 100, color: "#666666", opacity: 100 },
        ],
      });
    }
  };

  // Get display value for color swatch
  const getColorSwatchStyle = (cv: ColorValue): React.CSSProperties => {
    if (cv.type === "solid") {
      return { backgroundColor: colorToCSS(cv) };
    }
    return { background: colorToCSS(cv) };
  };

  // Get display text for color
  const getColorDisplayText = (cv: ColorValue): string => {
    if (cv.type === "solid") {
      return cv.opacity < 100 ? `${cv.color} ${cv.opacity}%` : cv.color;
    }
    return `Gradient (${cv.stops?.length || 0} stops)`;
  };

  const openFontPicker = (type: keyof ThemeFonts) => {
    setActiveFontType(type);
    setTempFont(fonts[type]);
    setFontPickerOpen(true);
  };

  const applyFont = () => {
    if (activeFontType) {
      setFonts((prev) => ({ ...prev, [activeFontType]: tempFont }));
    }
    setFontPickerOpen(false);
  };

  const handleImageUpload = (type: 'logo' | 'favicon', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogo(reader.result as string);
      } else {
        setFavicon(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const getFontDisplayName = (type: keyof ThemeFonts) => {
    const labels: Record<keyof ThemeFonts, string> = {
      titleText: "Title Text",
      headingText: "Heading Text",
      subheadingText: "Subheading",
      regularText: "Regular Text",
      accentText: "Accent Text",
    };
    return labels[type];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Theme</h1>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-24">
          <div className="flex flex-col gap-6">
            {/* Logos Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Logos</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 flex-shrink-0 border rounded flex items-center justify-center bg-muted relative overflow-hidden">
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Label htmlFor="logo" className="text-sm font-medium w-24 flex-shrink-0">
                      Logo
                    </Label>
                    <div className="flex-1 relative">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('logo', file);
                        }}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Favicon */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 flex-shrink-0 border rounded flex items-center justify-center bg-muted relative overflow-hidden">
                    {favicon ? (
                      <img src={favicon} alt="Favicon" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Label htmlFor="favicon" className="text-sm font-medium w-24 flex-shrink-0">
                      Favicon
                    </Label>
                    <div className="flex-1 relative">
                      <Input
                        id="favicon"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('favicon', file);
                        }}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pallet Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pallet</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {Object.entries(colors).map(([key, colorValue]) => (
                  <div key={key} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openColorPicker(key as keyof ThemeColors)}
                      className="w-12 h-10 rounded border flex-shrink-0 cursor-pointer relative overflow-hidden"
                      style={getColorSwatchStyle(colorValue)}
                    >
                      {/* Checkerboard pattern for transparency preview */}
                      {colorValue.opacity < 100 && colorValue.type === "solid" && (
                        <div 
                          className="absolute inset-0 -z-10" 
                          style={{ 
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' viewBox=\'0 0 8 8\'%3E%3Cpath fill=\'%23ccc\' d=\'M0 0h4v4H0V0zm4 4h4v4H4V4z\'/%3E%3C/svg%3E")',
                            backgroundSize: '8px 8px'
                          }} 
                        />
                      )}
                    </button>
                    <div className="flex-1 flex items-center gap-2">
                      <Label className="text-sm font-medium capitalize w-24 flex-shrink-0">
                        {key}
                      </Label>
                      <Input
                        value={getColorDisplayText(colorValue)}
                        onClick={() => openColorPicker(key as keyof ThemeColors)}
                        readOnly
                        className="font-mono text-sm cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Typography Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Typography</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {(Object.keys(fonts) as Array<keyof ThemeFonts>).map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <button
                      onClick={() => openFontPicker(key)}
                      className="w-12 h-10 flex-shrink-0 border rounded flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <Type className="w-4 h-4" />
                    </button>
                    <div className="flex-1 flex items-center gap-2">
                      <Label className="text-sm font-medium w-24 flex-shrink-0">
                        {getFontDisplayName(key)}
                      </Label>
                      <Input
                        value={`${fonts[key].family} - ${FONT_WEIGHT_STYLES.find(o => o.weight === fonts[key].weight && o.style === fonts[key].style)?.label || 'Regular'} - ${LINE_HEIGHTS.find(lh => lh.value === fonts[key].lineHeight)?.label || '150%'}`}
                        readOnly
                        className="flex-1 cursor-pointer"
                        onClick={() => openFontPicker(key)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Live Preview - Right 50% */}
          <Card className="sticky top-6 self-start">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border p-6 space-y-4"
                style={{
                  backgroundColor: colorToCSS(colors.background),
                  borderColor: colorToCSS(colors.border),
                  color: colorToCSS(colors.foreground),
                }}
              >
                <div className="space-y-2">
                  <h3 
                    className="text-2xl font-bold" 
                    style={{ 
                      color: colorToCSS(colors.foreground), 
                      fontFamily: fonts.titleText.family,
                      fontWeight: fonts.titleText.weight,
                      fontStyle: fonts.titleText.style,
                      lineHeight: fonts.titleText.lineHeight,
                    }}
                  >
                    Title Text Example
                  </h3>
                  <h4 
                    className="text-xl font-semibold" 
                    style={{ 
                      color: colorToCSS(colors.foreground), 
                      fontFamily: fonts.headingText.family,
                      fontWeight: fonts.headingText.weight,
                      fontStyle: fonts.headingText.style,
                      lineHeight: fonts.headingText.lineHeight,
                    }}
                  >
                    Heading Text Example
                  </h4>
                  <h5 
                    className="text-lg font-medium" 
                    style={{ 
                      color: colorToCSS(colors.secondary), 
                      fontFamily: fonts.subheadingText.family,
                      fontWeight: fonts.subheadingText.weight,
                      fontStyle: fonts.subheadingText.style,
                      lineHeight: fonts.subheadingText.lineHeight,
                    }}
                  >
                    Subheading Text Example
                  </h5>
                  <p 
                    className="text-sm" 
                    style={{ 
                      color: colorToCSS(colors.foreground), 
                      fontFamily: fonts.regularText.family,
                      fontWeight: fonts.regularText.weight,
                      fontStyle: fonts.regularText.style,
                      lineHeight: fonts.regularText.lineHeight,
                    }}
                  >
                    This is regular body text. It shows how your content will look with the selected typography settings.
                  </p>
                  <p 
                    className="text-sm" 
                    style={{ 
                      color: colorToCSS(colors.accent), 
                      fontFamily: fonts.accentText.family,
                      fontWeight: fonts.accentText.weight,
                      fontStyle: fonts.accentText.style,
                      lineHeight: fonts.accentText.lineHeight,
                    }}
                  >
                    This is accent text for emphasis and highlights.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium text-white"
                    style={{ 
                      background: colorToCSS(colors.primary), 
                      fontFamily: fonts.regularText.family,
                      fontWeight: fonts.regularText.weight,
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-md text-sm font-medium text-white"
                    style={{ 
                      background: colorToCSS(colors.accent), 
                      fontFamily: fonts.regularText.family,
                      fontWeight: fonts.regularText.weight,
                    }}
                  >
                    Accent Button
                  </button>
                </div>

                <div
                  className="p-4 rounded-md"
                  style={{ backgroundColor: colorToCSS(colors.muted) }}
                >
                  <p 
                    className="text-sm" 
                    style={{ 
                      color: colorToCSS(colors.foreground), 
                      fontFamily: fonts.regularText.family,
                      fontWeight: fonts.regularText.weight,
                    }}
                  >
                    Muted background section with foreground text
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 rounded" style={{ background: colorToCSS(colors.primary) }} />
                  <div className="h-12 rounded" style={{ background: colorToCSS(colors.secondary) }} />
                  <div className="h-12 rounded" style={{ background: colorToCSS(colors.accent) }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Font Picker Modal */}
      <Dialog open={fontPickerOpen} onOpenChange={setFontPickerOpen}>
        <DialogContent className="max-w-6xl" aria-describedby={undefined}>
          {/* Dynamically load Google Fonts for preview */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap');
            `
          }} />
          <DialogHeader>
            <DialogTitle>
              {activeFontType && `Select ${getFontDisplayName(activeFontType)}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Google Fonts Section */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5">
                <Label className="text-sm font-medium mb-2 block">Font Family</Label>
                <Select value={tempFont.family} onValueChange={(value) => setTempFont({ ...tempFont, family: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4">
                <Label className="text-sm font-medium mb-2 block">Weight / Style</Label>
                <Select 
                  value={`${tempFont.weight}-${tempFont.style}`} 
                  onValueChange={(value) => {
                    const option = FONT_WEIGHT_STYLES.find(o => o.value === value);
                    if (option) {
                      setTempFont({ ...tempFont, weight: option.weight, style: option.style });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHT_STYLES.slice(0, 9).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    <div className="my-1 border-t border-muted" />
                    {FONT_WEIGHT_STYLES.slice(9).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Label className="text-sm font-medium mb-2 block">Line Height</Label>
                <Select value={tempFont.lineHeight} onValueChange={(value) => setTempFont({ ...tempFont, lineHeight: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINE_HEIGHTS.map((lineHeight) => (
                      <SelectItem key={lineHeight.value} value={lineHeight.value}>
                        {lineHeight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Upload Font Section */}
            <div className="space-y-2 pt-3">
              <Label className="text-sm font-medium">Upload Font</Label>
              <Input
                type="file"
                accept=".woff,.woff2,.ttf,.otf"
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: .woff, .woff2, .ttf, .otf
              </p>
            </div>

            {/* Font Preview - Fixed Height */}
            <div className="border rounded-lg p-6 bg-muted/30">
              <Label className="text-sm font-medium mb-3 block text-muted-foreground">Preview</Label>
              <div className="h-24 overflow-hidden">
                <p 
                  className="text-3xl"
                  style={{ 
                    fontFamily: tempFont.family,
                    fontWeight: tempFont.weight,
                    fontStyle: tempFont.style,
                    lineHeight: tempFont.lineHeight,
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setFontPickerOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={applyFont}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Color Picker Modal */}
      <Dialog open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
        <DialogContent className="sm:max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {activeColorKey && `Edit ${activeColorKey} Color`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Type Toggle */}
            <div className="flex gap-2">
              <Button
                variant={tempColor.type === "solid" ? "default" : "outline"}
                size="sm"
                onClick={() => switchColorType("solid")}
                className="flex-1"
              >
                Solid
              </Button>
              <Button
                variant={tempColor.type === "gradient" ? "default" : "outline"}
                size="sm"
                onClick={() => switchColorType("gradient")}
                className="flex-1"
              >
                Gradient
              </Button>
            </div>

            {tempColor.type === "solid" ? (
              /* Solid Color Controls */
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Color</Label>
                    <Input
                      type="color"
                      value={tempColor.color}
                      onChange={(e) => setTempColor({ ...tempColor, color: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium mb-2 block">Hex</Label>
                    <Input
                      value={tempColor.color}
                      onChange={(e) => setTempColor({ ...tempColor, color: e.target.value })}
                      placeholder="#000000"
                      className="font-mono"
                    />
                  </div>
                  <div className="w-20">
                    <Label className="text-sm font-medium mb-2 block">Opacity</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={tempColor.opacity}
                        onChange={(e) => setTempColor({ ...tempColor, opacity: parseInt(e.target.value) || 0 })}
                        className="font-mono text-sm"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-2">
                  <div 
                    className="h-4 rounded relative"
                    style={{ 
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' viewBox=\'0 0 8 8\'%3E%3Cpath fill=\'%23ccc\' d=\'M0 0h4v4H0V0zm4 4h4v4H4V4z\'/%3E%3C/svg%3E")',
                      backgroundSize: '8px 8px'
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded"
                      style={{ 
                        background: `linear-gradient(to right, transparent, ${tempColor.color})` 
                      }}
                    />
                  </div>
                  <Slider
                    value={[tempColor.opacity]}
                    onValueChange={([value]) => setTempColor({ ...tempColor, opacity: value })}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            ) : (
              /* Gradient Controls */
              <div className="space-y-4">
                {/* Gradient Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Type</Label>
                    <Select 
                      value={tempColor.gradientType || "linear"} 
                      onValueChange={(value: "linear" | "radial") => setTempColor({ ...tempColor, gradientType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="radial">Radial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {tempColor.gradientType === "linear" && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Angle</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={360}
                          value={tempColor.gradientAngle || 90}
                          onChange={(e) => setTempColor({ ...tempColor, gradientAngle: parseInt(e.target.value) || 0 })}
                          className="font-mono"
                        />
                        <span className="text-sm text-muted-foreground">deg</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gradient Preview */}
                <div 
                  className="h-8 rounded border"
                  style={{ background: colorToCSS(tempColor) }}
                />

                {/* Stops */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Stops</Label>
                    <Button variant="ghost" size="sm" onClick={addGradientStop}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tempColor.stops?.map((stop, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <div className="w-12">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={stop.position}
                          onChange={(e) => updateGradientStop(index, { position: parseInt(e.target.value) || 0 })}
                          className="font-mono text-xs h-8 px-2"
                        />
                      </div>
                      <Input
                        type="color"
                        value={stop.color}
                        onChange={(e) => updateGradientStop(index, { color: e.target.value })}
                        className="w-10 h-8 p-0.5 cursor-pointer"
                      />
                      <Input
                        value={stop.color}
                        onChange={(e) => updateGradientStop(index, { color: e.target.value })}
                        className="flex-1 font-mono text-xs h-8"
                      />
                      <div className="w-14 flex items-center gap-0.5">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={stop.opacity}
                          onChange={(e) => updateGradientStop(index, { opacity: parseInt(e.target.value) || 0 })}
                          className="font-mono text-xs h-8 px-1"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => removeGradientStop(index)}
                        disabled={tempColor.stops && tempColor.stops.length <= 2}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="border rounded-lg p-4 space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Preview</Label>
              <div 
                className="h-16 rounded relative overflow-hidden"
                style={{ 
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'%23ddd\' d=\'M0 0h8v8H0V0zm8 8h8v8H8V8z\'/%3E%3C/svg%3E")',
                  backgroundSize: '16px 16px'
                }}
              >
                <div 
                  className="absolute inset-0"
                  style={getColorSwatchStyle(tempColor)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setColorPickerOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={applyColor}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pinned Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 flex items-center justify-end gap-3 z-10 shadow-lg">
        <Button variant="outline" onClick={() => {
          setColors(DEFAULT_COLORS);
          setFonts(DEFAULT_FONTS);
        }}>
          Cancel
        </Button>
        <Button>Save</Button>
      </div>
    </div>
  );
}
