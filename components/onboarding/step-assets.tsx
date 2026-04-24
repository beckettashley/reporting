"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function StepAssets() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Assets</h1>
        <p className="text-muted-foreground">
          Placeholder description
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
}
