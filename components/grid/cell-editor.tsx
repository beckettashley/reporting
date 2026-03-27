"use client"

import { GridCell, CellContent, IconListItem, IconBlockItem, createDefaultContent } from "@/types/grid"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "./rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, GripVertical, ChevronUp, ChevronDown, Upload } from "lucide-react"
import { ComponentPicker } from "./component-picker"
import { getComponentByType } from "./component-library"
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
    if (cell.contents.length <= 1) return // Keep at least one
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
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Width</Label>
          <span className="text-xs font-medium text-foreground">{cell.width ?? 50}%</span>
        </div>
        <Slider
          value={[cell.width ?? 50]}
          onValueChange={([value]) => onWidthChange ? onWidthChange(value) : onUpdate({ ...cell, width: value })}
          min={10}
          max={90}
          step={5}
          className="w-full"
        />
        <div className="flex gap-1">
          {[25, 33, 50, 66, 75].map((preset) => (
            <Button
              key={preset}
              variant={cell.width === preset ? "default" : "outline"}
              size="sm"
              className="flex-1 h-6 text-xs px-1"
              onClick={() => onWidthChange ? onWidthChange(preset) : onUpdate({ ...cell, width: preset })}
            >
              {preset}%
            </Button>
          ))}
        </div>
      </div>

      {/* Components List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground font-medium">Components</Label>
          <ComponentPicker
            onSelect={addComponent}
            trigger={
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Component
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
        <Label className="text-xs text-muted-foreground font-medium">Cell Styling</Label>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Text Justification</Label>
            <Select
              value={cell.style.textAlign || "left"}
              onValueChange={(value: "left" | "center" | "right") => updateStyle({ textAlign: value })}
            >
              <SelectTrigger className="h-9">
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
            <Label className="text-xs text-muted-foreground">Content Alignment</Label>
            <Select
              value={cell.style.alignItems || "start"}
              onValueChange={(value: "start" | "center" | "end") => updateStyle({ alignItems: value })}
            >
              <SelectTrigger className="h-9">
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cell.style.backgroundColor || "#18181b"}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-9 h-9 rounded border border-border cursor-pointer"
              />
              <Input
                value={cell.style.backgroundColor || "#18181b"}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="flex-1 h-9 font-mono text-xs"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Border</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cell.style.borderColor || "#27272a"}
                onChange={(e) => updateStyle({ borderColor: e.target.value })}
                className="w-9 h-9 rounded border border-border cursor-pointer"
              />
              <Input
                value={cell.style.borderColor || "#27272a"}
                onChange={(e) => updateStyle({ borderColor: e.target.value })}
                className="flex-1 h-9 font-mono text-xs"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Radius (px)</Label>
            <Input
              type="number"
              min={0}
              defaultValue={cell.style.borderRadius ?? 12}
              key={`radius-${cell.id}`}
              onBlur={(e) => updateStyle({ borderRadius: parseInt(e.target.value) || 0 })}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Padding (px)</Label>
            <Input
              type="number"
              min={0}
              defaultValue={cell.style.padding ?? 24}
              key={`padding-${cell.id}`}
              onBlur={(e) => updateStyle({ padding: parseInt(e.target.value) || 0 })}
              className="h-9"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Border Style</Label>
            <Select
              value={cell.style.borderStyle || "solid"}
              onValueChange={(value: "solid" | "dashed" | "dotted" | "double") => updateStyle({ borderStyle: value })}
            >
              <SelectTrigger className="h-9">
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
              className="h-9"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Shadow</Label>
            <label className="flex items-center gap-2 cursor-pointer h-9">
              <input
                type="checkbox"
                checked={cell.style.shadowEnabled ?? false}
                onChange={(e) => updateStyle({ shadowEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-xs">Enable</span>
            </label>
          </div>
        </div>
        {cell.style.shadowEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Shadow Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cell.style.shadowColor || "#00000015"}
                  onChange={(e) => updateStyle({ shadowColor: e.target.value })}
                  className="w-9 h-9 rounded border border-border cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Blur (px)</Label>
              <Input
                type="number"
                value={cell.style.shadowBlur ?? 8}
                onChange={(e) => updateStyle({ shadowBlur: parseInt(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
          </div>
        )}
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
            disabled={totalCount <= 1}
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
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <Input
                    type="color"
                    value={content.captionBgColor || "#f3f4f6"}
                    onChange={(e) => onUpdate({ captionBgColor: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Text Color</Label>
                  <Input
                    type="color"
                    value={content.captionTextColor || "#1f2937"}
                    onChange={(e) => onUpdate({ captionTextColor: e.target.value })}
                    className="h-9"
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
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Background Color</Label>
                  <Input
                    type="color"
                    value={content.captionBgColor || "#f3f4f6"}
                    onChange={(e) => onUpdate({ captionBgColor: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Text Color</Label>
                  <Input
                    type="color"
                    value={content.captionTextColor || "#1f2937"}
                    onChange={(e) => onUpdate({ captionTextColor: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    case "iconBlock":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Icon</Label>
            <Select
              value={content.icon || "star"}
              onValueChange={(value) => onUpdate({ icon: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="star">Star</SelectItem>
                <SelectItem value="heart">Heart</SelectItem>
                <SelectItem value="check">Checkmark</SelectItem>
                <SelectItem value="zap">Lightning</SelectItem>
                <SelectItem value="shield">Shield</SelectItem>
                <SelectItem value="rocket">Rocket</SelectItem>
                <SelectItem value="globe">Globe</SelectItem>
                <SelectItem value="lock">Lock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Input
              value={content.iconLabel || ""}
              onChange={(e) => onUpdate({ iconLabel: e.target.value })}
              placeholder="Feature label"
            />
          </div>
        </div>
      )

    case "bulletList":
    case "numberedList":
      return (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {content.type === "bulletList" ? "Bullet Items" : "Numbered Items"}
          </Label>
          <div className="space-y-2">
            {(content.bulletItems || []).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 text-xs text-muted-foreground shrink-0">
                  {content.type === "bulletList" ? "•" : `${i + 1}.`}
                </span>
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

    case "iconList": {
      const items = content.iconListItems || []
      const updateItem = (i: number, updates: Partial<IconListItem>) => {
        const next = items.map((item, idx) => idx === i ? { ...item, ...updates } : item)
        onUpdate({ iconListItems: next })
      }
      const removeItem = (i: number) => {
        onUpdate({ iconListItems: items.filter((_, idx) => idx !== i) })
      }
      const addItem = () => {
        const newItem: IconListItem = {
          id: `icon-item-${Date.now()}`,
          text: "",
          iconUrl: items[0]?.iconUrl || "",
        }
        onUpdate({ iconListItems: [...items, newItem] })
      }
      return (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Icon List Items</Label>
          <p className="text-xs text-muted-foreground">
            All items share the same icon image. Upload or paste a URL below.
          </p>
          {/* Shared icon URL for all items */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Icon Image URL</Label>
            <div className="flex items-center gap-2">
              {items[0]?.iconUrl && (
                <img
                  src={items[0].iconUrl}
                  alt="icon"
                  className="w-8 h-8 rounded object-contain border border-border shrink-0"
                />
              )}
              <Input
                value={items[0]?.iconUrl || ""}
                onChange={(e) => {
                  // Update iconUrl on all items at once
                  const next = items.map((item) => ({ ...item, iconUrl: e.target.value }))
                  onUpdate({ iconListItems: next.length ? next : [{ id: `icon-item-${Date.now()}`, text: "", iconUrl: e.target.value }] })
                }}
                placeholder="https://... or upload"
                className="flex-1"
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => document.getElementById("icon-list-upload")?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Icon Image
              </Button>
              <input
                id="icon-list-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const url = URL.createObjectURL(file)
                  const next = items.map((item) => ({ ...item, iconUrl: url }))
                  onUpdate({ iconListItems: next.length ? next : [{ id: `icon-item-${Date.now()}`, text: "", iconUrl: url }] })
                }}
              />
            </div>
          </div>
          {/* Items */}
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2">
                {item.iconUrl && (
                  <img
                    src={item.iconUrl}
                    alt={`icon-${i}`}
                    className="w-5 h-5 rounded object-contain border border-border shrink-0"
                  />
                )}
                {!item.iconUrl && <span className="w-5 text-xs text-muted-foreground shrink-0">{i + 1}.</span>}
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(i, { text: e.target.value })}
                  placeholder="List item text"
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
            <Label className="text-xs text-muted-foreground">Button Style</Label>
            <Select
              value={content.ctaVariant || "primary"}
              onValueChange={(value: "primary" | "secondary" | "outline") =>
                onUpdate({ ctaVariant: value })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={content.starColor || "#f59e0b"}
                onChange={(e) => onUpdate({ starColor: e.target.value })}
                className="h-9 w-9 rounded border border-border cursor-pointer p-0.5"
              />
              <Input
                value={content.starColor || "#f59e0b"}
                onChange={(e) => onUpdate({ starColor: e.target.value })}
                className="flex-1"
                placeholder="#f59e0b"
              />
            </div>
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

    case "productComparison":
      const products = content.productComparisonProducts || []
      const metrics = content.productComparisonMetrics || []
      
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Products</Label>
            <div className="space-y-2">
              {products.map((product, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={product.name}
                    onChange={(e) => {
                      const newProducts = [...products]
                      newProducts[i].name = e.target.value
                      onUpdate({ productComparisonProducts: newProducts })
                    }}
                    placeholder="Product name"
                    className="flex-1"
                  />
                  <Input
                    type="color"
                    value={product.color || "#3b82f6"}
                    onChange={(e) => {
                      const newProducts = [...products]
                      newProducts[i].color = e.target.value
                      onUpdate({ productComparisonProducts: newProducts })
                    }}
                    className="w-12 p-1 h-9"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => {
                      onUpdate({ productComparisonProducts: products.filter((_, idx) => idx !== i) })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onUpdate({
                    productComparisonProducts: [...products, { name: "New Product", color: "#3b82f6" }],
                  })
                }}
              >
                + Add Product
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Metrics</Label>
            <div className="space-y-2">
              {metrics.map((metric, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={metric.label}
                    onChange={(e) => {
                      const newMetrics = [...metrics]
                      newMetrics[i].label = e.target.value
                      onUpdate({ productComparisonMetrics: newMetrics })
                    }}
                    placeholder="Feature/Metric"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => {
                      onUpdate({ productComparisonMetrics: metrics.filter((_, idx) => idx !== i) })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onUpdate({
                    productComparisonMetrics: [
                      ...metrics,
                      { label: "New Feature", emoji: "✓", values: Array(products.length).fill(true) },
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

    default:
      return null
  }
}
