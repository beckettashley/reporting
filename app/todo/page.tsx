"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Circle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useOnboarding } from "@/lib/onboarding-context";

interface Task {
  id: string;
  title: string;
  wizardStep: number;
  portalHref: string;
}

// Maps wizard steps to tasks
const ONBOARDING_TASKS: Task[] = [
  {
    id: "task-ad-account",
    title: "Connect ad account",
    wizardStep: 1,
    portalHref: "/portal/settings/tracking",
  },
  {
    id: "task-payment",
    title: "Set up payment processors",
    wizardStep: 2,
    portalHref: "/portal/settings/payment",
  },
  {
    id: "task-store",
    title: "Connect your store",
    wizardStep: 3,
    portalHref: "/portal/settings/stores",
  },
  {
    id: "task-subdomain",
    title: "Configure subdomain",
    wizardStep: 4,
    portalHref: "/portal/settings/subdomain",
  },
  {
    id: "task-tracking",
    title: "Set up tracking pixels",
    wizardStep: 5,
    portalHref: "/portal/settings/tracking",
  },
  {
    id: "task-products",
    title: "Select Products",
    wizardStep: 6,
    portalHref: "/portal/products",
  },
];

export default function TodoPage() {
  const { state, getStepStatus, goToStep } = useOnboarding();
  
  // Check if onboarding is fully complete (all 6 steps)
  const onboardingComplete = state.completedSteps.length >= 6 || 
    ONBOARDING_TASKS.every(task => getStepStatus(task.wizardStep) === "complete");

  const getTaskStatus = (task: Task): "pending" | "in-progress" | "complete" => {
    const stepStatus = getStepStatus(task.wizardStep);
    if (stepStatus === "complete") return "complete";
    if (stepStatus === "started") return "in-progress";
    return "pending";
  };

  const getStatusIcon = (status: "pending" | "in-progress" | "complete") => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "in-progress":
        return <Circle className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: "pending" | "in-progress" | "complete") => {
    switch (status) {
      case "complete":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Complete
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
            Pending
          </Badge>
        );
    }
  };

  // Get the href for a task - wizard step if onboarding incomplete, portal page if complete
  const getTaskHref = (task: Task, status: "pending" | "in-progress" | "complete"): string => {
    // If onboarding is complete, always go to portal page
    if (onboardingComplete) {
      return task.portalHref;
    }
    // If this step is complete, go to portal page
    if (status === "complete") {
      return task.portalHref;
    }
    // Otherwise, go to wizard at that step
    return `/onboarding?step=${task.wizardStep}`;
  };

  // Handle click to set the wizard step before navigation
  const handleTaskClick = (task: Task, status: "pending" | "in-progress" | "complete") => {
    if (!onboardingComplete && status !== "complete") {
      goToStep(task.wizardStep);
    }
  };

  // Calculate progress
  const completedCount = ONBOARDING_TASKS.filter(task => getTaskStatus(task) === "complete").length;
  const totalCount = ONBOARDING_TASKS.length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">To Do</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {onboardingComplete 
            ? "Onboarding complete! You can update these settings anytime."
            : `Complete your onboarding to get started. ${completedCount} of ${totalCount} steps done.`
          }
        </p>
      </div>

      <Card className="py-0 overflow-hidden">
        <div className="divide-y divide-border">
          {ONBOARDING_TASKS.map((task) => {
            const status = getTaskStatus(task);
            const href = getTaskHref(task, status);
            
            return (
              <Link
                key={task.id}
                href={href}
                onClick={() => handleTaskClick(task, status)}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  <span className={status === "complete" ? "text-muted-foreground line-through" : ""}>
                    {task.title}
                  </span>
                </div>
                {getStatusBadge(status)}
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
