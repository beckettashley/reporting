"use client";

import { useOnboarding } from "@/lib/onboarding-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";

const INTEGRATIONS = [
  { key: "stripe" as const, label: "Stripe", description: "Accept payments" },
  { key: "paypal" as const, label: "PayPal", description: "PayPal checkout" },
  { key: "taxjar" as const, label: "TaxJar", description: "Tax compliance" },
];

export default function IntegrationsSettingsPage() {
  const { state, updateIntegrations } = useOnboarding();
  const { integrations } = state;

  const toggleIntegration = (key: keyof typeof integrations) => {
    updateIntegrations({ [key]: !integrations[key] });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect and manage your third-party integrations.
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {INTEGRATIONS.map((integration) => {
          const connected = integrations[integration.key];
          return (
            <Card key={integration.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{integration.label}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                  {connected && (
                    <Badge className="bg-foreground text-background">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant={connected ? "outline" : "default"}
                  onClick={() => toggleIntegration(integration.key)}
                >
                  {connected ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
