"use client"

import { useState } from "react"
import { GridCell, CellContent, BulletListItem, IconBlockItem, createDefaultContent } from "@/types/grid"
import { createDefaultBanner } from "@/types/banner"
import { BannerEditor } from "./banner-editor"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "./rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, GripVertical, ChevronUp, ChevronDown, ChevronRight, Upload } from "lucide-react"
import { ComponentPicker } from "./component-picker"
import { getComponentByType } from "./component-library"
import { ColorPicker } from "./color-picker"
import { cn } from "@/lib/utils"

interface CellEditorProps {
  cell: GridCell
  onUpdate: (cell: GridCell) => void
  onWidthChange?: (width: number) => void  // Row-aware width change
  cellIndex: number
}

export function CellEditor({ cell, onUpdate, onWidthChange, cellIndex }: CellEditorProps) {
  const addComponent = (selectedComponent: CellContent) => {
    // Generate a new ID for the component
    const newComponent: CellContent = {
      ...selectedComponent,
      id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }
    onUpdate({
      ...cell,
      contents: [...cell.contents, newComponent],
    })
  }

  const updateComponent = (contentId: string, updates: Partial<CellContent>) => {
    onUpdate({
      ...cell,
      contents: cell.contents.map((c) =>
        c.id === contentId ? { ...c, ...updates } : c
      ),
    })
  }

  const removeComponent = (contentId: string) => {
    onUpdate({
      ...cell,
      contents: cell.contents.filter((c) => c.id !== contentId),
    })
  }

  const moveComponent = (contentId: string, direction: "up" | "down") => {
    const index = cell.contents.findIndex((c) => c.id === contentId)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === cell.contents.length - 1) return

    const newContents = [...cell.contents]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newContents[index], newContents[targetIndex]] = [newContents[targetIndex], newContents[index]]
    
    onUpdate({
      ...cell,
      contents: newContents,
    })
  }

  const [cellAdvancedOpen, setCellAdvancedOpen] = useState(false)

  const updateStyle = (updates: Partial<GridCell["style"]>) => {
    onUpdate({
      ...cell,
      style: { ...cell.style, ...updates },
    })
  }

  return (
    <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <span className="text-sm font-medium text-foreground">Cell {cellIndex + 1}</span>
        <span className="text-xs text-muted-foreground">{cell.contents.length} component{cell.contents.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Width Control */}
      <div className="space-y-2 pb-3 border-b border-border">
        <Label className="text-xs text-muted-foreground">Width</Label>
        <div className="flex gap-1">
          {[25, 33, 50, 66, 75, 100].map((preset) => (
            <Button
              key={preset}
              variant={cell.width === preset ? "default" : "outline"}
              size="sm"
              className="flex-1 h-6 text-xs px-0"
              onClick={() => onWidthChange ? onWidthChange(preset) : onUpdate({ ...cell, width: preset })}
            >
              {preset}%
            </Button>
          ))}
        </div>
        <Input
          type="number"
          min={10}
          max={100}
          value={cell.width ?? 50}
          onChange={(e) => {
            const v = parseInt(e.target.value) || 50
            onWidthChange ? onWidthChange(v) : onUpdate({ ...cell, width: v })
          }}
          className="h-7 text-xs text-muted-foreground"
        />
      </div>

      {/* Content Blocks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground font-medium">Content Blocks</Label>
          <ComponentPicker
            onSelect={addComponent}
            trigger={
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Block
              </Button>
            }
          />
        </div>

        {cell.contents.map((content, idx) => (
          <ComponentItem
            key={content.id}
            content={content}
            index={idx}
            totalCount={cell.contents.length}
            onUpdate={(updates) => updateComponent(content.id, updates)}
            onRemove={() => removeComponent(content.id)}
            onMoveUp={() => moveComponent(content.id, "up")}
            onMoveDown={() => moveComponent(content.id, "down")}
          />
        ))}
      </div>

      {/* Style Controls */}
      <div className="pt-3 border-t border-border space-y-3">
        <Label className="text-xs text-muted-foreground font-medium">Column Styling</Label>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Background</Label>
          <ColorPicker
            value={cell.style.backgroundColor ?? ""}
            onChange={(v) => updateStyle({ backgroundColor: v })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Padding (px)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground block">Horizontal</span>
              <Input
                type="number" min={0}
                defaultValue={cell.style.paddingX ?? 16}
                key={`cpx-${cell.id}-${cell.style.paddingX}`}
                onBlur={(e) => updateStyle({ paddingX: parseInt(e.target.value) || 0 })}
                className="h-7 text-xs px-2"
              />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground block">Vertical</span>
              <Input
                type="number" min={0}
                defaultValue={cell.style.paddingY ?? 16}
                key={`cpy-${cell.id}-${cell.style.paddingY}`}
                onBlur={(e) => updateStyle({ paddingY: parseInt(e.target.value) || 0 })}
                className="h-7 text-xs px-2"
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">Tablet: ×0.75 · Mobile: ×0.6</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Row Span</Label>
          <Input
            type="number"
            min={1}
            max={6}
            defaultValue={cell.rowSpan ?? 1}
            key={`rowspan-${cell.id}`}
            onBlur={(e) => {
              const v = parseInt(e.target.value) || 1
              onUpdate({ ...cell, rowSpan: v <= 1 ? undefined : v })
            }}
            className="h-8 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">Desktop only — how many rows this cell spans vertically</p>
        </div>

        {/* Advanced (collapsed) */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setCellAdvancedOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <span>Advanced</span>
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", cellAdvancedOpen && "rotate-90")} />
          </button>
          {cellAdvancedOpen && (
            <div className="px-3 py-2 border-t border-border space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Text Align</Label>
                  <Select
                    value={cell.style.textAlign || "left"}
                    onValueChange={(value: "left" | "center" | "right") => updateStyle({ textAlign: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Vertical Align</Label>
                  <Select
                    value={cell.style.alignItems || "start"}
                    onValueChange={(value: "start" | "center" | "end") => updateStyle({ alignItems: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start">Top</SelectItem>
                      <SelectItem value="center">Middle</SelectItem>
                      <SelectItem value="end">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Radius (px)</Label>
                <Input
                  type="number"
                  min={0}
                  defaultValue={cell.style.borderRadius ?? 12}
                  key={`radius-${cell.id}`}
                  onBlur={(e) => updateStyle({ borderRadius: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Border Color</Label>
                <ColorPicker
                  value={cell.style.borderColor ?? ""}
                  onChange={(v) => updateStyle({ borderColor: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Border Style</Label>
                  <Select
                    value={cell.style.borderStyle || "solid"}
                    onValueChange={(value: "solid" | "dashed" | "dotted" | "double") => updateStyle({ borderStyle: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Border Width (px)</Label>
                  <Input
                    type="number"
                    min={0}
                    defaultValue={cell.style.borderWidth ?? 0}
                    key={`borderwidth-${cell.id}`}
                    onBlur={(e) => updateStyle({ borderWidth: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cell.style.shadowEnabled ?? false}
                    onChange={(e) => updateStyle({ shadowEnabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label className="text-xs text-muted-foreground cursor-pointer">Drop Shadow</Label>
                </label>
              </div>
              {cell.style.shadowEnabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Shadow Color</Label>
                    <ColorPicker
                      value={cell.style.shadowColor ?? "#00000040"}
                      onChange={(v) => updateStyle({ shadowColor: v })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Blur (px)</Label>
                    <Input
                      type="number"
                      value={cell.style.shadowBlur ?? 8}
                      onChange={(e) => updateStyle({ shadowBlur: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Responsive Behavior */}
        <div className="pt-3 border-t border-border space-y-2">
          <Label className="text-xs text-muted-foreground font-medium">Responsive Behavior</Label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cell.hideOnMobile ?? false}
              onChange={(e) => onUpdate({ ...cell, hideOnMobile: e.target.checked })}
              className="w-4 h-4"
            />
            <Label className="text-xs text-muted-foreground cursor-pointer">Hide on mobile</Label>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cell.hideOnDesktop ?? false}
              onChange={(e) => onUpdate({ ...cell, hideOnDesktop: e.target.checked })}
              className="w-4 h-4"
            />
            <Label className="text-xs text-muted-foreground cursor-pointer">Hide on desktop & tablet</Label>
          </label>
        </div>
      </div>
    </div>
  )
}

// Individual component item within a cell
interface ComponentItemProps {
  content: CellContent
  index: number
  totalCount: number
  onUpdate: (updates: Partial<CellContent>) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function ComponentItem({ content, index, totalCount, onUpdate, onRemove, onMoveUp, onMoveDown }: ComponentItemProps) {
  const componentDef = getComponentByType(content.type)
  const [isExpanded, setIsExpanded] = React.useState(true)

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      {/* Component Header */}
      <div 
        className="flex items-center gap-2 px-3 py-2 bg-muted/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        {componentDef && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {componentDef.icon}
            <span className="font-medium">{componentDef.label}</span>
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={index === totalCount - 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Component Fields */}
      {isExpanded && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          <ContentFields content={content} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  )
}

// Need to import React for useState
import React from "react"

// Content-specific form fields
function ContentFields({ content, onUpdate }: { content: CellContent; onUpdate: (updates: Partial<CellContent>) => void }) {
  switch (content.type) {
    case "textBox":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Text Box</Label>
            <p className="text-xs text-muted-foreground">
              Use the toolbar for headings (H1-H6), bold, italic, colors, highlights, and links.
            </p>
            <RichTextEditor
              value={content.text || ""}
              onChange={(value) => onUpdate({ text: value })}
              placeholder="Enter your content..."
            />
          </div>
        </div>
      )

    case "image":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Image URL</Label>
            <Input
              value={content.imageUrl || ""}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
            <div className="grid grid-cols-6 gap-1">
              {(["auto", "square", "widescreen", "portrait", "portrait-tall", "standard"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => onUpdate({ imageAspectRatio: r })}
                  className={cn(
                    "py-1 text-[10px] rounded border transition-colors",
                    (content.imageAspectRatio ?? "auto") === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r === "widescreen" ? "16:9" : r === "portrait" ? "3:4" : r === "portrait-tall" ? "4:5" : r === "standard" ? "4:3" : r === "square" ? "1:1" : "Auto"}
                </button>
              ))}
            </div>
          </div>
          {(content.imageAspectRatio ?? "auto") !== "auto" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Object Fit</Label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["cover", "contain"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => onUpdate({ imageObjectFit: f })}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0",
                      (content.imageObjectFit ?? "cover") === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {(content.imageObjectFit ?? "cover") === "cover" ? "Fills the frame — may crop edges" : "Fits inside the frame — may show letterbox"}
              </p>
            </div>
          )}
          {/* Max Width */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max Width</Label>
            <div className="grid grid-cols-6 gap-1">
              {([25, 33, 50, 66, 75, 100] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => onUpdate({ imageMaxWidth: w })}
                  className={cn(
                    "py-1 text-[10px] rounded border transition-colors",
                    (content.imageMaxWidth ?? 100) === w
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {w}%
                </button>
              ))}
            </div>
          </div>

          {/* Align + Mobile override — only relevant when width < 100 */}
          {(content.imageMaxWidth ?? 100) < 100 && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Align</Label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => onUpdate({ imageAlign: a })}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0",
                        (content.imageAlign ?? "center") === a
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Mobile Max Width</Label>
                <div className="grid grid-cols-5 gap-1">
                  {([33, 50, 66, 75, 100] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => onUpdate({ imageMobileMaxWidth: w })}
                      className={cn(
                        "py-1 text-[10px] rounded border transition-colors",
                        (content.imageMobileMaxWidth ?? 100) === w
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {w === 100 ? "Full" : `${w}%`}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">Defaults to full width on mobile</p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Alt Text</Label>
            <Input
              value={content.imageAlt || ""}
              onChange={(e) => onUpdate({ imageAlt: e.target.value })}
              placeholder="Describe the image for accessibility"
            />
          </div>
          <div className="border-t pt-3">
            <Label className="text-xs font-semibold text-foreground">Caption (Optional)</Label>
            <div className="space-y-2 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Caption Text</Label>
                <RichTextEditor
                  value={content.captionText || ""}
                  onChange={(text) => onUpdate({ captionText: text })}
                  placeholder="Add caption..."
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <ColorPicker
                    value={content.captionBgColor ?? ""}
                    onChange={(v) => onUpdate({ captionBgColor: v })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Text Color</Label>
                  <ColorPicker
                    value={content.captionTextColor ?? ""}
                    onChange={(v) => onUpdate({ captionTextColor: v })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    case "video":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
            <Select
              value={content.videoAspectRatio || "square"}
              onValueChange={(v) => onUpdate({ videoAspectRatio: v as "widescreen" | "standard" | "square" })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="widescreen">Widescreen (16:9)</SelectItem>
                <SelectItem value="standard">Standard (9:8 · 1080×960)</SelectItem>
                <SelectItem value="square">Square (1:1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Video URL</Label>
            <Input
              value={content.videoUrl || ""}
              onChange={(e) => onUpdate({ videoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Autoplay</Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={content.videoAutoplay !== false}
                onChange={(e) => onUpdate({ videoAutoplay: e.target.checked })}
              />
              <span>Enable autoplay</span>
            </label>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Loop</Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={content.videoLoop !== false}
                onChange={(e) => onUpdate({ videoLoop: e.target.checked })}
              />
              <span>Loop video</span>
            </label>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Controls</Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={content.videoControls ?? true}
                onChange={(e) => onUpdate({ videoControls: e.target.checked })}
              />
              <span>Show player controls</span>
            </label>
          </div>
          <div className="border-t pt-3">
            <Label className="text-xs font-semibold text-foreground">Caption (Optional)</Label>
            <div className="space-y-2 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Caption Text</Label>
                <RichTextEditor
                  value={content.captionText || ""}
                  onChange={(text) => onUpdate({ captionText: text })}
                  placeholder="Add caption..."
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <ColorPicker
                    value={content.captionBgColor ?? ""}
                    onChange={(v) => onUpdate({ captionBgColor: v })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Text Color</Label>
                  <ColorPicker
                    value={content.captionTextColor ?? ""}
                    onChange={(v) => onUpdate({ captionTextColor: v })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    case "bulletList": {
      const items = content.bulletListItems || []
      const sharedIconUrl = items[0]?.iconUrl || ""
      const updateItem = (i: number, updates: Partial<BulletListItem>) => {
        const next = items.map((item, idx) => idx === i ? { ...item, ...updates } : item)
        onUpdate({ bulletListItems: next })
      }
      const removeItem = (i: number) => {
        onUpdate({ bulletListItems: items.filter((_, idx) => idx !== i) })
      }
      const addItem = () => {
        const newItem: BulletListItem = {
          id: `bullet-item-${Date.now()}`,
          text: "",
          iconUrl: sharedIconUrl || undefined,
        }
        onUpdate({ bulletListItems: [...items, newItem] })
      }
      const setSharedIcon = (url: string) => {
        const next = items.map((item) => ({ ...item, iconUrl: url || undefined }))
        onUpdate({ bulletListItems: next.length ? next : [{ id: `bullet-item-${Date.now()}`, text: "", iconUrl: url || undefined }] })
      }
      return (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Bullet Items</Label>
          <p className="text-xs text-muted-foreground">
            Leave the icon URL empty for default disc bullets. Set a shared icon URL to render the same icon before every item.
          </p>
          {/* Shared icon URL */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Shared Icon URL (optional)</Label>
            <div className="flex items-center gap-2">
              {sharedIconUrl && (
                <img
                  src={sharedIconUrl}
                  alt="icon"
                  className="w-8 h-8 rounded object-contain border border-border shrink-0"
                />
              )}
              <Input
                value={sharedIconUrl}
                onChange={(e) => setSharedIcon(e.target.value)}
                placeholder="https://... or leave blank for disc bullets"
                className="flex-1"
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => document.getElementById("bullet-list-upload")?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Icon Image
              </Button>
              <input
                id="bullet-list-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setSharedIcon(URL.createObjectURL(file))
                }}
              />
            </div>
          </div>
          {/* Items */}
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2">
                {item.iconUrl ? (
                  <img
                    src={item.iconUrl}
                    alt={`icon-${i}`}
                    className="w-5 h-5 rounded object-contain border border-border shrink-0"
                  />
                ) : (
                  <span className="w-5 text-xs text-muted-foreground shrink-0 text-center">•</span>
                )}
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(i, { text: e.target.value })}
                  placeholder="Bullet text"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      )
    }

    case "numberedList":
      return (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Numbered Items</Label>
          <div className="space-y-2">
            {(content.bulletItems || []).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 text-xs text-muted-foreground shrink-0">{i + 1}.</span>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(content.bulletItems || [])]
                    newItems[i] = e.target.value
                    onUpdate({ bulletItems: newItems })
                  }}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    const newItems = (content.bulletItems || []).filter((_, idx) => idx !== i)
                    onUpdate({ bulletItems: newItems })
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                onUpdate({
                  bulletItems: [...(content.bulletItems || []), "New item"],
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      )

    case "stickyBottomCta":
    case "ctaButton":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Button Text</Label>
            <Input
              value={content.ctaText || ""}
              onChange={(e) => onUpdate({ ctaText: e.target.value })}
              placeholder="Click here"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Button URL</Label>
            <Input
              value={content.ctaUrl || ""}
              onChange={(e) => onUpdate({ ctaUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Background Color</Label>
            <ColorPicker
              value={content.ctaBackgroundColor ?? ""}
              onChange={(v) => onUpdate({ ctaBackgroundColor: v })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Text Color</Label>
            <ColorPicker
              value={content.ctaTextColor ?? ""}
              onChange={(v) => onUpdate({ ctaTextColor: v })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Border Radius</Label>
              <span className="text-xs font-medium text-foreground">{content.ctaBorderRadius ?? 12}px</span>
            </div>
            <Slider
              value={[content.ctaBorderRadius ?? 12]}
              onValueChange={([v]) => onUpdate({ ctaBorderRadius: v })}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Padding Y (px)</Label>
            <Input
              type="number"
              value={content.ctaPaddingY ?? 12}
              onChange={(e) => onUpdate({ ctaPaddingY: parseInt(e.target.value) || 0 })}
              min={0}
              max={80}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Letter Spacing</Label>
            <Input
              value={content.ctaLetterSpacing ?? ""}
              onChange={(e) => onUpdate({ ctaLetterSpacing: e.target.value || undefined })}
              placeholder="e.g. 0.05em"
              className="h-8 text-xs font-mono"
            />
          </div>
          {/* Gradient */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Gradient</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">From</span>
                <ColorPicker value={content.ctaGradientFrom ?? ""} onChange={(v) => onUpdate({ ctaGradientFrom: v || undefined })} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">To</span>
                <ColorPicker value={content.ctaGradientTo ?? ""} onChange={(v) => onUpdate({ ctaGradientTo: v || undefined })} />
              </div>
            </div>
            <Input
              value={content.ctaGradientDirection ?? ""}
              onChange={(e) => onUpdate({ ctaGradientDirection: e.target.value || undefined })}
              placeholder="Direction (e.g. to right, 135deg)"
              className="h-8 text-xs font-mono"
            />
          </div>
          {/* Drop Shadow */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={content.ctaDropShadow ?? false}
                onChange={(e) => onUpdate({ ctaDropShadow: e.target.checked })}
                className="w-4 h-4"
              />
              <Label className="text-xs text-muted-foreground cursor-pointer">Drop Shadow</Label>
            </label>
            {content.ctaDropShadow && (
              <div className="space-y-2 pl-6">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Shadow color</Label>
                  <ColorPicker value={content.ctaDropShadowColor ?? ""} onChange={(v) => onUpdate({ ctaDropShadowColor: v })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Y (px)</Label>
                    <Input
                      type="number"
                      value={content.ctaDropShadowY ?? 4}
                      onChange={(e) => onUpdate({ ctaDropShadowY: parseInt(e.target.value) || 0 })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Blur (px)</Label>
                    <Input
                      type="number"
                      value={content.ctaDropShadowBlur ?? 8}
                      onChange={(e) => onUpdate({ ctaDropShadowBlur: parseInt(e.target.value) || 0 })}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Border Style */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Border Style</Label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["none", "solid", "dashed", "dotted"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdate({ ctaBorderStyle: s })}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0",
                    (content.ctaBorderStyle ?? "none") === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {content.ctaBorderStyle && content.ctaBorderStyle !== "none" && (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Border color</Label>
                <ColorPicker value={content.ctaBorderColor ?? ""} onChange={(v) => onUpdate({ ctaBorderColor: v })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Border width (px)</Label>
                <Input
                  type="number" min={1} max={8}
                  value={content.ctaBorderWidth ?? 1}
                  onChange={(e) => onUpdate({ ctaBorderWidth: parseInt(e.target.value) || 1 })}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          )}
          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Font size (px)</Label>
            <Input
              type="number" min={10} max={36}
              defaultValue={content.ctaFontSize ?? 16}
              key={`cta-font-size-${content.id}`}
              onBlur={(e) => onUpdate({ ctaFontSize: parseInt(e.target.value) || 16 })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      )

    case "badge":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Badge Text</Label>
            <Input
              value={content.text || ""}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Label"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Style</Label>
            <Select
              value={content.badgeVariant || "default"}
              onValueChange={(value: "default" | "secondary" | "destructive" | "outline") =>
                onUpdate({ badgeVariant: value })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="destructive">Destructive</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case "spacer":
      return (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Height (px)</Label>
          <Input
            type="number"
            value={content.spacerHeight || 40}
            onChange={(e) => onUpdate({ spacerHeight: parseInt(e.target.value) || 40 })}
            min={8}
            max={200}
          />
        </div>
      )

    case "divider":
      return (
        <p className="text-xs text-muted-foreground">
          A horizontal line separator. No additional configuration needed.
        </p>
      )

    case "starRating":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Rating (0–5, supports 0.5 steps)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={content.starCount || 5}
                step={0.5}
                value={content.starValue ?? 4.5}
                onChange={(e) => onUpdate({ starValue: Math.min(parseFloat(e.target.value) || 0, content.starCount || 5) })}
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">out of {content.starCount || 5}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Total Stars</Label>
            <Select
              value={String(content.starCount || 5)}
              onValueChange={(v) => onUpdate({ starCount: parseInt(v) })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Label (optional)</Label>
            <Input
              value={content.starLabel || ""}
              onChange={(e) => onUpdate({ starLabel: e.target.value })}
              placeholder="e.g. 4.5 out of 5"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Star Color</Label>
            <ColorPicker
              value={content.starColor ?? ""}
              onChange={(v) => onUpdate({ starColor: v })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Star fill</Label>
            <ColorPicker value={content.starFillColor ?? ""} onChange={(v) => onUpdate({ starFillColor: v || undefined })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Star empty</Label>
            <ColorPicker value={content.starEmptyColor ?? ""} onChange={(v) => onUpdate({ starEmptyColor: v || undefined })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Star border</Label>
            <ColorPicker value={content.starBorderColor ?? ""} onChange={(v) => onUpdate({ starBorderColor: v || undefined })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Star size (px)</Label>
              <Input
                type="number" min={8} max={64}
                defaultValue={content.starSize ?? 20}
                key={`star-size-${content.id}`}
                onBlur={(e) => onUpdate({ starSize: parseInt(e.target.value) || 20 })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Label size (px)</Label>
              <Input
                type="number" min={8} max={48}
                defaultValue={content.starLabelSize ?? 14}
                key={`star-label-size-${content.id}`}
                onBlur={(e) => onUpdate({ starLabelSize: parseInt(e.target.value) || 14 })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Label color</Label>
            <ColorPicker value={content.starLabelColor ?? ""} onChange={(v) => onUpdate({ starLabelColor: v || undefined })} />
          </div>
        </div>
      )

    case "iconBlock": {
      const items = content.iconBlockItems || []
      const updateItem = (i: number, updates: Partial<{ iconUrl: string; label: string }>) => {
        const next = items.map((item, idx) => idx === i ? { ...item, ...updates } : item)
        onUpdate({ iconBlockItems: next })
      }
      const removeItem = (i: number) => {
        onUpdate({ iconBlockItems: items.filter((_, idx) => idx !== i) })
      }
      const addItem = () => {
        const newItem = {
          id: `icon-block-${Date.now()}`,
          iconUrl: "",
          label: "",
        }
        onUpdate({ iconBlockItems: [...items, newItem] })
      }
      return (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Icon Block Items</Label>
          <p className="text-xs text-muted-foreground">
            Add icons with optional labels. Each icon can have its own image.
          </p>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={item.id} className="p-3 border border-border rounded-lg space-y-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Icon {i + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {item.iconUrl && (
                    <img
                      src={item.iconUrl}
                      alt=""
                      className="w-10 h-10 rounded object-contain border border-border shrink-0 bg-background"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <Input
                      value={item.iconUrl}
                      onChange={(e) => updateItem(i, { iconUrl: e.target.value })}
                      placeholder="Icon URL..."
                      className="text-xs"
                    />
                  </div>
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-xs"
                    onClick={() => document.getElementById(`icon-block-upload-${i}`)?.click()}
                  >
                    <Upload className="h-3 w-3" />
                    Upload Icon
                  </Button>
                  <input
                    id={`icon-block-upload-${i}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const url = URL.createObjectURL(file)
                      updateItem(i, { iconUrl: url })
                    }}
                  />
                </div>
                <Input
                  value={item.label || ""}
                  onChange={(e) => updateItem(i, { label: e.target.value })}
                  placeholder="Label (optional)"
                  className="text-xs"
                />
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Icon
            </Button>
          </div>
        </div>
      )
    }

    case "articleDetails":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Author Name</Label>
            <Input
              value={content.articleAuthor || ""}
              onChange={(e) => onUpdate({ articleAuthor: e.target.value })}
              placeholder="e.g., Jade M."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Author Image URL</Label>
            <Input
              value={content.articleAuthorImage || ""}
              onChange={(e) => onUpdate({ articleAuthorImage: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Publication Date</Label>
            <Input
              value={content.articleDate || ""}
              onChange={(e) => onUpdate({ articleDate: e.target.value })}
              placeholder="Mar 22, 2026"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Variant</Label>
            <Select
              value={content.articleVariant || "default"}
              onValueChange={(v) => onUpdate({ articleVariant: v as "default" | "minimal" })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Full byline)</SelectItem>
                <SelectItem value="minimal">Minimal (Name only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case "productComparison": {
      const products = content.productComparisonProducts || []
      const metrics = content.productComparisonMetrics || []

      const updateProduct = (i: number, patch: Partial<typeof products[0]>) => {
        const next = products.map((p, idx) => idx === i ? { ...p, ...patch } : p)
        onUpdate({ productComparisonProducts: next })
      }

      const deleteProduct = (i: number) => {
        onUpdate({
          productComparisonProducts: products.filter((_, idx) => idx !== i),
          productComparisonMetrics: metrics.map(m => ({
            ...m,
            values: m.values.filter((_, vIdx) => vIdx !== i),
          })),
        })
      }

      const updateMetric = (i: number, patch: Partial<typeof metrics[0]>) => {
        const next = metrics.map((m, idx) => idx === i ? { ...m, ...patch } : m)
        onUpdate({ productComparisonMetrics: next })
      }

      return (
        <div className="space-y-4">
          {/* Top-level: highlight border color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Highlight Border Color</Label>
            <ColorPicker
              value={content.productComparisonHighlightBorderColor ?? "#7DD9D9"}
              onChange={(v) => onUpdate({ productComparisonHighlightBorderColor: v })}
            />
          </div>

          {/* Products */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Products</Label>
            <div className="space-y-2">
              {products.map((product, i) => (
                <div key={i} className="p-2 rounded-md border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{i === 0 ? "Your product" : `Competitor ${i}`}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => deleteProduct(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Name</Label>
                    <Input
                      value={product.name}
                      onChange={(e) => updateProduct(i, { name: e.target.value })}
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Logo URL</Label>
                    <Input
                      value={product.logo ?? ""}
                      onChange={(e) => updateProduct(i, { logo: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Highlight Color</Label>
                    <ColorPicker
                      value={product.color ?? ""}
                      onChange={(v) => updateProduct(i, { color: v })}
                    />
                  </div>
                  {i !== 0 && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Header Background</Label>
                        <ColorPicker
                          value={product.headerBackgroundColor ?? "#fee2e2"}
                          onChange={(v) => updateProduct(i, { headerBackgroundColor: v })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Header Text Color</Label>
                        <ColorPicker
                          value={product.headerTextColor ?? "#dc2626"}
                          onChange={(v) => updateProduct(i, { headerTextColor: v })}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onUpdate({
                    productComparisonProducts: [
                      ...products,
                      { name: "New Product", headerBackgroundColor: "#fee2e2", headerTextColor: "#dc2626" },
                    ],
                    productComparisonMetrics: metrics.map(m => ({ ...m, values: [...m.values, ""] })),
                  })
                }}
              >
                + Add Product
              </Button>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Metrics</Label>
            <div className="space-y-2">
              {metrics.map((metric, i) => (
                <div key={i} className="p-2 rounded-md border border-border space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={metric.emoji ?? ""}
                      onChange={(e) => updateMetric(i, { emoji: e.target.value })}
                      placeholder="emoji"
                      className="w-14 shrink-0 text-center"
                    />
                    <Input
                      value={metric.label}
                      onChange={(e) => updateMetric(i, { label: e.target.value })}
                      placeholder="Metric label"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => onUpdate({ productComparisonMetrics: metrics.filter((_, idx) => idx !== i) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {products.map((product, pIdx) => (
                    <div key={pIdx}>
                      <Label className="text-xs text-muted-foreground mb-1 block truncate">
                        {product.name.length > 20 ? product.name.slice(0, 18) + "…" : product.name}
                      </Label>
                      <Input
                        value={String(metric.values[pIdx] ?? "")}
                        onChange={(e) => {
                          const newValues = [...metric.values]
                          newValues[pIdx] = e.target.value
                          updateMetric(i, { values: newValues })
                        }}
                        placeholder="Value"
                      />
                    </div>
                  ))}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onUpdate({
                    productComparisonMetrics: [
                      ...metrics,
                      { label: "New Feature", emoji: "", values: Array(products.length).fill("") },
                    ],
                  })
                }}
              >
                + Add Metric
              </Button>
            </div>
          </div>
        </div>
      )
    }

    case "banner":
      return (
        <BannerEditor
          config={content.bannerConfig ?? createDefaultBanner()}
          onChange={(v) => onUpdate({ bannerConfig: v })}
        />
      )

    case "navbar": {
      const links = content.navbarLinks || []
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Logo URL</Label>
            <Input
              value={content.navbarLogoUrl || ""}
              onChange={(e) => onUpdate({ navbarLogoUrl: e.target.value })}
              placeholder="https://example.com/logo.svg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Logo Height (px)</Label>
            <Input
              type="number"
              value={content.navbarLogoHeight ?? 40}
              onChange={(e) => onUpdate({ navbarLogoHeight: parseInt(e.target.value) || 40 })}
              placeholder="40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Navbar Height (px)</Label>
            <Input
              type="number"
              value={content.navbarHeight ?? 70}
              onChange={(e) => onUpdate({ navbarHeight: parseInt(e.target.value) || 70 })}
              placeholder="70"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Navigation Links</Label>
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1.5">
                    <Input
                      value={link.label}
                      onChange={(e) => {
                        const next = links.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l)
                        onUpdate({ navbarLinks: next })
                      }}
                      placeholder="Label"
                      className="text-xs h-8"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => {
                        const next = links.map((l, idx) => idx === i ? { ...l, url: e.target.value } : l)
                        onUpdate({ navbarLinks: next })
                      }}
                      placeholder="#section"
                      className="text-xs h-8"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onUpdate({ navbarLinks: links.filter((_, idx) => idx !== i) })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onUpdate({ navbarLinks: [...links, { label: "", url: "" }] })}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Background Color</Label>
            <ColorPicker value={content.navbarBackgroundColor ?? "#ffffff"} onChange={(v) => onUpdate({ navbarBackgroundColor: v })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Text Color</Label>
            <ColorPicker value={content.navbarTextColor ?? "#000000"} onChange={(v) => onUpdate({ navbarTextColor: v })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Hover Color</Label>
            <ColorPicker value={content.navbarLinkHoverColor ?? "#666666"} onChange={(v) => onUpdate({ navbarLinkHoverColor: v })} />
          </div>
        </div>
      )
    }

    case "footer": {
      const links = content.footerLinks || []
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Disclaimer / Legal Text</Label>
            <p className="text-[10px] text-muted-foreground">Use <code className="bg-muted px-1 rounded">{"{{date}}"}</code> to insert today's date.</p>
            <RichTextEditor
              value={content.footerDisclaimer || ""}
              onChange={(v) => onUpdate({ footerDisclaimer: v })}
              placeholder="*Offer valid on first order only..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Copyright Text</Label>
            <Input
              value={content.footerCopyright || ""}
              onChange={(e) => onUpdate({ footerCopyright: e.target.value })}
              placeholder={`© ${new Date().getFullYear()} Your Company. All rights reserved.`}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Links</Label>
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1.5">
                    <Input
                      value={link.label}
                      onChange={(e) => {
                        const next = links.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l)
                        onUpdate({ footerLinks: next })
                      }}
                      placeholder="Label"
                      className="text-xs h-8"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => {
                        const next = links.map((l, idx) => idx === i ? { ...l, url: e.target.value } : l)
                        onUpdate({ footerLinks: next })
                      }}
                      placeholder="https://..."
                      className="text-xs h-8"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onUpdate({ footerLinks: links.filter((_, idx) => idx !== i) })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onUpdate({ footerLinks: [...links, { label: "", url: "" }] })}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Text Color</Label>
            <ColorPicker value={content.footerTextColor ?? ""} onChange={(v) => onUpdate({ footerTextColor: v })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Link Color</Label>
            <ColorPicker value={content.footerLinkColor ?? ""} onChange={(v) => onUpdate({ footerLinkColor: v })} />
          </div>
        </div>
      )
    }

    default:
      return null
  }
}
