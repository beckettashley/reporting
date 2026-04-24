"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { ProductsTable, generateDummyProducts, Product } from "@/components/products/products-table";
import { ProductsGuideModal, ProductsHelpPill, ProductsGuideModalHandle, useProductsGuideHighlights } from "@/components/products/products-guide-modal";

export default function ProductsPage() {
  const [allProducts] = useState<Product[]>(generateDummyProducts());
  const router = useRouter();
  
  // Initialize with first 5 products (all Active with experiments)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const products = generateDummyProducts();
    const initialSet = new Set<string>();
    for (let i = 0; i < 5 && i < products.length; i++) {
      initialSet.add(products[i].id);
    }
    return initialSet;
  });

  const [selectedVariants, setSelectedVariants] = useState<Map<string, Set<string>>>(() => {
    const products = generateDummyProducts();
    const initialMap = new Map<string, Set<string>>();
    for (let i = 0; i < 5 && i < products.length; i++) {
      const product = products[i];
      initialMap.set(product.id, new Set(product.variantList.map(v => v.id)));
    }
    return initialMap;
  });

  const [savedSelectedIds, setSavedSelectedIds] = useState<Set<string>>(() => {
    const products = generateDummyProducts();
    const initialSet = new Set<string>();
    for (let i = 0; i < 5 && i < products.length; i++) {
      initialSet.add(products[i].id);
    }
    return initialSet;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const modalRef = useRef<ProductsGuideModalHandle>(null);
  const {
    onStepChange: handleModalStepChange,
    expandTrigger,
    columnHighlightOpacity,
    variantHighlightOpacity,
    minPriceHighlightOpacity,
  } = useProductsGuideHighlights(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Warn user before navigating away with unsaved changes (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Intercept link clicks for in-app navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && link.href && hasUnsavedChanges) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          e.preventDefault();
          setPendingNavigation(url.pathname);
          setShowUnsavedDialog(true);
        }
      }
    };
    
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [hasUnsavedChanges]);

  const handleDiscardAndNavigate = () => {
    if (pendingNavigation) {
      setHasUnsavedChanges(false);
      router.push(pendingNavigation);
    }
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

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
  };

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
    <main className="p-6 flex flex-col h-screen overflow-hidden gap-3">
      <ProductsGuideModal
        ref={modalRef}
        startVisible={false}
        onStepChange={handleModalStepChange}
      />

      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <ProductsHelpPill modalRef={modalRef} />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Select the products you&apos;d like us to promote — your best sellers and top upsells. Recommended: 5-10; Maximum: 20
        </p>
      </div>

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
          showExperimentColumn={true}
          showMinPriceInput={true}
          pageSize={20}
          maxProducts={20}
          columnHighlightOpacity={columnHighlightOpacity}
          variantHighlightOpacity={variantHighlightOpacity}
          minPriceHighlightOpacity={minPriceHighlightOpacity}
          expandFirstProductTrigger={expandTrigger}
          onPriceChange={() => setHasUnsavedChanges(true)}
          onVariantChange={() => setHasUnsavedChanges(true)}
        />
      </div>

      {/* Unsaved Changes Navigation Warning */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingNavigation(null)}>
              Stay on page
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardAndNavigate}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
