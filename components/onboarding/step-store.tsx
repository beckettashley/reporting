"use client";
// v25
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOnboarding } from "@/lib/onboarding-context";

export default function StepStore() {
  const { state, updateStore } = useOnboarding();
  const { store } = state;

  const [showModal, setShowModal] = useState(false);

  const isConnected = store.connected;

  const handleDisconnect = () => {
    updateStore({ shopifyStoreUrl: "", connected: false });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Store</h2>
        <p className="text-muted-foreground mt-1">
          Placeholder description
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shopify</span>
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_shopify-fNycAPetD7f0SJYKDi3OuCw12r9WmL.svg" alt="Shopify" className="h-7 w-7 object-contain" />
                )}
              </div>
              <div>
                <p className="text-base font-medium">
                  Shopify Store<span className="text-red-500 ml-0.5">*</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? store.shopifyStoreUrl : "Connect your store to sync products"}
                </p>
              </div>
            </div>
            {isConnected ? (
              <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
                Manage
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
                Connect
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_shopify-fNycAPetD7f0SJYKDi3OuCw12r9WmL.svg" alt="Shopify" className="h-5 w-5 object-contain" />
              {isConnected ? "Manage Shopify Store" : "Connect Shopify Store"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Shopify store connection
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex items-center justify-center border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">Placeholder</p>
          </div>

          <div className="flex gap-2">
            {isConnected ? (
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            )}
            <Button className="flex-1" onClick={() => { updateStore({ connected: true, shopifyStoreUrl: "demo.myshopify.com" }); setShowModal(false); }}>
              {isConnected ? "Update" : "Connect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
