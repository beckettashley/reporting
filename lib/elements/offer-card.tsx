"use client"

import { useState } from "react"
import { CellContent } from "@/types/grid"
import { Button } from "@/components/ui/button"

/** Renders a group of offer cards with single-expand behavior */
export function OfferCardGroup({ cards }: { cards: CellContent[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {cards.map((card) => (
        <OfferCard
          key={card.id}
          content={card}
          expanded={expandedId === card.id}
          onToggle={() => setExpandedId(expandedId === card.id ? null : card.id)}
        />
      ))}
    </div>
  )
}

/** Single offer card — receives expanded state from parent */
function OfferCard({ content, expanded, onToggle }: {
  content: CellContent
  expanded: boolean
  onToggle: () => void
}) {
  const variants = content.offerCardVariants
  const [selectedSize, setSelectedSize] = useState(variants?.defaultSize ?? variants?.sizes?.[0] ?? "")
  const [selectedColor, setSelectedColor] = useState(variants?.defaultColor ?? variants?.colors?.[0] ?? "")
  const hasVariants = variants && ((variants.sizes?.length ?? 0) > 0 || (variants.colors?.length ?? 0) > 0)

  const imgSize = content.offerCardImageSize ?? 25

  const ctaBg = content.offerCardCtaBackgroundColor || "#2a2552"

  return (
    <div
      style={{
        backgroundColor: content.offerCardBackgroundColor || "#ffffff",
        border: `${content.offerCardBorderWidth ?? 1}px solid ${expanded ? "#1a1a1a" : (content.offerCardBorderColor || "#e5e7eb")}`,
        borderRadius: content.offerCardBorderRadius ?? 12,
        padding: `${content.offerCardPaddingY ?? 24}px ${content.offerCardPaddingX ?? 24}px`,
        boxShadow: expanded ? "0 2px 12px rgba(0,0,0,0.1)" : (content.offerCardShadow ? "0 2px 8px rgba(0,0,0,0.08)" : undefined),
        width: "100%",
        cursor: "pointer",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onClick={onToggle}
    >
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Col 1: Image */}
        {content.offerCardImageUrl && (
          <div style={{ flex: `0 0 ${imgSize}%`, maxWidth: `${imgSize}%` }}>
            <img src={content.offerCardImageUrl} alt={content.offerCardTitle || ""} style={{
              width: "100%",
              aspectRatio: "1/1",
              objectFit: "contain",
              borderRadius: 8,
              display: "block",
              backgroundColor: "#f9f9f9",
            }} />
          </div>
        )}
        {/* Col 2: Title, subtitle, tag */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {content.offerCardTitle && (
            <p style={{ fontWeight: 700, margin: 0, fontSize: 16 }}>{content.offerCardTitle}</p>
          )}
          {content.offerCardSubtitle && (
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#555" }}>{content.offerCardSubtitle}</p>
          )}
          {content.offerCardTag && (
            <span style={{
              display: "inline-block",
              marginTop: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "3px 10px",
              borderRadius: 100,
              color: content.offerCardTagColor || "#ffffff",
              backgroundColor: content.offerCardTagBackgroundColor || "#dc2626",
            }}>{content.offerCardTag}</span>
          )}
        </div>
        {/* Col 3: Prices + chevron */}
        <div style={{ flexShrink: 0, textAlign: "right", display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            {content.offerCardComparePrice && (
              <p style={{ margin: 0, fontSize: 13, color: "#999", textDecoration: "line-through" }}>{content.offerCardComparePrice}</p>
            )}
            {content.offerCardSellPrice && (
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a1a" }}>{content.offerCardSellPrice}</p>
            )}
          </div>
          <span style={{
            display: "inline-block",
            transition: "transform 0.2s",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            fontSize: 18,
            color: "#888",
          }}>&#8964;</span>
        </div>
      </div>

      {/* Expanded: variant selectors + CTA */}
      {expanded && (
        <div
          style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Variant selectors */}
          {hasVariants && (
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              {variants.sizes && variants.sizes.length > 0 && (
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#555" }}>Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    {variants.sizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}
              {variants.colors && variants.colors.length > 0 && (
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#555" }}>Color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    {variants.colors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* CTA Button */}
          <Button
            className="w-full h-auto px-6"
            style={{
              background: ctaBg,
              color: content.offerCardCtaTextColor || "#ffffff",
              borderRadius: 8,
              paddingTop: 14,
              paddingBottom: 14,
              fontSize: 16,
              fontWeight: 700,
              border: "none",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.dataset.bg = e.currentTarget.style.background; e.currentTarget.style.background = `linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.15)),${e.currentTarget.dataset.bg}` }}
            onMouseLeave={(e) => { if (e.currentTarget.dataset.bg) e.currentTarget.style.background = e.currentTarget.dataset.bg }}
            onClick={() => content.offerCardCtaUrl && window.open(content.offerCardCtaUrl, "_blank")}
          >
            {content.offerCardCtaText || "Add to Order"}
          </Button>
        </div>
      )}
    </div>
  )
}
