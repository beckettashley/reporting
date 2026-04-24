"use client";

const _PAGE_VERSION = 31;

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/lib/onboarding-context";
import StepIndicator from "@/components/onboarding/step-indicator";
import StepAdAccount from "@/components/onboarding/step-ad-account";
import StepPayment from "@/components/onboarding/step-payment";
import StepSubdomain from "@/components/onboarding/step-subdomain";
import StepPixels from "@/components/onboarding/step-tracking";
import StepStore from "@/components/onboarding/step-store";
import StepProducts from "@/components/onboarding/step-products";
import SaveToast from "@/components/onboarding/save-toast";
import StepNavigation from "@/components/onboarding/step-navigation";
import { Loader2, Zap, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const { state, goToStep, nextStep, prevStep, completeStep, isCurrentPageComplete, productsHasUnsavedChanges, triggerProductsSave } = useOnboarding();
  const { currentStep, completedSteps, saveStatus, lastSavedAt, account } = state;
  const [mounted, setMounted] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const isPageComplete = isCurrentPageComplete(currentStep);

  // Check if we should warn about unsaved changes (only on Products step)
  const shouldWarnUnsaved = currentStep === 6 && productsHasUnsavedChanges;

  // Intercept navigation when there are unsaved changes
  const attemptNavigation = useCallback((navigateFn: () => void) => {
    if (shouldWarnUnsaved) {
      setPendingNavigation(() => navigateFn);
      setShowUnsavedModal(true);
    } else {
      navigateFn();
    }
  }, [shouldWarnUnsaved]);

  // Save then proceed to intended destination
  const handleSaveAndProceed = () => {
    if (triggerProductsSave) {
      triggerProductsSave();
    }
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  // Cancel navigation — stay on page
  const handleCancelLeave = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const handleContinue = () => {
    if (currentStep === TOTAL_STEPS) {
      attemptNavigation(() => {
        completeStep(TOTAL_STEPS);
        router.push("/portal");
      });
    } else {
      completeStep(currentStep);
      nextStep();
    }
  };

  const handleBack = () => {
    attemptNavigation(() => {
      prevStep();
    });
  };

  // Intercept step indicator clicks
  const handleStepClick = (step: number) => {
    if (step !== currentStep) {
      attemptNavigation(() => {
        goToStep(step);
      });
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS;
  const continueLabel = isLastStep ? "Go to Portal" : "Continue";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle browser reload/close when there are unsaved changes on Products step
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldWarnUnsaved) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldWarnUnsaved]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepAdAccount />;
      case 2:
        return <StepPayment />;
      case 3:
        return <StepStore />;
      case 4:
        return <StepSubdomain />;
      case 5:
        return <StepPixels />;
      case 6:
        return <StepProducts />;
      default:
        return <StepAdAccount />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <Zap className="h-5 w-5 text-background" />
            </div>
            <span className="font-semibold text-lg">Velocity</span>
          </div>
          <div className="flex items-center gap-4">
            <SaveToast status={saveStatus} lastSavedAt={lastSavedAt} />
            <div className="text-sm text-muted-foreground">
              {account?.operatingName || "Test Brand"}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <StepIndicator
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Step Content — pb-24 reserves space above the fixed nav bar */}
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className={currentStep === 5 || currentStep === 6 ? "max-w-full" : "max-w-2xl mx-auto"}>
          {renderStep()}
        </div>
      </main>

      {/* Fixed bottom navigation */}
      <StepNavigation
        onBack={handleBack}
        onContinue={handleContinue}
        hideBack={currentStep === 1}
        continueLabel={continueLabel}
        isPageComplete={isPageComplete}
        rightContent={
          isLastStep ? (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Rocket className="h-4 w-4" />
              Last step
            </span>
          ) : undefined
        }
      />

      {/* Unsaved Changes Modal - Products page only */}
      <Dialog open={showUnsavedModal} onOpenChange={(open) => { if (!open) handleCancelLeave(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You have unsaved changes</DialogTitle>
            <DialogDescription>
              Your product selection has not been saved. Save before continuing?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelLeave}>
              Cancel
            </Button>
            <Button onClick={handleSaveAndProceed}>
              Save &amp; Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
