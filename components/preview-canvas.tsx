"use client"

import { useState, useEffect } from "react"
import { Section, ViewportSize, PageStyle } from "@/types/grid"
import { SectionRenderer } from "@/components/section-renderer"

const getViewport = (width: number): ViewportSize => {
  if (width <= 500) return "mobile"
  if (width <= 820) return "tablet"
  return "desktop"
}

interface PreviewCanvasProps {
  sections: Section[]
  pageStyle?: PageStyle
}

export function PreviewCanvas({ sections, pageStyle }: PreviewCanvasProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop")

  useEffect(() => {
    const update = () => setViewport(getViewport(window.innerWidth))
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <div className="preview-container">
      <div className="preview-wrapper">
        <SectionRenderer sections={sections} viewport={viewport} pageStyle={pageStyle} />
      </div>
    </div>
  )
}
