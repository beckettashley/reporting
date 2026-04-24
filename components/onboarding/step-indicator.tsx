"use client";

import { cn } from "@/lib/utils";
import { useOnboarding } from "@/lib/onboarding-context";

interface Step {
  id: number;
  name: string;
}

const STEPS: Step[] = [
  { id: 1, name: "Ad Account" },
  { id: 2, name: "Payment" },
  { id: 3, name: "Store" },
  { id: 4, name: "Subdomain" },
  { id: 5, name: "Pixels" },
  { id: 6, name: "Products" },
];

/**
 * Renders an SVG circle with a pie segment fill.
 * progress = 0–1 (proportion filled clockwise from top).
 */
function StepCircle({
  progress,
  isCompleted,
  isCurrent,
  stepId,
}: {
  progress: number;
  isCompleted: boolean;
  isCurrent: boolean;
  stepId: number;
}) {
  const size = 32;
  const r = 14;
  const cx = size / 2;
  const cy = size / 2;
  const strokeW = 2;

  // Pie arc path: clockwise from top
  const arcPath = (pct: number) => {
    if (pct <= 0) return "";
    if (pct >= 1) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
    }
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    const largeArc = pct > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`;
  };

  const bgColor = isCurrent ? "#000000" : isCompleted ? "#10b981" : "transparent";
  const ringColor = isCurrent ? "#000000" : isCompleted ? "#10b981" : "#d1d5db";
  const pieColor = isCurrent ? "rgba(255,255,255,0.25)" : "#10b981";
  const cutoutColor = isCurrent ? "#000000" : "transparent";

  const showPie = !isCompleted && progress > 0 && progress < 1;
  const showFullFill = isCompleted || (progress >= 1);
  const showCutout = isCurrent && showPie;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      {/* Background fill circle */}
      <circle cx={cx} cy={cy} r={r} fill={bgColor} />

      {/* Ring border */}
      <circle
        cx={cx}
        cy={cy}
        r={r - strokeW / 2}
        fill="none"
        stroke={ringColor}
        strokeWidth={strokeW}
      />

      {/* Pie progress segment */}
      {showPie && (
        <path d={arcPath(progress)} fill={pieColor} />
      )}

      {/* Cutout for remaining portion when active+started */}
      {showCutout && (
        <path d={arcPath(1 - progress)} fill={cutoutColor} transform={`rotate(${progress * 360}, ${cx}, ${cy})`} />
      )}

      {/* Check icon for completed */}
      {isCompleted && (
        <g transform={`translate(${cx - 6}, ${cy - 6})`}>
          <polyline
            points="2,7 5,10 10,3"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
}

interface StepIndicatorProps {
  currentStep?: number;
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({ currentStep: currentStepProp, onStepClick }: StepIndicatorProps) {
  const { state, goToStep, getStepStatus, getStepProgress } = useOnboarding();
  const currentStep = currentStepProp ?? state.currentStep;

  const handleStepClick = (stepId: number) => {
    if (onStepClick) {
      onStepClick(stepId);
    } else {
      goToStep(stepId);
    }
  };

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const progress = getStepProgress(step.id);
          const isCompleted = status === "complete";
          const isCurrent = currentStep === step.id;
          const isLast = index === STEPS.length - 1;

          return (
            <li key={step.id} className="relative flex flex-1 flex-col items-center">
              {/* Connector line — always grey */}
              {!isLast && (
                <div className="absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] hidden h-0.5 bg-border sm:block" />
              )}

              <button
                onClick={() => handleStepClick(step.id)}
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all hover:opacity-80"
                aria-current={isCurrent ? "step" : undefined}
              >
                <StepCircle
                  progress={progress}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  stepId={step.id}
                />
              </button>

              {/* Step name */}
              <span
                className={cn(
                  "mt-1 text-center text-xs",
                  isCurrent
                    ? "font-semibold text-foreground"
                    : isCompleted
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
