"use client"

import { GridCell, createDefaultCell } from "@/types/grid"
import { cn } from "@/lib/utils"
import { Plus, Trash2, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MiniGridEditorProps {
  cells: GridCell[]
  onChange: (cells: GridCell[]) => void
  selectedCellIndex?: number
  onSelectCell?: (index: number) => void
  onMergeMode?: () => void
}

// Group cells into rows based on width
function groupCellsIntoRows(cells: GridCell[]): { cell: GridCell; index: number }[][] {
  const rows: { cell: GridCell; index: number }[][] = []
  let currentRow: { cell: GridCell; index: number }[] = []
  let currentWidth = 0

  cells.forEach((cell, index) => {
    const cellWidth = cell.width ?? 50
    
    if (currentWidth + cellWidth > 100 && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = [{ cell, index }]
      currentWidth = cellWidth
    } else {
      currentRow.push({ cell, index })
      currentWidth += cellWidth
      
      if (currentWidth >= 100) {
        rows.push(currentRow)
        currentRow = []
        currentWidth = 0
      }
    }
  })

  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
}

export function MiniGridEditor({ 
  cells, 
  onChange, 
  selectedCellIndex, 
  onSelectCell,
}: MiniGridEditorProps) {
  const rows = groupCellsIntoRows(cells)

  // Add a row (2 cells at 50% each)
  const addRow = () => {
    const newId1 = `cell-${Date.now()}-1`
    const newId2 = `cell-${Date.now()}-2`
    const cell1 = createDefaultCell(newId1)
    const cell2 = createDefaultCell(newId2)
    cell1.width = 50
    cell2.width = 50
    onChange([...cells, cell1, cell2])
  }

  // Add full width cell
  const addFullWidthCell = () => {
    const newId = `cell-${Date.now()}`
    const newCell = createDefaultCell(newId)
    newCell.width = 100
    onChange([...cells, newCell])
  }

  // Delete a cell and redistribute its width to other cells in the row
  const deleteCell = (index: number) => {
    if (cells.length <= 1) return
    
    const deletedCell = cells[index]
    const deletedWidth = deletedCell.width ?? 50
    
    // Find which row this cell belongs to
    let currentWidth = 0
    let rowStart = 0
    let rowEnd = -1
    
    for (let i = 0; i < cells.length; i++) {
      const cellWidth = cells[i].width ?? 50
      
      if (currentWidth + cellWidth > 100 && currentWidth > 0) {
        if (index < i) {
          rowEnd = i - 1
          break
        }
        rowStart = i
        currentWidth = cellWidth
      } else {
        currentWidth += cellWidth
      }
      
      if (currentWidth >= 100) {
        if (index <= i) {
          rowEnd = i
          break
        }
        rowStart = i + 1
        currentWidth = 0
      }
    }
    
    if (rowEnd === -1) rowEnd = cells.length - 1
    
    // Get other cells in the row
    const otherCellsInRow = []
    for (let i = rowStart; i <= rowEnd; i++) {
      if (i !== index) {
        otherCellsInRow.push(i)
      }
    }
    
    // If this was the only cell in the row, just remove it
    if (otherCellsInRow.length === 0) {
      const newCells = cells.filter((_, i) => i !== index)
      onChange(newCells)
      return
    }
    
    // Distribute the deleted cell's width proportionally to remaining cells in the row
    const newCells = cells
      .filter((_, i) => i !== index)
      .map((cell, newIndex) => {
        // Find original index to check if this cell was in the deleted row
        let originalIndex = newIndex
        if (newIndex >= index) originalIndex++
        
        // Only adjust cells that were in the same row as the deleted cell
        const wasInSameRow = originalIndex >= rowStart && originalIndex <= rowEnd && originalIndex !== index
        if (!wasInSameRow) return cell
        
        const cellWidth = cell.width ?? 50
        const otherTotalWidth = otherCellsInRow
          .map(idx => cells[idx].width ?? 50)
          .reduce((sum, w) => sum + w, 0)
        
        // Calculate new width: proportionally share the deleted cell's width
        const newWidth = Math.round(cellWidth + (cellWidth / otherTotalWidth) * deletedWidth)
        return { ...cell, width: newWidth }
      })
    
    onChange(newCells)
  }

  // Swap two adjacent cells
  const swapCells = (index1: number, index2: number) => {
    if (index2 < 0 || index2 >= cells.length) return
    const newCells = [...cells]
    ;[newCells[index1], newCells[index2]] = [newCells[index2], newCells[index1]]
    onChange(newCells)
  }

  // Insert cell (splits the current cell's width)
  const insertCellAfter = (index: number) => {
    const existingCell = cells[index]
    const existingWidth = existingCell.width ?? 50
    const halfWidth = Math.max(Math.floor(existingWidth / 2), 10)
    
    const newId = `cell-${Date.now()}`
    const newCell = createDefaultCell(newId)
    newCell.width = halfWidth
    
    const updatedExisting = { ...existingCell, width: existingWidth - halfWidth }
    
    const newCells = [
      ...cells.slice(0, index),
      updatedExisting,
      newCell,
      ...cells.slice(index + 1)
    ]
    
    onChange(newCells)
  }

  return (
    <div className="space-y-1.5">
      {/* Row-based visual grid - Webflow style */}
      {rows.map((row, rowIndex) => {
        // Calculate total width of cells in this row to make them proportional
        const rowTotalWidth = row.reduce((sum, { cell }) => sum + (cell.width ?? 50), 0)
        
        return (
          <div key={rowIndex} className="flex items-stretch h-9 rounded-md overflow-hidden border border-border bg-muted/30">
            {row.map(({ cell, index }, cellInRowIndex) => {
              // Calculate proportional width (cells fill full bar width)
              const proportionalWidth = ((cell.width ?? 50) / rowTotalWidth) * 100
              
              return (
                <div
                  key={cell.id}
                  className={cn(
                    "relative group flex items-center justify-center cursor-pointer transition-all",
                    "border-r-2 border-background last:border-r-0",
                    "hover:bg-primary/20",
                    selectedCellIndex === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  style={{ width: `${proportionalWidth}%` }}
                  onClick={() => onSelectCell?.(index)}
                >
                  {/* Cell label - shows actual width percentage */}
                  <span className="text-[11px] font-medium">
                    {cell.width ?? 50}%
                  </span>
                  
                  {/* Quick actions on hover */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 bg-background/90 transition-opacity">
                    {/* Swap with next in row */}
                    {cellInRowIndex < row.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); swapCells(index, row[cellInRowIndex + 1].index) }}
                        className="p-1 rounded hover:bg-muted"
                        title="Swap"
                      >
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {/* Insert/split */}
                    <button
                      onClick={(e) => { e.stopPropagation(); insertCellAfter(index) }}
                      className="p-1 rounded hover:bg-muted text-primary"
                      title="Split"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    {/* Delete */}
                    {cells.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCell(index) }}
                        className="p-1 rounded hover:bg-destructive/10 text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Add cell button at end of row */}
            <button
              onClick={() => insertCellAfter(row[row.length - 1].index)}
              className="w-6 flex items-center justify-center bg-muted/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
              title="Add cell to row"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}

      {/* Add row button */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs border-dashed"
          onClick={addRow}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Row (2 cols)
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs border-dashed"
          onClick={addFullWidthCell}
        >
          <Plus className="h-3 w-3 mr-1" />
          Full Width
        </Button>
      </div>
    </div>
  )
}
