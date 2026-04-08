"use client"

import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface ColorPickerProps {
  value: string          // "" | "#rrggbb" | "#rrggbbaa"
  onChange: (value: string) => void
  className?: string
}

function getHex(v: string): string {
  if (!v) return "#ffffff"
  if (/^#[0-9a-fA-F]{8}$/i.test(v)) return v.slice(0, 7)
  if (/^#[0-9a-fA-F]{6}$/i.test(v)) return v
  return "#ffffff"
}

function getAlpha(v: string): number {
  if (!v) return 100
  if (/^#[0-9a-fA-F]{8}$/i.test(v)) {
    return Math.round((parseInt(v.slice(7, 9), 16) / 255) * 100)
  }
  return 100
}

function build(hex: string, alpha: number): string {
  if (alpha >= 100) return hex
  if (alpha <= 0) return ""
  const a = Math.round((alpha / 100) * 255).toString(16).padStart(2, "0")
  return `${hex}${a}`
}

function AlphaSlider({ hex, value, onChange }: { hex: string; value: number; onChange: (v: number) => void }) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      onValueChange={([v]) => onChange(v)}
      min={0}
      max={100}
      step={1}
      className="relative flex w-full touch-none items-center select-none"
    >
      <SliderPrimitive.Track
        className="relative h-3 w-full grow rounded-full overflow-hidden border border-border/50"
        style={{
          backgroundImage: [
            `linear-gradient(to right, ${hex}00, ${hex})`,
            "repeating-conic-gradient(#d1d5db 0% 25%, #f9fafb 0% 50%)",
          ].join(", "),
          backgroundSize: "auto, 8px 8px",
        }}
      >
        {/* Range intentionally transparent — gradient shows through */}
        <SliderPrimitive.Range className="absolute h-full bg-transparent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-border bg-white shadow-sm outline-none cursor-pointer hover:ring-2 hover:ring-ring/50 focus-visible:ring-2 focus-visible:ring-ring/50" />
    </SliderPrimitive.Root>
  )
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const hex = getHex(value)
  const alpha = getAlpha(value)

  return (
    <div className={cn("space-y-2", className)}>
      {/* Row: swatch + hex + clear */}
      <div className="flex items-center gap-1.5">
        {/* Swatch — checkerboard shows when transparent */}
        <div className="relative w-8 h-8 shrink-0 rounded border border-border overflow-hidden cursor-pointer">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-conic-gradient(#d1d5db 0% 25%, #f9fafb 0% 50%)",
              backgroundSize: "8px 8px",
            }}
          />
          {value && <div className="absolute inset-0" style={{ backgroundColor: value }} />}
          {/* Invisible native picker on top */}
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(build(e.target.value, alpha))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="transparent"
          className="flex-1 h-8 font-mono text-xs"
        />

        {value && (
          <button
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-foreground px-1 shrink-0 leading-none text-base"
            title="Clear (transparent)"
          >
            ×
          </button>
        )}
      </div>

      {/* Alpha slider — always visible */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-12 shrink-0">Opacity</span>
        <AlphaSlider
          hex={hex}
          value={alpha}
          onChange={(v) => onChange(build(hex, v))}
        />
        <span className="text-[10px] text-muted-foreground w-7 text-right shrink-0">
          {alpha}%
        </span>
      </div>
    </div>
  )
}
