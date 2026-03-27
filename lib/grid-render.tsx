"use client"

import { GridConfig, GridCell, CellContent } from "@/types/grid"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const PROSE_STYLES = "max-w-none [&_p]:m-0 [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_strong]:font-bold [&_em]:italic"

function ArticleDetailsRenderer({ avatar, authorName, date, variant }: { avatar?: string; authorName?: string; date?: string; variant?: string }) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {avatar && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatar} alt={authorName || "Author"} />
            <AvatarFallback>{authorName?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        {authorName && <span className="font-medium text-gray-900">{authorName}</span>}
        {date && <span>•</span>}
        {date && <span>{date}</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 md:gap-4">
      {avatar && (
        <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0">
          <AvatarImage src={avatar} alt={authorName || "Author"} />
          <AvatarFallback>{authorName?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1 min-w-0">
        {authorName && <p className="text-sm md:text-base font-semibold text-gray-900">{authorName}</p>}
        {date && <p className="text-xs md:text-sm text-gray-500">{date}</p>}
      </div>
    </div>
  )
}

function ContentRenderer({ content, cellStyle }: { content: CellContent; cellStyle: GridCell["style"] }) {
  switch (content.type) {
    case "textBox": {
      // Inject h1/h2 sizes globally via a wrapping div with CSS vars
      const html = (content.text || "")
        .replace(/<h1/g, '<h1 style="font-size:44px;font-weight:700;line-height:1.1;margin-bottom:8px"')
        .replace(/<h2/g, '<h2 style="font-size:28px;font-weight:700;line-height:1.2;margin-bottom:8px"')
      return (
        <div
          className={PROSE_STYLES}
          style={{ textAlign: cellStyle?.textAlign as "left" | "center" | "right" | undefined }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }

    case "image":
      return (
        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
          <NextImage
            src={content.imageUrl || ""}
            alt={content.imageAlt || ""}
            fill
            className="object-cover"
          />
        </div>
      )

    case "video":
      return (
        <div className="relative w-full bg-black rounded-lg overflow-hidden">
          <video
            src={content.videoUrl || ""}
            autoPlay
            loop
            muted
            playsInline
            controls={content.videoControls}
            className="w-full h-auto object-cover"
          />
          {content.captionText && (
            <div
              className="absolute bottom-0 left-0 right-0 px-4 py-2"
              style={{
                backgroundColor: content.captionBgColor || "#7C3AED",
                color: content.captionTextColor || "#FFFFFF",
              }}
            >
              <div
                className={PROSE_STYLES}
                style={{ color: content.captionTextColor || "#FFFFFF", textAlign: "center" }}
                dangerouslySetInnerHTML={{ __html: content.captionText }}
              />
            </div>
          )}
        </div>
      )

    case "articleDetails":
      return (
        <ArticleDetailsRenderer
          avatar={content.articleAuthorImage}
          authorName={content.articleAuthor}
          date={content.articleDate}
          variant={content.articleVariant}
        />
      )

    case "ctaButton":
      return (
        <Button
          className="w-full h-auto py-4 px-6 text-base font-semibold rounded-xl"
          style={{
            backgroundColor: content.ctaBackgroundColor || "#1e1b4b",
            color: content.ctaTextColor || "#ffffff",
          }}
          onClick={() => content.ctaUrl && window.open(content.ctaUrl, "_blank")}
        >
          {content.ctaText || "Click here"}
        </Button>
      )

    case "badge":
      return (
        <div
          className="inline-block px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: content.badgeVariant === "secondary" ? "#e5e7eb" : "#1e1b4b",
            color: content.badgeVariant === "secondary" ? "#1f2937" : "#ffffff",
          }}
        >
          {content.text}
        </div>
      )

    case "bulletList":
      return (
        <ul className="space-y-2 list-disc list-inside">
          {content.bulletItems?.map((item: string, idx: number) => (
            <li key={idx} className="text-sm">{item}</li>
          ))}
        </ul>
      )

    case "divider":
      return <hr className="my-4 border-gray-200" />

    case "spacer":
      return <div style={{ height: content.spacerHeight || 16 }} />

    case "productComparison":
      const products = content.productComparisonProducts || []
      const metrics = content.productComparisonMetrics || []
      return (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left font-semibold"></th>
                {products.map((product: { name: string; color?: string; logo?: string }, idx: number) => (
                  <th
                    key={idx}
                    className="p-3 text-center font-semibold min-w-[120px]"
                    style={{ backgroundColor: product.color || "#f5f5f5" }}
                  >
                    {product.logo ? (
                      <NextImage src={product.logo} alt={product.name} width={80} height={24} className="mx-auto h-6 w-auto" style={{ width: 'auto', height: 'auto' }} />
                    ) : (
                      product.name
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric: { label: string; emoji?: string; values: string[] }, idx: number) => (
                <tr key={idx} className="border-t border-gray-200">
                  <td className="p-3 font-medium">
                    {metric.emoji && <span className="mr-2">{metric.emoji}</span>}
                    {metric.label}
                  </td>
                  {metric.values.map((value: string, vIdx: number) => (
                    <td
                      key={vIdx}
                      className="p-3 text-center"
                      style={{ backgroundColor: products[vIdx]?.color || "#f5f5f5" }}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    default:
      return null
  }
}

function groupCellsIntoRows(cells: GridCell[]): GridCell[][] {
  const rows: GridCell[][] = []
  let currentRow: GridCell[] = []
  let currentWidth = 0

  cells.forEach((cell) => {
    const cellWidth = cell.width || 100
    if (currentWidth + cellWidth > 100 && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = [cell]
      currentWidth = cellWidth
    } else {
      currentRow.push(cell)
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

export function GridPreview({ config, className }: { config: GridConfig; className?: string }) {
  const { cells, gridStyle } = config
  const rows = groupCellsIntoRows(cells)
  const gridPadding = gridStyle.padding ?? 16
  const gridGap = gridStyle.gap ?? 24

  const shadowValue = gridStyle.shadowEnabled
    ? "0 4px " + String(gridStyle.shadowBlur ?? 16) + "px " + String(gridStyle.shadowSpread ?? 0) + "px " + (gridStyle.shadowColor || "#00000030")
    : "none"

  const outerStyle: React.CSSProperties = {
    backgroundColor: gridStyle.backgroundColor || "#ffffff",
    borderRadius: gridStyle.borderRadius ?? 16,
    borderColor: gridStyle.borderColor,
    borderWidth: gridStyle.borderWidth ?? 0,
    borderStyle: gridStyle.borderStyle || "solid",
    boxShadow: shadowValue,
    overflow: "hidden",
  }

  return (
    <div className={"w-full " + (className || "")} style={outerStyle}>
      <div style={{ padding: gridPadding, display: "flex", flexDirection: "column", gap: gridGap }}>
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={{ display: "flex", flexDirection: "row", gap: gridGap }}
          >
            {row.map((cell) => {
              const cellStyle: React.CSSProperties = {
                flex: cell.width ? "0 0 " + String(cell.width) + "%" : "1 1 0%",
                maxWidth: cell.width ? cell.width + "%" : "100%",
                backgroundColor: cell.style?.backgroundColor || "transparent",
                borderRadius: cell.style?.borderRadius ?? 0,
                borderColor: cell.style?.borderColor,
                borderWidth: cell.style?.borderWidth ?? 0,
                borderStyle: cell.style?.borderStyle || "solid",
                padding: cell.style?.padding ?? 0,
                overflow: "hidden",
              }

              return (
                <div key={cell.id} style={cellStyle}>
                  <div
                    className="flex flex-col gap-4"
                    style={{
                      height: "100%",
                      width: "100%",
                      justifyContent: cell.style?.alignItems === "center" ? "center" : undefined,
                      alignItems: cell.style?.alignItems === "center" ? "center" : undefined,
                      textAlign: cell.style?.alignItems === "center" ? "center" : (cell.style?.textAlign as "left" | "center" | "right" | undefined),
                    }}
                  >
                    {cell.contents.map((content) => (
                      <ContentRenderer key={content.id} content={content} cellStyle={cell.style} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
