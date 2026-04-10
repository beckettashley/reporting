"use client"

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react"
import NextImage from "next/image"
import { CellContent, ViewportSize } from "@/types/grid"
import { applyOpacity } from "./shared"

export function ProductComparisonTable({ content, viewport }: { content: CellContent; viewport: ViewportSize }) {
  const tableRef = useRef<HTMLTableElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [tableContainerWidth, setTableContainerWidth] = useState(0)

  useEffect(() => {
    const el = tableContainerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setTableContainerWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const effectiveIsMobile = tableContainerWidth > 0 ? tableContainerWidth <= 500 : viewport === "mobile"
  const effectiveIsTablet = tableContainerWidth > 0 ? tableContainerWidth <= 820 : viewport === "tablet"

  const products = content.productComparisonProducts || []
  const metrics  = content.productComparisonMetrics  || []

  const cellPad      = effectiveIsMobile ? "py-1 px-0.5"  : effectiveIsTablet ? "py-1.5 px-1" : "py-2 px-1"
  const cellFontSize = effectiveIsMobile ? 12 : 15
  const labelColWidth = effectiveIsMobile ? "26%" : "22%"
  const dataColWidth  = effectiveIsMobile ? `${74 / products.length}%` : `${78 / products.length}%`
  const logoHeight    = effectiveIsMobile ? "20px" : effectiveIsTablet ? "30px" : "36px"
  const highlightBackground = (() => {
    const c1 = content.productComparisonHighlightColor
    const c2 = content.productComparisonHighlightColorEnd
    const opacity = content.productComparisonHighlightOpacity ?? 1
    if (c1 && c2) {
      return `linear-gradient(180deg, ${applyOpacity(c1, opacity)} 0%, ${applyOpacity(c2, opacity)} 100%)`
    }
    if (c1) {
      return applyOpacity(c1, opacity)
    }
    return "linear-gradient(180deg, rgba(200,240,240,0.25) 0%, rgba(219,234,255,0.25) 100%)"
  })()
  const highlightBorder    = content.productComparisonHighlightBorderColor ?? "#7DD9D9"
  const highlightTopOffset = content.productComparisonHighlightTopOffset ?? 14

  const equalizeRows = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    const rows = Array.from(table.querySelectorAll("tr")) as HTMLTableRowElement[]
    const bodyRows = rows.slice(1)
    // Reset to let rows size naturally
    bodyRows.forEach(r => { r.style.height = "" })
    // Measure and find tallest
    const maxHeight = Math.max(...bodyRows.map(r => r.getBoundingClientRect().height))
    // Set all body rows to the tallest
    if (maxHeight > 0) bodyRows.forEach(r => { r.style.height = `${maxHeight}px` })
  }, [])

  useLayoutEffect(() => {
    equalizeRows()
  }, [equalizeRows, content, tableContainerWidth])

  useEffect(() => {
    const observer = new ResizeObserver(equalizeRows)
    if (tableRef.current) observer.observe(tableRef.current)
    return () => observer.disconnect()
  }, [equalizeRows])

  return (
    <>
    <div ref={tableContainerRef} className="w-full" style={{ position: "relative", paddingBottom: 14 }}>
      <div style={{
        position: "absolute",
        left: labelColWidth,
        width: dataColWidth,
        top: `-${highlightTopOffset}px`,
        bottom: "0",
        background: highlightBackground,
        outline: `2px solid ${highlightBorder}`,
        outlineOffset: "1px",
        borderRadius: "16px",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <table
        ref={tableRef}
        className="w-full border-collapse"
        style={{ tableLayout: "fixed", position: "relative", zIndex: 1 }}
      >
        <colgroup>
          <col style={{ width: labelColWidth }} />
          {products.map((_: unknown, i: number) => (
            <col key={i} style={{ width: dataColWidth }} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ height: effectiveIsMobile ? 56 : 70 }}>
            <th className={`${cellPad} text-left font-semibold`} style={{ fontSize: cellFontSize, verticalAlign: "middle", paddingTop: 8, paddingBottom: 8 }}></th>
            {products.map((product: { name: string; color?: string; logo?: string; headerImage?: string; headerImageHeight?: number; headerTextColor?: string; headerBackgroundColor?: string }, idx: number) => (
              <th
                key={idx}
                className={`${cellPad} text-center font-semibold`}
                style={{ fontSize: cellFontSize, backgroundColor: idx === 0 ? "transparent" : (product.headerBackgroundColor ?? "#fee2e2"), color: idx === 0 ? undefined : (product.headerTextColor ?? "#dc2626"), verticalAlign: "middle", paddingTop: 8, paddingBottom: 8, ...(idx === 0 ? { height: "100%" } : {}) }}
              >
                {product.headerImage ? (
                  <div style={{ display: "flex", flexDirection: effectiveIsMobile ? "column" : "row", alignItems: "center", justifyContent: "center", gap: effectiveIsMobile ? 2 : 6 }}>
                    <img src={product.headerImage} alt={product.name} style={{ height: effectiveIsMobile ? 36 : (product.headerImageHeight ?? 40), width: "auto" }} />
                    <span style={{ fontSize: cellFontSize, fontWeight: 600 }}>{product.name}</span>
                  </div>
                ) : product.logo ? (
                  <NextImage
                    src={product.logo}
                    alt={product.name}
                    width={120}
                    height={40}
                    className="mx-auto"
                    style={{ height: "auto", maxHeight: effectiveIsMobile ? 34 : 42, width: "auto", maxWidth: "100%" }}
                    sizes="25vw"
                  />
                ) : (
                  product.name
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric: { label: string; emoji?: string; values: (string | number | boolean)[] }, idx: number) => (
            <tr key={idx} style={{ borderTop: "1px dashed #e5e7eb" }}>
              <td
                className={`${cellPad} font-medium break-words`}
                style={content.productComparisonLabelStyle === "uppercase"
                  ? { fontSize: cellFontSize, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", verticalAlign: "middle" }
                  : { fontSize: cellFontSize, verticalAlign: "middle" }}
              >
                {metric.emoji && <span className={effectiveIsMobile ? "mr-0.5" : "mr-2"}>{metric.emoji}</span>}
                {metric.label}
              </td>
              {metric.values.map((value, vIdx: number) => {
                const isHero = vIdx === 0
                const valueColor = isHero
                  ? content.productComparisonValueColorHero
                  : content.productComparisonValueColorOther
                const str = String(value)
                const inIdx = str.indexOf(" in ")
                const primary = inIdx !== -1 ? str.slice(0, inIdx) : str
                const qualifier = inIdx !== -1 ? str.slice(inIdx) : null
                return (
                  <td
                    key={vIdx}
                    className={`${cellPad} text-center break-words`}
                    style={{ fontSize: cellFontSize, fontWeight: isHero ? 700 : 400, backgroundColor: "transparent", verticalAlign: "middle", ...(valueColor ? { color: valueColor } : {}) }}
                  >
                    <span>{primary}</span>
                    {qualifier && (
                      <span className="block text-gray-400" style={{ fontSize: "0.75em" }}>{qualifier}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {content.productComparisonFootnote && (
      <p style={{ fontSize: "var(--fs-micro)", color: "var(--color-text-muted)", textAlign: "center", marginTop: 0, marginBottom: 8, lineHeight: 1.4 }}>
        {content.productComparisonFootnote}
      </p>
    )}
    </>
  )
}
