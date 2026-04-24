import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Your Account | Velocity",
  description: "Complete your merchant onboarding to start selling with Velocity",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
