"use client"

import { Star } from "lucide-react"
import { CellContent, ViewportSize } from "@/types/grid"

export function LogoBanner({ content, viewport }: { content: CellContent; viewport: ViewportSize }) {
  const items = content.logoBannerItems ?? []
  const speed = content.logoBannerSpeed ?? 30
  const height = content.logoBannerHeight ?? 60
  const gap = content.logoBannerGap ?? 64
  const label = content.logoBannerLabel
  const showStars = content.logoBannerShowStars ?? false
  const starColor = content.logoBannerStarColor || "#facc15"

  if (items.length === 0) return null

  // Repeat the item set N times so the marquee loops seamlessly. Tripling guards
  // against narrow item sets being shorter than the viewport. translateX target
  // is -100/SETS% so each cycle moves by exactly one set's width.
  const SETS = 3
  const loop = Array.from({ length: SETS }, () => items).flat()
  const translatePercent = 100 / SETS
  // Unique animation name per instance to avoid collisions
  const animName = `logoBannerScroll-${content.id.replace(/[^a-zA-Z0-9_-]/g, "")}`

  return (
    <div style={{ width: "100%", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes ${animName} {
          from { transform: translateX(0); }
          to   { transform: translateX(-${translatePercent}%); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap,
          // Trailing gap balances the flex `gap` count so each set is exactly
          // 1/SETS of the total width — without this, translateX(-1/SETS%) lands
          // half-a-gap short of the next set boundary and the loop visibly hiccups.
          paddingRight: gap,
          width: "max-content",
          animation: `${animName} ${speed}s linear infinite`,
        }}
      >
        {loop.map((item, i) => (
          <img
            key={i}
            src={item.imageUrl}
            alt={item.alt}
            style={{ height, width: "auto", objectFit: "contain", flexShrink: 0 }}
          />
        ))}
      </div>
      {(label || showStars) && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(540px, 70vw)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            pointerEvents: "none",
            zIndex: 2,
            background:
              "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 25%, rgba(255,255,255,1) 75%, rgba(255,255,255,0) 100%)",
          }}
        >
          {showStars && (
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={21} fill={starColor} stroke={starColor} />
              ))}
            </div>
          )}
          {label && (
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "inherit",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {label}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
