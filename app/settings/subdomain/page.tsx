"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Globe, ExternalLink, Copy, Check, Loader2 } from "lucide-react";

const DNS_RECORDS = [
  { type: "A", name: "@", value: "76.76.21.21", ttl: "300" },
  { type: "CNAME", name: "api", value: "ghs.googlehosted.com", ttl: "300" },
  { type: "CNAME", name: "collect", value: "ghs.googlehosted.com", ttl: "300" },
  { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: "300" },
];

export default function SubdomainSettingsPage() {
  const { state, updateSubdomain } = useOnboarding();
  const { subdomain } = state;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Check if subdomain step is completed (has both subdomain and rootDomain set)
  const isStepComplete = subdomain.subdomain && subdomain.rootDomain && subdomain.verificationStatus === "verified";

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerify = () => {
    updateSubdomain({ verificationStatus: "verifying" });
    setTimeout(() => {
      updateSubdomain({ verificationStatus: "verified", dnsVerified: true });
    }, 2000);
  };

  const fullDomain = subdomain.subdomain && subdomain.rootDomain
    ? `${subdomain.subdomain}.${subdomain.rootDomain}`
    : "";

  // If step is complete, show the DNS records view
  if (isStepComplete) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Subdomain</h1>
        </div>

        <div className="space-y-6">
          {/* Subdomain input (disabled when verified) */}
          <div className="flex items-end gap-2">
            <div className="w-1/4 space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex">
                <Input
                  id="subdomain"
                  value={subdomain.subdomain}
                  disabled
                  className="rounded-r-none bg-muted"
                />
                <div className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-sm text-muted-foreground shrink-0">
                  .
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="rootDomain">Your Domain</Label>
              <div className="flex gap-2">
                <Input
                  id="rootDomain"
                  value={subdomain.rootDomain}
                  disabled
                  className="bg-muted"
                />
                <Button variant="default" size="sm" disabled>
                  <Check className="h-4 w-4 mr-1" />
                  DNS Verified
                </Button>
              </div>
            </div>
          </div>

          {fullDomain && (
            <p className="text-sm text-muted-foreground">
              Your pages are available at{" "}
              <span className="font-mono text-foreground">{fullDomain}</span>
            </p>
          )}

          {/* DNS Configuration */}
          <div className="space-y-3">
            <h3 className="font-medium">DNS Configuration</h3>
            <Card className="py-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="h-9 text-xs">Type</TableHead>
                    <TableHead className="h-9 text-xs">Name</TableHead>
                    <TableHead className="h-9 text-xs">Value</TableHead>
                    <TableHead className="h-9 text-xs">TTL</TableHead>
                    <TableHead className="h-9 text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DNS_RECORDS.map((record, i) => {
                    const recordName = record.name === "@"
                      ? fullDomain
                      : `${record.name}.${fullDomain}`;
                    const copyKey = `${record.type}-${record.name}`;

                    return (
                      <TableRow key={i}>
                        <TableCell className="py-2">
                          <Badge variant={record.type === "A" ? "default" : "secondary"} className="text-xs">
                            {record.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-xs">{recordName}</TableCell>
                        <TableCell className="py-2 text-xs">{record.value}</TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">{record.ttl}</TableCell>
                        <TableCell className="py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(record.value, copyKey)}
                          >
                            {copiedField === copyKey ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          <p className="text-xs text-muted-foreground">To change your subdomain, please contact support.</p>
        </div>
      </div>
    );
  }

  // If step is NOT complete, show the wizard setup UI
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Subdomain Setup</h1>
        <p className="text-muted-foreground mt-1">
          Configure your custom subdomain for your pages
        </p>
      </div>

      <div className="space-y-6">
        {/* Subdomain input */}
        <div className="flex items-end gap-2">
          <div className="w-1/4 space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex">
              <Input
                id="subdomain"
                placeholder="shop"
                value={subdomain.subdomain}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  updateSubdomain({ subdomain: val });
                }}
                className="rounded-r-none"
              />
              <div className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-sm text-muted-foreground shrink-0">
                .
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="rootDomain">Your Domain</Label>
            <div className="flex gap-2">
              <Input
                id="rootDomain"
                placeholder="yourbrand.com"
                value={subdomain.rootDomain}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, "");
                  updateSubdomain({ rootDomain: val });
                  if (subdomain.verificationStatus === "verified") {
                    updateSubdomain({ verificationStatus: "pending" });
                  }
                }}
              />
              {fullDomain && (
                <Button
                  variant={subdomain.verificationStatus === "verified" ? "default" : "outline"}
                  size="sm"
                  onClick={handleVerify}
                  disabled={subdomain.verificationStatus === "verifying"}
                >
                  {subdomain.verificationStatus === "verifying" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Verifying
                    </>
                  ) : subdomain.verificationStatus === "verified" ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      DNS Verified
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-1" />
                      Verify
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {fullDomain && (
          <p className="text-sm text-muted-foreground">
            Your pages will be available at{" "}
            <span className="font-mono text-foreground">{fullDomain}</span>
          </p>
        )}

        {/* DNS Records */}
        {fullDomain && (
          <div className="space-y-3 !mt-2">
            <h3 className="font-medium">DNS Configuration</h3>
            <Card className="py-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="h-9 text-xs">Type</TableHead>
                    <TableHead className="h-9 text-xs">Name</TableHead>
                    <TableHead className="h-9 text-xs">Value</TableHead>
                    <TableHead className="h-9 text-xs">TTL</TableHead>
                    <TableHead className="h-9 text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DNS_RECORDS.map((record, i) => {
                    const recordName = record.name === "@"
                      ? fullDomain
                      : `${record.name}.${fullDomain}`;
                    const copyKey = `${record.type}-${record.name}`;

                    return (
                      <TableRow key={i}>
                        <TableCell className="py-2">
                          <Badge variant={record.type === "A" ? "default" : "secondary"} className="text-xs">
                            {record.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-xs">{recordName}</TableCell>
                        <TableCell className="py-2 text-xs">{record.value}</TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">{record.ttl}</TableCell>
                        <TableCell className="py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(record.value, copyKey)}
                          >
                            {copiedField === copyKey ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
