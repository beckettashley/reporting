"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOnboarding } from "@/lib/onboarding-context";

const MetaIcon = ({ className }: { className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_meta-P27ninycSmuKN9UhxVKuXv4K4DoF5G.png" alt="Meta" className={className} />
);

export default function StepAdAccount() {
  const { state, updateAdAccount } = useOnboarding();
  const [showModal, setShowModal] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = state.adAccount?.connected ?? false;

  const handleConnect = async () => {
    if (!accountId.trim()) return;
    
    setIsConnecting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateAdAccount({ connected: true, accountId: accountId.trim() });
    setIsConnecting(false);
    setShowModal(false);
    setAccountId("");
  };

  const handleDisconnect = () => {
    updateAdAccount({ connected: false, accountId: "" });
    setAccountId("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Ad Account</h2>
        <p className="text-muted-foreground mt-1">
          Placeholder description
        </p>
      </div>

      {/* Ad Account section header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Meta Business</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Card
          className={`p-4 transition-colors ${
            isConnected ? "border-emerald-500 bg-emerald-500/5" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  isConnected
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isConnected ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <MetaIcon className="h-7 w-7 object-contain" />
                )}
              </div>
              <div>
                <p className="text-base font-medium">
                  Meta Ad Account<span className="text-red-500 ml-0.5">*</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? "Connected" : "Connect Facebook & Instagram ads"}
                </p>
              </div>
            </div>
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
              >
                Manage
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
              >
                Connect
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Connection Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MetaIcon className="h-5 w-5 object-contain" />
              {isConnected ? "Meta Ad Account" : "Connect Meta"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Meta ad account connection
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex items-center justify-center border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">Placeholder</p>
          </div>

          <div className="flex gap-2">
            {isConnected ? (
              <Button variant="outline" size="sm" onClick={() => { updateAdAccount({ connected: false, accountId: "" }); setShowModal(false); }}>
                Disconnect
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            )}
            <Button className="flex-1" onClick={() => { 
              updateAdAccount({ 
                connected: true, 
                accountId: "demo",
                pixels: [
                  { id: "123456789012345", name: "Main Website Pixel" },
                  { id: "234567890123456", name: "Landing Page Pixel" },
                  { id: "345678901234567", name: "Checkout Pixel" },
                ]
              }); 
              setShowModal(false); 
            }}>
              {isConnected ? "Update" : "Connect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
