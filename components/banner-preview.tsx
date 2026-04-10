"use client"

import { BannerConfig, BannerCountdown } from "@/types/banner"
import { ViewportSize } from "@/types/grid"
import { useCountdown } from "@/lib/use-countdown"

function CountdownDisplay({ countdown }: { countdown: BannerCountdown; textColor?: string }) {
  const { hours, minutes, seconds } = useCountdown(countdown.durationSeconds ?? 11169)
  const units = [
    { label: "HRS", val: hours },
    { label: "MIN", val: minutes },
    { label: "SEC", val: seconds },
  ]

  return (
    <div
      style={{ backgroundColor: "#ffffff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
      suppressHydrationWarning
    >
      {units.map(({ label, val }, i) => (
        <span key={label} style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          {i > 0 && <span style={{ color: "#1a1a1a", fontSize: 12, lineHeight: "20px" }}>:</span>}
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{ color: "#1a1a1a", fontWeight: 900, fontSize: 20, lineHeight: "20px", fontVariantNumeric: "tabular-nums" as React.CSSProperties["fontVariantNumeric"] }}>{val}</span>
            <span style={{ color: "#555555", fontSize: 10, letterSpacing: "0.06em" }}>{label}</span>
          </span>
        </span>
      ))}
    </div>
  )
}

export function BannerPreview({ config, viewport }: { config: BannerConfig; viewport?: ViewportSize }) {
  if (!config.enabled) return null

  const stickyStyle: React.CSSProperties = config.position === "sticky"
    ? { position: "sticky", top: 0, zIndex: 50 }
    : {}

  const hasCountdown = !!config.primary.countdown
  const isMobile = viewport === "mobile"

  return (
    <div style={stickyStyle} className="w-full">
      {/* Primary banner */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "flex-start" : "center",
          width: "100%",
          minHeight: isMobile ? 48 : 64,
          paddingTop: isMobile ? 8 : undefined,
          paddingBottom: isMobile ? 8 : undefined,
          backgroundColor: config.primary.backgroundColor || "#2a2552",
          paddingLeft: isMobile ? 12 : undefined,
          paddingRight: isMobile ? 12 : undefined,
        }}
      >
        {/* Content row — text + countdown */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: isMobile ? 10 : 16,
          whiteSpace: isMobile ? "normal" : "nowrap",
          width: isMobile ? "100%" : undefined,
          justifyContent: isMobile ? "space-between" : undefined,
        }}>
          {/* Text stack */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "flex-start" : "center",
            textAlign: isMobile ? "left" : "center",
            gap: 2,
            flex: isMobile ? 1 : undefined,
            minWidth: isMobile ? 0 : undefined,
          }}>
            {config.primary.iconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.primary.iconUrl} alt="" className="h-5 w-5 object-contain shrink-0" />
            )}

            {config.primary.badgeText && (
              config.primary.badgeBackgroundColor
                ? (
                  <span
                    className="shrink-0 py-0.5 rounded-full"
                    style={{
                      backgroundColor: config.primary.badgeBackgroundColor,
                      color: config.primary.badgeTextColor ?? "#000000",
                      fontSize: isMobile ? 14 : 18,
                      fontWeight: 900,
                      letterSpacing: "0.03em",
                      paddingLeft: 14,
                      paddingRight: 14,
                    }}
                  >
                    {config.primary.badgeText}
                  </span>
                ) : (
                  <span style={{ fontSize: isMobile ? 14 : 18, fontWeight: 900, color: config.primary.badgeTextColor ?? "#ffffff", letterSpacing: "0.03em" }}>
                    {config.primary.badgeText}
                  </span>
                )
            )}

            {config.primary.text && (
              <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {config.primary.text}
              </span>
            )}
          </div>

          {/* Countdown — pinned right on mobile */}
          {hasCountdown && <CountdownDisplay countdown={config.primary.countdown!} textColor={config.primary.textColor} />}
        </div>
      </div>

      {/* Secondary banner */}
      {config.secondary.enabled && config.secondary.text && (
        <div
          className={`w-full flex items-center ${isMobile ? "justify-start" : "justify-center"} px-4 py-1.5`}
          style={{
            backgroundColor: config.secondary.backgroundColor || "#7c3aed",
            minHeight: 32,
          }}
        >
          <span className={`${isMobile ? "text-left" : "text-center"}`} style={{ color: config.secondary.textColor || "#ffffff", fontWeight: 600, fontSize: 12 }}>
            {config.secondary.text}
          </span>
        </div>
      )}
    </div>
  )
}
