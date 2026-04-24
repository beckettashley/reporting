"use client";
// v25
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
  CreditCard,
  Wallet,
  Check,
} from "lucide-react";

type IntegrationId = "stripe" | "paypal" | "taxjar";

interface IntegrationConfig {
  id: IntegrationId;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  brandColor: string;
  textColor: string;
  customIcon?: React.ReactNode;
  optional?: boolean;
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept credit card payments securely",
    icon: CreditCard,
    brandColor: "bg-muted",
    textColor: "text-foreground",
    // eslint-disable-next-line @next/next/no-img-element
    customIcon: <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_stripe-xKrEIBdHpc0rw5qHMaryOnR7MF9Hs3.webp" alt="Stripe" className="h-8 w-8 object-contain rounded-md" />,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Enable PayPal checkout for customers",
    icon: Wallet,
    brandColor: "bg-muted",
    textColor: "text-foreground",
    // eslint-disable-next-line @next/next/no-img-element
    customIcon: <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_paypal-4PFmdIke3zTAaEfFTzt64c24iSQeHF.svg" alt="PayPal" className="h-8 w-8 object-contain" />,
  },
  {
    id: "taxjar",
    name: "TaxJar",
    description: "Automated sales tax compliance and reporting",
    icon: CreditCard,
    brandColor: "bg-muted",
    textColor: "text-foreground",
    optional: true,
    // eslint-disable-next-line @next/next/no-img-element
    customIcon: <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_taxjar-Y40zvvAT67fHXzQ7cAZQuYOGp1nuSj.png" alt="TaxJar" className="h-8 w-8 object-contain rounded-lg" />,
  },
];

export default function StepIntegrations() {
  const { state, updateIntegrations } = useOnboarding();
  const { integrations } = state;

  const [activeModal, setActiveModal] = useState<IntegrationId | null>(null);

  const handleOpenModal = (id: IntegrationId) => {
    setActiveModal(id);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleDisconnect = (id: IntegrationId) => {
    updateIntegrations({ [id]: false });
  };

  const activeIntegration = INTEGRATIONS.find((i) => i.id === activeModal);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Payment</h2>
        <p className="text-muted-foreground mt-1">
          Placeholder description
        </p>
      </div>

      {/* Payment Processors */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Processors</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        {INTEGRATIONS.filter((i) => !i.optional).map((integration) => {
          const Icon = integration.icon;
          const isEnabled = integrations[integration.id];

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
                    className={`flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden ${
                      isEnabled ? "bg-emerald-500 text-white" : "bg-background border"
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
                    <p className="text-base font-medium">
                      {integration.name}
                      {!integration.optional && <span className="text-red-500 ml-0.5">*</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isEnabled ? "Connected" : integration.description}
                    </p>
                  </div>
                </div>
                {isEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(integration.id)}
                  >
                    Manage
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

      {/* Tax integrations - optional */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Taxes</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        {INTEGRATIONS.filter((i) => i.optional).map((integration) => {
          const Icon = integration.icon;
          const isEnabled = integrations[integration.id];

          return (
            <Card
              key={integration.id}
              className={`p-4 transition-colors ${
                isEnabled ? "border-emerald-500 bg-emerald-500/5" : "border-dashed"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden ${
                      isEnabled ? "bg-emerald-500 text-white" : "bg-background border"
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
                    onClick={() => handleOpenModal(integration.id)}
                  >
                    Manage
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
                <DialogDescription className="sr-only">
                  Connect {activeIntegration.name} integration
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 flex items-center justify-center border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Placeholder</p>
              </div>

              <div className="flex gap-2">
                {integrations[activeIntegration.id] ? (
                  <Button variant="outline" size="sm" onClick={() => { handleDisconnect(activeIntegration.id); handleCloseModal(); }}>
                    Disconnect
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                )}
                <Button className="flex-1" onClick={() => { updateIntegrations({ [activeIntegration.id]: true }); handleCloseModal(); }}>
                  {integrations[activeIntegration.id] ? "Update" : "Connect"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
