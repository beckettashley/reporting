"use client"

import * as React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import { X, Square, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorPickerValue {
  mode: "solid" | "gradient"
  solid: { hex: string; opacity: number }
  gradient: {
    type: "linear"
    angle: number
    stops: Array<{ id: string; position: number; hex: string; opacity: number }>
  }
}

interface ColorPickerProps {
  value: ColorPickerValue
  onChange: (value: ColorPickerValue) => void
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Color conversion utilities
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace(/^#/, "")
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === rn) {
      h = ((gn - bn) / d) % 6
    } else if (max === gn) {
      h = (bn - rn) / d + 2
    } else {
      h = (rn - gn) / d + 4
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : d / max
  const v = max

  return { h, s, v }
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let rn = 0
  let gn = 0
  let bn = 0

  if (h >= 0 && h < 60) {
    rn = c; gn = x; bn = 0
  } else if (h >= 60 && h < 120) {
    rn = x; gn = c; bn = 0
  } else if (h >= 120 && h < 180) {
    rn = 0; gn = c; bn = x
  } else if (h >= 180 && h < 240) {
    rn = 0; gn = x; bn = c
  } else if (h >= 240 && h < 300) {
    rn = x; gn = 0; bn = c
  } else {
    rn = c; gn = 0; bn = x
  }

  const r = Math.round((rn + m) * 255)
  const g = Math.round((gn + m) * 255)
  const b = Math.round((bn + m) * 255)

  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  )
}

function hueToHex(h: number): string {
  return hsvToHex(h, 1, 1)
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

function isValidHex(hex: string): boolean {
  return /^[0-9a-fA-F]{6}$/.test(hex)
}

let idCounter = 0
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  idCounter += 1
  return `stop-${idCounter}-${Date.now()}`
}

function interpolateColor(hex1: string, hex2: string, t: number): string {
  const c1 = hexToRgb(hex1)
  const c2 = hexToRgb(hex2)
  const r = Math.round(c1.r + (c2.r - c1.r) * t)
  const g = Math.round(c1.g + (c2.g - c1.g) * t)
  const b = Math.round(c1.b + (c2.b - c1.b) * t)
  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  )
}

// ---------------------------------------------------------------------------
// Drag hook
// ---------------------------------------------------------------------------

function useDrag(
  onDrag: (e: MouseEvent | React.MouseEvent) => void,
  onEnd?: () => void,
) {
  const dragging = useRef(false)
  const onDragRef = useRef(onDrag)
  const onEndRef = useRef(onEnd)
  onDragRef.current = onDrag
  onEndRef.current = onEnd

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!dragging.current) return
      e.preventDefault()
      onDragRef.current(e)
    }
    function handleUp() {
      if (!dragging.current) return
      dragging.current = false
      onEndRef.current?.()
    }
    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }
  }, [])

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = true
      onDragRef.current(e as unknown as MouseEvent)
    },
    [],
  )

  return { onMouseDown }
}

// ---------------------------------------------------------------------------
// Checkerboard pattern for alpha backgrounds
// ---------------------------------------------------------------------------

const CHECKERBOARD_BG =
  "repeating-conic-gradient(#d0d0d0 0% 25%, #fff 0% 50%) 0 0 / 8px 8px"

// ---------------------------------------------------------------------------
// SolidPicker sub-component
// ---------------------------------------------------------------------------

interface SolidPickerProps {
  hex: string
  opacity: number
  onChangeHex: (hex: string) => void
  onChangeOpacity: (opacity: number) => void
}

function SolidPicker({ hex, opacity, onChangeHex, onChangeOpacity }: SolidPickerProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const alphaRef = useRef<HTMLDivElement>(null)

  const hsv = hexToHsv(hex)
  const [hue, setHue] = useState(hsv.h)
  const [sat, setSat] = useState(hsv.s)
  const [val, setVal] = useState(hsv.v)
  const [hexInput, setHexInput] = useState(hex.replace(/^#/, "").toUpperCase())
  const [opacityInput, setOpacityInput] = useState(String(opacity))

  // Keep internal hue state in sync when hex prop changes from outside
  const prevHex = useRef(hex)
  useEffect(() => {
    if (hex !== prevHex.current) {
      prevHex.current = hex
      const newHsv = hexToHsv(hex)
      setHue(newHsv.h)
      setSat(newHsv.s)
      setVal(newHsv.v)
      setHexInput(hex.replace(/^#/, "").toUpperCase())
    }
  }, [hex])

  useEffect(() => {
    setOpacityInput(String(opacity))
  }, [opacity])

  const updateColor = useCallback(
    (h: number, s: number, v: number) => {
      const newHex = hsvToHex(h, s, v)
      setHue(h)
      setSat(s)
      setVal(v)
      setHexInput(newHex.replace(/^#/, "").toUpperCase())
      onChangeHex(newHex)
    },
    [onChangeHex],
  )

  // Canvas drag
  const canvasDrag = useDrag(
    useCallback(
      (e: MouseEvent | React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
        const y = clamp((e.clientY - rect.top) / rect.height, 0, 1)
        updateColor(hue, x, 1 - y)
      },
      [hue, updateColor],
    ),
  )

  // Hue drag
  const hueDrag = useDrag(
    useCallback(
      (e: MouseEvent | React.MouseEvent) => {
        const rect = hueRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
        const newHue = Math.round(x * 360)
        updateColor(newHue, sat, val)
      },
      [sat, val, updateColor],
    ),
  )

  // Alpha drag
  const alphaDrag = useDrag(
    useCallback(
      (e: MouseEvent | React.MouseEvent) => {
        const rect = alphaRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
        const newOpacity = Math.round(x * 100)
        setOpacityInput(String(newOpacity))
        onChangeOpacity(newOpacity)
      },
      [onChangeOpacity],
    ),
  )

  const handleHexBlur = useCallback(() => {
    const cleaned = hexInput.trim()
    if (isValidHex(cleaned)) {
      const newHex = "#" + cleaned.toLowerCase()
      const newHsv = hexToHsv(newHex)
      setHue(newHsv.h)
      setSat(newHsv.s)
      setVal(newHsv.v)
      onChangeHex(newHex)
    } else {
      setHexInput(hex.replace(/^#/, "").toUpperCase())
    }
  }, [hexInput, hex, onChangeHex])

  const handleOpacityBlur = useCallback(() => {
    const parsed = parseInt(opacityInput, 10)
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed, 0, 100)
      setOpacityInput(String(clamped))
      onChangeOpacity(clamped)
    } else {
      setOpacityInput(String(opacity))
    }
  }, [opacityInput, opacity, onChangeOpacity])

  const currentHueHex = hueToHex(hue)
  const currentHex = hsvToHex(hue, sat, val)
  const { r, g, b } = hexToRgb(currentHex)

  return (
    <div className="flex flex-col gap-3">
      {/* Saturation/Value Canvas */}
      <div
        ref={canvasRef}
        className="relative h-[180px] w-[280px] cursor-crosshair rounded-lg"
        style={{ backgroundColor: currentHueHex }}
        onMouseDown={canvasDrag.onMouseDown}
      >
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: "linear-gradient(to right, #ffffff, transparent)",
          }}
        />
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: "linear-gradient(to bottom, transparent, #000000)",
          }}
        />
        <div
          className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{
            left: `${sat * 100}%`,
            top: `${(1 - val) * 100}%`,
            backgroundColor: currentHex,
          }}
        />
      </div>

      {/* Hue Slider */}
      <div
        ref={hueRef}
        className="relative h-3 w-[280px] cursor-pointer rounded-full"
        style={{
          background:
            "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
        }}
        onMouseDown={hueDrag.onMouseDown}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{
            left: `${(hue / 360) * 100}%`,
            backgroundColor: currentHueHex,
          }}
        />
      </div>

      {/* Alpha Slider */}
      <div
        ref={alphaRef}
        className="relative h-3 w-[280px] cursor-pointer rounded-full"
        style={{ background: CHECKERBOARD_BG }}
        onMouseDown={alphaDrag.onMouseDown}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`,
          }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{
            left: `${opacity}%`,
            backgroundColor: `rgba(${r},${g},${b},${opacity / 100})`,
          }}
        />
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Hex</span>
        <div className="flex items-center rounded border border-border bg-background">
          <span className="pl-2 text-xs text-muted-foreground">#</span>
          <input
            type="text"
            className="w-20 bg-transparent px-1 py-1 font-mono text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value.toUpperCase())}
            onBlur={handleHexBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleHexBlur()
            }}
            maxLength={6}
          />
        </div>
        <div className="flex items-center rounded border border-border bg-background">
          <input
            type="text"
            className="w-14 bg-transparent px-2 py-1 text-right font-mono text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
            value={opacityInput}
            onChange={(e) => setOpacityInput(e.target.value)}
            onBlur={handleOpacityBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleOpacityBlur()
            }}
            maxLength={3}
          />
          <span className="pr-2 text-xs text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GradientMode sub-component
// ---------------------------------------------------------------------------

interface GradientModeProps {
  gradient: ColorPickerValue["gradient"]
  onChange: (gradient: ColorPickerValue["gradient"]) => void
}

function GradientMode({ gradient, onChange }: GradientModeProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const [selectedStopId, setSelectedStopId] = useState<string>(
    gradient.stops[0]?.id ?? "",
  )
  const [editingStopId, setEditingStopId] = useState<string | null>(null)
  const [angleInput, setAngleInput] = useState(String(gradient.angle))

  // Keep angle input in sync
  useEffect(() => {
    setAngleInput(String(gradient.angle))
  }, [gradient.angle])

  // Ensure selectedStopId is valid
  useEffect(() => {
    if (!gradient.stops.find((s) => s.id === selectedStopId)) {
      setSelectedStopId(gradient.stops[0]?.id ?? "")
    }
  }, [gradient.stops, selectedStopId])

  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position)

  const gradientCss = `linear-gradient(90deg, ${sortedStops
    .map((s) => {
      const { r, g, b } = hexToRgb(s.hex)
      return `rgba(${r},${g},${b},${s.opacity / 100}) ${s.position}%`
    })
    .join(", ")})`

  const updateStop = useCallback(
    (id: string, patch: Partial<{ position: number; hex: string; opacity: number }>) => {
      const newStops = gradient.stops.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      )
      onChange({ ...gradient, stops: newStops })
    },
    [gradient, onChange],
  )

  const removeStop = useCallback(
    (id: string) => {
      if (gradient.stops.length <= 2) return
      const newStops = gradient.stops.filter((s) => s.id !== id)
      onChange({ ...gradient, stops: newStops })
      if (selectedStopId === id) {
        setSelectedStopId(newStops[0]?.id ?? "")
      }
      if (editingStopId === id) {
        setEditingStopId(null)
      }
    },
    [gradient, onChange, selectedStopId, editingStopId],
  )

  const addStop = useCallback(() => {
    const sorted = [...gradient.stops].sort((a, b) => a.position - b.position)
    const selIdx = sorted.findIndex((s) => s.id === selectedStopId)
    const idx = selIdx >= 0 ? selIdx : 0
    const nextIdx = Math.min(idx + 1, sorted.length - 1)
    const s1 = sorted[idx]
    const s2 = sorted[nextIdx]
    const pos = Math.round((s1.position + s2.position) / 2)
    const hex = interpolateColor(s1.hex, s2.hex, 0.5)
    const op = Math.round((s1.opacity + s2.opacity) / 2)
    const newStop = { id: generateId(), position: pos, hex, opacity: op }
    const newStops = [...gradient.stops, newStop]
    onChange({ ...gradient, stops: newStops })
    setSelectedStopId(newStop.id)
  }, [gradient, onChange, selectedStopId])

  const handleAngleBlur = useCallback(() => {
    const parsed = parseInt(angleInput, 10)
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed, 0, 360)
      setAngleInput(String(clamped))
      onChange({ ...gradient, angle: clamped })
    } else {
      setAngleInput(String(gradient.angle))
    }
  }, [angleInput, gradient, onChange])

  // Stop marker drag
  const dragStopId = useRef<string | null>(null)
  const stopDrag = useDrag(
    useCallback(
      (e: MouseEvent | React.MouseEvent) => {
        if (!dragStopId.current) return
        const rect = barRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
        const pos = Math.round(x * 100)
        updateStop(dragStopId.current, { position: pos })
      },
      [updateStop],
    ),
  )

  const editingStop = editingStopId
    ? gradient.stops.find((s) => s.id === editingStopId)
    : null

  return (
    <div className="flex flex-col gap-3">
      {/* Controls row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">Linear</span>
        <div className="flex items-center rounded border border-border bg-background">
          <input
            type="text"
            className="w-14 bg-transparent px-2 py-1 text-right font-mono text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
            value={angleInput}
            onChange={(e) => setAngleInput(e.target.value)}
            onBlur={handleAngleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAngleBlur()
            }}
            maxLength={3}
          />
          <span className="pr-2 text-xs text-muted-foreground">°</span>
        </div>
      </div>

      {/* Gradient preview bar with stop markers */}
      <div className="relative">
        {/* Stop markers above the bar */}
        <div className="relative mb-1 h-4">
          {sortedStops.map((stop) => (
            <button
              key={stop.id}
              className={cn(
                "absolute top-0 h-3 w-3 -translate-x-1/2 cursor-grab rounded-sm border-2 shadow-sm",
                stop.id === selectedStopId
                  ? "border-blue-500 ring-1 ring-blue-300"
                  : "border-white",
              )}
              style={{
                left: `${stop.position}%`,
                backgroundColor: stop.hex,
              }}
              onMouseDown={(e) => {
                setSelectedStopId(stop.id)
                dragStopId.current = stop.id
                stopDrag.onMouseDown(e)
              }}
            />
          ))}
        </div>
        {/* Gradient bar */}
        <div
          ref={barRef}
          className="h-6 w-full rounded"
          style={{
            background: CHECKERBOARD_BG,
          }}
        >
          <div
            className="h-full w-full rounded"
            style={{ background: gradientCss }}
          />
        </div>
      </div>

      {/* Stops list */}
      <div className="flex flex-col gap-1.5">
        {sortedStops.map((stop) => (
          <StopRow
            key={stop.id}
            stop={stop}
            isSelected={stop.id === selectedStopId}
            canRemove={gradient.stops.length > 2}
            onSelect={() => setSelectedStopId(stop.id)}
            onUpdate={(patch) => updateStop(stop.id, patch)}
            onRemove={() => removeStop(stop.id)}
            onEditColor={() =>
              setEditingStopId(editingStopId === stop.id ? null : stop.id)
            }
            isEditing={editingStopId === stop.id}
          />
        ))}
      </div>

      {/* Add stop button */}
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        onClick={addStop}
      >
        <Plus className="h-3 w-3" />
        Add stop
      </button>

      {/* Nested solid picker for editing stop color */}
      {editingStop && (
        <div className="rounded-lg border border-border bg-background p-3">
          <SolidPicker
            hex={editingStop.hex}
            opacity={editingStop.opacity}
            onChangeHex={(hex) => updateStop(editingStop.id, { hex })}
            onChangeOpacity={(opacity) =>
              updateStop(editingStop.id, { opacity })
            }
          />
          <button
            type="button"
            className="mt-2 rounded bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/80"
            onClick={() => setEditingStopId(null)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// StopRow sub-component
// ---------------------------------------------------------------------------

interface StopRowProps {
  stop: { id: string; position: number; hex: string; opacity: number }
  isSelected: boolean
  canRemove: boolean
  onSelect: () => void
  onUpdate: (patch: Partial<{ position: number; hex: string; opacity: number }>) => void
  onRemove: () => void
  onEditColor: () => void
  isEditing: boolean
}

function StopRow({
  stop,
  isSelected,
  canRemove,
  onSelect,
  onUpdate,
  onRemove,
  onEditColor,
  isEditing,
}: StopRowProps) {
  const [posInput, setPosInput] = useState(String(stop.position))
  const [hexInput, setHexInput] = useState(
    stop.hex.replace(/^#/, "").toUpperCase(),
  )
  const [opInput, setOpInput] = useState(String(stop.opacity))

  useEffect(() => {
    setPosInput(String(stop.position))
  }, [stop.position])

  useEffect(() => {
    setHexInput(stop.hex.replace(/^#/, "").toUpperCase())
  }, [stop.hex])

  useEffect(() => {
    setOpInput(String(stop.opacity))
  }, [stop.opacity])

  const handlePosBlur = useCallback(() => {
    const parsed = parseInt(posInput, 10)
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed, 0, 100)
      setPosInput(String(clamped))
      onUpdate({ position: clamped })
    } else {
      setPosInput(String(stop.position))
    }
  }, [posInput, stop.position, onUpdate])

  const handleHexBlur = useCallback(() => {
    const cleaned = hexInput.trim()
    if (isValidHex(cleaned)) {
      onUpdate({ hex: "#" + cleaned.toLowerCase() })
    } else {
      setHexInput(stop.hex.replace(/^#/, "").toUpperCase())
    }
  }, [hexInput, stop.hex, onUpdate])

  const handleOpBlur = useCallback(() => {
    const parsed = parseInt(opInput, 10)
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed, 0, 100)
      setOpInput(String(clamped))
      onUpdate({ opacity: clamped })
    } else {
      setOpInput(String(stop.opacity))
    }
  }, [opInput, stop.opacity, onUpdate])

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded px-1.5 py-1",
        isSelected && "bg-blue-50 dark:bg-blue-950/30",
      )}
      onClick={onSelect}
    >
      {/* Position input */}
      <div className="flex items-center rounded border border-border bg-background">
        <input
          type="text"
          className="w-10 bg-transparent px-1 py-0.5 text-right font-mono text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
          value={posInput}
          onChange={(e) => setPosInput(e.target.value)}
          onBlur={handlePosBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handlePosBlur()
          }}
          maxLength={3}
        />
        <span className="pr-1 text-xs text-muted-foreground">%</span>
      </div>

      {/* Color swatch */}
      <button
        type="button"
        className={cn(
          "h-4 w-4 shrink-0 rounded border",
          isEditing ? "border-blue-500 ring-1 ring-blue-300" : "border-border",
        )}
        style={{ backgroundColor: stop.hex }}
        onClick={(e) => {
          e.stopPropagation()
          onEditColor()
        }}
      />

      {/* Hex input */}
      <div className="flex items-center rounded border border-border bg-background">
        <span className="pl-1 text-xs text-muted-foreground">#</span>
        <input
          type="text"
          className="w-14 bg-transparent px-0.5 py-0.5 font-mono text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value.toUpperCase())}
          onBlur={handleHexBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleHexBlur()
          }}
          maxLength={6}
        />
      </div>

      {/* Opacity input */}
      <div className="flex items-center rounded border border-border bg-background">
        <input
          type="text"
          className="w-10 bg-transparent px-1 py-0.5 text-right font-mono text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
          value={opInput}
          onChange={(e) => setOpInput(e.target.value)}
          onBlur={handleOpBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleOpBlur()
          }}
          maxLength={3}
        />
        <span className="pr-1 text-xs text-muted-foreground">%</span>
      </div>

      {/* Remove button */}
      <button
        type="button"
        className={cn(
          "ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground",
          !canRemove && "pointer-events-none opacity-30",
        )}
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        disabled={!canRemove}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Gradient icon (inline SVG since lucide doesn't have one)
// ---------------------------------------------------------------------------

function GradientIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="3" x2="21" y2="21" />
      <path d="M3 9h3M3 15h6M21 9h-6M21 15h-3" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main ColorPicker component
// ---------------------------------------------------------------------------

function ColorPicker({ value, onChange, onClose }: ColorPickerProps) {
  const handleModeChange = useCallback(
    (mode: "solid" | "gradient") => {
      onChange({ ...value, mode })
    },
    [value, onChange],
  )

  const handleSolidHexChange = useCallback(
    (hex: string) => {
      onChange({ ...value, solid: { ...value.solid, hex } })
    },
    [value, onChange],
  )

  const handleSolidOpacityChange = useCallback(
    (opacity: number) => {
      onChange({ ...value, solid: { ...value.solid, opacity } })
    },
    [value, onChange],
  )

  const handleGradientChange = useCallback(
    (gradient: ColorPickerValue["gradient"]) => {
      onChange({ ...value, gradient })
    },
    [value, onChange],
  )

  return (
    <div className="w-80 rounded-xl border border-border bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1">
          {/* Solid mode button */}
          <button
            type="button"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded",
              value.mode === "solid" && "bg-muted",
            )}
            onClick={() => handleModeChange("solid")}
            title="Solid color"
          >
            <Square className="h-4 w-4 text-foreground" />
          </button>
          {/* Gradient mode button */}
          <button
            type="button"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded",
              value.mode === "gradient" && "bg-muted",
            )}
            onClick={() => handleModeChange("gradient")}
            title="Gradient"
          >
            <GradientIcon className="h-4 w-4 text-foreground" />
          </button>
        </div>
        {/* Close button */}
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        {value.mode === "solid" ? (
          <SolidPicker
            hex={value.solid.hex}
            opacity={value.solid.opacity}
            onChangeHex={handleSolidHexChange}
            onChangeOpacity={handleSolidOpacityChange}
          />
        ) : (
          <GradientMode
            gradient={value.gradient}
            onChange={handleGradientChange}
          />
        )}
      </div>
    </div>
  )
}

export default ColorPicker
export { hexToHsv, hsvToHex, hexToRgb }
export type { ColorPickerProps }
