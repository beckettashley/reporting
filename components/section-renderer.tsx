"use client"

import React from "react"
import { Section, ViewportSize, PageStyle } from "@/types/grid"
import { GridPreview, GLOBAL_CARD_STYLES } from "@/lib/grid-render"

const SECTION_PAD_Y: Record<string, { desktop: number; tablet: number; mobile: number }> = {
  none: { desktop: 0, tablet: 0, mobile: 0 },
  s: { desktop: 18, tablet: 12, mobile: 9 },
  m: { desktop: 36, tablet: 24, mobile: 18 },
  l: { desktop: 60, tablet: 42, mobile: 30 },
  xl: { desktop: 90, tablet: 60, mobile: 42 },
}

interface SectionRendererProps {
  sections: Section[]
  viewport: ViewportSize
  pageStyle?: PageStyle
}

export function SectionRenderer({ sections, viewport, pageStyle }: SectionRendererProps) {
  const pageVars = {
    ...(pageStyle?.fontDisplay && { '--page-font-display': pageStyle.fontDisplay }),
    ...(pageStyle?.fontBody && { '--page-font-body': pageStyle.fontBody }),
    // Typography tokens
    ...(pageStyle?.titleFontFamily && { '--page-title-family': pageStyle.titleFontFamily }),
    ...(pageStyle?.titleFontSize && { '--page-title-size': `${pageStyle.titleFontSize}px` }),
    ...(pageStyle?.titleFontWeight && { '--page-title-weight': String(pageStyle.titleFontWeight) }),
    ...(pageStyle?.titleColor && { '--page-title-color': pageStyle.titleColor }),
    ...(pageStyle?.titleLineHeight && { '--page-title-line-height': String(pageStyle.titleLineHeight) }),
    ...(pageStyle?.h1FontFamily && { '--page-h1-family': pageStyle.h1FontFamily }),
    ...(pageStyle?.h1FontSize && { '--page-h1-size': `${pageStyle.h1FontSize}px` }),
    ...(pageStyle?.h1FontWeight && { '--page-h1-weight': String(pageStyle.h1FontWeight) }),
    ...(pageStyle?.h1Color && { '--page-h1-color': pageStyle.h1Color }),
    ...(pageStyle?.h1LineHeight && { '--page-h1-line-height': String(pageStyle.h1LineHeight) }),
    ...(pageStyle?.h2FontFamily && { '--page-h2-family': pageStyle.h2FontFamily }),
    ...(pageStyle?.h2FontSize && { '--page-h2-size': `${pageStyle.h2FontSize}px` }),
    ...(pageStyle?.h2FontWeight && { '--page-h2-weight': String(pageStyle.h2FontWeight) }),
    ...(pageStyle?.h2Color && { '--page-h2-color': pageStyle.h2Color }),
    ...(pageStyle?.h2LineHeight && { '--page-h2-line-height': String(pageStyle.h2LineHeight) }),
    ...(pageStyle?.h3FontFamily && { '--page-h3-family': pageStyle.h3FontFamily }),
    ...(pageStyle?.h3FontSize && { '--page-h3-size': `${pageStyle.h3FontSize}px` }),
    ...(pageStyle?.h3FontWeight && { '--page-h3-weight': String(pageStyle.h3FontWeight) }),
    ...(pageStyle?.h3Color && { '--page-h3-color': pageStyle.h3Color }),
    ...(pageStyle?.h3LineHeight && { '--page-h3-line-height': String(pageStyle.h3LineHeight) }),
    ...(pageStyle?.h4FontFamily && { '--page-h4-family': pageStyle.h4FontFamily }),
    ...(pageStyle?.h4FontSize && { '--page-h4-size': `${pageStyle.h4FontSize}px` }),
    ...(pageStyle?.h4FontWeight && { '--page-h4-weight': String(pageStyle.h4FontWeight) }),
    ...(pageStyle?.h4Color && { '--page-h4-color': pageStyle.h4Color }),
    ...(pageStyle?.h4LineHeight && { '--page-h4-line-height': String(pageStyle.h4LineHeight) }),
    ...(pageStyle?.h5FontFamily && { '--page-h5-family': pageStyle.h5FontFamily }),
    ...(pageStyle?.h5FontSize && { '--page-h5-size': `${pageStyle.h5FontSize}px` }),
    ...(pageStyle?.h5FontWeight && { '--page-h5-weight': String(pageStyle.h5FontWeight) }),
    ...(pageStyle?.h5Color && { '--page-h5-color': pageStyle.h5Color }),
    ...(pageStyle?.h5LineHeight && { '--page-h5-line-height': String(pageStyle.h5LineHeight) }),
    ...(pageStyle?.h6FontFamily && { '--page-h6-family': pageStyle.h6FontFamily }),
    ...(pageStyle?.h6FontSize && { '--page-h6-size': `${pageStyle.h6FontSize}px` }),
    ...(pageStyle?.h6FontWeight && { '--page-h6-weight': String(pageStyle.h6FontWeight) }),
    ...(pageStyle?.h6Color && { '--page-h6-color': pageStyle.h6Color }),
    ...(pageStyle?.h6LineHeight && { '--page-h6-line-height': String(pageStyle.h6LineHeight) }),
    ...(pageStyle?.bodyFontFamily && { '--page-body-family': pageStyle.bodyFontFamily }),
    ...(pageStyle?.bodyFontSize && { '--page-body-size': `${pageStyle.bodyFontSize}px` }),
    ...(pageStyle?.bodyFontWeight && { '--page-body-weight': String(pageStyle.bodyFontWeight) }),
    ...(pageStyle?.bodyColor && { '--page-body-color': pageStyle.bodyColor }),
    ...(pageStyle?.bodyLineHeight && { '--page-body-line-height': String(pageStyle.bodyLineHeight) }),
  } as React.CSSProperties

  // Build dynamic typography style rules — only for properties that are set
  const typoRules: string[] = []
  const levels = [
    { tag: 'h1', prefix: 'h1' }, { tag: 'h2', prefix: 'h2' }, { tag: 'h3', prefix: 'h3' },
    { tag: 'h4', prefix: 'h4' }, { tag: 'h5', prefix: 'h5' }, { tag: 'h6', prefix: 'h6' },
    { tag: 'p', prefix: 'body' },
  ] as const
  for (const { tag, prefix } of levels) {
    const props: string[] = []
    if ((pageStyle as Record<string, unknown>)?.[`${prefix}FontFamily`]) props.push(`font-family: var(--page-${prefix}-family)`)
    if ((pageStyle as Record<string, unknown>)?.[`${prefix}FontSize`]) props.push(`font-size: var(--page-${prefix}-size)`)
    if ((pageStyle as Record<string, unknown>)?.[`${prefix}FontWeight`]) props.push(`font-weight: var(--page-${prefix}-weight)`)
    if ((pageStyle as Record<string, unknown>)?.[`${prefix}Color`]) props.push(`color: var(--page-${prefix}-color)`)
    if ((pageStyle as Record<string, unknown>)?.[`${prefix}LineHeight`]) props.push(`line-height: var(--page-${prefix}-line-height)`)
    if (props.length) typoRules.push(`.page-typo ${tag} { ${props.join('; ')}; }`)
  }

  // Track cumulative height of previous sticky sections for stacking
  let cumulativeStickyTop = 0

  return (
    <div style={pageVars}>
      <style>{GLOBAL_CARD_STYLES}</style>
      {typoRules.length > 0 && <style>{typoRules.join('\n')}</style>}
      {sections.map((section) => {
        const sectionHasBanner = section.grids.some(g =>
          g.cells.some(c => c.contents.some(ct => ct.type === "banner" || ct.type === "footer" || ct.type === "logoBanner"))
        )
        const cw = sectionHasBanner ? "flood" : (section.style.contentWidth ?? "contained")
        const isContained = cw === "contained"
        const isNarrow = cw === "narrow"
        const gutter = viewport === "mobile" ? 16 : viewport === "tablet" ? 12 : 16
        const narrowGutter = viewport === "mobile" ? 16 : viewport === "tablet" ? 12 : 16
        const sectionMaxWidth = section.style.maxWidth ?? null

        // Support independent top/bottom padding
        let sectionPadTop: number
        let sectionPadBottom: number

        // Viewport-specific overrides take precedence over scaled overrides on their respective viewport.
        // Outer condition includes the viewport-specific fields so a section using only e.g. paddingTopOverrideMobile still enters this branch.
        const topOverrideMobile = section.style.paddingTopOverrideMobile
        const bottomOverrideMobile = section.style.paddingBottomOverrideMobile
        const topOverrideTablet = section.style.paddingTopOverrideTablet
        const bottomOverrideTablet = section.style.paddingBottomOverrideTablet
        const hasAnyOverride =
          section.style.paddingTopOverride !== undefined ||
          section.style.paddingBottomOverride !== undefined ||
          topOverrideMobile !== undefined ||
          bottomOverrideMobile !== undefined ||
          topOverrideTablet !== undefined ||
          bottomOverrideTablet !== undefined

        if (hasAnyOverride) {
          // Independent top/bottom overrides
          const topOverride = section.style.paddingTopOverride ?? section.style.paddingYOverride
          const bottomOverride = section.style.paddingBottomOverride ?? section.style.paddingYOverride

          // Top resolution: viewport-specific > scaled override > preset fallback
          if (viewport === "mobile" && topOverrideMobile !== undefined) {
            sectionPadTop = topOverrideMobile
          } else if (viewport === "tablet" && topOverrideTablet !== undefined) {
            sectionPadTop = topOverrideTablet
          } else if (topOverride !== undefined) {
            sectionPadTop = viewport === "mobile"
              ? Math.round(topOverride * 0.6)
              : viewport === "tablet"
              ? Math.round(topOverride * 0.75)
              : topOverride
          } else {
            const sizes = SECTION_PAD_Y[section.style.paddingYSize ?? "none"]
            sectionPadTop = sizes[viewport]
          }

          // Bottom resolution: viewport-specific > scaled override > preset fallback
          if (viewport === "mobile" && bottomOverrideMobile !== undefined) {
            sectionPadBottom = bottomOverrideMobile
          } else if (viewport === "tablet" && bottomOverrideTablet !== undefined) {
            sectionPadBottom = bottomOverrideTablet
          } else if (bottomOverride !== undefined) {
            sectionPadBottom = viewport === "mobile"
              ? Math.round(bottomOverride * 0.6)
              : viewport === "tablet"
              ? Math.round(bottomOverride * 0.75)
              : bottomOverride
          } else {
            const sizes = SECTION_PAD_Y[section.style.paddingYSize ?? "none"]
            sectionPadBottom = sizes[viewport]
          }
        } else if (section.style.paddingYOverride !== undefined) {
          // Unified override (same for top and bottom)
          const padY = viewport === "mobile"
            ? Math.round(section.style.paddingYOverride * 0.6)
            : viewport === "tablet"
            ? Math.round(section.style.paddingYOverride * 0.75)
            : section.style.paddingYOverride
          sectionPadTop = padY
          sectionPadBottom = padY
        } else {
          // Use paddingYSize preset
          const sizes = SECTION_PAD_Y[section.style.paddingYSize ?? "none"]
          sectionPadTop = sizes[viewport]
          sectionPadBottom = sizes[viewport]
        }

        // [DEBUG] Confirm backgroundImage reaches the renderer
        if (section.style.backgroundImage) {
          console.log(`[section-render] ${section.id} backgroundImage = ${section.style.backgroundImage}`)
        }
        const bgImageStyle = section.style.backgroundImage ? {
          backgroundImage: `url(${section.style.backgroundImage})`,
          backgroundSize: section.style.backgroundSize ?? "cover",
          backgroundPosition: section.style.backgroundPosition ?? "center center",
          backgroundRepeat: section.style.backgroundRepeat ?? "no-repeat",
        } : {}
        const overlayOpacity = (section.style.backgroundOverlay ?? 0) / 100
        const overlayColor = section.style.backgroundOverlayColor ?? "#000000"
        const bgGradient = section.style.backgroundGradientStops && section.style.backgroundGradientStops.length >= 2
          ? (() => {
            // Multi-stop gradient (4+ stops)
            const type = section.style.backgroundGradientType ?? "linear"
            const dir  = section.style.backgroundGradientDirection
            const stops = section.style.backgroundGradientStops
              .map(stop => `${stop.color} ${stop.position}%`)
              .join(', ')
            return type === "radial"
              ? `radial-gradient(${dir ?? "50% 50% at 50% 50%"}, ${stops})`
              : `linear-gradient(${dir ?? "to bottom"}, ${stops})`
          })()
          : section.style.backgroundGradientFrom && section.style.backgroundGradientTo
          ? (() => {
            // Legacy 2-3 stop gradient
            const from    = section.style.backgroundGradientFrom!
            const to      = section.style.backgroundGradientTo!
            const mid     = section.style.backgroundGradientMid
            const midStop = section.style.backgroundGradientMidStop ?? 50
            const type    = section.style.backgroundGradientType ?? "linear"
            const dir     = section.style.backgroundGradientDirection
            const stops   = mid
              ? `${from} 0%, ${mid} ${midStop}%, ${to} 100%`
              : `${from}, ${to}`
            return type === "radial"
              ? `radial-gradient(${dir ?? "50% 50% at 50% 50%"}, ${stops})`
              : `linear-gradient(${dir ?? "to bottom"}, ${stops})`
          })()
          : null
        const maxWidthPadding = viewport === "mobile" ? 8 : viewport === "tablet" ? 12 : 16
        const innerContentStyle =
          sectionMaxWidth !== null
            ? { maxWidth: sectionMaxWidth, marginLeft: "auto", marginRight: "auto", paddingLeft: maxWidthPadding, paddingRight: maxWidthPadding } :
          isContained ? { maxWidth: 1250, marginLeft: "auto", marginRight: "auto", paddingLeft: gutter, paddingRight: gutter } :
          isNarrow    ? { maxWidth: 925, marginLeft: "auto", marginRight: "auto", paddingLeft: narrowGutter, paddingRight: narrowGutter } :
          undefined

        // Determine z-index and height for sticky sections based on content type
        const hasBanner = section.grids.some(g => g.cells.some(c => c.contents.some(ct => ct.type === "banner")))
        const hasNavbar = section.grids.some(g => g.cells.some(c => c.contents.some(ct => ct.type === "navbar")))

        let stickyZIndex = 50
        let stickyTop = 0
        let thisSectionHeight = 0

        if (section.style.position === "sticky") {
          stickyTop = cumulativeStickyTop

          if (hasNavbar) {
            stickyZIndex = 100  // Navbar on top
            // Navbar height from content config (default 70px)
            const navbarContent = section.grids[0]?.cells[0]?.contents.find(c => c.type === "navbar")
            thisSectionHeight = navbarContent?.navbarHeight || 70
          } else if (hasBanner) {
            stickyZIndex = 90   // Banner below navbar
            // Banner height: 64px primary + 32px secondary (if enabled) = ~96px
            // We'll use a fixed estimate since we can't measure dynamically
            thisSectionHeight = 96
          }
        }

        // Render the section
        const sectionElement = (
          <div
            key={section.id}
            id={section.anchorId || undefined}
            style={{
              position: "relative",
              ...(bgGradient ? { background: bgGradient } : { backgroundColor: section.style.backgroundColor || undefined }),
              paddingTop: sectionPadTop,
              paddingBottom: sectionPadBottom,
              ...(section.style.position === "sticky" ? { position: "sticky", top: stickyTop, zIndex: stickyZIndex } : {}),
              ...(section.anchorId ? { scrollMarginTop: cumulativeStickyTop } : {}),
              ...bgImageStyle,
            }}
          >
            {overlayOpacity > 0 && (
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
                pointerEvents: "none",
              }} />
            )}
            <div style={{ position: "relative", zIndex: 1, ...innerContentStyle }}>
              <div style={{ display: "flex", flexDirection: "column", gap: section.style.gridGap ? (viewport === "mobile" ? Math.round(section.style.gridGap * 0.6) : viewport === "tablet" ? Math.round(section.style.gridGap * 0.75) : section.style.gridGap) : 0 }}>
                {section.grids.map((grid, gIdx) => (
                  <GridPreview key={gIdx} config={grid} viewport={viewport} />
                ))}
              </div>
            </div>
          </div>
        )

        // Increment cumulative sticky top for next sticky section
        if (section.style.position === "sticky") {
          cumulativeStickyTop += thisSectionHeight
        }

        return sectionElement
      })}
    </div>
  )
}
