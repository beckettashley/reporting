"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface StepNavigationProps {
  onBack?: () => void;
  onContinue?: () => void;
  backLabel?: string;
  continueLabel?: string;
  rightContent?: ReactNode;
  hideBack?: boolean;
  isPageComplete?: boolean;
}

export default function StepNavigation({
  onBack,
  onContinue,
  backLabel = "Back",
  continueLabel = "Continue",
  rightContent,
  hideBack = false,
  isPageComplete = false,
}: StepNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          {!hideBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          {rightContent}
        </div>

        <Button
          onClick={onContinue}
          className={`gap-2 ${isPageComplete ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
        >
          {continueLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
