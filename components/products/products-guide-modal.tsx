"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProductsGuideModalHandle {
  open: () => void;
}

interface ProductsGuideModalProps {
  startVisible?: boolean;
  onStepChange?: (step: number) => void;
  onDismiss?: () => void;
}

export const ProductsGuideModal = forwardRef<ProductsGuideModalHandle, ProductsGuideModalProps>(
  function ProductsGuideModal({ startVisible = false, onStepChange, onDismiss }, ref) {
    const [modalStep, setModalStep] = useState(0);
    const [modalVisible, setModalVisible] = useState(startVisible);
    const [modalFading, setModalFading] = useState(false);
    const [modalReady, setModalReady] = useState(false);

    useEffect(() => {
      if (!startVisible) return;
      const t = setTimeout(() => setModalReady(true), 50);
      return () => clearTimeout(t);
    }, [startVisible]);

    const dismissModal = () => {
      onStepChange?.(-1);
      setModalFading(true);
      setTimeout(() => {
        setModalVisible(false);
        setModalFading(false);
        onDismiss?.();
      }, 300);
    };

    const openModal = () => {
      setModalStep(0);
      setModalFading(false);
      setModalVisible(true);
      setTimeout(() => setModalReady(true), 50);
    };

    const advanceModal = (toStep: number) => {
      if (!modalVisible) return;
      if (toStep >= 3) {
        dismissModal();
        return;
      }
      setModalStep(toStep);
      onStepChange?.(toStep);
    };

    useImperativeHandle(ref, () => ({ open: openModal }));

    const opacity = modalFading ? 0 : modalReady && modalVisible ? 1 : 0;

    return (
      <>
        {modalVisible && (
          <div
            className={`fixed bottom-[73px] z-50 w-96 bg-background border-2 border-black rounded-xl shadow-lg p-5 flex flex-col gap-4 ${
              modalStep === 2 ? "left-6" : "right-6"
            }`}
            style={{
              transition: "opacity 0.4s ease",
              opacity,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step indicator */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((s) => (
                <div
                  key={s}
                  className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: s <= modalStep ? "black" : "#e5e7eb" }}
                />
              ))}
            </div>

            {/* Step 0 — Products */}
            {modalStep === 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-base font-semibold tracking-tight">Select your products</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  The products you select will be used to create strategic offers to maximize revenue.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Choose up to 20 products — your best sellers, products customers buy together, and anything you&apos;d recommend alongside a purchase.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>We recommend 5–10 products</strong>; a focused selection will perform better than your full catalog.
                </p>
              </div>
            )}

            {/* Step 1 — Variants */}
            {modalStep === 1 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-base font-semibold tracking-tight">Select Variants</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  For each product you&apos;ve selected, choose which variants you&apos;d like us to sell.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  We recommend enabling all available variants — exclude any with inventory restrictions or other fulfilment limitations.
                </p>
              </div>
            )}

            {/* Step 2 — Min Price */}
            {modalStep === 2 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-base font-semibold tracking-tight">Minimum Sell Price</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  Set the <strong>Minimum Sell Price</strong> for each variant.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  When building your offers, we&apos;ll bundle products and adjust pricing to increase order value — your minimum price is the floor we won&apos;t go below.
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  You can set it per variant, or apply one price across all variants at the product level.
                </p>
              </div>
            )}

            {/* Video placeholder */}
            <div className="w-full aspect-video rounded-lg bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground border border-border">
              <div className="w-9 h-9 rounded-full bg-muted-foreground/15 flex items-center justify-center">
                <svg className="w-4 h-4 ml-0.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 3.5l7 4.5-7 4.5V3.5z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Video coming soon</span>
            </div>

            <div className="flex gap-2">
              {modalStep === 0 ? (
                <Button size="sm" variant="outline" onClick={dismissModal} className="flex-1">
                  Dismiss
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => advanceModal(modalStep - 1)} className="flex-1">
                  Back
                </Button>
              )}
              <Button size="sm" onClick={() => advanceModal(modalStep + 1)} className="flex-1">
                {modalStep === 2 ? "Got it" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }
);

// Help pill — renders inline wherever you place it, calls the modal ref
export function ProductsHelpPill({ modalRef }: { modalRef: React.RefObject<ProductsGuideModalHandle | null> }) {
  return (
    <button
      type="button"
      onClick={() => modalRef.current?.open()}
      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground text-xs font-medium shrink-0 transition-colors"
    >
      <HelpCircle className="w-3.5 h-3.5" />
      Help
    </button>
  );
}

// Utility hook to compute highlight opacities based on modal step — used by parent to pass to ProductsTable
export function useProductsGuideHighlights(startVisible = false) {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(startVisible);
  const [expandTrigger, setExpandTrigger] = useState(0);
  const [collapseTrigger, setCollapseTrigger] = useState(0);

  useEffect(() => {
    if (!startVisible) return;
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, [startVisible]);

  const onStepChange = (toStep: number) => {

    if (toStep === -1) {
      setStep(-1);
      setCollapseTrigger((n) => n + 1);
      return;
    }
    setStep(toStep);
    if (toStep === 1) setExpandTrigger((n) => n + 1);
    if (toStep === 0) setCollapseTrigger((n) => n + 1);
  };

  const onOpen = () => {
    setStep(0);
    setFading(false);
    setVisible(true);
    setTimeout(() => setReady(true), 50);
  };

  const onDismiss = () => {
    setVisible(false);
    setStep(-1);
    setCollapseTrigger((n) => n + 1);
  };

  const base = fading ? 0 : ready && visible ? 1 : 0;

  return {
    step,
    onStepChange,
    onOpen,
    onDismiss,
    expandTrigger,
    collapseTrigger,
    columnHighlightOpacity: step === 0 ? base : 0,
    variantHighlightOpacity: step === 1 ? base : 0,
    minPriceHighlightOpacity: step === 2 ? base : 0,
  };
}
