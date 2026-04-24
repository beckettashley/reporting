"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Copy, Check, ExternalLink } from "lucide-react";

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

const getStatusBadge = (status: Experiment["status"]) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
          Active
        </Badge>
      );
    case "paused":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          Paused
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
          Completed
        </Badge>
      );
  }
};

export default function ExperimentsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns: DataTableColumn<Experiment>[] = [
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (exp) => getStatusBadge(exp.status),
    },
    {
      key: "name",
      header: "Experiment",
      sortable: true,
    },
    {
      key: "heroProduct",
      header: "Hero Product",
      sortable: true,
    },
    {
      key: "link",
      header: "Link",
      className: "text-center w-20",
      render: (exp) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleCopyLink(exp.id, exp.link)}
          >
            {copiedId === exp.id ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      ),
    },
    {
      key: "preview",
      header: "Preview",
      className: "text-center w-20",
      render: (exp) => (
        <div className="flex items-center justify-center">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
            <a href={exp.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      ),
    },
  ];

  if (EXPERIMENTS.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Experiments</h1>
        </div>
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <ExternalLink className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No experiments yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Experiments will appear here once created by our team.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Experiments</h1>
      </div>

      <DataTable
        data={EXPERIMENTS}
        columns={columns}
        searchPlaceholder="Search experiments..."
        searchKeys={["name", "heroProduct", "status"]}
        pageSize={20}
        emptyMessage="No experiments found"
      />
    </div>
  );
}
