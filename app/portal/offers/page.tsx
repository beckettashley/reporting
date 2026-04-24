"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Tag } from "lucide-react";

export default function OffersPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Offers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create special offers and promotions for your customers.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Offer
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Tag className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No offers yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            Create offers like discounts, bundles, or upsells to increase your average order value.
          </p>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create your first offer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
