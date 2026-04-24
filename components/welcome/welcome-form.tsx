"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-context";

const schema = z.object({
  companyName: z.string().min(2, "Legal company name must be at least 2 characters"),
  operatingName: z.string().optional(),
  website: z.string().url("Please enter a valid URL (e.g. https://example.com)"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  tosAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service",
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Privacy Policy",
  }),
});

type FormValues = z.infer<typeof schema>;

function WelcomeFormInner() {
  const router = useRouter();
  const { createAccount } = useOnboarding();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usedGoogleAuth, setUsedGoogleAuth] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      // Pre-fill with test data for easier development
      companyName: "Test Brand Inc.",
      operatingName: "Test Brand",
      website: "https://testbrand.com",
      fullName: "John Demo",
      email: "demo@testbrand.com",
      tosAccepted: true,
      privacyAccepted: true,
    },
  });

  const tosAccepted = watch("tosAccepted");
  const privacyAccepted = watch("privacyAccepted");

  const handleGoogleAuth = () => {
    setIsGoogleLoading(true);
    // Simulate Google OAuth - only provides name and email
    setTimeout(() => {
      setValue("fullName", "Jane Smith");
      setValue("email", "jane.smith@gmail.com");
      setUsedGoogleAuth(true);
      setIsGoogleLoading(false);
    }, 1200);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    createAccount({
      companyName: data.companyName,
      operatingName: data.operatingName ?? "",
      website: data.website,
      fullName: data.fullName,
      email: data.email,
    });
    router.push("/onboarding");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Section 1: Company Information */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">Company Information</h3>
          <p className="text-xs text-muted-foreground">Tell us about your business</p>
        </div>

        {/* Legal Company Name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="companyName">
            Legal Company Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="Acme Corp Inc."
            {...register("companyName")}
            aria-invalid={!!errors.companyName}
          />
          {errors.companyName && (
            <p className="text-xs text-destructive">{errors.companyName.message}</p>
          )}
        </div>

        {/* Operating Name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="operatingName">
            Operating Name <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </Label>
          <Input
            id="operatingName"
            placeholder="Acme"
            {...register("operatingName")}
          />
        </div>

        {/* Website URL */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website">
            Website URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://your-store.com"
            {...register("website")}
            aria-invalid={!!errors.website}
          />
          {errors.website && (
            <p className="text-xs text-destructive">{errors.website.message}</p>
          )}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Section 2: Contact Information */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">Contact Information</h3>
          <p className="text-xs text-muted-foreground">Your personal details for account access</p>
        </div>

        {/* Google OAuth Option */}
        {!usedGoogleAuth ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or enter manually</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </>
        ) : (
          <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-400">
              Signed in with Google
            </p>
          </div>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Jane Smith"
            {...register("fullName")}
            aria-invalid={!!errors.fullName}
            disabled={usedGoogleAuth}
            className={usedGoogleAuth ? "bg-muted" : ""}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@yourcompany.com"
            {...register("email")}
            aria-invalid={!!errors.email}
            disabled={usedGoogleAuth}
            className={usedGoogleAuth ? "bg-muted" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Section 3: Agreements */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Checkbox
            id="tosAccepted"
            checked={tosAccepted}
            onCheckedChange={(checked) => {
              setValue("tosAccepted", checked === true);
              trigger("tosAccepted");
            }}
            aria-invalid={!!errors.tosAccepted}
          />
          <Label htmlFor="tosAccepted" className="text-sm font-normal leading-relaxed cursor-pointer">
            I agree to the{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground text-muted-foreground">
              Terms of Service
            </a>
          </Label>
        </div>
        {errors.tosAccepted && (
          <p className="text-xs text-destructive ml-7">{errors.tosAccepted.message}</p>
        )}

        <div className="flex items-start gap-3">
          <Checkbox
            id="privacyAccepted"
            checked={privacyAccepted}
            onCheckedChange={(checked) => {
              setValue("privacyAccepted", checked === true);
              trigger("privacyAccepted");
            }}
            aria-invalid={!!errors.privacyAccepted}
          />
          <Label htmlFor="privacyAccepted" className="text-sm font-normal leading-relaxed cursor-pointer">
            I agree to the{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground text-muted-foreground">
              Privacy Policy
            </a>
          </Label>
        </div>
        {errors.privacyAccepted && (
          <p className="text-xs text-destructive ml-7">{errors.privacyAccepted.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        Already have an account?{" "}
        <a href="#" className="underline underline-offset-2 hover:text-foreground">
          Sign in
        </a>
      </p>
    </form>
  );
}

export default function WelcomeForm() {
  return <WelcomeFormInner />;
}
