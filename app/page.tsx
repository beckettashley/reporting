"use client";

import { useState } from "react";
import Link from "next/link";
import { useOnboarding } from "@/lib/onboarding-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Orders } from "@/components/dashboard/orders";
import { Copy } from "lucide-react";

// Mock experiments data
interface Experiment {
  id: string;
  name: string;
  heroProduct: string;
  variantCount: number;
  status: "active" | "paused" | "completed";
  link: string;
}

const EXPERIMENTS: Experiment[] = [
  { id: "exp-001", name: "Homepage Hero Test", heroProduct: "Premium Wireless Earbuds", variantCount: 3, status: "active", link: "https://shop.example.com/e/abc123" },
  { id: "exp-002", name: "Checkout Flow A/B", heroProduct: "Smart Watch Pro", variantCount: 2, status: "active", link: "https://shop.example.com/e/def456" },
  { id: "exp-003", name: "Landing Page Redesign", heroProduct: "Fitness Tracker", variantCount: 4, status: "paused", link: "https://shop.example.com/e/ghi789" },
  { id: "exp-004", name: "Product Page Layout", heroProduct: "Complete Skincare Set", variantCount: 3, status: "completed", link: "https://shop.example.com/e/jkl012" },
  { id: "exp-005", name: "Cart Upsell Test", heroProduct: "Hydrating Face Serum", variantCount: 2, status: "active", link: "https://shop.example.com/e/mno345" },
];

export default function PortalDashboard() {
  const { state } = useOnboarding();
  const { account } = state;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          Dashboard
        </h1>
        <span className="text-xs font-bold text-red-600">PLACEHOLDER LAYOUT FOR DEMO ONLY</span>
      </div>

      {/* Experiments Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Experiments</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/experiments">All Experiments</Link>
          </Button>
        </div>
        <Card className="py-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="h-9 px-4 py-2 text-xs font-medium text-left">Experiment</th>
                  <th className="h-9 px-4 py-2 text-xs font-medium text-left">Hero Product</th>
                  <th className="h-9 px-4 py-2 text-xs font-medium text-center">Variants</th>
                  <th className="h-9 px-4 py-2 text-xs font-medium text-center">Link</th>
                </tr>
              </thead>
              <tbody>
                {EXPERIMENTS.filter(exp => exp.status === "active").map((experiment) => (
                  <tr key={experiment.id} className="border-b hover:bg-muted/30 last:border-0">
                    <td className="px-4 py-2 text-sm">{experiment.name}</td>
                    <td className="px-4 py-2 text-sm text-muted-foreground">{experiment.heroProduct}</td>
                    <td className="px-4 py-2 text-sm text-muted-foreground text-center">{experiment.variantCount}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(experiment.link);
                        }}
                        className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {EXPERIMENTS.filter(exp => exp.status === "active").length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No active experiments
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Orders Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/reporting">All Orders</Link>
          </Button>
        </div>
        <Orders compact />
      </div>
    </div>
  );
}
