"use client"

import { useState, useEffect } from "react"

export function useCountdown(durationSeconds: number = 11169) {
  const [remaining, setRemaining] = useState(durationSeconds)

  useEffect(() => {
    setRemaining(durationSeconds)
    const interval = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [durationSeconds])

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    totalRemaining: remaining,
  }
}
