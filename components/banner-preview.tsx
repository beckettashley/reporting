"use client"

import { BannerConfig, BannerCountdown } from "@/types/banner"
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

export function BannerPreview({ config }: { config: BannerConfig }) {
  if (!config.enabled) return null

  const stickyStyle: React.CSSProperties = config.position === "sticky"
    ? { position: "sticky", top: 0, zIndex: 50 }
    : {}

  const hasCountdown = !!config.primary.countdown

  return (
    <div style={stickyStyle} className="w-full">
      {/* Primary banner */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: 64,
          backgroundColor: config.primary.backgroundColor || "#2a2552",
        }}
      >
        {/* Center content — text + countdown, centered */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 16, whiteSpace: "nowrap" }}>
          {/* Text stack */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 2 }}>
            {config.primary.iconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.primary.iconUrl} alt="" className="h-5 w-5 object-contain shrink-0" />
            )}

            {config.primary.badgeText && (
              config.primary.badgeBackgroundColor
                ? (
                  <span
                    className="shrink-0 px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: config.primary.badgeBackgroundColor,
                      color: config.primary.badgeTextColor ?? "#000000",
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {config.primary.badgeText}
                  </span>
                ) : (
                  <span style={{ fontSize: 18, fontWeight: 800, color: config.primary.badgeTextColor ?? "#ffffff", letterSpacing: "0.03em" }}>
                    {config.primary.badgeText}
                  </span>
                )
            )}

            {config.primary.text && (
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {config.primary.text}
              </span>
            )}
          </div>

          {/* Countdown */}
          {hasCountdown && <CountdownDisplay countdown={config.primary.countdown!} textColor={config.primary.textColor} />}
        </div>
      </div>

      {/* Secondary banner */}
      {config.secondary.enabled && config.secondary.text && (
        <div
          className="w-full flex items-center justify-center px-4 py-1.5"
          style={{
            backgroundColor: config.secondary.backgroundColor || "#7c3aed",
            minHeight: 32,
          }}
        >
          <span className="text-xs text-center" style={{ color: config.secondary.textColor || "#ffffff" }}>
            {config.secondary.text}
          </span>
        </div>
      )}
    </div>
  )
}
