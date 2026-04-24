"use client";

import { useOnboarding } from "@/lib/onboarding-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrackingSettingsPage() {
  const { state, updateTracking } = useOnboarding();
  const { tracking } = state;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Tracking Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your tracking pixels and conversion IDs.
        </p>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meta (Facebook) Pixel</CardTitle>
            <CardDescription>
              Track conversions and build audiences for Meta ads.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="metaPixelId">Pixel ID</Label>
              <Input
                id="metaPixelId"
                value={tracking.metaPixelId}
                onChange={(e) => updateTracking({ metaPixelId: e.target.value })}
                placeholder="e.g. 1234567890"
              />
            </div>
            <Button className="w-fit">Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google Ads Conversion</CardTitle>
            <CardDescription>
              Track conversions from your Google Ads campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="googleConversionId">Conversion ID</Label>
              <Input
                id="googleConversionId"
                value={tracking.googleConversionId}
                onChange={(e) => updateTracking({ googleConversionId: e.target.value })}
                placeholder="e.g. AW-1234567890"
              />
            </div>
            <Button className="w-fit">Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Store Subdomain</CardTitle>
            <CardDescription>
              Your custom subdomain for Velocity-hosted pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center gap-0">
                <Input
                  id="subdomain"
                  value={tracking.subdomain}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    updateTracking({ subdomain: val });
                  }}
                  placeholder="your-store"
                  className="rounded-r-none border-r-0"
                />
                <div className="flex items-center px-3 h-9 text-sm text-muted-foreground bg-muted border border-input rounded-r-md">
                  .velocity.com
                </div>
              </div>
            </div>
            <Button className="w-fit">Save</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
