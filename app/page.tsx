"use client"

import { useState, useEffect } from "react"
import { GridConfig, createDefaultGridConfig } from "@/types/grid"
// Note: CellMerge removed — grid is now a flat N-cell layout
import { GridPreview } from "@/lib/grid-render"
import { GridEditor } from "@/components/grid/grid-editor"
import { cn } from "@/lib/utils"
import { PanelLeftClose, PanelLeft, Monitor, Smartphone, Tablet, Save, Trash2 } from "lucide-react"

export type ViewportSize = "desktop" | "tablet" | "mobile"

type Preset = { name: string; config: GridConfig }
const STORAGE_KEY = "grid-presets"

function loadUserPresets(): Preset[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistUserPresets(presets: Preset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

const VIEWPORT_WIDTHS: Record<ViewportSize, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1200,
}

const SAMPLE_CONFIGS: { name: string; config: GridConfig }[] = [
  {
    name: "Javvy Article - 11 Reasons Why",
    config: {
      cells: [
        {
          id: "cell-headline",
          width: 100,
          contents: [
            { 
              id: "c1", 
              type: "textBox", 
              text: "<h1>11 Reasons Why This High-Protein Iced Coffee is the #1 Trending Drink for 2026</h1>", 
            },
          ],
          style: { backgroundColor: "#ffffff", borderColor: "#ffffff", borderWidth: 0, borderRadius: 0, padding: 0, textAlign: "left" },
        },
        {
          id: "cell-author",
          width: 100,
          contents: [
            {
              id: "c2",
              type: "articleDetails",
              articleAuthor: "Jade M.",
              articleAuthorImage: "https://assets.javvycoffee.com/66e0a9b786f105ff696cfcb1_ps02-avi.webp",
              articleDate: "Mar 22, 2026",
              articleVariant: "default",
            },
          ],
          style: { backgroundColor: "#ffffff", borderColor: "#ffffff", borderWidth: 0, borderRadius: 0, padding: 0 },
        },
        {
          id: "cell-quote",
          width: 100,
          contents: [
            {
              id: "c3",
              type: "textBox",
              text: "<blockquote><em>\"Read this BEFORE your next coffee run!\"</em></blockquote>",
            },
          ],
          style: { backgroundColor: "#ffffff", borderColor: "#ffffff", borderWidth: 0, borderRadius: 0, padding: 0 },
        },
        {
          id: "cell-comparison",
          width: 100,
          contents: [
            {
              id: "c4",
              type: "productComparison",
              productComparisonProducts: [
                { name: "Javvy", color: "#e8f5f0", logo: "https://assets.javvycoffee.com/673f5ae58cfb1d06dd96a4e3_javvy-blu.svg" },
                { name: "Mainstream Coffees", color: "#fce4ec" },
                { name: "Protein Drinks", color: "#fff3e0" },
              ],
              productComparisonMetrics: [
                { label: "Calories", emoji: "📊", values: ["120cal in 2 scoops", "150-400cal", "160-200cal"] },
                { label: "Protein", emoji: "💪", values: ["20g in 2 scoops", "2-12g", "20g"] },
                { label: "Sugar", emoji: "🍬", values: ["<1g", "20-50g", "5g or artificial sweeteners"] },
                { label: "Price", emoji: "💵", values: ["✓", "😟", "😟"] },
              ],
            },
          ],
          style: { backgroundColor: "#ffffff", borderColor: "#ffffff", borderWidth: 0, borderRadius: 0, padding: 24 },
        },
        {
          id: "cell-tldr",
          width: 100,
          contents: [
            {
              id: "c5",
              type: "textBox",
              text: "<p><strong>TLDR:</strong> Drinking Javvy Protein Coffee has 11+ life changing benefits 👇</p>",
            },
            {
              id: "c5-spacer",
              type: "spacer",
              spacerHeight: 32,
            },
          ],
          style: { backgroundColor: "#ffffff", borderColor: "#ffffff", borderWidth: 0, borderRadius: 0, padding: 0 },
        },
        {
          id: "cell-listicle-1-img",
          width: 40,
          contents: [
            {
              id: "c6",
              type: "video",
              videoUrl: "https://vz-318e2430-7a3.b-cdn.net/6bdd6b94-d2e7-4a48-b249-0f744f657a62/play_480p.mp4",
              videoAutoplay: true,
              videoLoop: true,
              videoControls: false,
              captionText: "<h3>☕ Coffee. Reinvented.</h3>",
              captionBgColor: "#7C3AED",
              captionTextColor: "#FFFFFF",
            },
          ],
          style: { backgroundColor: "#ffffff", borderColor: "#ffffff", borderWidth: 0, borderRadius: 12, padding: 0 },
        },
        {
          id: "cell-listicle-1-text",
          width: 60,
          contents: [
            {
              id: "c7-heading",
              type: "textBox",
              text: "<h2>1. NEW innovative guilt-free formula designed to kick your body into shape</h2>",
            },
            {
              id: "c7-body",
              type: "textBox",
              text: "<p>Javvy created the perfect iced Coffee that works for your body instead of against it. The combination of protein, coffee, and these key functional ingredients are essential to feeling your best, recovering faster, and boosting your youthfulness.*</p>",
            },
          ],
          style: { backgroundColor: "#ffffff", borderColor: "#ffffff", borderWidth: 0, borderRadius: 0, padding: 24, textAlign: "left", alignItems: "center" },
        },
        {
          id: "cell-listicle-2-img",
          width: 40,
          contents: [
            {
              id: "c8",
              type: "video",
              videoUrl: "https://vz-318e2430-7a3.b-cdn.net/f4e9573e-2b2d-4839-a104-70a9c0b291f9/play_480p.mp4",
              videoAutoplay: true,
              videoLoop: true,
              videoControls: false,
              captionText: "<h3>🔒 Craving Control</h3>",
              captionBgColor: "#7C3AED",
              captionTextColor: "#FFFFFF",
            },
          ],
          style: { backgroundColor: "#ffffff", borderColor: "#ffffff", borderWidth: 0, borderRadius: 12, padding: 0 },
        },
        {
          id: "cell-listicle-2-text",
          width: 60,
          contents: [
            {
              id: "c9-heading",
              type: "textBox",
              text: "<h2>2. Beats the sugar cravings to keep you feeling satisfied</h2>",
            },
            {
              id: "c9-body",
              type: "textBox",
              text: "<p>The balanced blend of protein and caffeine works to stabilize blood sugar and energy levels, preventing the sugar crashes that lead to cravings and overeating.</p>",
            },
          ],
          style: { backgroundColor: "#ffffff", borderColor: "#ffffff", borderWidth: 0, borderRadius: 0, padding: 24, textAlign: "left", alignItems: "center" },
        },
      ],
      gridStyle: { backgroundColor: "#ffffff", padding: 32, borderRadius: 0, gap: 24 },
    },
  },
  {
    name: "Wuffes - What Do I Get",
    config: {
      cells: [
        // Row 1: Full width heading + subtitle
        {
          id: "cell-wuffes-heading",
          width: 100,
          contents: [
            {
              id: "cw1-h1",
              type: "textBox",
              text: "<h1 style='color:#ffffff !important; margin:0'>What do I get with Wuffes?</h1>",
            },
            {
              id: "cw1-subtitle",
              type: "textBox",
              text: "<h3 style='color:#ffffff !important; margin:12px 0 0 0; font-size:16px; line-height:1.5; font-weight:400'>Everything you need to support your dog&apos;s joint health - now, and in the months to come.</h3>",
            },
          ],
          style: {
            backgroundColor: "#2A4A3A",
            borderColor: "#2A4A3A",
            borderWidth: 0,
            borderRadius: 0,
            padding: 40,
            textAlign: "center",
            alignItems: "center",
          },
        },
        // Row 2: Left cell - image + text
        {
          id: "cell-wuffes-left",
          width: 50,
          contents: [
            {
              id: "cw2-img",
              type: "image",
              imageUrl: "https://wuffes.com/cdn/shop/files/offer-hc-benefits-left_160x.png?v=18412045986892816936",
              imageAlt: "Wuffes Advanced Hip & Joint Support supplement jar",
            },
            {
              id: "cw2-text",
              type: "textBox",
              text: "<h3 style='color:#ffffff; margin:12px 0 0 0; font-size:18px; font-weight:600'>Wuffes Joint Chews</h3><p style='color:#ffffff; margin:8px 0 0 0; font-size:15px'>Soft chews packed with clinically-proven ingredients</p>",
            },
          ],
          style: {
            backgroundColor: "transparent",
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 0,
            padding: 24,
            textAlign: "center",
            alignItems: "center",
          },
        },
        // Row 2: Right cell - image + text
        {
          id: "cell-wuffes-right",
          width: 50,
          contents: [
            {
              id: "cw3-img",
              type: "image",
              imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OQ4GXw8NNyd0YbpXm68AWrU3Mvc7Ub.png",
              imageAlt: "Veterinarian holding two Yorkshire Terriers",
            },
            {
              id: "cw3-text",
              type: "textBox",
              text: "<h3 style='color:#ffffff; margin:12px 0 0 0; font-size:18px; font-weight:600'>Credible Vet Insights</h3><p style='color:#ffffff; margin:8px 0 0 0; font-size:15px'>Educational resources from our Vet Advisory Board</p>",
            },
          ],
          style: {
            backgroundColor: "transparent",
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 0,
            padding: 24,
            textAlign: "center",
            alignItems: "center",
          },
        },
        // Row 3: Full width CTA button
        {
          id: "cell-wuffes-cta",
          width: 100,
          contents: [
            {
              id: "cw4-btn",
              type: "ctaButton",
              ctaText: "TRY WUFFES",
              ctaUrl: "https://wuffes.com",
              ctaVariant: "primary",
              ctaBackgroundColor: "#A8E63D",
              ctaTextColor: "#1a2e1a",
            },
          ],
          style: {
            backgroundColor: "#2A4A3A",
            borderColor: "#2A4A3A",
            borderWidth: 0,
            borderRadius: 0,
            padding: 24,
            textAlign: "center",
            alignItems: "center",
          },
        },
      ],
      gridStyle: { backgroundColor: "#2A4A3A", padding: 32, borderRadius: 0, gap: 24 },
    },
  },
]

const VIEWPORT_CONFIG = {
  mobile: {
    icon: Smartphone,
    label: "Mobile",
    width: 375,
    frameClass: "rounded-[2rem] border-[6px]",
    showChrome: true,
  },
  tablet: {
    icon: Tablet,
    label: "Tablet",
    width: 768,
    frameClass: "rounded-2xl border-[6px]",
    showChrome: true,
  },
  desktop: {
    icon: Monitor,
    label: "Desktop",
    width: 1200,
    frameClass: "rounded-lg border-2",
    showChrome: false,
  },
}

export default function GridEditorPage() {
  const [config, setConfig] = useState<GridConfig>(SAMPLE_CONFIGS[0].config)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewport, setViewport] = useState<ViewportSize>("desktop")
  const [selectedPreset, setSelectedPreset] = useState("")
  const [userPresets, setUserPresets] = useState<Preset[]>([])

  useEffect(() => {
    setUserPresets(loadUserPresets())
  }, [])

  const vp = VIEWPORT_CONFIG[viewport]

  const savePreset = () => {
    const name = window.prompt("Preset name:")
    if (!name?.trim()) return
    const updated = [...userPresets.filter(p => p.name !== name.trim()), { name: name.trim(), config }]
    setUserPresets(updated)
    persistUserPresets(updated)
    setSelectedPreset(`user:${name.trim()}`)
  }

  const deletePreset = (name: string) => {
    const updated = userPresets.filter(p => p.name !== name)
    setUserPresets(updated)
    persistUserPresets(updated)
    setSelectedPreset("")
  }

  const handlePresetChange = (value: string) => {
    if (value.startsWith("factory:")) {
      const preset = SAMPLE_CONFIGS.find(c => c.name === value.slice(8))
      if (preset) { setConfig(preset.config); setSelectedPreset(value) }
    } else if (value.startsWith("user:")) {
      const preset = userPresets.find(p => p.name === value.slice(5))
      if (preset) { setConfig(preset.config); setSelectedPreset(value) }
    }
  }

  const selectedIsUserPreset = selectedPreset.startsWith("user:")

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            aria-label={sidebarOpen ? "Close editor" : "Open editor"}
          >
            {sidebarOpen
              ? <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
              : <PanelLeft className="h-4 w-4 text-muted-foreground" />
            }
          </button>
          <div className="h-5 w-px bg-border" />
          <span className="text-sm font-semibold text-foreground">Grid Editor</span>
          <span className="hidden sm:block text-xs text-muted-foreground">— Headless CMS Component Demo</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Switcher */}
          <div className="flex items-center bg-muted border border-border rounded-lg p-1 gap-0.5">
            {(Object.entries(VIEWPORT_CONFIG) as [ViewportSize, typeof vp][]).map(([key, val]) => {
              const Icon = val.icon
              return (
                <button
                  key={key}
                  onClick={() => setViewport(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                    viewport === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title={`${val.label} (${val.width}px)`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{val.label}</span>
                </button>
              )
            })}
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5">
            <select
              className="h-8 px-2.5 text-xs bg-muted border border-border rounded-lg text-foreground"
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              <option value="" disabled>Load Preset</option>
              <optgroup label="Factory">
                {SAMPLE_CONFIGS.map((preset) => (
                  <option key={preset.name} value={`factory:${preset.name}`}>{preset.name}</option>
                ))}
              </optgroup>
              {userPresets.length > 0 && (
                <optgroup label="Saved">
                  {userPresets.map((preset) => (
                    <option key={preset.name} value={`user:${preset.name}`}>{preset.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
            <button
              onClick={savePreset}
              className="h-8 px-2.5 flex items-center gap-1.5 text-xs bg-muted border border-border rounded-lg text-foreground hover:bg-background transition-colors"
              title="Save current config as preset"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
            {selectedIsUserPreset && (
              <button
                onClick={() => deletePreset(selectedPreset.slice(5))}
                className="h-8 px-2 flex items-center text-destructive hover:bg-destructive/10 border border-destructive/30 rounded-lg transition-colors"
                title="Delete this preset"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Editor Sidebar */}
        <aside
          className={cn(
            "border-r border-border bg-card transition-[width] duration-300 overflow-hidden shrink-0",
            sidebarOpen ? "w-[360px]" : "w-0"
          )}
        >
          <div className="w-[360px] h-full overflow-y-auto">
            <GridEditor config={config} onChange={setConfig} />
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 overflow-auto bg-muted/40 flex flex-col">

          {/* Viewport Label Bar */}
          <div className="shrink-0 flex items-center justify-center gap-3 py-2.5 border-b border-border bg-card/60">
            <vp.icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">{vp.label}</span>
            <span className="text-xs text-muted-foreground opacity-50">{vp.width}px</span>
          </div>

          {/* Scrollable Preview Canvas */}
          <div className="flex-1 overflow-auto p-6 flex justify-center">
            <DeviceFrame viewport={viewport}>
              {/* Simulated page context */}
              <div className="bg-background min-h-full">
                {/* Fake page nav */}
                <div className="h-10 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
                  <div className="h-2 w-16 bg-muted-foreground/20 rounded-full" />
                  <div className="flex-1" />
                  <div className="h-2 w-8 bg-muted-foreground/20 rounded-full" />
                  <div className="h-2 w-8 bg-muted-foreground/20 rounded-full" />
                  <div className="h-2 w-12 bg-muted-foreground/20 rounded-full" />
                </div>

                {/* Page body */}
                <div className="p-5 space-y-5">
                  {/* Hero text placeholder */}
                  <div className="space-y-2">
                    <div className="h-5 bg-muted-foreground/10 rounded-full w-3/4" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-full" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-5/6" />
                  </div>

                  {/* The actual live grid component */}
                  <div className="relative">
                    <div className="absolute -top-2 -left-1 text-[9px] font-mono text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded z-10">
                      &lt;Grid /&gt;
                    </div>
                    <GridPreview config={config} viewport={viewport} />
                  </div>

                  {/* Body text placeholder */}
                  <div className="space-y-2">
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-full" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-4/5" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-full" />
                    <div className="h-3 bg-muted-foreground/10 rounded-full w-3/4" />
                  </div>
                </div>
              </div>
            </DeviceFrame>
          </div>
        </main>
      </div>
    </div>
  )
}

// Device frame wrapper
function DeviceFrame({ viewport, children }: { viewport: ViewportSize; children: React.ReactNode }) {
  const vp = VIEWPORT_CONFIG[viewport]

  if (viewport === "desktop") {
    return (
      <div className="w-full max-w-[1200px]">
        <div className={cn("border border-border bg-background overflow-hidden", vp.frameClass)}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn("border-border bg-card overflow-hidden shadow-2xl", vp.frameClass)}
        style={{ width: vp.width, maxWidth: "100%" }}
      >
        {/* Device chrome top bar */}
        <div className="h-6 bg-card flex items-center justify-center shrink-0">
          {viewport === "mobile" && (
            <div className="h-1 w-20 bg-muted-foreground/30 rounded-full" />
          )}
          {viewport === "tablet" && (
            <div className="h-1 w-10 bg-muted-foreground/20 rounded-full" />
          )}
        </div>
        {/* Screen */}
        <div className="bg-background overflow-y-auto" style={{ maxHeight: viewport === "mobile" ? 720 : 900 }}>
          {children}
        </div>
        {/* Device chrome bottom bar */}
        {viewport === "mobile" && (
          <div className="h-5 bg-card flex items-center justify-center shrink-0">
            <div className="h-1 w-24 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}
