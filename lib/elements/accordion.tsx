"use client"

import React, { useState } from "react"
import { CellContent } from "@/types/grid"

export function AccordionList({ content }: { content: CellContent }) {
  const items = content.accordionItems ?? []
  const defaultIndex = items.findIndex(i => i.defaultOpen)
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultIndex >= 0 ? defaultIndex : null
  )

  const borderColor = content.accordionBorderColor ?? "#d0d0d0"
  const borderStyle = content.accordionBorderStyle ?? "dashed"

  return (
    <div style={{ width: "100%" }}>
      {items.map((item, i) => (
        <div key={i}>
          <div
            style={{
              borderTop: `1px ${borderStyle} ${borderColor}`,
              borderBottom: i === items.length - 1 ? `1px ${borderStyle} ${borderColor}` : undefined,
              padding: "16px 0",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span style={{
              fontSize: content.accordionQuestionSize ? `${content.accordionQuestionSize}px` : "var(--fs-xs)",
              fontWeight: content.accordionQuestionWeight ?? 700,
              color: content.accordionQuestionColor ?? "var(--color-text-primary)",
              textTransform: (content.accordionQuestionTransform ?? "uppercase") as React.CSSProperties["textTransform"],
              letterSpacing: "0.04em",
              flex: 1,
            }}>
              {item.question}
            </span>
            <span style={{
              fontSize: "var(--fs-h4)",
              color: content.accordionQuestionColor ?? "var(--color-text-primary)",
              flexShrink: 0,
              transition: "transform 0.2s",
              transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
              display: "inline-block",
            }}>
              &#8964;
            </span>
          </div>
          {openIndex === i && (
            <div style={{
              fontSize: content.accordionAnswerSize ? `${content.accordionAnswerSize}px` : "var(--fs-small)",
              color: content.accordionAnswerColor ?? "var(--color-text-body)",
              paddingBottom: 16,
              lineHeight: 1.6,
            }}>
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
