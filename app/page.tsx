"use client"

import { useState, useEffect } from "react"
import { GridConfig, ViewportSize, createDefaultCell, Section, createDefaultSection, PageStyle } from "@/types/grid"
import { createDefaultBanner } from "@/types/banner"
import { GridPreview } from "@/lib/grid-render"
import { GridEditor } from "@/components/grid/grid-editor"
import { ColorPicker } from "@/components/grid/color-picker"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  PanelLeftClose, PanelLeft, Monitor, Smartphone, Tablet,
  Save, Trash2, Plus, ChevronUp, ChevronDown, ChevronRight, Eye, EyeOff, Copy, ExternalLink,
} from "lucide-react"
import { SectionRenderer } from "@/components/section-renderer"

type Preset = { id?: number; name: string; sections: Section[]; pageStyle?: PageStyle }

const VIEWPORT_WIDTHS: Record<ViewportSize, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1200,
}

const VIEWPORT_CONFIG = {
  mobile: {
    icon: Smartphone,
    label: "Mobile",
    width: 375,
    frameClass: "rounded-[2rem] border-[6px]",
    showChrome: true,
  },
  tablet: {
    icon: Tablet,
    label: "Tablet",
    width: 768,
    frameClass: "rounded-2xl border-[6px]",
    showChrome: true,
  },
  desktop: {
    icon: Monitor,
    label: "Desktop",
    width: null,
    frameClass: "rounded-lg border-2",
    showChrome: false,
  },
}

export default function GridEditorPage() {
  const [sections, setSections] = useState<Section[]>([createDefaultSection()])
  const [pageStyle, setPageStyle] = useState<PageStyle | undefined>()
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [activeGridIndex, setActiveGridIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  const [viewport, setViewport] = useState<ViewportSize>("desktop")
  const [selectedPreset, setSelectedPreset] = useState("")
  const [userPresets, setUserPresets] = useState<Preset[]>([])
  const [sectionAdvancedOpen, setSectionAdvancedOpen] = useState(false)

  useEffect(() => {
    fetch("/api/presets")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUserPresets(data)
      })
      .catch(() => {})
  }, [])

  const activeSection = sections[activeSectionIndex] ?? sections[0]
  const activeGrid = activeSection.grids[activeGridIndex] ?? activeSection.grids[0]

  const vp = VIEWPORT_CONFIG[viewport]

  // --- Mutation helpers ---

  const updateSection = (idx: number, s: Section) =>
    setSections(prev => prev.map((x, i) => i === idx ? s : x))

  const updateActiveGrid = (grid: GridConfig) =>
    updateSection(activeSectionIndex, {
      ...activeSection,
      grids: activeSection.grids.map((g, i) => i === activeGridIndex ? grid : g),
    })

  const addSection = () => {
    const s = createDefaultSection()
    setSections(prev => [...prev, s])
    setActiveSectionIndex(sections.length)
    setActiveGridIndex(0)
  }

  const deleteSection = (idx: number) => {
    if (sections.length <= 1) return
    setSections(prev => prev.filter((_, i) => i !== idx))
    setActiveSectionIndex(i => Math.min(i, sections.length - 2))
    setActiveGridIndex(0)
  }

  const moveSection = (idx: number, dir: "up" | "down") => {
    const next = dir === "up" ? idx - 1 : idx + 1
    if (next < 0 || next >= sections.length) return
    setSections(prev => { const a = [...prev]; [a[idx], a[next]] = [a[next], a[idx]]; return a })
    setActiveSectionIndex(next)
  }

  const cloneSection = (idx: number) => {
    const src = sections[idx]
    const now = Date.now()
    const cloned: Section = {
      ...src,
      id: `section-${now}`,
      label: src.label ? `${src.label} (copy)` : "",
      grids: src.grids.map((grid, gi) => ({
        ...grid,
        cells: grid.cells.map((cell, ci) => {
          const newCellId = `cell-${now}-${gi}-${ci}`
          return {
            ...cell,
            id: newCellId,
            contents: cell.contents.map((c, cti) => ({
              ...c,
              id: `content-${now}-${gi}-${ci}-${cti}`,
            })),
          }
        }),
        rows: grid.rows?.map((row, ri) => ({
          ...row,
          id: `row-${now}-${gi}-${ri}`,
          cellIds: row.cellIds.map((_, ci) => `cell-${now}-${gi}-${ci}`),
        })),
      })),
    }
    setSections(prev => {
      const next = [...prev]
      next.splice(idx + 1, 0, cloned)
      return next
    })
    setActiveSectionIndex(idx + 1)
    setActiveGridIndex(0)
  }

  const addGrid = () => {
    const cellId = `cell-${Date.now()}`
    const cell = { ...createDefaultCell(cellId), width: 100 }
    const newGrid: GridConfig = {
      cells: [cell],
      rows: [{ id: `row-${Date.now()}`, cellIds: [cellId], style: { backgroundColor: "", paddingY: 0, gap: 0 } }],
      gridStyle: { backgroundColor: "", borderRadius: 0, gap: 16 },
    }
    updateSection(activeSectionIndex, { ...activeSection, grids: [...activeSection.grids, newGrid] })
    setActiveGridIndex(activeSection.grids.length)
  }

  const deleteGrid = (gIdx: number) => {
    if (activeSection.grids.length <= 1) return
    updateSection(activeSectionIndex, {
      ...activeSection,
      grids: activeSection.grids.filter((_, i) => i !== gIdx),
    })
    setActiveGridIndex(i => Math.min(i, activeSection.grids.length - 2))
  }

  const moveGrid = (gIdx: number, dir: "up" | "down") => {
    const next = dir === "up" ? gIdx - 1 : gIdx + 1
    if (next < 0 || next >= activeSection.grids.length) return
    const grids = [...activeSection.grids];
    [grids[gIdx], grids[next]] = [grids[next], grids[gIdx]]
    updateSection(activeSectionIndex, { ...activeSection, grids })
    setActiveGridIndex(next)
  }

  // --- Preset management ---

  const savePreset = async () => {
    const currentName = selectedPreset.startsWith("user:") ? selectedPreset.slice(5) : null
    const name = currentName ?? window.prompt("Preset name:")?.trim()
    if (!name) return
    const res = await fetch("/api/presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sections, pageStyle }),
    })
    const saved = await res.json()
    setUserPresets((prev) => {
      const filtered = prev.filter((p) => p.name !== name)
      return [...filtered, saved]
    })
    setSelectedPreset(`user:${name}`)
  }

  const savePresetAs = async () => {
    const name = window.prompt("Save as new preset:")?.trim()
    if (!name) return
    const res = await fetch("/api/presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sections, pageStyle }),
    })
    const saved = await res.json()
    setUserPresets((prev) => {
      const filtered = prev.filter((p) => p.name !== name)
      return [...filtered, saved]
    })
    setSelectedPreset(`user:${name}`)
  }

  const deletePreset = async (preset: Preset) => {
    if (!preset.id) return
    await fetch(`/api/presets/${preset.id}`, { method: "DELETE" })
    setUserPresets((prev) => prev.filter((p) => p.id !== preset.id))
    setSelectedPreset("")
  }

  // Migrate old sectionType:"banner" sections to content sections with a banner component
  const migrateSections = (raw: any[]): Section[] => {
    return raw.map((section: any) => {
      if (section.sectionType === "banner" && section.bannerConfig) {
        const cellId = `cell-migrated-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const rowId = `row-migrated-${Date.now()}`
        const contentId = `content-migrated-${Date.now()}`
        return {
          id: section.id,
          label: section.label || "Banner",
          style: { backgroundColor: "", paddingYSize: "none" as const },
          grids: [{
            cells: [{
              id: cellId,
              contents: [{ id: contentId, type: "banner" as const, bannerConfig: section.bannerConfig }],
              style: { backgroundColor: "", borderWidth: 0, borderRadius: 0, paddingX: 0, paddingY: 0, alignItems: "start" as const },
              width: 100,
            }],
            rows: [{ id: rowId, cellIds: [cellId], style: { backgroundColor: "", paddingY: 0, gap: 0 } }],
            gridStyle: { backgroundColor: "", borderRadius: 0, gap: 0 },
          }],
        } satisfies Section
      }
      return section as Section
    })
  }

  const handlePresetChange = (value: string) => {
    if (value.startsWith("user:")) {
      const preset = userPresets.find(p => p.name === value.slice(5))
      if (preset) {
        setSections(migrateSections(preset.sections))
        setPageStyle(preset.pageStyle)
        setActiveSectionIndex(0)
        setActiveGridIndex(0)
        setSelectedPreset(value)
      }
    }
  }

  const selectedIsUserPreset = selectedPreset.startsWith("user:")
  const selectedUserPreset = userPresets.find(p => p.name === selectedPreset.slice(5))

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className={cn("h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card", previewMode && "hidden")}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            aria-label={sidebarOpen ? "Close editor" : "Open editor"}
          >
            {sidebarOpen
              ? <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
              : <PanelLeft className="h-4 w-4 text-muted-foreground" />
            }
          </button>
          <button
            onClick={() => setPreviewMode(true)}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            aria-label="Preview mode"
            title="Preview mode"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="h-5 w-px bg-border" />
          <span className="text-sm font-semibold text-foreground">Grid Editor</span>
          <span className="hidden sm:block text-xs text-muted-foreground">— Headless CMS Component Demo</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Switcher */}
          <div className="flex items-center bg-muted border border-border rounded-lg p-1 gap-0.5">
            {(Object.entries(VIEWPORT_CONFIG) as [ViewportSize, typeof vp][]).map(([key, val]) => {
              const Icon = val.icon
              return (
                <button
                  key={key}
                  onClick={() => setViewport(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                    viewport === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title={val.width ? `${val.label} (${val.width}px)` : val.label}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{val.label}</span>
                </button>
              )
            })}
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5">
            <select
              className="h-8 px-2.5 text-xs bg-muted border border-border rounded-lg text-foreground"
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              <option value="" disabled>Load Preset</option>
              {userPresets.map((preset) => (
                <option key={preset.name} value={`user:${preset.name}`}>{preset.name}</option>
              ))}
            </select>
            <button
              onClick={savePreset}
              className="h-8 px-2.5 flex items-center gap-1.5 text-xs bg-muted border border-border rounded-lg text-foreground hover:bg-background transition-colors"
              title={selectedPreset.startsWith("user:") ? `Save changes to "${selectedPreset.slice(5)}"` : "Save as new preset"}
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {selectedPreset.startsWith("user:") ? "Save" : "Save As New"}
              </span>
            </button>
            {selectedPreset.startsWith("user:") && (
              <>
                <button
                  onClick={savePresetAs}
                  className="h-8 px-2.5 flex items-center gap-1.5 text-xs bg-muted border border-border rounded-lg text-foreground hover:bg-background transition-colors"
                  title="Save as a new preset"
                >
                  <span className="hidden sm:inline text-xs">Save As</span>
                </button>
                <button
                  onClick={() => deletePreset(selectedUserPreset!)}
                  className="h-8 px-2 flex items-center text-destructive hover:bg-destructive/10 border border-destructive/30 rounded-lg transition-colors"
                  title="Delete this preset"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Preview button */}
          <button
            onClick={() => selectedUserPreset?.id && window.open(`/preview?id=${selectedUserPreset.id}`, "_blank")}
            disabled={!selectedUserPreset?.id}
            className="h-8 px-2.5 flex items-center gap-1.5 text-xs bg-muted border border-border rounded-lg text-foreground hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Open full-page preview in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Editor Sidebar */}
        <aside
          className={cn(
            "border-r border-border bg-card transition-[width] duration-300 overflow-hidden shrink-0",
            previewMode ? "w-0" : sidebarOpen ? "w-[360px]" : "w-0"
          )}
        >
          <div className="w-[360px] h-full overflow-y-auto">

            {/* Panel 1: Sections list */}
            <div className="border-b border-border">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Sections</span>
                <button
                  onClick={addSection}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="Add section"
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="pb-2 px-2 flex flex-col gap-0.5">
                {sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group",
                      activeSectionIndex === idx
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    )}
                    onClick={() => { setActiveSectionIndex(idx); setActiveGridIndex(0) }}
                  >
                    <span className="flex-1 text-xs truncate">
                      {section.label?.trim() || `Section ${idx + 1}`}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(idx, "up") }}
                      disabled={idx === 0}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(idx, "down") }}
                      disabled={idx === sections.length - 1}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); cloneSection(idx) }}
                      className="p-0.5 rounded hover:bg-muted"
                      title="Clone section"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSection(idx) }}
                      disabled={sections.length <= 1}
                      className="p-0.5 rounded hover:bg-destructive/10 text-destructive disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Active section style */}
            <div className="border-b border-border px-3 py-3 flex flex-col gap-3">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Section Style
              </span>
              <div className="flex flex-col gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Label</Label>
                  <Input
                    value={activeSection.label ?? ""}
                    onChange={(e) => updateSection(activeSectionIndex, { ...activeSection, label: e.target.value })}
                    placeholder={`Section ${activeSectionIndex + 1}`}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Background Color</Label>
                  <ColorPicker
                    value={activeSection.style.backgroundColor ?? ""}
                    onChange={(v) => updateSection(activeSectionIndex, {
                      ...activeSection,
                      style: { ...activeSection.style, backgroundColor: v },
                    })}
                  />
                </div>

                {/* Background Gradient */}
                {(() => {
                  const gradType: "none" | "linear" | "radial" =
                    activeSection.style.backgroundGradientType ??
                    (activeSection.style.backgroundGradientFrom ? "linear" : "none")
                  const setGrad = (updates: Partial<typeof activeSection.style>) =>
                    updateSection(activeSectionIndex, { ...activeSection, style: { ...activeSection.style, ...updates } })
                  return (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground block">Background Gradient</Label>
                      {/* Type selector */}
                      <div className="flex rounded-lg border border-border overflow-hidden">
                        {(["none", "linear", "radial"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              if (t === "none") {
                                setGrad({ backgroundGradientType: undefined, backgroundGradientFrom: undefined, backgroundGradientMid: undefined, backgroundGradientTo: undefined, backgroundGradientDirection: undefined, backgroundGradientMidStop: undefined })
                              } else {
                                setGrad({ backgroundGradientType: t })
                              }
                            }}
                            className={cn(
                              "flex-1 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0",
                              gradType === t
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            )}
                          >{t}</button>
                        ))}
                      </div>
                      {gradType !== "none" && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">From (start)</Label>
                              <ColorPicker value={activeSection.style.backgroundGradientFrom ?? ""} onChange={(v) => setGrad({ backgroundGradientFrom: v || undefined })} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">To (end)</Label>
                              <ColorPicker value={activeSection.style.backgroundGradientTo ?? ""} onChange={(v) => setGrad({ backgroundGradientTo: v || undefined })} />
                            </div>
                          </div>
                          {/* Mid color stop */}
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Mid color (optional)</Label>
                            <ColorPicker value={activeSection.style.backgroundGradientMid ?? ""} onChange={(v) => setGrad({ backgroundGradientMid: v || undefined })} />
                          </div>
                          {activeSection.style.backgroundGradientMid && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] text-muted-foreground">Mid stop</Label>
                                <span className="text-[10px] text-muted-foreground">{activeSection.style.backgroundGradientMidStop ?? 50}%</span>
                              </div>
                              <Slider
                                min={0} max={100} step={5}
                                value={[activeSection.style.backgroundGradientMidStop ?? 50]}
                                onValueChange={([v]) => setGrad({ backgroundGradientMidStop: v })}
                              />
                            </div>
                          )}
                          {/* Direction (linear) / Position (radial) */}
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">
                              {gradType === "radial" ? "Center position" : "Direction"}
                            </Label>
                            {gradType === "linear" && (
                              <div className="flex rounded-lg border border-border overflow-hidden mb-1">
                                {(["to bottom", "to right", "to bottom right"] as const).map((d) => (
                                  <button key={d} onClick={() => setGrad({ backgroundGradientDirection: d })}
                                    className={cn(
                                      "flex-1 py-1 text-[10px] font-medium transition-colors border-r border-border last:border-r-0",
                                      (activeSection.style.backgroundGradientDirection ?? "to bottom") === d
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                  >{d.replace("to ", "")}</button>
                                ))}
                              </div>
                            )}
                            <Input
                              value={activeSection.style.backgroundGradientDirection ?? (gradType === "radial" ? "center" : "to bottom")}
                              onChange={(e) => setGrad({ backgroundGradientDirection: e.target.value || undefined })}
                              placeholder={gradType === "radial" ? "50% 50% at 50% 50%" : "to bottom"}
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Background image */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground block">Background Image</Label>
                  <Input
                    value={activeSection.style.backgroundImage ?? ""}
                    onChange={(e) => updateSection(activeSectionIndex, {
                      ...activeSection,
                      style: { ...activeSection.style, backgroundImage: e.target.value || undefined },
                    })}
                    placeholder="https://..."
                    className="h-7 text-xs"
                  />
                  {activeSection.style.backgroundImage && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Size</Label>
                        <div className="flex rounded-lg border border-border overflow-hidden">
                          {(["cover", "contain", "auto"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateSection(activeSectionIndex, {
                                ...activeSection,
                                style: { ...activeSection.style, backgroundSize: s },
                              })}
                              className={cn(
                                "flex-1 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0",
                                (activeSection.style.backgroundSize ?? "cover") === s
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Position</Label>
                        <div className="grid grid-cols-3 gap-1">
                          {(["top center", "center center", "bottom center"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => updateSection(activeSectionIndex, {
                                ...activeSection,
                                style: { ...activeSection.style, backgroundPosition: p },
                              })}
                              className={cn(
                                "py-1 text-[10px] rounded border capitalize transition-colors",
                                (activeSection.style.backgroundPosition ?? "center center") === p
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {p.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                        <Input
                          value={activeSection.style.backgroundPosition ?? "center center"}
                          onChange={(e) => updateSection(activeSectionIndex, {
                            ...activeSection,
                            style: { ...activeSection.style, backgroundPosition: e.target.value },
                          })}
                          placeholder="center center"
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Overlay Color</Label>
                        <ColorPicker
                          value={activeSection.style.backgroundOverlayColor ?? "#000000"}
                          onChange={(v) => updateSection(activeSectionIndex, {
                            ...activeSection,
                            style: { ...activeSection.style, backgroundOverlayColor: v },
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Overlay Opacity</Label>
                          <span className="text-[10px] text-muted-foreground">{activeSection.style.backgroundOverlay ?? 0}%</span>
                        </div>
                        <Slider
                          min={0} max={100} step={5}
                          value={[activeSection.style.backgroundOverlay ?? 0]}
                          onValueChange={([v]) => updateSection(activeSectionIndex, {
                            ...activeSection,
                            style: { ...activeSection.style, backgroundOverlay: v },
                          })}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Vertical Padding</Label>
                  <div className="flex rounded-lg border border-border overflow-hidden mb-1.5">
                    {(["none", "s", "m", "l", "xl"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSection(activeSectionIndex, {
                          ...activeSection,
                          style: { ...activeSection.style, paddingYSize: size, paddingYOverride: undefined },
                        })}
                        className={`flex-1 py-1.5 text-xs font-medium uppercase transition-colors border-r border-border last:border-r-0 ${
                          (activeSection.style.paddingYSize ?? "none") === size
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    value={activeSection.style.paddingYOverride ?? ""}
                    onChange={(e) => updateSection(activeSectionIndex, {
                      ...activeSection,
                      style: { ...activeSection.style, paddingYOverride: e.target.value === "" ? undefined : Number(e.target.value) },
                    })}
                    min={0}
                    placeholder="Custom px override"
                    className="h-7 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Override: tablet ×0.75 · mobile ×0.6</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground block">Width</Label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    {([
                      { value: "flood",     label: "Flood" },
                      { value: "narrow",    label: "Narrow" },
                      { value: "contained", label: "Standard" },
                    ] as const).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateSection(activeSectionIndex, {
                          ...activeSection,
                          style: { ...activeSection.style, contentWidth: value },
                        })}
                        className={`flex-1 py-1.5 text-xs font-medium transition-colors border-r border-border last:border-r-0 ${
                          (activeSection.style.contentWidth ?? "narrow") === value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {activeSection.style.contentWidth === "narrow" && (
                    <p className="text-[10px] text-muted-foreground">800px max</p>
                  )}
                  {activeSection.style.contentWidth === "contained" && (
                    <p className="text-[10px] text-muted-foreground">1040px max</p>
                  )}
                  <Input
                    type="number"
                    value={activeSection.style.maxWidth ?? ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? undefined : Number(e.target.value)
                      if (val !== undefined && (val < 320 || val > 1600)) return
                      updateSection(activeSectionIndex, {
                        ...activeSection,
                        style: { ...activeSection.style, maxWidth: val },
                      })
                    }}
                    min={320} max={1600}
                    placeholder="Max width px override"
                    className="h-7 text-xs"
                  />
                </div>

                {/* Advanced (collapsed) */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setSectionAdvancedOpen(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <span>Advanced</span>
                    <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", sectionAdvancedOpen && "rotate-90")} />
                  </button>
                  {sectionAdvancedOpen && (
                    <div className="px-3 py-2 border-t border-border flex flex-col gap-2.5">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Position</Label>
                        <div className="flex rounded-lg border border-border overflow-hidden">
                          {(["static", "sticky"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => updateSection(activeSectionIndex, {
                                ...activeSection,
                                style: { ...activeSection.style, position: p },
                              })}
                              className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0 ${
                                (activeSection.style.position ?? "static") === p
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Grid Gap (px)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={activeSection.style.gridGap ?? ""}
                          onChange={(e) => updateSection(activeSectionIndex, {
                            ...activeSection,
                            style: { ...activeSection.style, gridGap: e.target.value === "" ? undefined : Number(e.target.value) },
                          })}
                          placeholder="0"
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Background Repeat</Label>
                        <div className="flex rounded-lg border border-border overflow-hidden">
                          {(["no-repeat", "repeat", "repeat-x", "repeat-y"] as const).map((r) => (
                            <button
                              key={r}
                              onClick={() => updateSection(activeSectionIndex, {
                                ...activeSection,
                                style: { ...activeSection.style, backgroundRepeat: r },
                              })}
                              className={cn(
                                "flex-1 py-1.5 text-[10px] font-medium transition-colors border-r border-border last:border-r-0",
                                (activeSection.style.backgroundRepeat ?? "no-repeat") === r
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {r === "no-repeat" ? "none" : r.replace("repeat-", "")}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel 3: Grids in active section */}
            <div className="border-b border-border">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Grids</span>
                <button
                  onClick={addGrid}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="Add layout"
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="pb-2 px-2 flex flex-col gap-0.5">
                {activeSection.grids.map((_, gIdx) => (
                  <div
                    key={gIdx}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group",
                      activeGridIndex === gIdx
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    )}
                    onClick={() => setActiveGridIndex(gIdx)}
                  >
                    <span className="flex-1 text-xs">Grid {gIdx + 1}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveGrid(gIdx, "up") }}
                      disabled={gIdx === 0}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveGrid(gIdx, "down") }}
                      disabled={gIdx === activeSection.grids.length - 1}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteGrid(gIdx) }}
                      disabled={activeSection.grids.length <= 1}
                      className="p-0.5 rounded hover:bg-destructive/10 text-destructive disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid editor for active grid */}
            <GridEditor config={activeGrid} onChange={updateActiveGrid} />
          </div>
        </aside>

        {/* Preview Area */}
        <main className={cn("flex-1 overflow-auto bg-muted/40 flex flex-col", previewMode && "fixed inset-0 z-50")}>

          {/* Viewport Label Bar */}
          <div className={cn("shrink-0 flex items-center justify-center gap-3 py-2.5 border-b border-border bg-card/60", previewMode && "hidden")}>
            <vp.icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">{vp.label}</span>
            {vp.width && <span className="text-xs text-muted-foreground opacity-50">{vp.width}px</span>}
          </div>

          {/* Floating exit button in preview mode */}
          {previewMode && (
            <button
              onClick={() => setPreviewMode(false)}
              className="fixed bottom-5 right-5 z-[60] flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-card border border-border rounded-lg shadow-lg hover:bg-muted transition-colors"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Exit Preview
            </button>
          )}

          {/* Scrollable Preview Canvas */}
          <div className="flex-1 overflow-auto p-6 flex justify-center">
            <DeviceFrame viewport={viewport}>
              {/* Simulated page context */}
              <div className="bg-background min-h-full preview-wrapper">
                {/* Fake page nav */}
                <div className="h-10 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
                  <div className="h-2 w-16 bg-muted-foreground/20 rounded-full" />
                  <div className="flex-1" />
                  <div className="h-2 w-8 bg-muted-foreground/20 rounded-full" />
                  <div className="h-2 w-8 bg-muted-foreground/20 rounded-full" />
                  <div className="h-2 w-12 bg-muted-foreground/20 rounded-full" />
                </div>

                {/* Page body */}
                <div>
                  {/* Hero text placeholder */}
                  <div className={cn(
                    "space-y-2",
                    viewport === "mobile" ? "py-4 px-3" : viewport === "tablet" ? "p-4" : "p-5"
                  )}>
                    <div className="h-5 bg-muted-foreground/10 rounded-full w-3/4" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-full" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-5/6" />
                  </div>

                  {/* Sections */}
                  <SectionRenderer sections={sections} viewport={viewport} pageStyle={pageStyle} />

                  {/* Body text placeholder */}
                  <div className={cn(
                    "space-y-2",
                    viewport === "mobile" ? "py-4 px-3" : viewport === "tablet" ? "p-4" : "p-5"
                  )}>
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-full" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-4/5" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-full" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-3/4" />
                  </div>
                </div>
              </div>
            </DeviceFrame>
          </div>
        </main>
      </div>
    </div>
  )
}

// Device frame wrapper
function DeviceFrame({ viewport, children }: { viewport: ViewportSize; children: React.ReactNode }) {
  const vp = VIEWPORT_CONFIG[viewport]

  if (viewport === "desktop") {
    return (
      <div className="w-full">
        <div className={cn("border border-border bg-background overflow-clip", vp.frameClass)}>
          <div className="overflow-y-auto preview-container" style={{ maxHeight: "80vh" }}>
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn("border-border bg-card overflow-clip shadow-2xl", vp.frameClass)}
        style={{ width: vp.width ?? undefined, maxWidth: "100%" }}
      >
        {/* Device chrome top bar */}
        <div className="h-6 bg-card flex items-center justify-center shrink-0">
          {viewport === "mobile" && (
            <div className="h-1 w-20 bg-muted-foreground/30 rounded-full" />
          )}
          {viewport === "tablet" && (
            <div className="h-1 w-10 bg-muted-foreground/20 rounded-full" />
          )}
        </div>
        {/* Screen */}
        <div className="bg-background overflow-y-auto preview-container" style={{ maxHeight: viewport === "mobile" ? 720 : 900 }}>
          {children}
        </div>
        {/* Device chrome bottom bar */}
        {viewport === "mobile" && (
          <div className="h-5 bg-card flex items-center justify-center shrink-0">
            <div className="h-1 w-24 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}
