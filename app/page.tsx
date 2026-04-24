"use client";

import { useState } from "react";
import Link from "next/link";
import { useOnboarding } from "@/lib/onboarding-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Copy,
} from "lucide-react";

// Mock metrics data
const METRICS = [
  {
    label: "Total Revenue",
    value: "$12,450",
    change: "+12.5%",
    trend: "up" as const,
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    label: "Conversions",
    value: "234",
    change: "+8.2%",
    trend: "up" as const,
    icon: <ShoppingCart className="w-4 h-4" />,
  },
  {
    label: "Visitors",
    value: "8,432",
    change: "+23.1%",
    trend: "up" as const,
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Conversion Rate",
    value: "2.78%",
    change: "-0.4%",
    trend: "down" as const,
    icon: <TrendingUp className="w-4 h-4" />,
  },
];

// Mock orders data
interface Order {
  id: string;
  shopifyOrderId: string;
  shopifyStore: string;
  customer: string;
  email: string;
  product: string;
  amount: string;
  amountNum: number;
  status: "completed" | "pending" | "refunded";
  date: string;
  timestamp: string;
}

const ORDERS: Order[] = [
  { id: "10001", shopifyOrderId: "12847", shopifyStore: "acme-store", customer: "John Smith", email: "john.smith@example.com", product: "Premium Wireless Earbuds", amount: "$79.00", amountNum: 79, status: "completed", date: "Apr 8, 2026", timestamp: "2:34 PM" },
  { id: "10002", shopifyOrderId: "12848", shopifyStore: "acme-store", customer: "Sarah Johnson", email: "sarah.j@example.com", product: "Smart Watch Pro", amount: "$199.00", amountNum: 199, status: "completed", date: "Apr 7, 2026", timestamp: "11:22 AM" },
  { id: "10003", shopifyOrderId: "12849", shopifyStore: "acme-store", customer: "Mike Davis", email: "mike.davis@example.com", product: "Fitness Tracker", amount: "$49.00", amountNum: 49, status: "pending", date: "Apr 7, 2026", timestamp: "4:15 PM" },
  { id: "10004", shopifyOrderId: "12850", shopifyStore: "acme-store", customer: "Emily Chen", email: "emily.chen@example.com", product: "Complete Skincare Set", amount: "$149.00", amountNum: 149, status: "refunded", date: "Apr 6, 2026", timestamp: "9:08 AM" },
  { id: "10005", shopifyOrderId: "12851", shopifyStore: "acme-store", customer: "David Wilson", email: "d.wilson@example.com", product: "Premium Wireless Earbuds", amount: "$79.00", amountNum: 79, status: "completed", date: "Apr 5, 2026", timestamp: "1:45 PM" },
  { id: "10006", shopifyOrderId: "12852", shopifyStore: "acme-store", customer: "Lisa Brown", email: "lisa.b@example.com", product: "Hydrating Face Serum", amount: "$49.00", amountNum: 49, status: "completed", date: "Apr 5, 2026", timestamp: "3:20 PM" },
  { id: "10007", shopifyOrderId: "12853", shopifyStore: "acme-store", customer: "James Miller", email: "james.miller@example.com", product: "Smart Watch Pro", amount: "$199.00", amountNum: 199, status: "pending", date: "Apr 4, 2026", timestamp: "10:55 AM" },
  { id: "10008", shopifyOrderId: "12854", shopifyStore: "acme-store", customer: "Anna Taylor", email: "anna.taylor@example.com", product: "Premium Wireless Earbuds", amount: "$79.00", amountNum: 79, status: "completed", date: "Apr 4, 2026", timestamp: "5:12 PM" },
  { id: "10009", shopifyOrderId: "12855", shopifyStore: "acme-store", customer: "Robert Garcia", email: "r.garcia@example.com", product: "Complete Skincare Set", amount: "$149.00", amountNum: 149, status: "completed", date: "Apr 3, 2026", timestamp: "8:30 AM" },
  { id: "10010", shopifyOrderId: "12856", shopifyStore: "acme-store", customer: "Jennifer Martinez", email: "jmartinez@example.com", product: "Fitness Tracker", amount: "$49.00", amountNum: 49, status: "completed", date: "Apr 3, 2026", timestamp: "12:40 PM" },
  { id: "10011", shopifyOrderId: "12857", shopifyStore: "acme-store", customer: "Chris Anderson", email: "chris.a@example.com", product: "Premium Wireless Earbuds", amount: "$79.00", amountNum: 79, status: "completed", date: "Apr 2, 2026", timestamp: "3:15 PM" },
  { id: "10012", shopifyOrderId: "12858", shopifyStore: "acme-store", customer: "Maria Rodriguez", email: "maria.r@example.com", product: "Smart Watch Pro", amount: "$199.00", amountNum: 199, status: "completed", date: "Apr 2, 2026", timestamp: "10:30 AM" },
  { id: "10013", shopifyOrderId: "12859", shopifyStore: "acme-store", customer: "Kevin Lee", email: "kevin.lee@example.com", product: "Fitness Tracker", amount: "$49.00", amountNum: 49, status: "pending", date: "Apr 1, 2026", timestamp: "2:45 PM" },
  { id: "10014", shopifyOrderId: "12860", shopifyStore: "acme-store", customer: "Amanda White", email: "amanda.w@example.com", product: "Complete Skincare Set", amount: "$149.00", amountNum: 149, status: "completed", date: "Apr 1, 2026", timestamp: "11:20 AM" },
  { id: "10015", shopifyOrderId: "12861", shopifyStore: "acme-store", customer: "Brian Clark", email: "b.clark@example.com", product: "Hydrating Face Serum", amount: "$49.00", amountNum: 49, status: "completed", date: "Mar 31, 2026", timestamp: "4:50 PM" },
  { id: "10016", shopifyOrderId: "12862", shopifyStore: "acme-store", customer: "Nicole Hall", email: "nicole.hall@example.com", product: "Premium Wireless Earbuds", amount: "$79.00", amountNum: 79, status: "completed", date: "Mar 31, 2026", timestamp: "1:10 PM" },
  { id: "10017", shopifyOrderId: "12863", shopifyStore: "acme-store", customer: "Thomas Young", email: "t.young@example.com", product: "Smart Watch Pro", amount: "$199.00", amountNum: 199, status: "refunded", date: "Mar 30, 2026", timestamp: "9:25 AM" },
  { id: "10018", shopifyOrderId: "12864", shopifyStore: "acme-store", customer: "Jessica King", email: "jessica.k@example.com", product: "Fitness Tracker", amount: "$49.00", amountNum: 49, status: "completed", date: "Mar 30, 2026", timestamp: "5:35 PM" },
  { id: "10019", shopifyOrderId: "12865", shopifyStore: "acme-store", customer: "Daniel Scott", email: "daniel.s@example.com", product: "Complete Skincare Set", amount: "$149.00", amountNum: 149, status: "completed", date: "Mar 29, 2026", timestamp: "2:00 PM" },
  { id: "10020", shopifyOrderId: "12866", shopifyStore: "acme-store", customer: "Laura Adams", email: "laura.a@example.com", product: "Hydrating Face Serum", amount: "$49.00", amountNum: 49, status: "pending", date: "Mar 29, 2026", timestamp: "10:15 AM" },
];

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

const getStatusBadge = (status: Order["status"]) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          Pending
        </Badge>
      );
    case "refunded":
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
          Refunded
        </Badge>
      );
  }
};

const getExperimentStatusBadge = (status: Experiment["status"]) => {
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

const columns: DataTableColumn<Order>[] = [
  {
    key: "shopifyOrderId",
    header: "Order",
    sortable: true,
    render: (order) => (
      <div className="flex flex-col">
        <a
          href={`https://${order.shopifyStore}.myshopify.com/admin/orders/${order.shopifyOrderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline hover:text-blue-700"
        >
          #{order.shopifyOrderId}
        </a>
        <span className="text-xs text-muted-foreground">{order.id}</span>
      </div>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    sortable: true,
    render: (order) => (
      <div className="flex flex-col">
        <span>{order.customer}</span>
        <span className="text-xs text-muted-foreground">{order.email}</span>
      </div>
    ),
  },
  {
    key: "product",
    header: "Product",
    sortable: true,
  },
  {
    key: "amountNum",
    header: "Amount",
    sortable: true,
    render: (order) => <span className="tabular-nums">{order.amount}</span>,
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    render: (order) => (
      <div className="flex flex-col">
        <span>{order.date}</span>
        <span className="text-xs text-muted-foreground">{order.timestamp}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (order) => getStatusBadge(order.status),
  },
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

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <div className="p-2 bg-muted rounded-md">{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {metric.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 text-[oklch(0.627_0.194_149)]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-destructive" />
                )}
                <span
                  className={
                    metric.trend === "up"
                      ? "text-xs text-[oklch(0.627_0.194_149)]"
                      : "text-xs text-destructive"
                  }
                >
                  {metric.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
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
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <DataTable
          data={ORDERS}
          columns={columns}
          searchPlaceholder="Search orders..."
          searchKeys={["shopifyOrderId", "id", "customer", "product", "status"]}
          pageSize={10}
          emptyMessage="No orders found"
        />
      </div>
    </div>
  );
}
