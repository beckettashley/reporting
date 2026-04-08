"use client"

import { useState, useEffect } from "react"
import { CellContent, ViewportSize, TestimonialCarouselItem, TestimonialMoreReviewsItem } from "@/types/grid"
import { StarRow, STAR_PATH } from "./shared"

export function TestimonialSection({ content, viewport }: { content: CellContent; viewport: ViewportSize }) {
  const isMobile = viewport === "mobile"
  const accentColor = content.testimonialAccentColor ?? "#3d348b"

  const [thumbs, setThumbs] = useState<Record<string, { up: boolean; down: boolean; count: number }>>(() => {
    const init: Record<string, { up: boolean; down: boolean; count: number }> = {}
    for (const r of content.testimonialReviews ?? []) {
      init[r.id] = { up: false, down: false, count: r.helpfulCount ?? 0 }
    }
    return init
  })

  const [modalImage, setModalImage] = useState<string | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalImage) {
        setModalImage(null)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [modalImage])

  const toggleUp = (id: string) => setThumbs(prev => {
    const cur = prev[id]
    return { ...prev, [id]: { up: !cur.up, down: false, count: cur.up ? cur.count - 1 : cur.count + 1 } }
  })

  const toggleDown = (id: string) => setThumbs(prev => {
    const cur = prev[id]
    return { ...prev, [id]: { up: false, down: !cur.down, count: cur.up ? cur.count - 1 : cur.count } }
  })

  const videosCols = isMobile ? 3 : 6
  const reviewCols = 1
  const gap = 10

  const hasVideos = (content.testimonialVideos?.length ?? 0) > 0
  const hasReviews = (content.testimonialReviews?.length ?? 0) > 0
  const [activeTab, setActiveTab] = useState<"videos" | "written">(hasVideos ? "videos" : "written")
  const [reviewPage, setReviewPage] = useState(0)

  // ── Legacy carousel (FluffCo compat) ──
  const [activeIdx, setActiveIdx] = useState(0)
  const legacyItems = content.testimonialItems ?? []
  const legacyMore = content.testimonialMoreReviewsItems ?? []
  const legacyCols = isMobile
    ? (content.testimonialMoreReviewsColumnsMobile ?? 1)
    : (content.testimonialMoreReviewsColumns ?? 1)
  const legacyGap = 24
  const legacyItem: TestimonialCarouselItem | undefined = legacyItems[activeIdx]

  return (
    <div style={{ width: "100%" }}>

      {/* Heading */}
      {content.testimonialTitle && (
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>{content.testimonialTitle}</h1>
      )}
      {content.testimonialSubtitle && (
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", marginBottom: 32 }}>{content.testimonialSubtitle}</p>
      )}

      {/* Aggregate stats */}
      {content.testimonialRating != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 40, flexWrap: "wrap", justifyContent: isMobile ? "center" : undefined }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "var(--fs-display)", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>{content.testimonialRating}</div>
            <StarRow value={content.testimonialRating} count={5} size={20} accentColor={accentColor} />
            {content.testimonialReviewCount != null && (
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--color-text-muted)" }}>Based on {content.testimonialReviewCount.toLocaleString()} reviews</p>
            )}
          </div>
          {content.testimonialStarDistribution && (
            <div style={{ flex: 1, minWidth: 200 }}>
              {content.testimonialStarDistribution.map(({ stars, pct }) => (
                <div key={stars} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: "var(--fs-label)", color: "var(--color-text-secondary)", width: 12, textAlign: "right" }}>{stars}</span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill={accentColor}><path d={STAR_PATH} /></svg>
                  <div style={{ flex: 1, height: 8, backgroundColor: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", backgroundColor: accentColor, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: "var(--fs-label)", color: "var(--color-text-muted)", width: 32 }}>{pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      {hasVideos && hasReviews && (
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #e5e7eb", justifyContent: "center" }}>
          {([{ key: "videos", label: "Video Reviews" }, { key: "written", label: "Written Reviews" }] as const).map(({ key, label }) => (
            <button key={key} onClick={() => { setActiveTab(key); setReviewPage(0); }} style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: activeTab === key ? `2px solid ${accentColor}` : "2px solid transparent",
              marginBottom: -2,
              background: "none",
              cursor: "pointer",
              fontWeight: activeTab === key ? 700 : 500,
              fontSize: "var(--fs-small)",
              color: activeTab === key ? accentColor : "var(--color-text-tertiary)",
            }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Video grid */}
      {hasVideos && activeTab === "videos" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap, marginBottom: 40, justifyContent: "center" }}>
          {content.testimonialVideos!.map((v, i) => (
            <div key={i} style={{ width: `calc((100% - ${gap * (videosCols - 1)}px) / ${videosCols})`, aspectRatio: "9/16", borderRadius: 12, overflow: "hidden", backgroundColor: "#000" }}>
              <video
                src={v.videoUrl}
                poster={v.posterUrl}
                controls
                preload="none"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Written reviews grid */}
      {hasReviews && activeTab === "written" && (() => {
        const allReviews = content.testimonialReviews!
        const reviewsPerPage = 6
        const maxPages = 6
        const totalPages = Math.min(Math.ceil(allReviews.length / reviewsPerPage), maxPages)
        const startIdx = reviewPage * reviewsPerPage
        const endIdx = Math.min(startIdx + reviewsPerPage, allReviews.length, maxPages * reviewsPerPage)
        const visibleReviews = allReviews.slice(startIdx, endIdx)

        return (
          <>
        <div style={{ display: "flex", flexWrap: "wrap", gap, justifyContent: "center" }}>
          {visibleReviews.map(review => {
            const t = thumbs[review.id] ?? { up: false, down: false, count: review.helpfulCount ?? 0 }
            return (
              <div key={review.id} style={{
                width: `calc((100% - ${gap * (reviewCols - 1)}px) / ${reviewCols})`,
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "var(--fs-small)", color: "var(--color-text-primary)", margin: 0 }}>{review.name}</p>
                    {review.verified && (
                      <p style={{ fontSize: "var(--fs-micro)", color: accentColor, margin: 0, fontWeight: 600 }}>✓ Verified Buyer</p>
                    )}
                  </div>
                  {review.date && <p style={{ fontSize: "var(--fs-micro)", color: "var(--color-text-subtle)", margin: 0 }}>{review.date}</p>}
                </div>
                <StarRow value={review.rating} count={5} size={14} accentColor={accentColor} />
                {review.title && <p style={{ fontWeight: 600, fontSize: "var(--fs-small)", color: "var(--color-text-primary)", margin: 0 }}>{review.title}</p>}
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--color-text-body)", lineHeight: 1.5, margin: 0 }}>{review.body}</p>
                {review.imageUrl && (
                  <div
                    onClick={() => setModalImage(review.imageUrl!)}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "1px solid #e5e7eb",
                      marginTop: 8,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={review.imageUrl} alt={review.title || "Review image"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
                  <span style={{ fontSize: "var(--fs-micro)", color: "var(--color-text-muted)" }}>Was this helpful?</span>
                  <button onClick={() => toggleUp(review.id)} style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    color: t.up ? accentColor : "var(--color-text-subtle)", display: "flex", alignItems: "center", gap: 4, fontSize: "var(--fs-label)",
                  }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill={t.up ? accentColor : "none"} stroke={t.up ? accentColor : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z" />
                    </svg>
                    {t.count}
                  </button>
                  <button onClick={() => toggleDown(review.id)} style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    color: t.down ? "#dc2626" : "var(--color-text-subtle)", fontSize: "var(--fs-label)",
                  }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill={t.down ? "#dc2626" : "none"} stroke={t.down ? "#dc2626" : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 14V2M9 18.12L10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L13 22a3.13 3.13 0 0 1-3-3.88z" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
            <button
              onClick={() => setReviewPage(p => Math.max(0, p - 1))}
              disabled={reviewPage === 0}
              style={{
                padding: "8px 16px",
                border: `1px solid ${reviewPage === 0 ? "#e5e7eb" : accentColor}`,
                borderRadius: 8,
                background: "none",
                cursor: reviewPage === 0 ? "not-allowed" : "pointer",
                fontSize: "var(--fs-small)",
                fontWeight: 600,
                color: reviewPage === 0 ? "var(--color-text-subtle)" : accentColor,
              }}>
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setReviewPage(i)}
                style={{
                  width: 36,
                  height: 36,
                  border: reviewPage === i ? `2px solid ${accentColor}` : "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: reviewPage === i ? accentColor : "none",
                  cursor: "pointer",
                  fontSize: "var(--fs-small)",
                  fontWeight: 600,
                  color: reviewPage === i ? "#fff" : "var(--color-text-primary)",
                }}>
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setReviewPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={reviewPage === totalPages - 1}
              style={{
                padding: "8px 16px",
                border: `1px solid ${reviewPage === totalPages - 1 ? "#e5e7eb" : accentColor}`,
                borderRadius: 8,
                background: "none",
                cursor: reviewPage === totalPages - 1 ? "not-allowed" : "pointer",
                fontSize: "var(--fs-small)",
                fontWeight: 600,
                color: reviewPage === totalPages - 1 ? "var(--color-text-subtle)" : accentColor,
              }}>
              Next
            </button>
          </div>
        )}
          </>
        )
      })()}

      {/* Legacy carousel — FluffCo compat */}
      {legacyItems.length > 0 && legacyItem && (
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: legacyGap,
          alignItems: "flex-start",
          marginBottom: legacyMore.length > 0 ? 32 : 0,
        }}>
          {(legacyItem.videoUrl || legacyItem.imageUrl) && (
            <div style={{ flexShrink: 0, width: isMobile ? "100%" : "40%" }}>
              {legacyItem.videoUrl ? (
                <div style={{ aspectRatio: "1 / 1", width: "100%", overflow: "hidden", borderRadius: 12 }}>
                  <video src={legacyItem.videoUrl} poster={legacyItem.posterUrl} controls preload="none" width="100%"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ) : (
                <div style={{ aspectRatio: "1 / 1", width: "100%", overflow: "hidden", borderRadius: 12 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={legacyItem.imageUrl} alt={legacyItem.name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
            </div>
          )}
          <div style={{ flex: 1 }}>
            {legacyItem.starValue != null && (
              <StarRow value={legacyItem.starValue} count={legacyItem.starCount ?? 5} size={18} accentColor={accentColor} />
            )}
            <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--color-text-primary)", marginBottom: 16 }}>&ldquo;{legacyItem.quote}&rdquo;</p>
            {legacyItem.name && <p style={{ fontWeight: 700, fontSize: "var(--fs-cta)", color: "var(--color-text-primary)", marginBottom: legacyItem.title ? 2 : 0 }}>{legacyItem.name}</p>}
            {legacyItem.title && <p style={{ fontSize: "var(--fs-small)", color: "var(--color-text-tertiary)" }}>{legacyItem.title}</p>}
            {legacyItems.length > 1 && (
              <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
                {legacyItems.map((_, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    backgroundColor: i === activeIdx ? "#1a1a1a" : "#d1d5db",
                    border: "none", cursor: "pointer", padding: 0,
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {legacyMore.length > 0 && (
        <>
          {content.testimonialMoreReviewsTitle && (
            <p style={{ fontWeight: 700, fontSize: "var(--fs-h4)", marginBottom: 16, color: "var(--color-text-primary)" }}>{content.testimonialMoreReviewsTitle}</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: legacyGap, justifyContent: "center" }}>
            {legacyMore.map((review: TestimonialMoreReviewsItem, i: number) => (
              <div key={i} style={{ width: `calc((100% - ${legacyGap * (legacyCols - 1)}px) / ${legacyCols})` }}>
                {review.starValue != null && <StarRow value={review.starValue} count={5} size={14} accentColor={accentColor} />}
                <p style={{ fontSize: "var(--fs-small)", color: "var(--color-text-body)", lineHeight: 1.5, marginBottom: 6 }}>&ldquo;{review.quote}&rdquo;</p>
                {review.name && <p style={{ fontWeight: 600, fontSize: "var(--fs-xs)", color: "var(--color-text-primary)" }}>{review.name}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Image modal */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "pointer",
            padding: 20,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={modalImage}
            alt="Review image full size"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        </div>
      )}

    </div>
  )
}
