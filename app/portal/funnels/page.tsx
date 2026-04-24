"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, GitBranch } from "lucide-react";

export default function FunnelsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Funnels</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your sales funnels.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Funnel
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <GitBranch className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No funnels yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            Create your first funnel to start converting visitors into customers.
          </p>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create your first funnel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
