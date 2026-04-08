"use client"

import { GridCell, createDefaultCell } from "@/types/grid"
import { cn } from "@/lib/utils"
import { Plus, Trash2, ArrowLeftRight, Smartphone, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COLUMN_PRESETS: { label: string; widths: [number, number] }[] = [
  { label: "1/2 · 1/2", widths: [50, 50] },
  { label: "3/5 · 2/5", widths: [60, 40] },
  { label: "2/5 · 3/5", widths: [40, 60] },
  { label: "2/3 · 1/3", widths: [67, 33] },
  { label: "1/3 · 2/3", widths: [33, 67] },
  { label: "5/9 · 4/9", widths: [56, 44] },
  { label: "4/9 · 5/9", widths: [44, 56] },
]

function ColPreviewBar({ widths }: { widths: [number, number] }) {
  return (
    <div className="flex h-2.5 w-12 gap-px overflow-hidden rounded-sm shrink-0">
      <div className="bg-primary/70 rounded-sm" style={{ width: `${widths[0]}%` }} />
      <div className="bg-muted-foreground/30 rounded-sm" style={{ width: `${widths[1]}%` }} />
    </div>
  )
}

interface MiniGridEditorProps {
  cells: GridCell[]
  onChange: (cells: GridCell[]) => void
  selectedCellIndex?: number
  onSelectCell?: (cellIndex: number, rowIndex: number) => void
  selectedRowIndex?: number
  onSelectRow?: (rowIndex: number) => void
  onMergeMode?: () => void
}

function groupCellsIntoRows(cells: GridCell[]): { cell: GridCell; index: number }[][] {
  const rows: { cell: GridCell; index: number }[][] = []
  let currentRow: { cell: GridCell; index: number }[] = []
  let currentWidth = 0

  cells.forEach((cell, index) => {
    const w = cell.width ?? 50
    if (currentWidth + w > 100 && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = [{ cell, index }]
      currentWidth = w
    } else {
      currentRow.push({ cell, index })
      currentWidth += w
      if (currentWidth >= 100) {
        rows.push(currentRow)
        currentRow = []
        currentWidth = 0
      }
    }
  })

  if (currentRow.length > 0) rows.push(currentRow)
  return rows
}

export function MiniGridEditor({
  cells,
  onChange,
  selectedCellIndex,
  onSelectCell,
  selectedRowIndex,
  onSelectRow,
}: MiniGridEditorProps) {
  const rows = groupCellsIntoRows(cells)

  // Flat list of all cells with row/col context for the global mobile panel
  const allCells = rows.flatMap((row, rowIndex) =>
    row.map(({ cell, index }, colInRow) => ({ cell, index, rowIndex, colInRow }))
  )

  // Sorted by effective mobileOrder
  const globalMobileOrder = [...allCells].sort((a, b) => {
    const aOrder = a.cell.mobileOrder ?? allCells.findIndex(x => x.index === a.index)
    const bOrder = b.cell.mobileOrder ?? allCells.findIndex(x => x.index === b.index)
    return aOrder - bOrder
  })

  const addRow = () => {
    const id1 = `cell-${Date.now()}-1`
    const id2 = `cell-${Date.now()}-2`
    const c1 = createDefaultCell(id1); c1.width = 50
    const c2 = createDefaultCell(id2); c2.width = 50
    onChange([...cells, c1, c2])
  }

  const addFullWidthCell = () => {
    const id = `cell-${Date.now()}`
    const c = createDefaultCell(id); c.width = 100
    onChange([...cells, c])
  }

  const deleteCell = (index: number) => {
    if (cells.length <= 1) return
    const deleted = cells[index]
    const deletedWidth = deleted.width ?? 50

    let rowStart = 0, rowEnd = -1, currentWidth = 0
    for (let i = 0; i < cells.length; i++) {
      const w = cells[i].width ?? 50
      if (currentWidth + w > 100 && currentWidth > 0) {
        if (index < i) { rowEnd = i - 1; break }
        rowStart = i; currentWidth = w
      } else {
        currentWidth += w
      }
      if (currentWidth >= 100) {
        if (index <= i) { rowEnd = i; break }
        rowStart = i + 1; currentWidth = 0
      }
    }
    if (rowEnd === -1) rowEnd = cells.length - 1

    const siblings = Array.from({ length: rowEnd - rowStart + 1 }, (_, i) => rowStart + i).filter(i => i !== index)
    if (siblings.length === 0) { onChange(cells.filter((_, i) => i !== index)); return }

    const siblingTotal = siblings.reduce((s, i) => s + (cells[i].width ?? 50), 0)
    const newCells = cells.filter((_, i) => i !== index).map((cell, ni) => {
      let oi = ni; if (ni >= index) oi++
      if (oi < rowStart || oi > rowEnd) return cell
      const w = cell.width ?? 50
      return { ...cell, width: Math.round(w + (w / siblingTotal) * deletedWidth) }
    })
    onChange(newCells)
  }

  // Reorder cells globally across all rows
  const moveMobileOrderGlobal = (stackPos: number, dir: -1 | 1) => {
    const sorted = [...globalMobileOrder]
    const targetPos = stackPos + dir
    if (targetPos < 0 || targetPos >= sorted.length) return
    ;[sorted[stackPos], sorted[targetPos]] = [sorted[targetPos], sorted[stackPos]]
    const updated = cells.map(cell => {
      const pos = sorted.findIndex(s => s.cell.id === cell.id)
      return pos === -1 ? cell : { ...cell, mobileOrder: pos }
    })
    onChange(updated)
  }

  const toggleHideOnMobile = (cellIndex: number) => {
    onChange(cells.map((cell, i) =>
      i === cellIndex ? { ...cell, hideOnMobile: !cell.hideOnMobile } : cell
    ))
  }

  const swapCells = (i1: number, i2: number) => {
    if (i2 < 0 || i2 >= cells.length) return
    const n = [...cells];[n[i1], n[i2]] = [n[i2], n[i1]]; onChange(n)
  }

  const insertCellAfter = (index: number) => {
    const existing = cells[index]
    const existingWidth = existing.width ?? 50
    const half = Math.max(Math.floor(existingWidth / 2), 10)
    const id = `cell-${Date.now()}`
    const newCell = createDefaultCell(id); newCell.width = half
    onChange([
      ...cells.slice(0, index),
      { ...existing, width: existingWidth - half },
      newCell,
      ...cells.slice(index + 1),
    ])
  }

  const applyRowPreset = (rowIndex: number, widths: [number, number]) => {
    const row = rows[rowIndex]
    if (row.length !== 2) return
    onChange(cells.map((cell, i) => {
      const pos = row.findIndex(r => r.index === i)
      return pos === -1 ? cell : { ...cell, width: widths[pos] }
    }))
  }

  const getRowPresetLabel = (row: { cell: GridCell; index: number }[]) => {
    if (row.length !== 2) return undefined
    const w0 = row[0].cell.width ?? 50
    const w1 = row[1].cell.width ?? 50
    return COLUMN_PRESETS.find(p => p.widths[0] === w0 && p.widths[1] === w1)?.label
  }

  return (
    <div className="space-y-1.5">
      {rows.map((row, rowIndex) => {
        const rowTotal = row.reduce((s, { cell }) => s + (cell.width ?? 50), 0)
        const rowSelected = selectedRowIndex === rowIndex

        return (
          <div key={rowIndex} className="space-y-1">
            <div className="flex items-stretch gap-1">
              {/* Row handle — click to select row */}
              <button
                onClick={() => onSelectRow?.(rowIndex)}
                className={cn(
                  "w-4 shrink-0 rounded-sm flex items-center justify-center transition-colors",
                  rowSelected
                    ? "bg-primary"
                    : "bg-muted hover:bg-primary/40"
                )}
                title={`Select row ${rowIndex + 1}`}
              />

              {/* Cells */}
              <div className="flex-1 flex items-stretch h-9 rounded-md overflow-hidden border border-border bg-muted/30">
                {row.map(({ cell, index }, cellInRow) => {
                  const pct = ((cell.width ?? 50) / rowTotal) * 100
                  const cellSelected = selectedCellIndex === index

                  return (
                    <div
                      key={cell.id}
                      className={cn(
                        "relative group flex items-center justify-center cursor-pointer transition-all",
                        "border-r-2 border-background last:border-r-0",
                        cell.hideOnMobile && "opacity-50",
                        cellSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-foreground"
                      )}
                      style={{ width: `${pct}%` }}
                      onClick={() => onSelectCell?.(index, rowIndex)}
                    >
                      <span className="text-[11px] font-medium">{cell.width ?? 50}%</span>
                      {(cell.rowSpan ?? 1) > 1 && (
                        <span className="absolute bottom-0.5 left-0.5 text-[9px] font-bold opacity-70">↕{cell.rowSpan}</span>
                      )}
                      {cell.hideOnMobile && (
                        <EyeOff className="absolute top-0.5 right-0.5 h-2.5 w-2.5 opacity-50 pointer-events-none" />
                      )}

                      <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 bg-background/90 transition-opacity">
                        {cellInRow < row.length - 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); swapCells(index, row[cellInRow + 1].index) }}
                            className="p-1 rounded hover:bg-muted"
                            title="Swap"
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); insertCellAfter(index) }}
                          className="p-1 rounded hover:bg-muted text-primary"
                          title="Split cell"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        {cells.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteCell(index) }}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive"
                            title="Delete cell"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                <button
                  onClick={() => insertCellAfter(row[row.length - 1].index)}
                  className="w-6 flex items-center justify-center bg-muted/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                  title="Add cell to row"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Column ratio preset — only for 2-cell rows */}
            {rowSelected && row.length === 2 && (
              <div className="ml-5">
                <Select
                  value={getRowPresetLabel(row) ?? ""}
                  onValueChange={(label) => {
                    const preset = COLUMN_PRESETS.find(p => p.label === label)
                    if (preset) applyRowPreset(rowIndex, preset.widths)
                  }}
                >
                  <SelectTrigger className="h-7 text-[10px] w-full">
                    <SelectValue placeholder="Column ratio…" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMN_PRESETS.map(preset => (
                      <SelectItem key={preset.label} value={preset.label}>
                        <div className="flex items-center gap-2">
                          <ColPreviewBar widths={preset.widths} />
                          <span className="text-[11px]">{preset.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )
      })}

      {/* Global Mobile Stack Order panel */}
      <div className="space-y-1 border-t border-border pt-2 mt-0.5">
        <div className="flex items-center gap-1.5">
          <Smartphone className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-[10px] font-medium text-muted-foreground">Mobile Stack Order</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {globalMobileOrder.map(({ cell, index: cellIdx, rowIndex, colInRow }, stackPos) => (
            <div
              key={cell.id}
              className={cn(
                "flex items-center gap-1 bg-muted border border-border rounded px-1.5 h-7 text-[10px]",
                cell.hideOnMobile && "opacity-40"
              )}
            >
              <span className="w-4 text-center font-medium text-muted-foreground shrink-0">{stackPos + 1}</span>
              <span className="flex-1 text-muted-foreground truncate">Row {rowIndex + 1}, Col {colInRow + 1}</span>
              <button
                onClick={() => toggleHideOnMobile(cellIdx)}
                className={cn(
                  "p-0.5 rounded transition-colors shrink-0",
                  cell.hideOnMobile ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                title={cell.hideOnMobile ? "Show on mobile" : "Hide on mobile"}
              >
                {cell.hideOnMobile ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
              <div className="flex flex-col shrink-0">
                <button
                  disabled={stackPos === 0}
                  onClick={() => moveMobileOrderGlobal(stackPos, -1)}
                  className="disabled:opacity-20 hover:text-foreground transition-colors text-muted-foreground"
                >
                  <ChevronUp className="h-2.5 w-2.5" />
                </button>
                <button
                  disabled={stackPos === globalMobileOrder.length - 1}
                  onClick={() => moveMobileOrderGlobal(stackPos, 1)}
                  className="disabled:opacity-20 hover:text-foreground transition-colors text-muted-foreground"
                >
                  <ChevronDown className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1">
        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs border-dashed" onClick={addRow}>
          <Plus className="h-3 w-3 mr-1" /> Add 2-Col Row
        </Button>
        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs border-dashed" onClick={addFullWidthCell}>
          <Plus className="h-3 w-3 mr-1" /> Add Full-Width Row
        </Button>
      </div>
    </div>
  )
}
