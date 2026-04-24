"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOnboarding } from "@/lib/onboarding-context";
import StepIndicator from "@/components/onboarding/step-indicator";
import StepAdAccount from "@/components/onboarding/step-ad-account";
import StepPayment from "@/components/onboarding/step-payment";
import StepStore from "@/components/onboarding/step-store";
import StepSubdomain from "@/components/onboarding/step-subdomain";
import StepPixels from "@/components/onboarding/step-tracking";
import StepProducts from "@/components/onboarding/step-products";
import SaveToast from "@/components/onboarding/save-toast";
import { Button } from "@/components/ui/button";
import { Zap, Loader2, ArrowLeft, ArrowRight } from "lucide-react";

const TOTAL_STEPS = 6;

export default function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, goToStep, nextStep, prevStep, completeOnboarding } = useOnboarding();
  const { currentStep, saveStatus, lastSavedAt, account } = state;
  const [isHydrated, setIsHydrated] = useState(false);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  const handleGoToPortal = () => {
    completeOnboarding();
    router.push("/portal");
  };

  // Set hydrated flag after mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle step query parameter
  useEffect(() => {
    if (isHydrated) {
      const stepParam = searchParams.get("step");
      if (stepParam) {
        const step = parseInt(stepParam, 10);
        if (step >= 1 && step <= 6 && step !== currentStep) {
          goToStep(step);
        }
      }
    }
  }, [isHydrated, searchParams, goToStep, currentStep]);

  // Redirect to welcome if no account (only after hydration)
  useEffect(() => {
    if (isHydrated && !account) {
      router.replace("/");
    }
  }, [isHydrated, account, router]);

  // Show loading state that matches on server and client
  if (!isHydrated || !account) {
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center">
            <Zap className="w-4 h-4 text-background" />
          </div>
          <span className="font-semibold text-foreground">Velocity</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Welcome, <span className="text-foreground font-medium">{account.fullName}</span>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 flex flex-col min-h-0">
          {currentStep === 5 || currentStep === 6 ? (
            <div className="flex-1 min-h-0 w-full">
              {renderStep()}
            </div>
          ) : (
            <div className="max-w-xl mx-auto w-full">
              {renderStep()}
            </div>
          )}
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="border-t border-border bg-background px-6 py-4">
        <div className={`flex items-center justify-between ${currentStep === 5 || currentStep === 6 ? '' : 'max-w-xl mx-auto'}`}>
          {!isFirstStep ? (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          
          {isLastStep ? (
            <Button onClick={handleGoToPortal}>
              Go to Portal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>

      {/* Save Toast */}
      <SaveToast status={saveStatus} lastSavedAt={lastSavedAt} />
    </div>
  );
}
