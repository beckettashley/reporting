"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

import { ProductsTable, generateDummyProducts, Product } from "@/components/products/products-table";
import type { Product as ContextProduct } from "@/lib/types";
import { ProductsGuideModal, ProductsHelpPill, ProductsGuideModalHandle, useProductsGuideHighlights } from "@/components/products/products-guide-modal";

const MAX_PRODUCTS = 20;

export default function StepProducts() {
  const { state, goToStep, triggerSave, setProductsHasUnsavedChanges, setTriggerProductsSave, updateProducts } = useOnboarding();
  const { store, products: savedProducts } = state;

  // Generate products once
  const allProducts = useMemo(() => generateDummyProducts(), []);

  // Initialize selected state from context (saved products) or empty
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (savedProducts && savedProducts.length > 0) {
      return new Set(savedProducts.map(p => p.id));
    }
    return new Set();
  });
  const [selectedVariants, setSelectedVariants] = useState<Map<string, Set<string>>>(() => {
    if (savedProducts && savedProducts.length > 0) {
      const map = new Map<string, Set<string>>();
      savedProducts.forEach(p => {
        if (p.variants && typeof p.variants === 'object') {
          map.set(p.id, new Set());
        } else {
          map.set(p.id, new Set());
        }
      });
      return map;
    }
    return new Map();
  });
  const [savedSelectedIds, setSavedSelectedIds] = useState<Set<string>>(() => {
    if (savedProducts && savedProducts.length > 0) {
      return new Set(savedProducts.map(p => p.id));
    }
    return new Set();
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const modalRef = useRef<ProductsGuideModalHandle>(null);

  const {
    step: modalStep,
    onStepChange: handleModalStepChange,
    expandTrigger,
    collapseTrigger,
    columnHighlightOpacity,
    variantHighlightOpacity,
    minPriceHighlightOpacity,
  } = useProductsGuideHighlights(true);

  const handleMinPriceHovered = () => {
    if (modalStep === 1) handleModalStepChange(2);
  };

  // Keep a stable ref to handleSave so the context callback never goes stale
  const handleSaveRef = useRef<() => void>(() => {});

  // Sync local unsaved changes with context for parent page to access
  useEffect(() => {
    setProductsHasUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges, setProductsHasUnsavedChanges]);

  // Register a stable save callback in context on mount
  useEffect(() => {
    setTriggerProductsSave(() => () => handleSaveRef.current());
    return () => {
      setTriggerProductsSave(null);
      setProductsHasUnsavedChanges(false);
    };
  }, [setTriggerProductsSave, setProductsHasUnsavedChanges]);

  const handleSelectionChange = (newSelectedIds: Set<string>, newSelectedVariants: Map<string, Set<string>>) => {
    setSelectedIds(newSelectedIds);
    setSelectedVariants(newSelectedVariants);
    
    // Compare with saved state to determine if there are actual changes
    const sameIds = newSelectedIds.size === savedSelectedIds.size && 
      [...newSelectedIds].every(id => savedSelectedIds.has(id));
    setHasUnsavedChanges(!sameIds);
  };

  const handleSave = () => {
    setSavedSelectedIds(new Set(selectedIds));
    setHasUnsavedChanges(false);
    
    // Convert selected products to the format expected by updateProducts
    const selectedProductsArray = Array.from(selectedIds).map(productId => {
      const product = allProducts.find(p => p.id === productId);
      if (!product) return null;
      
      return {
        ...product,
        variantList: product.variantList.filter(v => selectedVariants.get(productId)?.has(v.id)),
      };
    }).filter(Boolean) as Product[];
    
    // Update context with selected products
    updateProducts(selectedProductsArray as unknown as ContextProduct[]);
    triggerSave();
  };

  // Keep ref up to date so the context callback always calls the latest version
  handleSaveRef.current = handleSave;

  const handleCancel = () => {
    // Reset to saved state
    setSelectedIds(new Set(savedSelectedIds));
    // Reset variants for saved products
    const resetVariants = new Map<string, Set<string>>();
    savedSelectedIds.forEach(id => {
      const product = allProducts.find(p => p.id === id);
      if (product) {
        resetVariants.set(id, new Set(product.variantList.map(v => v.id)));
      }
    });
    setSelectedVariants(resetVariants);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <ProductsGuideModal
        ref={modalRef}
        startVisible={true}
        onStepChange={handleModalStepChange}
      />

      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
          <ProductsHelpPill modalRef={modalRef} />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Select the products you&apos;d like us to promote — your best sellers and top upsells. Recommended: 5-10; Maximum: 20
        </p>
      </div>

      {/* Empty state — store not connected */}
      {!store.connected && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-lg border border-dashed text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No store connected</p>
            <p className="text-sm text-muted-foreground mt-1">Connect your Shopify store first to load your product catalog.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => goToStep(3)}>
            Go to Store setup
          </Button>
        </div>
      )}

      {/* Products table - using shared component */}
      {store.connected && (
        <div className="flex-1 min-h-0 flex flex-col">
          <ProductsTable
            products={allProducts}
            selectedIds={selectedIds}
            selectedVariants={selectedVariants}
            savedSelectedIds={savedSelectedIds}
            onSelectionChange={handleSelectionChange}
            onSave={handleSave}
            onCancel={handleCancel}
            hasUnsavedChanges={hasUnsavedChanges}
            showExperimentColumn={false}
            showMinPriceInput={true}
            pageSize={15}
            maxProducts={MAX_PRODUCTS}
            columnHighlightOpacity={columnHighlightOpacity}
            variantHighlightOpacity={variantHighlightOpacity}
            minPriceHighlightOpacity={minPriceHighlightOpacity}
            expandFirstProductTrigger={expandTrigger}
            collapseFirstProductTrigger={collapseTrigger}
            onMinPriceHovered={handleMinPriceHovered}
            guideStep={modalStep}
          />
        </div>
      )}
    </div>
  );
}
