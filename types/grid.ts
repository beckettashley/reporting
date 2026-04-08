import type { BannerConfig } from "@/types/banner"
import { createDefaultBanner } from "@/types/banner"

export type ContentType =
  | "textBox"    // Rich text with H1-H6, bold, italic, colors, links
  | "image"
  | "carousel"
  | "video"
  | "bulletList"
  | "numberedList"
  | "iconList"
  | "ctaButton"
  | "stickyBottomCta"
  | "iconBlock"
  | "spacer"
  | "divider"
  | "badge"
  | "starRating"
  | "articleDetails"
  | "productComparison"
  | "banner"
  | "navbar"
  | "footer"
  | "countdown"
  | "iconGrid"
  | "accordion"
  | "benefitsGrid"
  | "testimonial"
  | "logoBanner"

export interface TestimonialCarouselItem {
  id: string
  imageUrl?: string
  videoUrl?: string    // if set, renders as click-to-play video instead of image
  posterUrl?: string   // thumbnail shown before play
  name?: string
  title?: string
  quote: string
  starValue?: number
  starCount?: number
}

export interface TestimonialMoreReviewsItem {
  id: string
  name?: string
  avatarUrl?: string
  quote: string
  starValue?: number
}

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
  paddingX?: number   // horizontal cell inset; tablet=75%, mobile=60% auto-scaled
  paddingY?: number   // vertical cell inset; tablet=75%, mobile=60% auto-scaled
  paddingTop?: number    // overrides paddingY top when set; tablet=75%, mobile=60%
  paddingBottom?: number // overrides paddingY bottom when set; tablet=75%, mobile=60%
  textAlign?: "left" | "center" | "right"
  textAlignMobile?: "left" | "center" | "right"  // overrides textAlign on mobile viewports
  alignItems?: "start" | "center" | "end"  // Vertical alignment of cell contents
  mobileAlignItems?: "start" | "center" | "end"  // overrides alignItems on mobile viewports only
  shadowEnabled?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowSpread?: number
  contentGap?: number    // gap between content elements within the cell; default 16
  fontWeight?: number | string  // cascades to all text within the cell
}

export interface RowStyle extends CellStyle {
  // Row-specific styling - applies to all cells in the row
  backgroundColor?: string
  paddingY?: number
  gap?: number  // Space between cells in the row
}

export interface GridStyle extends CellStyle {
  // Grid-specific styling
  gap?: number        // Row gap (between rows); tablet=75%, mobile=60% auto-scaled
  columnGap?: number  // Column gap (between columns); tablet=75%, mobile=60% auto-scaled. Falls back to gap if unset.
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around"  // Horizontal alignment
  alignItems?: "start" | "center" | "end"  // Vertical alignment for all cells
  gridMarginBottom?: number  // margin-bottom on the outer grid wrapper (px); useful for heading grids
  gridMaxWidth?: number      // max-width on the outer grid wrapper (px); centered with margin:auto — useful for heading grids
}

export interface CellContent {
  id: string
  type: ContentType
  // Text Box content (rich text with formatting)
  text?: string  // HTML content from rich text editor
  textFontSize?: number          // px override applied to the textBox wrapper
  textFontWeight?: number | string
  textLineHeight?: number | string
  // Image content
  imageUrl?: string
  imageAlt?: string
  imageAspectRatio?: "auto" | "square" | "widescreen" | "portrait" | "portrait-tall" | "standard"
  imageObjectFit?: "cover" | "contain"
  imageObjectPosition?: string  // e.g. "center 70%"; applied as CSS object-position on the img element
  imageMaxWidth?: 25 | 33 | 50 | 66 | 75 | 100   // % of cell width; default 100
  imageAlign?: "left" | "center" | "right"         // default "center"; only meaningful when imageMaxWidth < 100
  imageMobileMaxWidth?: 33 | 50 | 66 | 75 | 100   // mobile override; default 100 when imageMaxWidth < 100
  imageBorderRadius?: number  // px; border-radius applied to the image element
  imageWidth?: number         // % freeform width (1–100); overrides imageMaxWidth
  imageCircle?: boolean       // renders as circle (border-radius: 50%; overrides imageBorderRadius)
  imageBorderWidth?: number   // px border on the image wrapper
  imageBorderColor?: string   // image border color
  imageBackgroundColor?: string  // background color visible around/behind the image
  imagePadding?: number       // px internal padding inside the image wrapper
  imageDropShadow?: boolean   // drop shadow on the image wrapper
  // Carousel content
  carouselImages?: Array<{
    url: string
    alt?: string
    thumbnailUrl?: string  // optional separate thumbnail; if not set, uses url
  }>
  carouselBorderRadius?: number  // px; border-radius for carousel images
  carouselShowThumbnails?: boolean  // show thumbnail strip below carousel
  carouselAutoplay?: boolean
  carouselAutoplayInterval?: number  // ms; default 5000
  carouselThumbnailSize?: number  // px; default 60
  carouselThumbnailGap?: number  // px; gap between thumbnails; default 8
  // Video content
  videoUrl?: string
  videoAspectRatio?: "widescreen" | "standard" | "square"
  videoAutoplay?: boolean
  videoLoop?: boolean
  videoControls?: boolean
  videoBadgeText?: string
  videoBadgeBackground?: string  // default "#2a2552"
  videoBadgeColor?: string       // default "#ffffff"
  // Media caption (for both image and video)
  captionText?: string       // Rich text HTML for caption
  captionBgColor?: string    // Hex color for caption background
  captionTextColor?: string  // Hex color for caption text
  captionBelow?: boolean     // When true, caption renders below video instead of overlaying it
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
  ctaBorderRadius?: number    // px; default uses theme rounded-xl (~12px)
  ctaLetterSpacing?: string   // e.g. "0.05em"; default unset
  ctaPaddingY?: number        // px; default 12 (py-3)
  ctaGradientFrom?: string
  ctaGradientTo?: string
  ctaGradientDirection?: string  // e.g. "to right", "135deg"
  ctaDropShadow?: boolean
  ctaDropShadowColor?: string
  ctaDropShadowY?: number
  ctaDropShadowBlur?: number
  ctaBorderStyle?: "solid" | "dashed" | "dotted" | "none"
  ctaBorderColor?: string
  ctaBorderWidth?: number
  ctaFontSize?: number
  ctaFontWeight?: number
  ctaGuarantees?: Array<{
    iconUrl: string
    text: string
    iconSize?: number  // px; default 24
  }>
  ctaGuaranteesGap?: number         // gap between guarantee items; default 16
  ctaGuaranteesFontSize?: number    // px; default 13
  ctaGuaranteesColor?: string       // text color; default inherit
  ctaGuaranteesIconSize?: number    // px; default 24
  // Icon block (supports 1-n icons with labels)
  iconBlockItems?: IconBlockItem[]
  // Spacer
  spacerHeight?: number
  // Badge
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  badgeBackgroundColor?: string
  badgeTextColor?: string
  // Star Rating
  starCount?: number        // total stars, default 5
  starValue?: number        // filled stars, supports 0.5 increments
  starLabel?: string        // optional label e.g. "4.8 out of 5"
  starColor?: string        // hex color for filled stars (legacy — prefer starFillColor)
  starFillColor?: string    // filled star fill color; overrides starColor
  starEmptyColor?: string   // unfilled star fill color
  starBorderColor?: string  // star stroke color (applied to both filled and empty)
  starBorderWidth?: number  // star stroke width px; default 1 when borderColor is set
  starSize?: number         // px; default 20
  starLabelColor?: string   // label text color
  starLabelSize?: number    // label font-size px; default 14
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
    headerTextColor?: string
    headerBackgroundColor?: string
    headerImage?: string
    headerImageHeight?: number
  }>
  productComparisonMetrics?: Array<{
    label: string
    emoji?: string
    values: (string | boolean | number)[]
  }>
  productComparisonHighlightBorderColor?: string
  productComparisonHighlightTopOffset?: number
  productComparisonHighlightColor?: string    // hero column cell background, default "#f0ffff"
  productComparisonHighlightColorEnd?: string // second gradient stop; when set with highlightColor, renders as gradient
  productComparisonHighlightOpacity?: number  // 0-1, default 1
  productComparisonValueColorOther?: string   // non-hero column value color
  productComparisonValueColorHero?: string    // hero column value color
  productComparisonLabelStyle?: "default" | "uppercase"
  productComparisonFootnote?: string          // small text rendered below table
  // Banner
  bannerConfig?: BannerConfig
  // NavBar
  navbarLogoUrl?: string
  navbarLogoHeight?: number  // px, height of logo (width auto)
  navbarLinks?: Array<{ label: string; url: string }>
  navbarBackgroundColor?: string
  navbarTextColor?: string
  navbarLinkHoverColor?: string
  navbarHeight?: number  // px, height of navbar
  // Footer
  footerDisclaimer?: string   // Plain-text legal/disclaimer copy; supports {{date}} token
  footerCopyright?: string    // e.g. "© 2026 Javvy Coffee Company. All rights reserved."
  footerLinks?: Array<{ label: string; url: string }>
  footerTextColor?: string
  footerLinkColor?: string
  // Accordion
  accordionItems?: Array<{
    question: string
    answer: string
    defaultOpen?: boolean
  }>
  accordionQuestionSize?: number
  accordionQuestionWeight?: number
  accordionQuestionColor?: string
  accordionAnswerSize?: number
  accordionAnswerColor?: string
  accordionBorderColor?: string
  accordionBorderStyle?: "solid" | "dashed"
  accordionQuestionTransform?: "uppercase" | "none"
  // Icon Grid
  iconGridItems?: Array<{
    iconUrl: string
    label: string
    iconSize?: number
  }>
  iconGridColumns?: number        // desktop columns, default 4
  iconGridColumnsMobile?: number  // mobile columns, default 2
  iconGridGap?: number            // gap between items px, default 24
  iconGridLabelSize?: number      // default 14
  iconGridLabelWeight?: number    // default 600
  iconGridLabelColor?: string     // default "#1a1a1a"
  iconGridLayout?: "column" | "row"  // layout direction: column (default, icon above text) or row (icon and text side by side)
  // Countdown timer
  countdownDurationSeconds?: number  // total seconds to count down from; default 11169
  countdownLabel?: string            // e.g. "DEAL ENDING IN:"
  countdownDigitColor?: string       // color for the timer digits; default "#dc2626"
  countdownLabelColor?: string       // color for the label text; default inherits
  countdownDigitSize?: number        // px; default 13
  // Benefits Grid
  // Benefits Grid
  benefitsGridTitle?: string
  benefitsGridCenterImage?: string
  benefitsGridCenterImageBorderRadius?: number  // default 24
  benefitsGridItemSize?: number                 // icon size px, default 48
  benefitsGridLeftItems?: Array<{ title: string; body: string; iconUrl: string }>
  benefitsGridRightItems?: Array<{ title: string; body: string; iconUrl: string }>
  // Testimonial section heading
  testimonialTitle?: string
  testimonialSubtitle?: string
  testimonialAccentColor?: string   // star/bar/verified color, default "#3d348b"
  // Aggregate stats
  testimonialRating?: number
  testimonialReviewCount?: number
  testimonialStarDistribution?: Array<{ stars: number; pct: number }>
  // Video grid
  testimonialVideos?: Array<{ videoUrl: string; posterUrl: string }>
  testimonialVideoColumns?: number
  testimonialVideoColumnsMobile?: number
  // Written reviews
  testimonialReviews?: Array<{
    id: string
    name: string
    rating: number
    title?: string
    body: string
    date?: string
    verified?: boolean
    helpfulCount?: number
    imageUrl?: string
  }>
  testimonialReviewColumns?: number
  testimonialReviewColumnsMobile?: number
  // Legacy carousel — kept for FluffCo compat
  testimonialItems?: TestimonialCarouselItem[]
  testimonialMoreReviewsTitle?: string
  testimonialMoreReviewsItems?: TestimonialMoreReviewsItem[]
  testimonialMoreReviewsColumns?: number       // desktop columns, default 1
  testimonialMoreReviewsColumnsMobile?: number // mobile columns, default 1
  // Logo Banner (horizontal scrolling marquee of logos)
  logoBannerLabel?: string
  logoBannerShowStars?: boolean
  logoBannerStarColor?: string
  logoBannerSpeed?: number          // marquee duration in seconds; default 30
  logoBannerHeight?: number         // logo height px, default 40
  logoBannerGap?: number            // gap between logos px, default 64
  logoBannerItems?: Array<{ imageUrl: string; alt: string }>
}

export interface GridCell {
  id: string
  contents: CellContent[]  // Now an array of components
  style: CellStyle
  width?: number       // Width as percentage (1-100), defaults to 50. Cells in a row sum to 100.
  rowIndex?: number    // Track which row this cell is in for row-level styling
  mobileOrder?: number // CSS order when stacked on mobile; defaults to natural row position
  hideOnMobile?: boolean  // Hide this cell on mobile viewports
  hideOnDesktop?: boolean // Hide this cell on desktop & tablet viewports
  rowSpan?: number    // Desktop: how many CSS grid rows this cell spans (default 1)
}

export interface GridRow {
  id: string
  cellIds: string[]  // IDs of cells in this row
  style: RowStyle  // Every row has a style
}

export interface GridConfig {
  cells: GridCell[]
  rows?: GridRow[]  // Optional: if defined, organizes cells into rows with row-level styling
  gridStyle: GridStyle  // Renamed from GridCell style
  mobileColumns?: 1 | 2  // default 1 (stack). When 2, keeps 2-col layout on mobile (≤500px).
  // Only meaningful for grids with 2 defined columns. On 3+ col grids, collapses to 2, not 3.
  gridBadge?: {
    text: string
    backgroundColor: string
    textColor: string
    fontSize?: number       // default 14
    paddingX?: number       // default 16
    paddingY?: number       // default 6
    borderRadius?: number   // default 100 (pill)
    animated?: boolean      // default false — CSS gradient animation
    position?: "top-center" | "top-left" | "top-right" | "bottom-center" | "bottom-left" | "bottom-right"  // default "top-center"
  }
}

export const createDefaultContent = (type: ContentType = "textBox"): CellContent => ({
  id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  type,
  text: type === "textBox" ? "" : undefined,
  bulletItems: type === "bulletList" || type === "numberedList" ? [] : undefined,
  iconListItems: type === "iconList" ? [] : undefined,
  ctaText: type === "ctaButton" || type === "stickyBottomCta" ? "" : undefined,
  ctaUrl: type === "stickyBottomCta" ? "#" : undefined,
  ctaBackgroundColor: type === "stickyBottomCta" ? "#000000" : undefined,
  ctaTextColor: type === "stickyBottomCta" ? "#ffffff" : undefined,
  iconBlockItems: type === "iconBlock" ? [] : undefined,
  spacerHeight: type === "spacer" ? 40 : undefined,
  bannerConfig: type === "banner" ? createDefaultBanner() : undefined,
  navbarLinks: type === "navbar" ? [
    { label: "ORDER", url: "#order" },
    { label: "BEFORE & AFTER", url: "#before-after" },
    { label: "QUICK & EASY", url: "#quick-easy" },
    { label: "WHY US", url: "#why-us" },
    { label: "BENEFITS", url: "#benefits" },
    { label: "REVIEWS", url: "#reviews" },
    { label: "FAQ", url: "#faq" },
  ] : undefined,
  navbarBackgroundColor: type === "navbar" ? "#ffffff" : undefined,
  navbarTextColor: type === "navbar" ? "#000000" : undefined,
  navbarHeight: type === "navbar" ? 70 : undefined,
  navbarLogoHeight: type === "navbar" ? 40 : undefined,
  footerLinks: type === "footer" ? [] : undefined,
})

export const createDefaultCell = (id: string): GridCell => ({
  id,
  contents: [],
  style: {
    backgroundColor: "",
    borderColor: "",
    borderWidth: 0,
    borderRadius: 0,
    borderStyle: "solid",
    paddingX: 16,
    paddingY: 16,
    alignItems: "start",
    shadowEnabled: false,
  },
})

export type ViewportSize = "desktop" | "tablet" | "mobile"

export const createDefaultGridConfig = (): GridConfig => {
  const cell1 = createDefaultCell("cell-1")
  const cell2 = createDefaultCell("cell-2")
  cell1.width = 50
  cell2.width = 50

  return {
    cells: [cell1, cell2],
    rows: [
      {
        id: "row-1",
        cellIds: ["cell-1", "cell-2"],
        style: { backgroundColor: "", paddingY: 0, gap: 16 },
      },
    ],
    gridStyle: {
      backgroundColor: "",
      borderRadius: 0,
      gap: 48,
    },
  }
}

export interface SectionStyle {
  backgroundColor?: string  // empty string = transparent
  position?: "sticky" | "static"  // default "static"
  paddingYSize?: "none" | "s" | "m" | "l" | "xl"  // named vertical rhythm; auto-scales per viewport
  paddingYOverride?: number  // desktop px override; tablet=75%, mobile=60% auto-scaled
  paddingTopOverride?: number  // independent top padding override; desktop px; tablet=75%, mobile=60%
  paddingBottomOverride?: number  // independent bottom padding override; desktop px; tablet=75%, mobile=60%
  paddingTopOverrideMobile?: number     // viewport-specific override; absolute mobile px, no scaling. Wins over scaled paddingTopOverride on mobile.
  paddingBottomOverrideMobile?: number  // viewport-specific override; absolute mobile px, no scaling. Wins over scaled paddingBottomOverride on mobile.
  paddingTopOverrideTablet?: number     // viewport-specific override; absolute tablet px, no scaling. Wins over scaled paddingTopOverride on tablet.
  paddingBottomOverrideTablet?: number  // viewport-specific override; absolute tablet px, no scaling. Wins over scaled paddingBottomOverride on tablet.
  contentWidth?: "flood" | "narrow" | "contained"
  // "flood"    = edge-to-edge, section background AND content fill full width (banners, hero images)
  // "narrow"   = ~720px editorial/article width, centered, auto gutters (24/16/12px)
  // "contained"= standard 1200px marketing layout, centered, auto gutters (40/24/16px)
  gridGap?: number  // vertical gap between grids within this section (desktop px); tablet=75%, mobile=60%
  maxWidth?: number  // px override; centers the content wrapper with margin:auto. 320–1600. Overrides contentWidth constraint when set.
  backgroundImage?: string                                                   // URL
  backgroundSize?: "cover" | "contain" | "auto"                             // default: "cover"
  backgroundPosition?: string                                                // default: "center center"
  backgroundRepeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y"      // default: "no-repeat"
  backgroundOverlay?: number   // 0–100 opacity of a solid color overlay rendered above the bg image. default: 0
  backgroundOverlayColor?: string  // hex/rgba. default: "#000000"
  backgroundGradientType?: "linear" | "radial"  // default "linear"
  backgroundGradientFrom?: string      // hex/rgba gradient start color (supports alpha)
  backgroundGradientMid?: string       // optional middle color stop (hex/rgba)
  backgroundGradientMidStop?: number   // % position of mid stop, 0–100; default 50
  backgroundGradientTo?: string        // hex/rgba gradient end color (supports alpha)
  backgroundGradientDirection?: string // linear: CSS direction e.g. "to bottom"; radial: center position e.g. "center"
  backgroundGradientStops?: Array<{ color: string; position: number }>  // Multi-stop gradients (4+); takes precedence over from/mid/to when set
}

export interface Section {
  id: string
  label?: string
  style: SectionStyle
  grids: GridConfig[]  // one or more, stacked vertically
}

export const createDefaultSection = (): Section => {
  const now = Date.now()
  const cellId = `cell-${now + 1}`
  return {
    id: `section-${now}`,
    label: "",
    style: { backgroundColor: "", paddingYSize: "s", contentWidth: "narrow" },
    grids: [{
      cells: [{ ...createDefaultCell(cellId), width: 100 }],
      rows: [{
        id: `row-${now}`,
        cellIds: [cellId],
        style: { backgroundColor: "", paddingY: 0, gap: 0 },
      }],
      gridStyle: { backgroundColor: "", borderRadius: 0, gap: 48 },
    }],
  }
}

export interface PageStyle {
  fontDisplay?: string  // CSS font-family value, e.g. "'Libre Baskerville', serif"
  fontBody?: string     // CSS font-family value, e.g. "'DM Sans', sans-serif"
}

export function rebuildRows(cells: GridCell[], existingRows?: GridRow[]): GridRow[] {
  // Group cells into rows based on width summing to 100
  const rows: GridCell[][] = []
  let currentRow: GridCell[] = []
  let currentWidth = 0

  cells.forEach((cell) => {
    const w = cell.width ?? 100
    if (currentWidth + w > 100.5 && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = [cell]
      currentWidth = w
    } else {
      currentRow.push(cell)
      currentWidth += w
      if (currentWidth >= 99.5) {
        rows.push(currentRow)
        currentRow = []
        currentWidth = 0
      }
    }
  })
  if (currentRow.length > 0) rows.push(currentRow)

  // Map to GridRow objects, preserving existing row styles where row cellIds match
  return rows.map((rowCells, i) => {
    const cellIds = rowCells.map(c => c.id)
    const existing = existingRows?.find(r =>
      r.cellIds.length === cellIds.length && r.cellIds.every((id, j) => id === cellIds[j])
    )
    return {
      id: existing?.id ?? `row-${Date.now()}-${i}`,
      cellIds,
      style: existing?.style ?? { backgroundColor: "", paddingY: 0, gap: 16 },
    }
  })
}
