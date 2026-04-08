"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { CellContent, ViewportSize } from "@/types/grid"

export function NavBar({ content, viewport }: { content: CellContent; viewport: ViewportSize }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const links = content.navbarLinks ?? []
  const bgColor = content.navbarBackgroundColor || "#ffffff"
  const textColor = content.navbarTextColor || "#000000"
  const hoverColor = content.navbarLinkHoverColor || "#666666"
  const height = content.navbarHeight || 70
  const logoHeight = content.navbarLogoHeight || 40

  const isMobile = viewport === "mobile" || viewport === "tablet"
  const gutter = viewport === "mobile" ? 8 : viewport === "tablet" ? 12 : 16

  return (
    <div style={{
      width: "100%",
      backgroundColor: bgColor,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      position: "relative",
      zIndex: mobileMenuOpen && isMobile ? 200 : "auto",
    }}>
      {/* Main navbar */}
      <div style={{
        width: "100%",
        height,
      }}>
        {/* Inner container - matches "contained" sections */}
        <div style={{
          maxWidth: 1250,
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: gutter,
          paddingRight: gutter,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {content.navbarLogoUrl ? (
              <img
                src={content.navbarLogoUrl}
                alt="Logo"
                style={{ height: logoHeight, width: "auto", display: "block" }}
              />
            ) : (
              <div style={{
                height: logoHeight,
                width: 120,
                backgroundColor: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#9ca3af"
              }}>
                Logo
              </div>
            )}
          </div>

          {/* Desktop Links */}
          {!isMobile && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              marginLeft: "auto",
            }}>
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url || "#"}
                  style={{
                    color: textColor,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = hoverColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = textColor
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Mobile Hamburger */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: textColor,
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown - Absolutely positioned overlay */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          width: "100%",
          backgroundColor: bgColor,
          borderTop: `1px solid ${textColor}15`,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          zIndex: 1,
        }}>
          <div style={{
            maxWidth: 1250,
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: gutter,
            paddingRight: gutter,
            paddingTop: 16,
            paddingBottom: 16,
          }}>
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url || "#"}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  color: textColor,
                  fontSize: 16,
                  fontWeight: 600,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  padding: "12px 0",
                  borderBottom: i < links.length - 1 ? `1px solid ${textColor}10` : "none",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
