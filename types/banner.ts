export interface BannerCTA {
  text: string
  url: string
  backgroundColor?: string
  textColor?: string
}

export interface BannerCountdown {
  durationSeconds?: number  // total seconds to count down from; default 11169
  targetDate?: string       // legacy ISO 8601 date string (unused — kept for DB compat)
}

export interface PrimaryBanner {
  text: string
  iconUrl?: string
  badgeText?: string           // pill badge rendered inline before the text
  badgeBackgroundColor?: string
  badgeTextColor?: string
  countdown?: BannerCountdown
  cta?: BannerCTA
  backgroundColor?: string
  textColor?: string
}

export interface SecondaryBanner {
  enabled: boolean
  text: string
  backgroundColor?: string
  textColor?: string
}

export interface BannerConfig {
  enabled: boolean
  position: "sticky" | "static"
  primary: PrimaryBanner
  secondary: SecondaryBanner
}

export const createDefaultBanner = (): BannerConfig => ({
  enabled: true,
  position: "sticky",
  primary: {
    text: "🎉 Free shipping on orders over $50 — Shop now",
    backgroundColor: "#1a1a1a",
    textColor: "#ffffff",
  },
  secondary: {
    enabled: false,
    text: "",
    backgroundColor: "#7c3aed",
    textColor: "#ffffff",
  },
})
