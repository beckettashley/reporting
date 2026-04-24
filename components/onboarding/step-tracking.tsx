"use client";

import { useState, useMemo } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Send, Loader2, Settings } from "lucide-react";

// All available pixel integrations
const TRACKING_INTEGRATIONS = [
  {
    id: "meta-pixel",
    name: "Meta",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_meta-P27ninycSmuKN9UhxVKuXv4K4DoF5G.png" alt="Meta" className="w-4 h-4 object-contain" />
    ),
    iconBg: "bg-background border",
    iconColor: "",
    required: true,
  },
  {
    id: "applovin",
    name: "AppLovin",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_app-lovin-2UnKvCC9k9dWiPgcDEVOymgIFJDM7y.png" alt="AppLovin" className="w-4 h-4 object-contain" />
    ),
    iconBg: "bg-blue-600/10",
    iconColor: "text-blue-700",
  },
  {
    id: "google",
    name: "Google",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_google-ads-uAj9FGtOlFcwZ5OOyXbJ2oy4HVZrs0.png" alt="Google" className="w-4 h-4 object-contain" />
    ),
    iconBg: "bg-background border",
    iconColor: "",
    dualInput: true,
  },
  {
    id: "pinterest-tag",
    name: "Pinterest",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_pinterest-VCxQuSoAWP6ltgxLMhKUxPSCQauWln.png" alt="Pinterest" className="w-4 h-4 object-contain" />
    ),
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600",
  },
  {
    id: "snapchat-pixel",
    name: "Snapchat",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_snapchat-RNOpV0daUDk3ym7U6RPDMZq7nyfyaM.avif" alt="Snapchat" className="w-4 h-4 object-contain" />
    ),
    iconBg: "bg-background border",
    iconColor: "",
  },
  {
    id: "tiktok-pixel",
    name: "TikTok",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_tiktok-CRl0V9qqsOo9qYV2KCjuY1UGsTrO6q.webp" alt="TikTok" className="w-4 h-4 object-contain" />
    ),
    iconBg: "bg-black/10",
    iconColor: "text-foreground",
  },
];

type IntegrationStatus = "not-configured" | "pending";

interface ConfiguredIntegration {
  id: string;
  status: IntegrationStatus;
}

export default function StepPixels() {
  const { state, updateTracking } = useOnboarding();
  const { tracking, adAccount } = state;
  const [search, setSearch] = useState("");
  const [configureModal, setConfigureModal] = useState<string | null>(null);
  const [customRequestModal, setCustomRequestModal] = useState(false);
  const [customRequest, setCustomRequest] = useState({ platform: "", details: "" });
  const [submitting, setSubmitting] = useState(false);

  // Get available pixels from ad account (with mock data for demo)
  const availablePixels = adAccount?.pixels || [
    { id: "123456789012345", name: "Main Website Pixel" },
    { id: "234567890123456", name: "Landing Page Pixel" },
    { id: "345678901234567", name: "Checkout Pixel" },
  ];

  // Get configured status from tracking state
  const configuredIntegrations: ConfiguredIntegration[] = tracking?.integrations?.map(i => ({
    id: i.id,
    status: "pending" as IntegrationStatus,
  })) || [];

  const customRequests = tracking?.customRequests || [];

  const getStatus = (integrationId: string): IntegrationStatus => {
    // Special case for Meta Pixel - check metaPixelId
    if (integrationId === "meta-pixel") {
      return tracking.metaPixelId ? "pending" : "not-configured";
    }
    const configured = configuredIntegrations.find(c => c.id === integrationId);
    return configured?.status || "not-configured";
  };

  const handleConfigure = (integrationId: string) => {
    setConfigureModal(integrationId);
  };

  const handleSaveConfiguration = () => {
    if (!configureModal) return;
    const integration = TRACKING_INTEGRATIONS.find((i) => i.id === configureModal);
    if (!integration) return;

    const existingIntegrations = tracking?.integrations || [];
    
    // Only add if not already configured
    if (!existingIntegrations.some((i) => i.id === configureModal)) {
      updateTracking({
        integrations: [
          ...existingIntegrations,
          { id: configureModal, name: integration.name, enabled: true, configValue: "", status: "pending" },
        ],
      });
    }
    setConfigureModal(null);
  };

  const handleSubmitCustomRequest = async () => {
    if (!customRequest.platform.trim()) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newCustom = {
      id: `custom-${Date.now()}`,
      name: customRequest.platform,
      enabled: false,
      configValue: customRequest.details,
      status: "pending" as const,
      isCustom: true,
    };
    
    updateTracking({
      customRequests: [...customRequests, newCustom],
    });
    
    setSubmitting(false);
    setCustomRequestModal(false);
    setCustomRequest({ platform: "", details: "" });
  };

  const handleRemoveCustomRequest = (id: string) => {
    updateTracking({
      customRequests: customRequests.filter((r) => r.id !== id),
    });
  };

  // Filter integrations by search
  const filteredIntegrations = useMemo(() => {
    if (search === "") return TRACKING_INTEGRATIONS;
    return TRACKING_INTEGRATIONS.filter((int) =>
      int.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const activeIntegration = TRACKING_INTEGRATIONS.find((i) => i.id === configureModal);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Pixels</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure tracking pixels for your advertising platforms.
          </p>
        </div>
        <Button variant="outline" onClick={() => setCustomRequestModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Custom
        </Button>
      </div>

      {/* All Integrations Table */}
      <div className="flex-1 min-h-0 flex flex-col w-full">
        <div className="flex-1 overflow-auto border rounded-lg w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-9 text-xs w-[140px]">Status</TableHead>
              <TableHead className="h-9 text-xs">Platform</TableHead>
              <TableHead className="h-9 text-xs w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIntegrations.map((integration) => {
              const status = getStatus(integration.id);
              return (
                <TableRow key={integration.id}>
                  <TableCell className="py-2">
                    {status === "pending" ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                        Not Configured
                      </Badge>
                    )}
                  </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded ${integration.iconBg} ${integration.iconColor}`}>
                          {integration.icon}
                        </div>
                        <span className="text-sm font-medium">{integration.name}</span>
                        {integration.required && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  <TableCell className="py-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleConfigure(integration.id)}
                    >
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Custom Requests in same table */}
            {customRequests.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="py-2">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                    Pending
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground">
                      <Settings className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                    <Badge variant="secondary" className="text-xs">Custom</Badge>
                  </div>
                </TableCell>
                <TableCell className="py-2 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleRemoveCustomRequest(item.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>

        {filteredIntegrations.length === 0 && customRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No integrations found matching your search.
          </div>
        )}
      </div>

      {/* Configure Modal */}
      <Dialog open={!!configureModal} onOpenChange={(open) => !open && setConfigureModal(null)}>
        <DialogContent className="sm:max-w-3xl h-[450px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Configure {TRACKING_INTEGRATIONS.find(i => i.id === configureModal)?.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Configure settings for {TRACKING_INTEGRATIONS.find(i => i.id === configureModal)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-2">
            {configureModal === "meta-pixel" ? (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Pixel</Label>
                {availablePixels.length > 0 ? (
                  <Select 
                    value={tracking.metaPixelId || ""} 
                    onValueChange={(value) => updateTracking({ metaPixelId: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a pixel...">
                        {tracking.metaPixelId ? (() => {
                          const selectedPixel = availablePixels.find(p => p.id === tracking.metaPixelId);
                          return selectedPixel ? <span className="whitespace-nowrap">{selectedPixel.name} ({selectedPixel.id})</span> : "Select a pixel...";
                        })() : "Select a pixel..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {availablePixels.map((pixel) => (
                        <SelectItem key={pixel.id} value={pixel.id} className="w-full py-3">
                          <div className="flex flex-col items-start w-full gap-1">
                            <span className="font-medium">{pixel.name}</span>
                            <span className="text-xs text-muted-foreground">Pixel ID: {pixel.id}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground bg-muted rounded-md p-3 border">
                    Connect your Meta Ad Account first to see available pixels
                  </div>
                )}
              </div>
            ) : configureModal === "google" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Google Ads Conversion ID</Label>
                  <Input placeholder="Enter your Google Ads Conversion ID" />
                </div>
                <div className="space-y-2">
                  <Label>GA4 Measurement ID</Label>
                  <Input placeholder="Enter your GA4 Measurement ID" />
                </div>
              </div>
            ) : (
              <div className="py-6 flex items-center justify-center border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Configuration placeholder</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setConfigureModal(null)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveConfiguration}
              disabled={configureModal === "meta-pixel" && !tracking.metaPixelId}
            >
              Save & Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Request Modal */}
      <Dialog open={customRequestModal} onOpenChange={(open) => !open && setCustomRequestModal(false)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Request Custom Tracking</DialogTitle>
            <DialogDescription>
              Need a platform we don&apos;t support yet? Submit a request and we&apos;ll set it up.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                placeholder="e.g. Taboola, Outbrain, Reddit Ads"
                value={customRequest.platform}
                onChange={(e) => setCustomRequest({ ...customRequest, platform: e.target.value })}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="request-details">Details</Label>
              <Textarea
                id="request-details"
                placeholder="Paste your tracking pixel code, event scripts, or any specific requirements here..."
                value={customRequest.details}
                onChange={(e) => setCustomRequest({ ...customRequest, details: e.target.value })}
                rows={24}
                className="font-mono text-sm min-h-[500px]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setCustomRequestModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmitCustomRequest}
              disabled={!customRequest.platform.trim() || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
