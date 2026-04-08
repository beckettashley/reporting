"use client"

import { BannerConfig, BannerCountdown, SecondaryBanner } from "@/types/banner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "./color-picker"

interface BannerEditorProps {
  config: BannerConfig
  onChange: (config: BannerConfig) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
      <Label htmlFor={id} className="text-xs text-muted-foreground cursor-pointer">{label}</Label>
    </div>
  )
}

export function BannerEditor({ config, onChange }: BannerEditorProps) {
  const update = (updates: Partial<BannerConfig>) => onChange({ ...config, ...updates })
  const updatePrimary = (updates: Partial<typeof config.primary>) =>
    update({ primary: { ...config.primary, ...updates } })
  const updateSecondary = (updates: Partial<SecondaryBanner>) =>
    update({ secondary: { ...config.secondary, ...updates } })
  const updateCountdown = (updates: Partial<BannerCountdown>) =>
    updatePrimary({ countdown: { durationSeconds: 11169, ...config.primary.countdown, ...updates } })

  const hasCountdown = !!config.primary.countdown

  return (
    <div className="flex flex-col space-y-4 p-4">

      {/* Settings */}
      <Section title="Settings">
        <Toggle
          id="banner-enabled"
          checked={config.enabled}
          onChange={(v) => update({ enabled: v })}
          label="Banner enabled"
        />
        <Field label="Position">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["sticky", "static"] as const).map((p) => (
              <button
                key={p}
                onClick={() => update({ position: p })}
                className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors border-r border-border last:border-r-0 ${
                  config.position === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Primary Banner */}
      <Section title="Primary Banner">
        <Field label="Text">
          <Input
            value={config.primary.text}
            onChange={(e) => updatePrimary({ text: e.target.value })}
            placeholder="Announcement text..."
            className="h-8 text-xs"
          />
        </Field>
        <Field label="Icon URL (optional)">
          <Input
            value={config.primary.iconUrl ?? ""}
            onChange={(e) => updatePrimary({ iconUrl: e.target.value || undefined })}
            placeholder="https://..."
            className="h-8 text-xs"
          />
        </Field>
        <Field label="Background">
          <ColorPicker
            value={config.primary.backgroundColor ?? ""}
            onChange={(v) => updatePrimary({ backgroundColor: v })}
          />
        </Field>
        <Field label="Text Color">
          <ColorPicker
            value={config.primary.textColor ?? ""}
            onChange={(v) => updatePrimary({ textColor: v })}
          />
        </Field>

        {/* Countdown */}
        <Toggle
          id="banner-countdown"
          checked={hasCountdown}
          onChange={(v) => updatePrimary({ countdown: v ? { durationSeconds: 11169 } : undefined })}
          label="Enable countdown timer"
        />
        {hasCountdown && config.primary.countdown && (
          <div className="pl-6 space-y-2 border-l-2 border-border">
            <Field label="Duration (seconds)">
              <Input
                type="number"
                value={config.primary.countdown.durationSeconds ?? 11169}
                onChange={(e) => updateCountdown({ durationSeconds: Number(e.target.value) })}
                className="h-8 text-xs"
              />
            </Field>
          </div>
        )}
      </Section>

      {/* Secondary Banner */}
      <Section title="Secondary Banner">
        <Toggle
          id="secondary-enabled"
          checked={config.secondary.enabled}
          onChange={(v) => updateSecondary({ enabled: v })}
          label="Enable secondary banner"
        />
        {config.secondary.enabled && (
          <div className="space-y-2">
            <Field label="Text">
              <Input
                value={config.secondary.text}
                onChange={(e) => updateSecondary({ text: e.target.value })}
                placeholder="Secondary message..."
                className="h-8 text-xs"
              />
            </Field>
            <Field label="Background">
              <ColorPicker value={config.secondary.backgroundColor ?? ""} onChange={(v) => updateSecondary({ backgroundColor: v })} />
            </Field>
            <Field label="Text Color">
              <ColorPicker value={config.secondary.textColor ?? ""} onChange={(v) => updateSecondary({ textColor: v })} />
            </Field>
          </div>
        )}
      </Section>

    </div>
  )
}
