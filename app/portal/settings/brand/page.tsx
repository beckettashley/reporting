"use client";

import { useState, useRef } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Check } from "lucide-react";

export default function BrandSettingsPage() {
  const { state, updateTheme } = useOnboarding();
  const { theme } = state;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTheme({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTheme({ favicon: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Brand Settings</h1>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Logo & Favicon */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brand Identity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Logo */}
            <div className="flex flex-col gap-2">
              <Label>Logo</Label>
              <div className="flex items-start gap-4">
                <div
                  className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {theme.logo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={theme.logo}
                        alt="Logo"
                        className="w-full h-full object-contain p-2"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 w-6 h-6 bg-background border rounded-full flex items-center justify-center hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTheme({ logo: null });
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">Upload logo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <div className="text-xs text-muted-foreground">
                  <p>Recommended: 400x400px</p>
                  <p>PNG or SVG with transparent background</p>
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div className="flex flex-col gap-2">
              <Label>Favicon</Label>
              <div className="flex items-start gap-4">
                <div
                  className="relative w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                  onClick={() => faviconInputRef.current?.click()}
                >
                  {theme.favicon ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={theme.favicon}
                        alt="Favicon"
                        className="w-full h-full object-contain p-1"
                      />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 w-5 h-5 bg-background border rounded-full flex items-center justify-center hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTheme({ favicon: null });
                        }}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </>
                  ) : (
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFaviconUpload}
                />
                <div className="text-xs text-muted-foreground">
                  <p>32x32px or 64x64px</p>
                  <p>PNG or ICO format</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brand Colors</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={theme.primaryColor || "#000000"}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.primaryColor || "#000000"}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    placeholder="#000000"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={theme.secondaryColor || "#6b7280"}
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.secondaryColor || "#6b7280"}
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                    placeholder="#6b7280"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brand Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brandVoice">Brand Voice / Tone</Label>
              <Input
                id="brandVoice"
                placeholder="e.g. Professional, friendly, conversational"
                defaultValue=""
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="Your brand tagline or slogan"
                defaultValue=""
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : "Save Changes"}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600">Changes saved successfully</span>
          )}
        </div>
      </div>
    </div>
  );
}
