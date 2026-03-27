export type ContentType = 
  | "textBox"    // Rich text with H1-H6, bold, italic, colors, links
  | "image" 
  | "video" 
  | "bulletList" 
  | "numberedList"
  | "iconList"
  | "ctaButton"
  | "iconBlock"
  | "spacer"
  | "divider"
  | "badge"
  | "starRating"
  | "articleDetails"
  | "productComparison"

export interface IconListItem {
  id: string
  text: string
  iconUrl: string
}

export interface IconBlockItem {
  id: string
  iconUrl: string
  label?: string
}

export interface CellStyle {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  borderStyle?: "solid" | "dashed" | "dotted" | "double"
  padding?: number
  textAlign?: "left" | "center" | "right"
  alignItems?: "start" | "center" | "end"  // Vertical alignment of cell contents
  shadowEnabled?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowSpread?: number
}

export interface RowStyle extends CellStyle {
  // Row-specific styling - applies to all cells in the row
  gap?: number  // Space between cells in the row
  applyToAllCells?: boolean  // If true, override individual cell styles
}

export interface GridStyle extends CellStyle {
  // Grid-specific styling
  gap?: number  // Space between rows and columns
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around"  // Horizontal alignment
  alignItems?: "start" | "center" | "end"  // Vertical alignment for all cells
}

export interface CellContent {
  id: string
  type: ContentType
  // Text Box content (rich text with formatting)
  text?: string  // HTML content from rich text editor
  // Image content
  imageUrl?: string
  imageAlt?: string
  // Video content
  videoUrl?: string
  videoAutoplay?: boolean
  videoLoop?: boolean
  videoControls?: boolean
  // Media caption (for both image and video)
  captionText?: string       // Rich text HTML for caption
  captionBgColor?: string    // Hex color for caption background
  captionTextColor?: string  // Hex color for caption text
  // Bullet/numbered list content
  bulletItems?: string[]
  // Icon list content
  iconListItems?: IconListItem[]
  // CTA button content
  ctaText?: string
  ctaUrl?: string
  ctaVariant?: "primary" | "secondary" | "outline"
  ctaBackgroundColor?: string
  ctaTextColor?: string
  // Icon block (supports 1-n icons with labels)
  iconBlockItems?: IconBlockItem[]
  // Spacer
  spacerHeight?: number
  // Badge
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  // Star Rating
  starCount?: number        // total stars, default 5
  starValue?: number        // filled stars, supports 0.5 increments
  starLabel?: string        // optional label e.g. "4.8 out of 5"
  starColor?: string        // hex color for filled stars
  // Article Details
  articleAuthor?: string
  articleAuthorImage?: string
  articleDate?: string
  articleVariant?: "default" | "minimal"
  // Product Comparison
  productComparisonProducts?: Array<{
    name: string
    logo?: string
    color?: string
  }>
  productComparisonMetrics?: Array<{
    label: string
    emoji?: string
    values: (string | boolean | number)[]
  }>
}

export interface GridCell {
  id: string
  contents: CellContent[]  // Now an array of components
  style: CellStyle
  width?: number  // Width as percentage (1-100), defaults to 50. Cells in a row sum to 100.
  rowIndex?: number  // Track which row this cell is in for row-level styling
}

export interface GridRow {
  id: string
  cellIds: string[]  // IDs of cells in this row
  style?: RowStyle  // Optional row-level styling
}

export interface GridConfig {
  cells: GridCell[]
  rows?: GridRow[]  // Optional: if defined, organizes cells into rows with row-level styling
  gridStyle: GridStyle  // Renamed from GridCell style
}

export const createDefaultContent = (type: ContentType = "textBox"): CellContent => ({
  id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  type,
  text: type === "textBox" ? "" : undefined,
  bulletItems: type === "bulletList" || type === "numberedList" ? [] : undefined,
  iconListItems: type === "iconList" ? [] : undefined,
  ctaText: type === "ctaButton" ? "" : undefined,
  iconBlockItems: type === "iconBlock" ? [] : undefined,
  spacerHeight: type === "spacer" ? 40 : undefined,
})

export const createDefaultCell = (id: string): GridCell => ({
  id,
  contents: [createDefaultContent("textBox")],
  style: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: "solid",
    padding: 24,
    alignItems: "start",
    shadowEnabled: true,
    shadowColor: "#00000015",
    shadowBlur: 8,
    shadowSpread: 0,
  },
})

export const createDefaultGridConfig = (): GridConfig => {
  const cell1 = createDefaultCell("cell-1")
  const cell2 = createDefaultCell("cell-2")
  
  return {
    cells: [cell1, cell2],
    rows: [
      {
        id: "row-1",
        cellIds: ["cell-1", "cell-2"],
        style: {
          gap: 16,
        },
      },
    ],
    gridStyle: {
      backgroundColor: "#ffffff",
      padding: 16,
      borderRadius: 16,
      gap: 24,  // Space between rows
    },
  }
}
