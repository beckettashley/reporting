"use client";

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { SaveStatus } from "@/lib/types";

interface SaveToastProps {
  status: SaveStatus;
  lastSavedAt: Date | null;
}

export default function SaveToast({ status, lastSavedAt }: SaveToastProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {status === "saving" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && lastSavedAt && (
        <>
          <Cloud className="h-4 w-4 text-emerald-500" />
          <span>Saved at {formatTime(lastSavedAt)}</span>
        </>
      )}
      {status === "error" && (
        <>
          <CloudOff className="h-4 w-4 text-destructive" />
          <span>Failed to save</span>
        </>
      )}
    </div>
  );
}
