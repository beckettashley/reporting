"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

const MOCK_DATA = [
  { label: "This Week", revenue: "$4,320", conversions: 89, rate: "2.8%" },
  { label: "Last Week", revenue: "$3,890", conversions: 76, rate: "2.5%" },
  { label: "This Month", revenue: "$12,450", conversions: 234, rate: "2.78%" },
  { label: "Last Month", revenue: "$10,200", conversions: 198, rate: "2.6%" },
];

export default function ReportingPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Reporting Overview</h1>
          <span className="text-xs font-semibold text-red-600 uppercase">Placeholder (To Update)</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your store performance and key metrics.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_DATA.map((period) => (
            <Card key={period.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {period.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{period.revenue}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{period.conversions} conversions</span>
                  <span className="text-border">|</span>
                  <span>{period.rate} rate</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed border-border">
              <BarChart3 className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[oklch(0.627_0.194_149)]" />
                Top Performing Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-foreground">Summer Sale 2024</p>
              <p className="text-sm text-muted-foreground">3.2% conversion rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-foreground">Checkout A/B Test</p>
              <p className="text-sm text-muted-foreground">0.8% conversion rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
