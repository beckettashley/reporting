"use client"

import { CellContent, ViewportSize } from "@/types/grid"

export function IconGrid({ content, viewport }: { content: CellContent; viewport: ViewportSize }) {
  const items = content.iconGridItems ?? []
  const isMobile = viewport === "mobile"
  const cols = isMobile ? (content.iconGridColumnsMobile ?? 2) : (content.iconGridColumns ?? 4)
  const gap = content.iconGridGap ?? 24
  const layout = content.iconGridLayout ?? "column"
  const iconFilter = content.iconGridInvert ? "brightness(0) invert(1)" : undefined

  if (layout === "row") {
    // Row layout: icon and label on same line, left-aligned, stacked vertically
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: gap, width: "100%" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            textAlign: "left",
            width: "100%",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.iconUrl}
              alt={item.label}
              style={{ flexShrink: 0, width: item.iconSize ?? 48, height: item.iconSize ?? 48, objectFit: "contain", display: "block", filter: iconFilter }}
            />
            <span style={{
              fontSize: content.iconGridLabelSize ? `${content.iconGridLabelSize}px` : "var(--fs-small)",
              fontWeight: content.iconGridLabelWeight ?? 600,
              color: content.iconGridLabelColor ?? "var(--color-text-primary)",
              lineHeight: 1.3,
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Column layout (default): icon above text, centered, wrapped in grid
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: gap, width: "100%" }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 12,
          textAlign: "center",
          width: `calc((100% - ${gap * (cols - 1)}px) / ${cols})`,
          minWidth: 80,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.iconUrl}
            alt={item.label}
            style={{ width: item.iconSize ?? 48, height: item.iconSize ?? 48, objectFit: "contain", display: "block", filter: iconFilter }}
          />
          <span style={{
            fontSize: content.iconGridLabelSize ? `${content.iconGridLabelSize}px` : "var(--fs-small)",
            fontWeight: content.iconGridLabelWeight ?? 600,
            color: content.iconGridLabelColor ?? "var(--color-text-primary)",
            lineHeight: 1.3,
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
