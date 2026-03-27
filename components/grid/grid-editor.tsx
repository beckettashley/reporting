/* eslint-disable */
// Cache bust: fix-rowstart-let-2025
"use client"

import { useState } from "react"
import { GridConfig, GridCell } from "@/types/grid"
import { MiniGridEditor } from "./mini-grid-editor"
import { CellEditor } from "./cell-editor"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridStyle } from "@/types/grid"

interface GridEditorProps {
  config: GridConfig
  onChange: (config: GridConfig) => void
}

export function GridEditor({ config, onChange }: GridEditorProps) {
  const [focusedCellIndex, setFocusedCellIndex] = useState(0)

  const updateGridStyle = (updates: Partial<GridStyle>) => {
    onChange({
      ...config,
      gridStyle: { ...config.gridStyle, ...updates },
    })
  }

  const updateCell = (index: number, updatedCell: GridCell) => {
    const newCells = [...config.cells]
    newCells[index] = updatedCell
    onChange({ ...config, cells: newCells })
  }

  const removeCell = (index: number) => {
    if (config.cells.length <= 1) return
    const newCells = config.cells.filter((_, i) => i !== index)
    onChange({ ...config, cells: newCells })
    setFocusedCellIndex(Math.max(0, index - 1))
  }

  const duplicateCell = (index: number) => {
    const cell = config.cells[index]
    const newCell: GridCell = {
      ...cell,
      id: `cell-${Date.now()}`,
      contents: cell.contents.map(c => ({
        ...c,
        id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      })),
    }
    const newCells = [...config.cells.slice(0, index + 1), newCell, ...config.cells.slice(index + 1)]
    onChange({ ...config, cells: newCells })
  }

  const getRowForCell = (cellIndex: number) => {
    let currentWidth = 0
    let rowStart = cellIndex
    let rowEnd = cellIndex

    // Find start of row - go backwards until width exceeds 100%
    for (let i = cellIndex; i >= 0; i--) {
      if (i === cellIndex) {
        currentWidth = 0
      }
      const cellWidth = config.cells[i].width ?? 50
      if (currentWidth + cellWidth > 100 && i < cellIndex) break
      currentWidth += cellWidth
      rowStart = i as any
    }

    // Find end of row - go forwards until width exceeds 100%
    currentWidth = 0
    for (let i = rowStart; i < config.cells.length; i++) {
      const cellWidth = config.cells[i].width ?? 50
      if (currentWidth + cellWidth > 100 && i > rowStart) break
      currentWidth += cellWidth
      rowEnd = i
    }

    const rowIndices = Array.from({ length: rowEnd - rowStart + 1 }, (_, i) => rowStart + i)
    return {
      startIndex: rowStart,
      endIndex: rowEnd,
      cells: rowIndices.map(i => config.cells[i]),
      indices: rowIndices,
    }
  }

  const duplicateRow = (cellIndex: number) => {
    const row = getRowForCell(cellIndex)
    
    const clonedCells = row.cells.map((cell) => ({
      ...cell,
      id: `cell-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      contents: cell.contents.map(c => ({
        ...c,
        id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      })),
    }))

    // Insert cloned cells after the last cell in the row
    const insertIndex = row.endIndex + 1
    const newCells = [
      ...config.cells.slice(0, insertIndex),
      ...clonedCells,
      ...config.cells.slice(insertIndex),
    ]
    onChange({ ...config, cells: newCells })
  }

  const moveCell = (index: number, direction: "up" | "down") => {
    const newCells = [...config.cells]
    if (direction === "up" && index > 0) {
      [newCells[index], newCells[index - 1]] = [newCells[index - 1], newCells[index]]
      setFocusedCellIndex(index - 1)
    } else if (direction === "down" && index < newCells.length - 1) {
      [newCells[index], newCells[index + 1]] = [newCells[index + 1], newCells[index]]
      setFocusedCellIndex(index + 1)
    }
    onChange({ ...config, cells: newCells })
  }

  const adjustCellWidthWithRowSiblings = (index: number, newWidth: number) => {
    const newCells = [...config.cells]
    newCells[index] = { ...newCells[index], width: newWidth }
    onChange({ ...config, cells: newCells })
  }

  return (
    <div className="h-full flex flex-col space-y-4 p-4 overflow-y-auto">
      {/* Layout Section */}
      <div className="space-y-2 pb-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Layout</h2>
        <MiniGridEditor
          cells={config.cells}
          onChange={(cells) => onChange({ ...config, cells })}
          selectedCellIndex={focusedCellIndex}
          onSelectCell={(index) => setFocusedCellIndex(index)}
          onMergeMode={() => {}}
        />
      </div>

      {/* Grid Styling Section */}
      <Accordion type="single" collapsible className="w-full border-b border-border pb-4">
        <AccordionItem value="grid-styling" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-2 text-xs font-semibold">
            Grid Styling
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-3">
            {/* Grid Padding & Gap */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Padding (px)</Label>
                <Input
                  type="number"
                  min={0}
                  defaultValue={config.gridStyle.padding ?? 16}
                  key={`grid-padding-${config.gridStyle.padding}`}
                  onBlur={(e) => updateGridStyle({ padding: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Gap (px)</Label>
                <Input
                  type="number"
                  min={0}
                  defaultValue={config.gridStyle.gap ?? 24}
                  key={`grid-gap-${config.gridStyle.gap}`}
                  onBlur={(e) => updateGridStyle({ gap: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Border Radius & Width */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Radius (px)</Label>
                <Input
                  type="number"
                  min={0}
                  defaultValue={config.gridStyle.borderRadius ?? 16}
                  key={`grid-radius-${config.gridStyle.borderRadius}`}
                  onBlur={(e) => updateGridStyle({ borderRadius: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Border Width (px)</Label>
                <Input
                  type="number"
                  min={0}
                  defaultValue={config.gridStyle.borderWidth ?? 0}
                  key={`grid-borderwidth-${config.gridStyle.borderWidth}`}
                  onBlur={(e) => updateGridStyle({ borderWidth: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Background & Border Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Background</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.gridStyle.backgroundColor || "#ffffff"}
                    onChange={(e) => updateGridStyle({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.gridStyle.backgroundColor || "#ffffff"}
                    onChange={(e) => updateGridStyle({ backgroundColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Border Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.gridStyle.borderColor || "#e5e7eb"}
                    onChange={(e) => updateGridStyle({ borderColor: e.target.value })}
                    className="w-8 h-8 rounded border border-border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.gridStyle.borderColor || "#e5e7eb"}
                    onChange={(e) => updateGridStyle({ borderColor: e.target.value })}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Border Style */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Border Style</Label>
              <Select
                value={config.gridStyle.borderStyle || "solid"}
                onValueChange={(value: "solid" | "dashed" | "dotted" | "double") => updateGridStyle({ borderStyle: value })}
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

            {/* Shadow Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="grid-shadow"
                checked={config.gridStyle.shadowEnabled ?? false}
                onChange={(e) => updateGridStyle({ shadowEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="grid-shadow" className="text-xs text-muted-foreground cursor-pointer">
                Enable Drop Shadow
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Cells List Section */}
      <div className="space-y-2 pb-4 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground">Cells</h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {config.cells.map((cell, index) => (
            <button
              key={cell.id}
              onClick={() => setFocusedCellIndex(index)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors border text-xs ${
                focusedCellIndex === index
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Cell {index + 1}</span>
                <span className="text-[10px] text-muted-foreground">{cell.width ?? 50}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cell Editor - Expandable Accordion */}
      {focusedCellIndex >= 0 && focusedCellIndex < config.cells.length && (
        <Accordion type="single" collapsible defaultValue="editor" className="w-full">
          <AccordionItem value="editor" className="border-b-0">
            <AccordionTrigger className="hover:no-underline py-2 text-xs font-semibold">
              Edit Cell {focusedCellIndex + 1}
            </AccordionTrigger>
            <AccordionContent className="pt-2 max-h-80 overflow-y-auto">
              <CellEditor
                cell={config.cells[focusedCellIndex]}
                cellIndex={focusedCellIndex}
                onUpdate={(updatedCell) => updateCell(focusedCellIndex, updatedCell)}
                onWidthChange={(width) => adjustCellWidthWithRowSiblings(focusedCellIndex, width)}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Actions Section */}
      {focusedCellIndex >= 0 && focusedCellIndex < config.cells.length && (
        <div className="pt-4 border-t border-border space-y-2 mt-auto">
          <p className="text-xs font-semibold text-foreground">Actions</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {focusedCellIndex > 0 && (
              <button
                onClick={() => moveCell(focusedCellIndex, "up")}
                className="flex-1 px-2 py-1.5 rounded border border-border hover:bg-muted transition-colors"
              >
                ↑ Up
              </button>
            )}
            {focusedCellIndex < config.cells.length - 1 && (
              <button
                onClick={() => moveCell(focusedCellIndex, "down")}
                className="flex-1 px-2 py-1.5 rounded border border-border hover:bg-muted transition-colors"
              >
                ↓ Down
              </button>
            )}
            <button
              onClick={() => duplicateCell(focusedCellIndex)}
              className="flex-1 px-2 py-1.5 rounded border border-border hover:bg-muted transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={() => duplicateRow(focusedCellIndex)}
              className="flex-1 px-2 py-1.5 rounded border border-border hover:bg-muted transition-colors"
            >
              Copy Row
            </button>
            {config.cells.length > 1 && (
              <button
                onClick={() => removeCell(focusedCellIndex)}
                className="flex-1 px-2 py-1.5 rounded border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
