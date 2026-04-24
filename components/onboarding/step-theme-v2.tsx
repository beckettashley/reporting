"use client";

const _THEME_VERSION = 12;

import { useRef, useCallback } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { Button } from "@/components/ui/button";
import {
  Check,
  Menu,
  Star,
  ChevronDown,
  Upload,
  ShieldCheck,
} from "lucide-react";

// Velocity system colors — hardcoded, never exposed
const VELOCITY_POSITIVE = "#00B67A";

// WCAG auto-contrast: luminance > 0.179 = dark text, else white
function getContrastColor(hex: string | null): string {
  if (!hex) return "#1a1a1a";
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "#1a1a1a";
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.179 ? "#1a1a1a" : "#ffffff";
}

export default function StepTheme() {
  const { state, updateTheme } = useOnboarding();
  const theme = state?.theme;

  const coreColors = theme?.coreColors || [];
  const extendedColors = theme?.extendedColors || [];
  const typography = theme?.typography || [];
  const logo = theme?.logo;
  const favicon = theme?.favicon;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Get color by id
  const getColor = useCallback((id: string): string => {
    const found = coreColors.find((c) => c.id === id);
    return found?.hex || "#000000";
  }, [coreColors]);

  // Handle color change for core colors
  const handleCoreColorChange = useCallback(
    (colorId: string, newHex: string) => {
      const updated = coreColors.map((c) =>
        c.id === colorId ? { ...c, hex: newHex } : c
      );
      updateTheme({ coreColors: updated });
    },
    [coreColors, updateTheme]
  );

  // Handle color change for extended colors
  const handleExtendedColorChange = useCallback(
    (colorId: string, newHex: string) => {
      const updated = extendedColors.map((c) =>
        c.id === colorId ? { ...c, hex: newHex } : c
      );
      updateTheme({ extendedColors: updated });
    },
    [extendedColors, updateTheme]
  );

  // Handle file upload for logo/favicon
  const handleFileUpload = useCallback(
    (type: "logo" | "favicon", file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        updateTheme({ [type]: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [updateTheme]
  );

  // Color swatch row component
  const ColorRow = ({
    color,
    onChange,
  }: {
    color: { id: string; name: string; hex: string | null };
    onChange: (id: string, hex: string) => void;
  }) => {
    const isEmpty = !color.hex;
    return (
      <div className="flex items-center gap-3 py-2">
        <label
          className="relative h-10 w-10 rounded-lg cursor-pointer shrink-0 border overflow-hidden hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-shadow"
          style={{
            backgroundColor: color.hex || "transparent",
            backgroundImage: isEmpty
              ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
              : undefined,
            backgroundSize: isEmpty ? "8px 8px" : undefined,
            backgroundPosition: isEmpty ? "0 0, 0 4px, 4px -4px, -4px 0px" : undefined,
            borderStyle: isEmpty ? "dashed" : "solid",
          }}
        >
          <input
            type="color"
            value={color.hex || "#ffffff"}
            onChange={(e) => onChange(color.id, e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </label>
        <span className="text-sm flex-1">{color.name}</span>
        <span className="text-xs font-mono text-muted-foreground">
          {color.hex?.toUpperCase() || "—"}
        </span>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[600px]">
      {/* Left Column — Theme Controls */}
      <div className="w-[400px] shrink-0 overflow-y-auto bg-white p-6 space-y-8 border-r">
        {/* Section 1: Core colors */}
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Brand colors
          </h3>
          <div className="space-y-0">
            {coreColors.map((color) => (
              <ColorRow key={color.id} color={color} onChange={handleCoreColorChange} />
            ))}
          </div>
        </section>

        {/* Section 2: Extended palette */}
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Extended palette
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Optional. Used by AI for page generation.
          </p>
          <div className="space-y-0">
            {extendedColors.map((color) => (
              <ColorRow key={color.id} color={color} onChange={handleExtendedColorChange} />
            ))}
          </div>
        </section>

        {/* Section 3: Assets */}
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Assets
          </h3>
          <div className="space-y-2">
            {/* Logo row */}
            <div
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <div className="h-6 w-6 rounded bg-gray-300" />
                )}
              </div>
              <span className="text-sm flex-1">Logo</span>
              <Button variant="outline" size="sm" className="shrink-0">
                Replace
              </Button>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload("logo", file);
              }}
            />

            {/* Favicon row */}
            <div
              onClick={() => faviconInputRef.current?.click()}
              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <div className="h-6 w-6 rounded overflow-hidden">
                  {favicon ? (
                    <img src={favicon} alt="Favicon" className="h-full w-full object-contain" />
                  ) : (
                    <div className="h-full w-full rounded bg-gray-300" />
                  )}
                </div>
              </div>
              <span className="text-sm flex-1">Favicon</span>
              <Button variant="outline" size="sm" className="shrink-0">
                Replace
              </Button>
            </div>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload("favicon", file);
              }}
            />
          </div>
        </section>

        {/* Section 4: Typography */}
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Typography
          </h3>
          <div className="space-y-2">
            {typography.map((typo) => (
              <div key={typo.name} className="flex items-center gap-3 py-1.5">
                <span className="text-sm text-muted-foreground w-24">{typo.name}</span>
                <span className="text-sm flex-1">
                  {typo.font} · {typo.weight}
                </span>
                <span
                  className="text-lg"
                  style={{
                    fontFamily: typo.font,
                    fontWeight: typo.weight,
                  }}
                >
                  Aa
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Font colors are set automatically.
          </p>
        </section>
      </div>

      {/* Right Column — Live Preview */}
      <div className="flex-1 overflow-y-auto bg-[#F2F2F2] flex items-start justify-center py-8">
        <div className="w-[300px] rounded-[24px] border border-gray-300 bg-white shadow-xl overflow-hidden">
          {/* Banner bar — Primary bg */}
          <div
            className="py-2 px-3 flex items-center justify-between"
            style={{
              backgroundColor: getColor("primary"),
              color: getContrastColor(getColor("primary")),
            }}
          >
            <span className="text-[10px] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              Save 25% Today Only
            </span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-semibold"
              style={{
                backgroundColor: getColor("cta"),
                color: getContrastColor(getColor("cta")),
              }}
            >
              Claim Now
            </span>
          </div>

          {/* Nav — white bg, logo centered */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
            <Menu className="h-5 w-5 text-gray-700" />
            <div className="flex items-center gap-1.5">
              {logo ? (
                <img src={logo} alt="Logo" className="h-6 max-w-[80px] object-contain" />
              ) : (
                <span className="text-sm font-bold text-gray-900">Logo</span>
              )}
            </div>
            <div className="w-5" />
          </div>

          {/* Hero image placeholder */}
          <div className="h-48 bg-gradient-to-b from-gray-100 to-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-24 h-24 rounded-full"
                style={{ backgroundColor: getColor("accent") }}
              />
            </div>
          </div>

          {/* Product body */}
          <div className="p-4 space-y-3">
            {/* Star rating — CTA color */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-current"
                  style={{ color: getColor("cta") }}
                />
              ))}
              <Star
                className="h-4 w-4"
                style={{ color: getColor("cta") }}
              />
              <span className="ml-1.5 text-xs text-gray-600">4.5 Stars</span>
            </div>

            {/* Product title — Primary color */}
            <h2
              className="text-lg font-bold leading-tight"
              style={{ color: getColor("primary") }}
            >
              Product name
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">$49.99</span>
              <span className="text-sm line-through text-gray-400">$69.99</span>
              <span
                className="text-xs font-medium"
                style={{ color: VELOCITY_POSITIVE }}
              >
                Save $20.00
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
            </p>

            {/* Checklist items — Velocity green checkmarks */}
            <div className="space-y-2 py-1">
              {["Premium quality materials", "30-day money-back guarantee", "Free shipping worldwide"].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check
                    className="h-4 w-4 mt-0.5 shrink-0"
                    style={{ color: VELOCITY_POSITIVE }}
                  />
                  <span className="text-xs text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            {/* Primary CTA — CTA bg */}
            <button
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: getColor("cta"),
                color: getContrastColor(getColor("cta")),
              }}
            >
              Buy Now
            </button>

            {/* Secondary CTA — Primary color outlined */}
            <button
              className="w-full py-2.5 rounded-lg text-sm font-semibold border-2 bg-transparent transition-colors hover:bg-gray-50"
              style={{
                borderColor: getColor("primary"),
                color: getColor("primary"),
              }}
            >
              Learn More
            </button>

            {/* Accordion rows — Primary color chevrons */}
            <div className="border-t pt-3 space-y-2">
              {["Details", "Shipping", "Returns"].map((label) => (
                <div key={label} className="flex items-center justify-between py-1.5">
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                  <ChevronDown
                    className="h-4 w-4"
                    style={{ color: getColor("primary") }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee block — Secondary bg */}
          <div
            className="p-4 space-y-2"
            style={{
              backgroundColor: getColor("secondary"),
              color: getContrastColor(getColor("secondary")),
            }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" style={{ color: getColor("cta") }} />
              <span
                className="text-sm font-semibold"
                style={{ color: getColor("cta") }}
              >
                100% Satisfaction Guarantee
              </span>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              If you&apos;re not completely satisfied, return within 30 days for a full refund.
            </p>
          </div>

          {/* Footer nav — Primary bg */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              backgroundColor: getColor("primary"),
              color: getContrastColor(getColor("primary")),
            }}
          >
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="h-4 max-w-[60px] object-contain brightness-0 invert opacity-80"
              />
            ) : (
              <span className="text-xs font-medium opacity-80">Logo</span>
            )}
            <div className="flex items-center gap-3">
              {["Shop", "FAQ", "Contact"].map((link) => (
                <span key={link} className="text-[10px] opacity-60 hover:opacity-100 cursor-pointer">
                  {link}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
