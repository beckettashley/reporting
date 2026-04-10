"use client"

import { useRef, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { CellContent, ViewportSize } from "@/types/grid"

export function StickyBottomCta({ content, viewport = "desktop" }: { content: CellContent; viewport?: ViewportSize }) {
  const [isSticky, setIsSticky] = useState(false)
  const [mounted, setMounted] = useState(false)
  const originalRef = useRef<HTMLDivElement>(null)

  // Ensure we're on the client before using document.body
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!originalRef.current) return

    const checkSticky = () => {
      if (!originalRef.current) return
      const rect = originalRef.current.getBoundingClientRect()
      const scrolledPast = rect.bottom <= window.innerHeight
      // Hide when the user has scrolled near the page bottom (footer visible).
      // Reappears on scroll up when the footer is no longer in view.
      const distFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      const nearPageBottom = distFromBottom < 120
      setIsSticky(scrolledPast && !nearPageBottom)
    }

    window.addEventListener('scroll', checkSticky, { passive: true })
    checkSticky() // initial check

    return () => window.removeEventListener('scroll', checkSticky)
  }, [])

  const ctaBg = content.ctaGradientFrom && content.ctaGradientTo
    ? `linear-gradient(${content.ctaGradientDirection ?? "to right"}, ${content.ctaGradientFrom}, ${content.ctaGradientTo})`
    : content.ctaBackgroundColor || "#FFD61F"
  const ctaShadow = content.ctaDropShadow
    ? `0 ${content.ctaDropShadowY ?? 4}px ${content.ctaDropShadowBlur ?? 8}px ${content.ctaDropShadowColor ?? "#00000033"}`
    : "0 -2px 10px rgba(0, 0, 0, 0.1)"
  const guarantees = content.ctaGuarantees ?? []

  // Global max width for CTA buttons: 60% reduction on desktop/tablet, full width on mobile
  const ctaMaxWidth = viewport === "mobile" ? "100%" : 750

  const buttonContent = (
    <div style={{ width: "100%", maxWidth: ctaMaxWidth, marginLeft: "auto", marginRight: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
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
        {content.ctaText || "Get Started"}
      </Button>

      {guarantees.length > 0 && (
        <div style={{
          display: "flex",
          flexDirection: "row",
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

  return (
    <>
      {/* Original button in document flow - always present but invisible when sticky */}
      <div
        ref={originalRef}
        style={{
          opacity: isSticky ? 0 : 1,
          transition: "opacity 0.1s ease-in-out",
          pointerEvents: isSticky ? "none" : "auto",
          height: isSticky ? 0 : "auto",
          overflow: isSticky ? "hidden" : "visible",
          padding: isSticky ? 0 : undefined,
          margin: isSticky ? 0 : undefined,
        }}
      >
        {buttonContent}
      </div>

      {/* Sticky button at bottom - rendered via portal to escape preview-container */}
      {mounted && createPortal(
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            zIndex: 999999,
            backgroundColor: "#ffffff",
            boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
            paddingTop: "16px",
            paddingBottom: "16px",
            paddingLeft: "16px",
            paddingRight: "16px",
            opacity: isSticky ? 1 : 0,
            transform: isSticky ? "translateY(0)" : "translateY(100%)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
            pointerEvents: isSticky ? "auto" : "none",
          }}
        >
          <div style={{ maxWidth: 1250, marginLeft: "auto", marginRight: "auto" }}>
            {buttonContent}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
