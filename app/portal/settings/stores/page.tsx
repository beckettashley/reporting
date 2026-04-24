"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Store, ShoppingBag, Check, Loader2, ExternalLink } from "lucide-react";
import type { StoreConnection } from "@/lib/types";

export default function StoresPage() {
  const { state, updateStore } = useOnboarding();
  const { store } = state;

  const [connectModal, setConnectModal] = useState(false);
  const [configureModal, setConfigureModal] = useState<StoreConnection | null>(null);
  const [disconnectConfirm, setDisconnectConfirm] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<"initial" | "authenticating" | "success">("initial");

  const getStatusBadge = (status: StoreConnection["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
            Connected
          </Badge>
        );
      case "syncing":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
            Syncing
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">
            Error
          </Badge>
        );
      case "disconnected":
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
            Disconnected
          </Badge>
        );
    }
  };

  const handleStartAuth = async () => {
    setAuthStep("authenticating");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAuthStep("success");

    const newStore: StoreConnection = {
      id: `store-${Date.now()}`,
      storeUrl: "new-store.myshopify.com",
      status: "connected",
      lastSynced: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
      }),
    };

    updateStore({
      connected: true,
      stores: [...(store.stores || []), newStore],
    });

    setTimeout(() => {
      setConnectModal(false);
      setAuthStep("initial");
    }, 1000);
  };

  const handleCloseModal = () => {
    setConnectModal(false);
    setAuthStep("initial");
  };

  const handleDisconnect = (storeId: string) => {
    const updatedStores = (store.stores || []).filter((s) => s.id !== storeId);
    updateStore({
      connected: updatedStores.length > 0,
      stores: updatedStores,
    });
    setDisconnectConfirm(null);
    setConfigureModal(null);
  };

  const handleRowClick = (storeItem: StoreConnection) => {
    setConfigureModal(storeItem);
  };

  const stores = store.stores || [];

  // If stores exist, show the table view
  if (stores.length > 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Stores</h1>
            <p className="text-muted-foreground mt-1">
              Manage your connected Shopify stores
            </p>
          </div>
          <Button onClick={() => setConnectModal(true)} className="gap-2">
            <Store className="w-4 h-4" />
            Connect Store
          </Button>
        </div>

        <Card className="py-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="h-9 text-xs">Status</TableHead>
                <TableHead className="h-9 text-xs">Store URL</TableHead>
                <TableHead className="h-9 text-xs">Last Synced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((storeItem) => (
                <TableRow
                  key={storeItem.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(storeItem)}
                >
                  <TableCell className="py-2">{getStatusBadge(storeItem.status)}</TableCell>
                  <TableCell className="py-2">
                    <span className="font-medium">{storeItem.storeUrl}</span>
                  </TableCell>
                  <TableCell className="py-2 text-muted-foreground">
                    {storeItem.lastSynced || "Never"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Configure Store Modal */}
        <Dialog open={!!configureModal} onOpenChange={(open) => !open && setConfigureModal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Store Configuration</DialogTitle>
              <DialogDescription>
                Manage settings for this connected store
              </DialogDescription>
            </DialogHeader>

            {configureModal && (
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Store URL</Label>
                  <Input value={configureModal.storeUrl} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>{getStatusBadge(configureModal.status)}</div>
                </div>

                <div className="space-y-2">
                  <Label>Last Synced</Label>
                  <p className="text-sm text-muted-foreground">
                    {configureModal.lastSynced || "Never"}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <a
                      href={`https://${configureModal.storeUrl}/admin`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Shopify Admin
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="destructive"
                onClick={() => configureModal && setDisconnectConfirm(configureModal.id)}
              >
                Disconnect
              </Button>
              <Button variant="outline" onClick={() => setConfigureModal(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disconnect Confirmation */}
        <AlertDialog open={!!disconnectConfirm} onOpenChange={(open) => !open && setDisconnectConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect Store?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the store connection. You can reconnect it at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => disconnectConfirm && handleDisconnect(disconnectConfirm)}
              >
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Connect Modal */}
        <Dialog open={connectModal} onOpenChange={(open) => !open && handleCloseModal()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Connect Shopify Store
              </DialogTitle>
              <DialogDescription>
                Sign in to your Shopify account to connect your store.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              {authStep === "initial" && (
                <div className="space-y-4">
                  <Button
                    className="w-full h-12 bg-[#96bf48] text-white hover:bg-[#96bf48]/90"
                    onClick={handleStartAuth}
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Sign in with Shopify
                  </Button>
                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    You&apos;ll be redirected to Shopify to authorize
                  </p>
                </div>
              )}

              {authStep === "authenticating" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-[#96bf48] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Connecting to Shopify...</p>
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
                      Your Shopify store is now linked
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
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If no stores connected, show the setup UI
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Connect Your Store</h1>
        <p className="text-muted-foreground mt-1">
          Connect your Shopify store to sync products and orders
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-medium">Shopify</p>
              <p className="text-sm text-muted-foreground">
                Sync products and orders from your store
              </p>
            </div>
          </div>
          <Button onClick={() => setConnectModal(true)}>
            Connect
          </Button>
        </div>
      </Card>

      {/* Connect Modal */}
      <Dialog open={connectModal} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Connect Shopify Store
            </DialogTitle>
            <DialogDescription>
              Sign in to your Shopify account to connect your store.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {authStep === "initial" && (
              <div className="space-y-4">
                <Button
                  className="w-full h-12 bg-[#96bf48] text-white hover:bg-[#96bf48]/90"
                  onClick={handleStartAuth}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Sign in with Shopify
                </Button>
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  You&apos;ll be redirected to Shopify to authorize
                </p>
              </div>
            )}

            {authStep === "authenticating" && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-[#96bf48] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Connecting to Shopify...</p>
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
                    Your Shopify store is now linked
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
