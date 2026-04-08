"use client"

import { useState } from "react"
import { GridConfig, GridCell, GridStyle, RowStyle, rebuildRows } from "@/types/grid"
import { Copy, ChevronRight } from "lucide-react"
import { MiniGridEditor } from "./mini-grid-editor"
import { CellEditor } from "./cell-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColorPicker } from "./color-picker"
import { cn } from "@/lib/utils"

interface GridEditorProps {
  config: GridConfig
  onChange: (config: GridConfig) => void
}

type Scope = "grid" | "row" | "cell"

export function GridEditor({ config, onChange }: GridEditorProps) {
  const [selectedCellIndex, setSelectedCellIndex] = useState(0)
  const [selectedRowIndex, setSelectedRowIndex] = useState(0)
  const [scope, setScope] = useState<Scope>("grid")
  const [gridAdvancedOpen, setGridAdvancedOpen] = useState(false)

  const rows = config.rows ?? []
  const selectedRow = rows[selectedRowIndex]
  const selectedCell = config.cells[selectedCellIndex]

  const updateGridStyle = (updates: Partial<GridStyle>) =>
    onChange({ ...config, gridStyle: { ...config.gridStyle, ...updates } })

  const updateRowStyle = (rowIndex: number, updates: Partial<RowStyle>) => {
    const newRows = rows.map((r, i) =>
      i === rowIndex ? { ...r, style: { ...r.style, ...updates } } : r
    )
    onChange({ ...config, rows: newRows })
  }

  const updateCell = (index: number, updatedCell: GridCell) => {
    const newCells = [...config.cells]
    newCells[index] = updatedCell
    onChange({ ...config, cells: newCells })
  }

  const handleCellsChange = (newCells: GridCell[]) => {
    const newRows = rebuildRows(newCells, config.rows)
    onChange({ ...config, cells: newCells, rows: newRows })
  }

  const cloneRow = (rowIndex: number) => {
    const row = rows[rowIndex]
    if (!row) return
    const rowCells = row.cellIds
      .map(id => config.cells.find(c => c.id === id))
      .filter((c): c is GridCell => !!c)
    const now = Date.now()
    const cloned = rowCells.map((cell, i) => ({
      ...cell,
      id: `cell-clone-${now}-${i}`,
      contents: cell.contents.map((content, j) => ({
        ...content,
        id: `content-clone-${now}-${i}-${j}`,
      })),
    }))
    const lastId = row.cellIds[row.cellIds.length - 1]
    const insertAfter = config.cells.findIndex(c => c.id === lastId)
    const newCells = [
      ...config.cells.slice(0, insertAfter + 1),
      ...cloned,
      ...config.cells.slice(insertAfter + 1),
    ]
    onChange({ ...config, cells: newCells, rows: rebuildRows(newCells, config.rows) })
  }

  const handleSelectCell = (cellIndex: number, rowIndex: number) => {
    setSelectedCellIndex(cellIndex)
    setSelectedRowIndex(rowIndex)
    setScope("cell")
  }

  const handleSelectRow = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex)
    setScope("row")
  }

  return (
    <div className="flex flex-col space-y-4 p-4">

      {/* Mini grid — primary selection control */}
      <div className="space-y-2 pb-4 border-b border-border">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Layout</h2>
        <MiniGridEditor
          cells={config.cells}
          onChange={handleCellsChange}
          selectedCellIndex={selectedCellIndex}
          onSelectCell={handleSelectCell}
          selectedRowIndex={selectedRowIndex}
          onSelectRow={handleSelectRow}
        />
      </div>

      {/* Scope tabs */}
      <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
        {(["grid", "row", "cell"] as Scope[]).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0",
              scope === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            {s === "grid" ? "Layout" : s === "row" ? `Row ${selectedRowIndex + 1}` : `Cell ${selectedCellIndex + 1}`}
          </button>
        ))}
      </div>

      {/* Grid scope */}
      {scope === "grid" && (
        <div className="space-y-3">
          {/* Mobile layout — only shown when any row has exactly 2 cells */}
          {config.rows?.some(r => r.cellIds.length === 2) && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mobile Layout</Label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {([
                  { value: 1, label: "Stack (1 col)" },
                  { value: 2, label: "Keep 2 cols" },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => onChange({ ...config, mobileColumns: value === 1 ? undefined : value })}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium transition-colors border-r border-border last:border-r-0",
                      (config.mobileColumns ?? 1) === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gap — row and column, auto-scale per viewport */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Row Gap (px)</Label>
              <Input
                type="number" min={0}
                defaultValue={config.gridStyle.gap ?? 24}
                key={`gg-${config.gridStyle.gap}`}
                onBlur={(e) => updateGridStyle({ gap: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Col Gap (px)</Label>
              <Input
                type="number" min={0}
                defaultValue={config.gridStyle.columnGap ?? config.rows?.[0]?.style?.gap ?? config.gridStyle.gap ?? 24}
                key={`gcg-${config.gridStyle.columnGap}`}
                onBlur={(e) => updateGridStyle({ columnGap: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground -mt-1">Tablet: ×0.75 · Mobile: ×0.6</p>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Background</Label>
            <ColorPicker value={config.gridStyle.backgroundColor ?? ""} onChange={(v) => updateGridStyle({ backgroundColor: v })} />
          </div>

          {/* Advanced (collapsed) */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setGridAdvancedOpen(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>Advanced</span>
              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", gridAdvancedOpen && "rotate-90")} />
            </button>
            {gridAdvancedOpen && (
              <div className="px-3 py-2 border-t border-border space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Radius (px)</Label>
                    <Input type="number" min={0}
                      defaultValue={config.gridStyle.borderRadius ?? 0}
                      key={`gr-${config.gridStyle.borderRadius}`}
                      onBlur={(e) => updateGridStyle({ borderRadius: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Border Width (px)</Label>
                    <Input type="number" min={0}
                      defaultValue={config.gridStyle.borderWidth ?? 0}
                      key={`gbw-${config.gridStyle.borderWidth}`}
                      onBlur={(e) => updateGridStyle({ borderWidth: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Border Color</Label>
                  <ColorPicker value={config.gridStyle.borderColor ?? ""} onChange={(v) => updateGridStyle({ borderColor: v })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Border Style</Label>
                  <Select value={config.gridStyle.borderStyle || "solid"} onValueChange={(v: "solid" | "dashed" | "dotted" | "double") => updateGridStyle({ borderStyle: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="grid-shadow"
                    checked={config.gridStyle.shadowEnabled ?? false}
                    onChange={(e) => updateGridStyle({ shadowEnabled: e.target.checked })}
                    className="w-4 h-4" />
                  <Label htmlFor="grid-shadow" className="text-xs text-muted-foreground cursor-pointer">Drop Shadow</Label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row scope */}
      {scope === "row" && selectedRow && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Styling Row {selectedRowIndex + 1} — {selectedRow.cellIds.length} cell{selectedRow.cellIds.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Cell Gap (px)</Label>
              <Input type="number" min={0}
                defaultValue={selectedRow.style.gap ?? 16}
                key={`rg-${selectedRowIndex}-${selectedRow.style.gap}`}
                onBlur={(e) => updateRowStyle(selectedRowIndex, { gap: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Padding Y (px)</Label>
              <Input type="number" min={0}
                defaultValue={selectedRow.style.paddingY ?? 0}
                key={`rpy-${selectedRowIndex}-${selectedRow.style.paddingY}`}
                onBlur={(e) => updateRowStyle(selectedRowIndex, { paddingY: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Background</Label>
            <ColorPicker
              value={selectedRow.style.backgroundColor ?? ""}
              onChange={(v) => updateRowStyle(selectedRowIndex, { backgroundColor: v })}
            />
          </div>
          <button
            onClick={() => cloneRow(selectedRowIndex)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground w-full justify-center"
          >
            <Copy className="h-3.5 w-3.5" />
            Clone Row
          </button>
        </div>
      )}

      {/* Cell scope */}
      {scope === "cell" && selectedCell && (
        <CellEditor
          cell={selectedCell}
          cellIndex={selectedCellIndex}
          onUpdate={(updatedCell) => updateCell(selectedCellIndex, updatedCell)}
          onWidthChange={(width) => {
            const newCells = [...config.cells]
            newCells[selectedCellIndex] = { ...newCells[selectedCellIndex], width }
            const newRows = rebuildRows(newCells, config.rows)
            onChange({ ...config, cells: newCells, rows: newRows })
          }}
        />
      )}

    </div>
  )
}
