"use client"

import { useState, useEffect } from "react"
import { ViewportSize } from "@/types/grid"

export function CarouselRenderer({
  images,
  borderRadius,
  showThumbnails,
  autoplay,
  autoplayInterval,
  thumbnailSize,
  thumbnailGap,
  viewport = "desktop",
}: {
  images: Array<{ url: string; alt?: string; thumbnailUrl?: string }>
  borderRadius: number
  showThumbnails: boolean
  autoplay: boolean
  autoplayInterval: number
  thumbnailSize: number
  thumbnailGap: number
  viewport?: ViewportSize
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!autoplay || !mounted || images.length <= 1) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length)
    }, autoplayInterval)

    return () => clearInterval(interval)
  }, [autoplay, autoplayInterval, images.length, mounted])

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  const activeImage = images[activeIndex]

  const effectiveThumbSize = viewport === "mobile" ? Math.round(thumbnailSize * 0.65) : viewport === "tablet" ? Math.round(thumbnailSize * 0.8) : thumbnailSize
  const effectiveThumbGap = viewport === "mobile" ? Math.max(2, Math.round(thumbnailGap * 0.5)) : viewport === "tablet" ? Math.round(thumbnailGap * 0.75) : thumbnailGap
  const containerGap = viewport === "mobile" ? 6 : viewport === "tablet" ? 10 : 12

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: showThumbnails ? containerGap : 0 }}>
      {/* Main carousel image */}
      <div style={{ position: "relative", width: "100%", borderRadius, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage.url}
          alt={activeImage.alt || `Slide ${activeIndex + 1}`}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius,
          }}
        />

        {/* Navigation controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: "bold",
                color: "#000",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 10,
              }}
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: "bold",
                color: "#000",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 10,
              }}
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div style={{ display: "flex", gap: effectiveThumbGap, justifyContent: "center", flexWrap: "wrap" }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                width: effectiveThumbSize,
                height: effectiveThumbSize,
                borderRadius: borderRadius / 2,
                overflow: "hidden",
                border: idx === activeIndex ? "3px solid #000" : "3px solid transparent",
                cursor: "pointer",
                padding: 0,
                background: "none",
                opacity: idx === activeIndex ? 1 : 0.6,
                transition: "opacity 0.2s, border-color 0.2s",
              }}
              aria-label={`View image ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.thumbnailUrl || img.url}
                alt={img.alt || `Thumbnail ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
