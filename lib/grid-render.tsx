"use client"

import { useRef, useState, useEffect } from "react"
import { GridConfig, GridCell, CellContent, ViewportSize } from "@/types/grid"
import { createDefaultBanner } from "@/types/banner"
import { BannerPreview } from "@/components/banner-preview"
import { Button } from "@/components/ui/button"
import { StickyBottomCta } from "./elements/sticky-cta"
import { NavBar } from "./elements/navbar"
import { ArticleDetailsRenderer } from "./elements/article-details"
import { ProductComparisonTable } from "./elements/product-comparison"
import { CarouselRenderer } from "./elements/carousel"
import { LogoBanner } from "./elements/logo-banner"
import { BenefitsGrid } from "./elements/benefits-grid"
import { TestimonialSection } from "./elements/testimonial"
import { AccordionList } from "./elements/accordion"
import { IconGrid } from "./elements/icon-grid"
import { CountdownTimer } from "./elements/countdown"
import { OfferCard } from "./elements/offer-card"

const PROSE_STYLES = "max-w-none [&_p]:m-0 [&_h1]:mb-2 [&_h1]:leading-[0.99] [&_h1]:text-[30px] [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:mb-1 [&_h4]:font-semibold [&_h4]:mb-1 [&_h5]:font-semibold [&_h6]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_strong]:font-bold [&_em]:italic [&_hr]:border-t [&_hr]:border-current [&_hr]:my-3"

// Canonical card drop-shadow — layered for depth (tight ambient + soft lift).
// Used by the video case in captionBelow mode and by cells with shadowEnabled.
const CARD_SHADOW = "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.12)"

// Shared card styles used by ingredient/mechanism cards (javvy-card-body pattern).
// Injected once via GLOBAL_CARD_STYLES so it renders regardless of which card appears first.
export const GLOBAL_CARD_STYLES = `.javvy-card-body{display:flex;gap:20px;align-items:flex-start;padding:24px}.javvy-card-img{flex-shrink:0;width:120px;height:120px;border-radius:50%;overflow:hidden}@media(max-width:640px){.javvy-card-body{flex-direction:column}.javvy-card-img{width:100px;height:100px;margin:0 auto}}`

// ─── Content Renderer ─────────────────────────────────────────────────────────

function ContentRenderer({ content, cellStyle, viewport = "desktop" }: {
  content: CellContent
  cellStyle: GridCell["style"]
  viewport?: ViewportSize
}) {
  switch (content.type) {

    case "textBox": {
      return (
        <div
          className={PROSE_STYLES + " page-typo"}
          style={{
            width: "100%",
            textAlign: cellStyle?.textAlign as "left" | "center" | "right" | undefined,
            fontSize: content.textFontSize ? `${content.textFontSize}px` : undefined,
            fontWeight: content.textFontWeight ?? undefined,
            lineHeight: content.textLineHeight ?? undefined,
          }}
          dangerouslySetInnerHTML={{ __html: content.text || "" }}
        />
      )
    }

    case "image": {
      const RATIOS: Record<string, string> = {
        square: "1 / 1",
        widescreen: "16 / 9",
        portrait: "3 / 4",
        "portrait-tall": "4 / 5",
        standard: "4 / 3",
      }
      const ratio = content.imageAspectRatio && content.imageAspectRatio !== "auto"
        ? RATIOS[content.imageAspectRatio]
        : undefined
      const fit = content.imageObjectFit ?? "cover"

      // Width: imageWidth (freeform %) takes precedence over imageMaxWidth (enum)
      const desktopW = content.imageWidth ?? content.imageMaxWidth ?? 100
      const mobileW = content.imageMobileMaxWidth ?? 100
      const effectiveW = viewport === "mobile" ? mobileW : desktopW
      const needsWrap = effectiveW < 100
      const justifyMap = { left: "flex-start", center: "center", right: "flex-end" }
      const justify = justifyMap[content.imageAlign ?? "center"]

      // Visual styling props
      const imgRadius = content.imageCircle ? "50%" : content.imageBorderRadius
      const imgBorder = content.imageBorderWidth
        ? `${content.imageBorderWidth}px solid ${content.imageBorderColor ?? "transparent"}`
        : undefined
      const imgShadow = content.imageDropShadow ? "0 4px 12px rgba(0,0,0,0.25)" : undefined
      const imgPad = content.imagePadding
      const imgBg = content.imageBackgroundColor

      const wrapperStyle = {
        width: "100%",
        borderRadius: imgRadius,
        border: imgBorder,
        boxShadow: imgShadow,
        padding: imgPad,
        backgroundColor: imgBg,
      }

      const imageEl = !content.imageUrl ? (
        <div
          className="w-full bg-muted flex items-center justify-center rounded-lg text-muted-foreground text-xs"
          style={{ ...wrapperStyle, aspectRatio: ratio ?? "16 / 9", minHeight: 80 }}
        >
          No image
        </div>
      ) : !ratio ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={content.imageUrl} alt={content.imageAlt || ""} style={{ ...wrapperStyle, objectPosition: content.imageObjectPosition, objectFit: fit, maxWidth: "100%", display: "block", width: "100%", height: "auto" }} />
      ) : (
        <div className="overflow-hidden" style={{ ...wrapperStyle, aspectRatio: ratio }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.imageUrl}
            alt={content.imageAlt || ""}
            style={{ objectFit: fit, objectPosition: content.imageObjectPosition, display: "block", maxWidth: "100%", width: "100%", height: "100%" }}
          />
        </div>
      )

      if (!needsWrap) return imageEl

      return (
        <div style={{ width: "100%", display: "flex", justifyContent: justify }}>
          <div style={{ width: `${effectiveW}%` }}>{imageEl}</div>
        </div>
      )
    }

    case "carousel": {
      const images = content.carouselImages ?? []
      if (images.length === 0) {
        return (
          <div className="w-full bg-muted flex items-center justify-center rounded-lg text-muted-foreground text-xs" style={{ minHeight: 200 }}>
            No carousel images
          </div>
        )
      }

      return (
        <CarouselRenderer
          images={images}
          borderRadius={content.carouselBorderRadius ?? 6}
          showThumbnails={content.carouselShowThumbnails ?? true}
          autoplay={content.carouselAutoplay ?? false}
          autoplayInterval={content.carouselAutoplayInterval ?? 5000}
          thumbnailSize={content.carouselThumbnailSize ?? 60}
          thumbnailGap={content.carouselThumbnailGap ?? 8}
          viewport={viewport}
        />
      )
    }

    case "video": {
      const aspectRatioMap = { widescreen: "16 / 9", standard: "9 / 8", square: "1 / 1" }
      const aspectRatio = aspectRatioMap[content.videoAspectRatio || "square"]
      const isSquare = (content.videoAspectRatio || "square") === "square"
      const captionBelow = !!content.captionBelow
      const hasCaption = !!content.captionText
      const hasBadge = !!content.videoBadgeText
      const maxWidth = isSquare && viewport !== "mobile" ? 600 : undefined

      const badgePill = hasBadge ? (
        <div style={{
          display: "inline-block",
          backgroundColor: content.videoBadgeBackground ?? "#2a2552",
          color: content.videoBadgeColor ?? "#ffffff",
          fontSize: "var(--fs-label)",
          fontWeight: 700,
          padding: "4px 14px",
          borderRadius: 100,
          whiteSpace: "nowrap",
        }}>
          {content.videoBadgeText}
        </div>
      ) : null

      const captionBarStyle = {
        backgroundColor: content.captionBgColor || "#7C3AED",
        color: content.captionTextColor || "#FFFFFF",
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 10,
        paddingBottom: 10,
      }

      const captionInner = (
        <>
          {hasBadge && !captionBelow && (
            <div style={{ textAlign: "center", paddingBottom: 8 }}>{badgePill}</div>
          )}
          <div
            className={PROSE_STYLES}
            style={{ color: content.captionTextColor || "#FFFFFF", textAlign: "center" }}
            dangerouslySetInnerHTML={{ __html: content.captionText || "" }}
          />
        </>
      )

      return (
        <div style={{
          width: "100%",
          maxWidth,
          // captionBelow mode: become a flex column card that fills the cell vertically.
          // The video sits at top, the caption flex:1 fills the rest. Border + shadow wrap
          // the entire card; no internal border appears between video and caption because
          // they're inside the same overflow:hidden wrapper.
          ...(captionBelow ? {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            borderRadius: 8,
            boxShadow: CARD_SHADOW,
            overflow: "hidden",
          } : {
            borderRadius: 8,
            overflow: "hidden",
            marginTop: viewport === "mobile" ? 12 : undefined,
            marginBottom: viewport === "mobile" ? 12 : undefined,
          }),
        }}>
          <div style={{ aspectRatio, position: "relative" }} className="w-full bg-black">
            <video
              src={content.videoUrl || undefined}
              autoPlay={content.videoAutoplay ?? true}
              loop={content.videoLoop ?? true}
              muted
              playsInline
              controls={content.videoControls}
              className="w-full h-full object-cover"
            />
            {/* Badge in video only when no caption, or caption is below */}
            {hasBadge && (!hasCaption || captionBelow) && (
              <div style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 3,
              }}>
                {badgePill}
              </div>
            )}
            {/* Overlay caption (badge embedded at top) */}
            {hasCaption && !captionBelow && (
              <div className="absolute bottom-0 left-0 right-0" style={captionBarStyle}>
                {captionInner}
              </div>
            )}
          </div>
          {/* Below caption — flex:1 expands the caption to fill all remaining cell height after the video,
              with the text vertically and horizontally centered within that space */}
          {hasCaption && captionBelow && (
            <div
              className="w-full"
              style={{
                ...captionBarStyle,
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {captionInner}
            </div>
          )}
        </div>
      )
    }

    case "articleDetails":
      return (
        <ArticleDetailsRenderer
          avatar={content.articleAuthorImage}
          authorName={content.articleAuthor}
          date={content.articleDate}
          variant={content.articleVariant}
        />
      )

    case "ctaButton": {
      const ctaBg = content.ctaGradientFrom && content.ctaGradientTo
        ? `linear-gradient(${content.ctaGradientDirection ?? "to right"}, ${content.ctaGradientFrom}, ${content.ctaGradientTo})`
        : content.ctaBackgroundColor || "#1e1b4b"
      const ctaShadow = content.ctaDropShadow
        ? `0 ${content.ctaDropShadowY ?? 4}px ${content.ctaDropShadowBlur ?? 8}px ${content.ctaDropShadowColor ?? "#00000033"}`
        : undefined
      const guarantees = content.ctaGuarantees ?? []
      const isMobile = viewport === "mobile"

      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <Button
            className="w-full h-auto px-6"
            style={{
              background: ctaBg,
              color: content.ctaTextColor || "#ffffff",
              borderRadius: content.ctaBorderRadius ?? 8,
              paddingTop: content.ctaPaddingY ?? 16,
              paddingBottom: content.ctaPaddingY ?? 16,
              letterSpacing: content.ctaLetterSpacing ?? "0.02em",
              fontSize: content.ctaFontSize ?? 18,
              fontWeight: content.ctaFontWeight ?? 700,
              border: content.ctaBorderStyle && content.ctaBorderStyle !== "none"
                ? `${content.ctaBorderWidth ?? 1}px ${content.ctaBorderStyle} ${content.ctaBorderColor ?? "transparent"}`
                : "none",
              boxShadow: ctaShadow,
              transition: "background 0.15s ease",
            }}
            onClick={() => content.ctaUrl && window.open(content.ctaUrl, "_blank")}
            onMouseEnter={(e) => { e.currentTarget.dataset.bg = e.currentTarget.style.background; e.currentTarget.style.background = `linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.15)),${e.currentTarget.dataset.bg}` }}
            onMouseLeave={(e) => { if (e.currentTarget.dataset.bg) e.currentTarget.style.background = e.currentTarget.dataset.bg }}
          >
            {content.ctaText || "Click here"}
          </Button>

          {guarantees.length > 0 && (
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: content.ctaGuaranteesGap ?? 16,
            }}>
              {guarantees.map((guarantee, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <img
                    src={guarantee.iconUrl}
                    alt=""
                    style={{
                      width: guarantee.iconSize ?? content.ctaGuaranteesIconSize ?? 24,
                      height: guarantee.iconSize ?? content.ctaGuaranteesIconSize ?? 24,
                      flexShrink: 0,
                      objectFit: "contain",
                    }}
                  />
                  <span
                    style={{
                      fontSize: content.ctaGuaranteesFontSize ?? 13,
                      color: content.ctaGuaranteesColor ?? "inherit",
                      lineHeight: 1.3,
                    }}
                    dangerouslySetInnerHTML={{ __html: guarantee.text }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    case "stickyBottomCta":
      return <StickyBottomCta content={content} viewport={viewport} />

    case "badge":
      return (
        <div
          className="inline-flex max-w-full px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: content.badgeBackgroundColor || (content.badgeVariant === "secondary" ? "#e5e7eb" : "#1e1b4b"),
            color: content.badgeTextColor || (content.badgeVariant === "secondary" ? "#1f2937" : "#ffffff"),
          }}
        >
          <span className="truncate">{content.text}</span>
        </div>
      )

    case "starRating": {
      const total = content.starCount ?? 5
      const value = content.starValue ?? 0
      const fillColor = content.starFillColor ?? content.starColor ?? "#facc15"
      const emptyColor = content.starEmptyColor ?? "#e5e7eb"
      const borderColor = content.starBorderColor ?? "none"
      const borderWidth = content.starBorderWidth ?? (borderColor !== "none" ? 1 : 0)
      const size = content.starSize ?? 20
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: total }).map((_, i) => {
              const filled = i < (content.starValue ?? 5)
              return (
                <svg
                  key={i}
                  width={size}
                  height={size}
                  viewBox="0 0 24 24"
                  fill={filled ? fillColor : emptyColor}
                  style={{ fill: filled ? fillColor : emptyColor }}
                  stroke={borderColor !== "none" && borderColor ? borderColor : "none"}
                  strokeWidth={borderWidth}
                >
                  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                </svg>
              )
            })}
          </div>
          {content.starLabel && (
            <p style={{ color: content.starLabelColor ?? "inherit", fontSize: (viewport === "mobile" && content.starLabelSizeMobile) ? content.starLabelSizeMobile : (content.starLabelSize ?? 14), fontWeight: content.starLabelFontWeight ?? undefined }}>
              {content.starLabel}
            </p>
          )}
        </div>
      )
    }

    case "bulletList":
      return (
        <ul className="space-y-2 list-disc list-inside">
          {content.bulletItems?.map((item: string, idx: number) => (
            <li key={idx} className="text-sm break-words">{item}</li>
          ))}
        </ul>
      )

    case "numberedList":
      return (
        <ol className="space-y-2 list-decimal list-inside">
          {content.bulletItems?.map((item: string, idx: number) => (
            <li key={idx} className="text-sm break-words">{item}</li>
          ))}
        </ol>
      )

    case "iconList":
      return (
        <ul className="space-y-2">
          {content.iconListItems?.map((item, idx) => (
            <li key={item.id || idx} className="flex items-center gap-2 text-sm">
              {item.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.iconUrl} alt="" className="w-5 h-5 shrink-0 object-contain" />
              )}
              <span className="break-words">{item.text}</span>
            </li>
          ))}
        </ul>
      )

    case "iconBlock":
      return (
        <div className="flex flex-wrap gap-4 items-center justify-center">
          {content.iconBlockItems?.map((item, idx) => (
            <div key={item.id || idx} className="flex flex-col items-center gap-1">
              {item.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.iconUrl} alt={item.label || ""} className="w-8 h-8 object-contain" />
              )}
              {item.label && <span className="text-xs text-gray-600 text-center">{item.label}</span>}
            </div>
          ))}
        </div>
      )

    case "divider":
      return <hr className="border-t border-current opacity-20" />

    case "spacer":
      return <div style={{ height: content.spacerHeight || 16 }} />

    case "productComparison":
      return <ProductComparisonTable content={content} viewport={viewport} />

    case "banner":
      return <BannerPreview config={content.bannerConfig ?? createDefaultBanner()} viewport={viewport} />

    case "navbar":
      return <NavBar content={content} viewport={viewport} />

    case "footer": {
      const links = content.footerLinks ?? []
      const textColor = content.footerTextColor || undefined
      const linkColor = content.footerLinkColor || "inherit"
      const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
      const disclaimer = content.footerDisclaimer?.replace(/\{\{date\}\}/g, today)
      const textAlign = (viewport === "mobile" && cellStyle?.textAlignMobile)
        ? cellStyle.textAlignMobile
        : (cellStyle?.textAlign ?? "left")
      const justifyContent = textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start"
      const footerGutter = viewport === "mobile" ? 8 : viewport === "tablet" ? 12 : 16
      return (
        <div className="w-full space-y-2" style={{ color: textColor, textAlign, paddingLeft: footerGutter, paddingRight: footerGutter }}>
          {disclaimer && (
            <div
              className={PROSE_STYLES + " text-[10px] leading-relaxed"}
              dangerouslySetInnerHTML={{ __html: disclaimer }}
            />
          )}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px]" style={{ justifyContent }}>
            {content.footerCopyright && (
              <span style={{ fontWeight: 500 }}>{content.footerCopyright}</span>
            )}
            {links.map((link, i) => (
              <span key={i} className="flex items-center gap-x-1.5">
                <span style={{ fontWeight: 500 }}>|</span>
                <a
                  href={link.url || "#"}
                  style={{ color: linkColor, fontWeight: 500, textDecoration: "underline" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </span>
            ))}
          </div>
        </div>
      )
    }

    case "countdown":
      return <CountdownTimer content={content} />

    case "iconGrid":
      return <IconGrid content={content} viewport={viewport} />

    case "accordion":
      return <AccordionList content={content} />

    case "benefitsGrid":
      return <BenefitsGrid content={content} viewport={viewport} />

    case "testimonial":
      return <TestimonialSection content={content} viewport={viewport} />

    case "logoBanner":
      return <LogoBanner content={content} viewport={viewport} />

    case "offerCard":
      return <OfferCard content={content} />

    default:
      return null
  }
}

// ─── Responsive helpers ───────────────────────────────────────────────────────

function scaleForViewport(desktop: number, viewport: ViewportSize): number {
  if (viewport === "mobile") return Math.round(desktop * 0.6)
  if (viewport === "tablet") return Math.round(desktop * 0.75)
  return desktop
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

interface GridPosition {
  cell: GridCell
  colStart: number
  colSpan: number
  rowStart: number
  rowSpan: number
}

function assignGridPositions(cells: GridCell[]): { positions: GridPosition[]; totalCols: number; columnTemplate: string } {
  if (cells.length === 0) return { positions: [], totalCols: 1, columnTemplate: "1fr" }

  // Detect total columns from smallest width
  const widths = cells.map(c => c.width ?? 100)
  const minWidth = Math.min(...widths)
  const totalCols = Math.max(1, Math.round(100 / minWidth))

  // Track occupied cells in the grid
  const occupied: boolean[][] = []
  const ensureRows = (upTo: number) => {
    while (occupied.length <= upTo) occupied.push(new Array(totalCols).fill(false))
  }

  const findNext = (colSpan: number, rowSpan: number): { r: number; c: number } => {
    for (let r = 0; ; r++) {
      ensureRows(r + rowSpan - 1)
      for (let c = 0; c <= totalCols - colSpan; c++) {
        let fits = true
        outer: for (let dr = 0; dr < rowSpan; dr++) {
          ensureRows(r + dr)
          for (let dc = 0; dc < colSpan; dc++) {
            if (occupied[r + dr][c + dc]) { fits = false; break outer }
          }
        }
        if (fits) return { r, c }
      }
    }
  }

  const positions: GridPosition[] = cells.map(cell => {
    const colSpan = Math.max(1, Math.round((cell.width ?? 100) / (100 / totalCols)))
    const rowSpan = Math.max(1, cell.rowSpan ?? 1)
    const { r, c } = findNext(colSpan, rowSpan)
    for (let dr = 0; dr < rowSpan; dr++) {
      ensureRows(r + dr)
      for (let dc = 0; dc < colSpan; dc++) {
        occupied[r + dr][c + dc] = true
      }
    }
    return { cell, colStart: c + 1, colSpan, rowStart: r + 1, rowSpan }
  })

  // Derive actual column widths from single-span cells so gridTemplateColumns is proportional
  const colWidths: (number | null)[] = new Array(totalCols).fill(null)
  positions.forEach(({ cell, colStart, colSpan }) => {
    if (colSpan === 1) colWidths[colStart - 1] = cell.width ?? (100 / totalCols)
  })
  const knownSum = colWidths.reduce<number>((s, w) => s + (w ?? 0), 0)
  const unknownCount = colWidths.filter(w => w === null).length
  const perUnknown = unknownCount > 0 ? (100 - knownSum) / unknownCount : 0
  const columnTemplate = colWidths.map(w => `${w ?? perUnknown}fr`).join(" ")

  return { positions, totalCols, columnTemplate }
}

// ─── Grid Preview ─────────────────────────────────────────────────────────────

export function GridPreview({ config, viewport = "desktop", className }: {
  config: GridConfig
  viewport?: ViewportSize
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const badgeRef = useRef<HTMLSpanElement>(null)
  const [badgePulsed, setBadgePulsed] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = badgeRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { setBadgePulsed(entry.isIntersecting) },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Breakpoints aligned to device frame widths: mobile ≤500, tablet ≤820, desktop >820
  const effectiveViewport: ViewportSize =
    containerWidth > 0 && containerWidth <= 500 ? "mobile" :
    containerWidth > 0 && containerWidth <= 820 ? "tablet" :
    viewport

  const { cells, gridStyle, gridBadge } = config
  const isMobile = effectiveViewport === "mobile"
  const useMobileGrid = isMobile && (config.mobileColumns === 2)

  const gridGap = scaleForViewport(gridStyle.gap ?? 48, effectiveViewport)

  const shadowValue = gridStyle.shadowEnabled
    ? `0 4px ${gridStyle.shadowBlur ?? 16}px ${gridStyle.shadowSpread ?? 0}px ${gridStyle.shadowColor || "#00000030"}`
    : "none"

  const gsPadX = gridStyle.paddingX
  const gsPadTop = gridStyle.paddingTop ?? gridStyle.paddingY
  const gsPadBottom = gridStyle.paddingBottom ?? gridStyle.paddingY

  // Check if any cell contains accordion content
  const hasAccordion = cells.some(cell => cell.contents.some(c => c.type === "accordion"))

  const outerStyle: React.CSSProperties = {
    backgroundColor: gridStyle.backgroundColor || undefined,
    borderRadius: gridStyle.borderRadius ?? 16,
    overflow: (gridStyle.borderRadius ?? 16) > 0 ? "hidden" : undefined,
    borderColor: gridStyle.borderColor,
    borderWidth: gridStyle.borderWidth ?? 0,
    borderStyle: gridStyle.borderStyle || "solid",
    boxShadow: shadowValue,
    ...(gridStyle.gridMarginBottom !== undefined ? { marginBottom: gridStyle.gridMarginBottom } : {}),
    ...(gridStyle.gridMaxWidth !== undefined ? { maxWidth: gridStyle.gridMaxWidth, marginLeft: "auto", marginRight: "auto" } : {}),
    ...(gsPadX ? { paddingLeft: scaleForViewport(gsPadX, effectiveViewport), paddingRight: scaleForViewport(gsPadX, effectiveViewport) } : {}),
    ...(gsPadTop ? { paddingTop: scaleForViewport(gsPadTop, effectiveViewport) } : {}),
    ...(gsPadBottom ? { paddingBottom: scaleForViewport(gsPadBottom, effectiveViewport) } : {}),
  }

  // Compute grid positions for desktop/tablet (and mobile when mobileColumns:2)
  const visibleForGrid = (isMobile && !useMobileGrid) ? [] : cells.filter(c => !c.hideOnDesktop)
  const { positions, columnTemplate } = assignGridPositions(visibleForGrid)
  // Column gap: explicit gridStyle.columnGap (including 0) is honored via ??;
  // when columnGap is undefined, fall through the legacy chain using || to keep
  // the original 0-as-not-set behavior for legacyColGap and gridStyle.gap (otherwise
  // grids with rows[0].style.gap:0 leftover scaffolding would lose their gridStyle.gap
  // fallback, regressing layouts like Hero whose gridStyle.gap:48 is the intent).
  const legacyColGap = config.rows?.[0]?.style?.gap
  const columnGap = scaleForViewport(
    gridStyle.columnGap ?? (legacyColGap || gridStyle.gap || 48),
    effectiveViewport
  )

  // ─── Badge ──────────────────────────────────────────────────────────────────
  const badgePositionStyle: Record<string, React.CSSProperties> = {
    "top-center":    { top: -16, left: "50%", transform: "translateX(-50%)" },
    "top-left":      { top: -16, left: 16 },
    "top-right":     { top: -16, right: 16 },
    "bottom-center": { bottom: -16, left: "50%", transform: "translateX(-50%)" },
    "bottom-left":   { bottom: -16, left: 16 },
    "bottom-right":  { bottom: -16, right: 16 },
  }
  const badgePos = badgePositionStyle[gridBadge?.position ?? "top-center"]

  return (
    <div ref={containerRef} className={"w-full " + (className || "")} style={{ position: "relative", overflow: "visible" }}>
      {gridBadge?.animated && (
        <style>{`@keyframes badgePulse { 0% { transform: scale(1); } 40% { transform: scale(1.08); } 70% { transform: scale(0.97); } 100% { transform: scale(1); } }`}</style>
      )}
      {gridBadge && (
        // Outer span: handles absolute positioning only
        <span style={{ position: "absolute", zIndex: 10, pointerEvents: "none", ...badgePos }}>
          {/* Inner span: handles visual styling + animation so scale doesn't fight translateX */}
          <span
            ref={badgeRef}
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              color: gridBadge.textColor,
              backgroundColor: gridBadge.backgroundColor,
              fontSize: gridBadge.fontSize ?? 14,
              paddingLeft: gridBadge.paddingX ?? 16,
              paddingRight: gridBadge.paddingX ?? 16,
              paddingTop: gridBadge.paddingY ?? 6,
              paddingBottom: gridBadge.paddingY ?? 6,
              borderRadius: gridBadge.borderRadius ?? 100,
              fontWeight: 600,
              ...(gridBadge.animated && badgePulsed
                ? { animation: "badgePulse 0.55s ease-out 1 forwards" }
                : {}),
            }}
          >
            {gridBadge.text}
          </span>
        </span>
      )}
      <div className={hasAccordion ? "grid-has-accordion" : undefined} style={outerStyle}>
      {isMobile && !useMobileGrid ? (
        // D-Prime: flat flex column with global mobileOrder
        <div style={{ display: "flex", flexDirection: "column", gap: gridGap }}>
          {cells
            .filter(cell => !cell.hideOnMobile)
            .map((cell, naturalIdx) => {
              const cellPadX = (effectiveViewport === "mobile" && cell.style?.paddingXMobile !== undefined)
                ? cell.style.paddingXMobile
                : scaleForViewport(cell.style?.paddingX ?? 0, effectiveViewport)
              const cellPadY = cell.style?.paddingY ?? 0
              const cellPadTop = scaleForViewport(cell.style?.paddingTop ?? cellPadY, effectiveViewport)
              const cellPadBottom = scaleForViewport(cell.style?.paddingBottom ?? cellPadY, effectiveViewport)
              // Mobile-only alignItems override; falls back to alignItems when unset
              const mobileAlign = cell.style?.mobileAlignItems ?? cell.style?.alignItems
              return (
                <div
                  key={cell.id}
                  style={{
                    order: cell.mobileOrder ?? naturalIdx,
                    backgroundColor: cell.style?.backgroundColor || undefined,
                    borderRadius: cell.style?.borderRadius ?? 0,
                    borderColor: cell.style?.borderColor,
                    borderWidth: cell.style?.borderWidth ?? 0,
                    borderStyle: cell.style?.borderStyle || "solid",
                    paddingTop: cellPadTop,
                    paddingBottom: cellPadBottom,
                    paddingLeft: cellPadX,
                    paddingRight: cellPadX,
                    // Only clip when the cell has a rounded corner that would actually need clipping.
                    // Otherwise children's box-shadows (e.g., video card shadows) get cut off.
                    overflow: (cell.style?.borderRadius ?? 0) > 0 ? "hidden" : undefined,
                    boxShadow: cell.style?.shadowEnabled ? CARD_SHADOW : undefined,
                    display: "flex",
                    // Allow this flex item to shrink below its content's intrinsic min-content;
                    // without min-width:0, max-content children (e.g., LogoBanner marquee) widen the page.
                    minWidth: 0,
                    alignItems: mobileAlign || gridStyle.alignItems || "flex-start",
                  }}
                >
                  <div
                    className={`flex flex-col${cell.style?.fontWeight ? " has-cell-font-weight" : ""}${cell.contents.some(c => c.type === "accordion") ? " has-accordion" : ""}`}
                    style={{
                      gap: cell.style?.contentGap ?? 16,
                      width: "100%",
                      minWidth: 0,
                      fontWeight: cell.style?.fontWeight,
                      ...( cell.style?.fontWeight ? { "--cell-font-weight": String(cell.style.fontWeight) } as React.CSSProperties : {} ),
                      justifyContent:
                        cell.style?.justifyContent === "between" ? "space-between" :
                        cell.style?.justifyContent === "end" ? "flex-end" :
                        cell.style?.justifyContent === "center" ? "center" :
                        cell.style?.justifyContent === "start" ? "flex-start" :
                        mobileAlign === "center" ? "center" : undefined,
                      alignItems: mobileAlign === "center" ? "center" : undefined,
                      textAlign: mobileAlign === "center" ? "center" : ((cell.style?.textAlignMobile ?? cell.style?.textAlign) as "left" | "center" | "right" | undefined),
                    }}
                  >
                    {cell.contents.map((content) => (
                      <ContentRenderer key={content.id} content={content} cellStyle={cell.style} viewport={effectiveViewport} />
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      ) : (
        // Desktop/tablet (and mobileColumns:2): CSS Grid with rowSpan support
        <div style={{
          display: "grid",
          gridTemplateColumns: useMobileGrid ? "repeat(2, 1fr)" : columnTemplate,
          columnGap,
          rowGap: gridGap,
        }}>
          {positions.map(({ cell, colStart, colSpan, rowStart, rowSpan }) => {
            const cellPadX = (effectiveViewport === "mobile" && cell.style?.paddingXMobile !== undefined)
              ? cell.style.paddingXMobile
              : scaleForViewport(cell.style?.paddingX ?? 0, effectiveViewport)
            const cellPadY = cell.style?.paddingY ?? 0
            const cellPadTop = scaleForViewport(cell.style?.paddingTop ?? cellPadY, effectiveViewport)
            const cellPadBottom = scaleForViewport(cell.style?.paddingBottom ?? cellPadY, effectiveViewport)
            return (
              <div
                key={cell.id}
                style={{
                  gridColumn: `${colStart} / span ${colSpan}`,
                  gridRow: `${rowStart} / span ${rowSpan}`,
                  alignSelf: "stretch",
                  backgroundColor: cell.style?.backgroundColor || undefined,
                  borderRadius: cell.style?.borderRadius ?? 0,
                  borderColor: cell.style?.borderColor,
                  borderWidth: cell.style?.borderWidth ?? 0,
                  borderStyle: cell.style?.borderStyle || "solid",
                  paddingTop: cellPadTop,
                  paddingBottom: cellPadBottom,
                  paddingLeft: cellPadX,
                  paddingRight: cellPadX,
                  // Only clip when the cell has a rounded corner that would actually need clipping.
                  // Otherwise children's box-shadows (e.g., video card shadows) get cut off.
                  overflow: (cell.style?.borderRadius ?? 0) > 0 ? "hidden" : undefined,
                  boxShadow: cell.style?.shadowEnabled ? CARD_SHADOW : undefined,
                  display: "flex",
                  // Allow this grid item to shrink below its content's intrinsic min-content;
                  // without min-width:0, max-content children (e.g., LogoBanner marquee) widen the page.
                  minWidth: 0,
                  alignItems: cell.style?.alignItems || gridStyle.alignItems || "flex-start",
                }}
              >
                <div
                  className={`flex flex-col${cell.style?.fontWeight ? " has-cell-font-weight" : ""}${cell.contents.some(c => c.type === "accordion") ? " has-accordion" : ""}`}
                  style={{
                    gap: cell.style?.contentGap ?? 16,
                    height: (cell.style?.alignItems || cell.style?.justifyContent) ? "100%" : undefined,
                    width: "100%",
                    minWidth: 0,
                    fontWeight: cell.style?.fontWeight,
                    ...( cell.style?.fontWeight ? { "--cell-font-weight": String(cell.style.fontWeight) } as React.CSSProperties : {} ),
                    justifyContent:
                      cell.style?.justifyContent === "between" ? "space-between" :
                      cell.style?.justifyContent === "end" ? "flex-end" :
                      cell.style?.justifyContent === "center" ? "center" :
                      cell.style?.justifyContent === "start" ? "flex-start" :
                      cell.style?.alignItems === "end" ? "flex-end" :
                      cell.style?.alignItems === "center" ? "center" :
                      "flex-start",
                    alignItems: cell.style?.alignItems === "center" ? "center" : undefined,
                    textAlign: cell.style?.alignItems === "center" ? "center" : (cell.style?.textAlign as "left" | "center" | "right" | undefined),
                  }}
                >
                  {cell.contents.map((content) => (
                    <ContentRenderer key={content.id} content={content} cellStyle={cell.style} viewport={effectiveViewport} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
