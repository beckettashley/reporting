"use client";

import { useOnboarding } from "@/lib/onboarding-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { state } = useOnboarding();
  const { account } = state;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">General</h1>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                defaultValue={account?.companyName || ""}
                placeholder="Enter company name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="operatingName">Operating Name</Label>
              <Input
                id="operatingName"
                defaultValue={account?.operatingName || ""}
                placeholder="Enter operating name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                defaultValue={account?.website || ""}
                placeholder="https://example.com"
              />
            </div>
            <Button className="w-fit">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                defaultValue={account?.fullName || ""}
                placeholder="Enter your name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue={account?.email || ""}
                placeholder="Enter email address"
              />
            </div>
            <Button className="w-fit">Update Contact</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
