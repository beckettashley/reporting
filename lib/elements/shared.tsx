"use client"

export const STAR_PATH = "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"

export function StarRow({ value, count, size }: { value: number; count: number; size: number; accentColor?: string }) {
  const GOLD = "#f59e0b"
  const EMPTY = "#e5e7eb"
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
      {Array.from({ length: count }).map((_, i) => {
        const fillPct = Math.min(1, Math.max(0, value - i))
        const clipId = `sc-${size}-${i}-${Math.round(value * 10)}`
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
            {fillPct > 0 && fillPct < 1 && (
              <defs>
                <clipPath id={clipId}>
                  <rect x="0" y="0" width={fillPct * 24} height="24" />
                </clipPath>
              </defs>
            )}
            <path d={STAR_PATH} fill={EMPTY} />
            {fillPct > 0 && (
              <path d={STAR_PATH} fill={GOLD} clipPath={fillPct < 1 ? `url(#${clipId})` : undefined} />
            )}
          </svg>
        )
      })}
    </div>
  )
}

export function applyOpacity(color: string, opacity: number): string {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${opacity})`
  }
  return color
}
