"use client"

import { CellContent, ViewportSize } from "@/types/grid"

export function BenefitsGrid({ content, viewport }: { content: CellContent; viewport: ViewportSize }) {
  const isDesktop = viewport === "desktop"
  const isTablet  = viewport === "tablet"
  const isMobile  = viewport === "mobile"

  const leftItems  = content.benefitsGridLeftItems  ?? []
  const rightItems = content.benefitsGridRightItems ?? []
  const borderRadius = content.benefitsGridCenterImageBorderRadius ?? 24

  // benefitsGridItemSize drives the desktop circle; scales down for narrower viewports
  const desktopCircle = content.benefitsGridItemSize ?? 86
  const circleSize = isDesktop ? desktopCircle
    : isTablet  ? Math.round(desktopCircle * 0.70)
    :             Math.round(desktopCircle * 0.62)

  // Overlay (translateX into image edge) is a desktop-only visual effect —
  // at tablet width there isn't enough room for it without squishing the text
  const overlap = isDesktop ? Math.round(circleSize / 2) : 0

  const itemGap          = isDesktop ? 10 : 8
  const itemMarginBottom = isDesktop ? 28 : isTablet ? 22 : 18
  const columnGap        = isDesktop ? 24 : 16
  const bodyFontSize     = isDesktop ? 15 : 14

  const BenefitItem = ({ item, flip }: { item: { title: string; body: string; iconUrl: string }; flip: boolean }) => {
    // Row-reverse (icon facing image) only makes sense on desktop where the overlay is active
    const isFlipped = flip && isDesktop
    return (
      <div style={{
        display: "flex",
        flexDirection: isFlipped ? "row-reverse" : "row",
        alignItems: "center",
        gap: itemGap,
        marginBottom: itemMarginBottom,
      }}>
        <div style={{
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          flexShrink: 0,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          transform: overlap > 0
            ? `translateX(${isFlipped ? overlap : -overlap}px)`
            : undefined,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.iconUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={{ textAlign: isFlipped ? "right" : "left", flex: 1 }}>
          <h4 style={{ color: "var(--color-text-primary)", marginBottom: 4, fontFamily: "var(--font-body)", fontWeight: 800 }}>{item.title}</h4>
          <p style={{ fontSize: isDesktop ? "var(--fs-cta)" : "var(--fs-small)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{item.body}</p>
        </div>
      </div>
    )
  }

  // ── Mobile: single stacked column ────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ width: "100%" }}>
        {leftItems.map((item, i) => <BenefitItem key={i} item={item} flip={false} />)}
        {content.benefitsGridCenterImage && (
          <div style={{ marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.benefitsGridCenterImage} alt="" style={{ width: "100%", display: "block", borderRadius }} />
          </div>
        )}
        {rightItems.map((item, i) => <BenefitItem key={i} item={item} flip={false} />)}
      </div>
    )
  }

  // ── Tablet: 3-col flex, no overlay, no row-reverse — clean and legible ───
  if (isTablet) {
    return (
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: columnGap }}>
          <div style={{ flex: 1.4 }}>
            {leftItems.map((item, i) => <BenefitItem key={i} item={item} flip={false} />)}
          </div>
          {content.benefitsGridCenterImage && (
            <div style={{ flex: 1.5 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.benefitsGridCenterImage} alt="" style={{ width: "100%", display: "block", borderRadius }} />
            </div>
          )}
          <div style={{ flex: 1.4 }}>
            {rightItems.map((item, i) => <BenefitItem key={i} item={item} flip={false} />)}
          </div>
        </div>
      </div>
    )
  }

  // ── Desktop: 3-col with translateX icon overlay ───────────────────────────
  // isolation:isolate scopes the stacking context; position:relative activates
  // zIndex on flex children so left column (zIndex 2) correctly paints over
  // the image column (zIndex 1) even though it comes first in DOM order.
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: columnGap, isolation: "isolate" }}>
        <div style={{ flex: 1.4, position: "relative", zIndex: 2 }}>
          {leftItems.map((item, i) => <BenefitItem key={i} item={item} flip={true} />)}
        </div>
        {content.benefitsGridCenterImage && (
          <div style={{ flex: 1.5, position: "relative", zIndex: 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.benefitsGridCenterImage} alt="" style={{ width: "100%", display: "block", borderRadius }} />
          </div>
        )}
        <div style={{ flex: 1.4, position: "relative", zIndex: 2 }}>
          {rightItems.map((item, i) => <BenefitItem key={i} item={item} flip={false} />)}
        </div>
      </div>
    </div>
  )
}
