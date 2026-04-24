"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingBag,
  CreditCard,
  Wallet,
  BarChart3,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";

type IntegrationId = "shopify" | "stripe" | "paypal" | "googleAds" | "meta";

interface IntegrationConfig {
  id: IntegrationId;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  brandColor: string;
  textColor: string;
  customIcon?: React.ReactNode;
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: "shopify",
    name: "Shopify",
    description: "Sync products and orders from your store",
    icon: ShoppingBag,
    brandColor: "bg-[#96bf48]",
    textColor: "text-white",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept credit card payments securely",
    icon: CreditCard,
    brandColor: "bg-[#635bff]",
    textColor: "text-white",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Enable PayPal checkout for customers",
    icon: Wallet,
    brandColor: "bg-[#003087]",
    textColor: "text-white",
  },
  {
    id: "googleAds",
    name: "Google Ads",
    description: "Track conversions and optimize campaigns",
    icon: BarChart3,
    brandColor: "bg-[#4285f4]",
    textColor: "text-white",
  },
  {
    id: "meta",
    name: "Meta",
    description: "Connect Facebook & Instagram ad accounts",
    icon: BarChart3,
    brandColor: "bg-[#0866ff]",
    textColor: "text-white",
    customIcon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.001 2.002c-5.522 0-9.999 4.477-9.999 9.999 0 4.99 3.656 9.126 8.437 9.879v-6.988h-2.54v-2.891h2.54V9.798c0-2.508 1.493-3.891 3.776-3.891 1.094 0 2.24.195 2.24.195v2.459h-1.264c-1.24 0-1.628.772-1.628 1.563v1.875h2.771l-.443 2.891h-2.328v6.988C18.344 21.129 22 16.992 22 12.001c0-5.522-4.477-9.999-9.999-9.999z"/>
      </svg>
    ),
  },
];

export default function StepIntegrations() {
  const { state, updateIntegrations } = useOnboarding();
  const { integrations } = state;

  const [activeModal, setActiveModal] = useState<IntegrationId | null>(null);
  const [authStep, setAuthStep] = useState<"initial" | "authenticating" | "success">("initial");

  const handleOpenModal = (id: IntegrationId) => {
    setAuthStep("initial");
    setActiveModal(id);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setAuthStep("initial");
  };

  const handleStartAuth = async () => {
    setAuthStep("authenticating");
    // Simulate OAuth redirect and callback
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAuthStep("success");
    if (activeModal) {
      updateIntegrations({ [activeModal]: true });
    }
    // Auto-close after success
    setTimeout(() => {
      handleCloseModal();
    }, 1000);
  };

  const handleDisconnect = (id: IntegrationId) => {
    updateIntegrations({ [id]: false });
  };

  const enabledCount = Object.values(integrations).filter(Boolean).length;
  const activeIntegration = INTEGRATIONS.find((i) => i.id === activeModal);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground mt-1">
          Connect your payment processors and marketing platforms
        </p>
      </div>

      <div className="grid gap-4">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon;
          const isEnabled = (integrations as unknown as Record<string, boolean>)[integration.id] ?? false;

          return (
            <Card
              key={integration.id}
              className={`p-4 transition-colors ${
                isEnabled ? "border-emerald-500 bg-emerald-500/5" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      isEnabled
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isEnabled ? (
                      <Check className="h-6 w-6" />
                    ) : integration.customIcon ? (
                      integration.customIcon
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-base font-medium">{integration.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {isEnabled ? "Connected" : integration.description}
                    </p>
                  </div>
                </div>
                {isEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(integration.id)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(integration.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        {enabledCount} integration{enabledCount !== 1 ? "s" : ""} connected
      </p>

      {/* OAuth Modal */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          {activeIntegration && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {activeIntegration.customIcon ?? <activeIntegration.icon className="h-5 w-5" />}
                  Connect {activeIntegration.name}
                </DialogTitle>
                <DialogDescription>
                  Sign in to your {activeIntegration.name} account to connect it with Velocity.
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                {authStep === "initial" && (
                  <div className="space-y-4">
                    <Button
                      className={`w-full h-12 ${activeIntegration.brandColor} ${activeIntegration.textColor} hover:opacity-90`}
                      onClick={handleStartAuth}
                    >
                      <activeIntegration.icon className="mr-2 h-5 w-5" />
                      Sign in with {activeIntegration.name}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      You&apos;ll be redirected to {activeIntegration.name} to authorize
                    </p>
                  </div>
                )}

                {authStep === "authenticating" && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className={`h-16 w-16 rounded-full ${activeIntegration.brandColor} flex items-center justify-center`}>
                      <Loader2 className={`h-8 w-8 animate-spin ${activeIntegration.textColor}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Connecting to {activeIntegration.name}...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please complete authentication in the popup window
                      </p>
                    </div>
                  </div>
                )}

                {authStep === "success" && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-emerald-600">Successfully connected!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your {activeIntegration.name} account is now linked
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {authStep === "initial" && (
                <div className="border-t pt-4">
                  <Button variant="ghost" className="w-full" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
