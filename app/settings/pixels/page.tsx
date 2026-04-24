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

// All available pixel integrations - matching wizard
const TRACKING_INTEGRATIONS = [
  {
    id: "meta-pixel",
    name: "Meta",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/logos/meta.png" alt="Meta" className="w-4 h-4 object-contain" />
    ),
    iconBg: "bg-background border",
    iconColor: "",
    required: true,
  },
  {
    id: "applovin",
    name: "AppLovin",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 1 1 0 14A7 7 0 0 1 12 5zm-1 3v8l6-4-6-4z"/>
      </svg>
    ),
    iconBg: "bg-blue-600/10",
    iconColor: "text-blue-700",
  },
  {
    id: "google",
    name: "Google",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/logos/google-ads.png" alt="Google" className="w-4 h-4 object-contain" />
    ),
    iconBg: "bg-background border",
    iconColor: "",
    dualInput: true,
  },
  {
    id: "pinterest-tag",
    name: "Pinterest",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" fill="#E60023"/>
      </svg>
    ),
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600",
  },
  {
    id: "snapchat-pixel",
    name: "Snapchat",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/logos/snapchat.jpg" alt="Snapchat" className="w-4 h-4 object-contain" />
    ),
    iconBg: "bg-background border",
    iconColor: "",
  },
  {
    id: "tiktok-pixel",
    name: "TikTok",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
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

export default function PixelsSettingsPage() {
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
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Pixels</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your tracking pixels and conversion events.
        </p>
      </div>

      <div className="space-y-6">
        {/* Search and Custom Request Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search integrations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => setCustomRequestModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Custom Tracking
          </Button>
        </div>

        {/* All Integrations Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
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
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          {activeIntegration && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${activeIntegration.iconBg} ${activeIntegration.iconColor}`}>
                    {activeIntegration.icon}
                  </div>
                  Configure {activeIntegration.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Configure {activeIntegration.name} tracking
                </DialogDescription>
              </DialogHeader>

              {configureModal === "meta-pixel" ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Pixel</Label>
                  {availablePixels.length > 0 ? (
                    <Select 
                      value={tracking.metaPixelId || ""} 
                      onValueChange={(value) => updateTracking({ metaPixelId: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a pixel..." />
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

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfigureModal(null)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSaveConfiguration}>
                  Save Configuration
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Request Modal */}
      <Dialog open={customRequestModal} onOpenChange={(open) => !open && setCustomRequestModal(false)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Request Custom Pixel</DialogTitle>
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
