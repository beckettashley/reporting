"use client"

import { useCountdown } from "@/lib/use-countdown"
import { CellContent } from "@/types/grid"

export function CountdownTimer({ content }: { content: CellContent }) {
  const { hours, minutes, seconds } = useCountdown(content.countdownDurationSeconds ?? 11169)
  const display = `${hours}:${minutes}:${seconds}`
  const fs = content.countdownDigitSize ? `${content.countdownDigitSize}px` : "var(--fs-xs)"

  return (
    <p style={{ textAlign: "center", fontSize: fs, margin: 0 }}>
      {content.countdownLabel && (
        <strong style={{ color: content.countdownLabelColor ?? undefined }}>{content.countdownLabel} </strong>
      )}
      <span style={{ color: content.countdownDigitColor ?? "#dc2626" }}>{display}</span>
    </p>
  )
}
